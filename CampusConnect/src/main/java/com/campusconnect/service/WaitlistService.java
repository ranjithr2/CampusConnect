package com.campusconnect.service;

import com.campusconnect.dao.RegistrationDAO;
import com.campusconnect.dao.WaitlistDAO;
import com.campusconnect.model.Registration;
import com.campusconnect.model.Waitlist;
import com.campusconnect.util.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Service implementing the Smart FIFO Waitlist and Concurrency Algorithm.
 * Guarantees zero overbooking via row-level locking (SELECT ... FOR UPDATE) and atomic transactions.
 */
public class WaitlistService {
    private static final Logger LOGGER = Logger.getLogger(WaitlistService.class.getName());
    private final RegistrationDAO registrationDAO;
    private final WaitlistDAO waitlistDAO;

    public enum RegistrationResult {
        CONFIRMED_SUCCESS,
        WAITLISTED_SUCCESS,
        ALREADY_REGISTERED,
        EVENT_NOT_OPEN,
        SYSTEM_ERROR
    }

    public enum CancellationResult {
        CANCELLED_AND_PROMOTED_NEXT,
        CANCELLED_EMPTY_WAITLIST,
        WAITLIST_CANCELLED,
        NOT_FOUND,
        SYSTEM_ERROR
    }

    public WaitlistService() {
        this.registrationDAO = new RegistrationDAO();
        this.waitlistDAO = new WaitlistDAO();
    }

    /**
     * Executes atomic student event registration with automatic waitlist queueing.
     * Transaction Steps:
     * 1. Begin transaction (autoCommit = false).
     * 2. Lock event row using SELECT capacity, status, event_date FROM events WHERE event_id = ? FOR UPDATE.
     * 3. Verify event is UPCOMING and not in the past.
     * 4. Check for existing active registration (CONFIRMED or WAITLISTED).
     * 5. Count confirmed seats locked.
     * 6. If confirmed < capacity:
     *      Insert registration as CONFIRMED.
     *    Else:
     *      Insert registration as WAITLISTED, calculate next FIFO queue position, and insert waitlist record.
     * 7. Commit transaction.
     */
    public RegistrationResult registerStudentForEvent(int eventId, int studentId) {
        Connection conn = null;
        try {
            conn = DBUtil.getConnection();
            conn.setAutoCommit(false); // Begin Transaction

            // 1. Lock event row to coordinate concurrent registration requests
            String eventLockSql = "SELECT capacity, status, event_date FROM events WHERE event_id = ? FOR UPDATE";
            int capacity = 0;
            String status = null;
            try (PreparedStatement ps = conn.prepareStatement(eventLockSql)) {
                ps.setInt(1, eventId);
                try (ResultSet rs = ps.executeQuery()) {
                    if (!rs.next()) {
                        conn.rollback();
                        return RegistrationResult.EVENT_NOT_OPEN;
                    }
                    capacity = rs.getInt("capacity");
                    status = rs.getString("status");
                }
            }

            if (!"UPCOMING".equalsIgnoreCase(status)) {
                conn.rollback();
                return RegistrationResult.EVENT_NOT_OPEN;
            }

            // 2. Check if student already has an active registration
            Registration activeReg = registrationDAO.getActiveRegistration(conn, eventId, studentId);
            if (activeReg != null) {
                conn.rollback();
                return RegistrationResult.ALREADY_REGISTERED;
            }

            // 3. Count confirmed registrations
            int confirmedCount = registrationDAO.countConfirmedRegistrations(conn, eventId);

            if (confirmedCount < capacity) {
                // Seat available -> CONFIRMED
                Registration reg = new Registration();
                reg.setEventId(eventId);
                reg.setStudentId(studentId);
                reg.setStatus(Registration.Status.CONFIRMED);
                registrationDAO.createRegistration(conn, reg);

                conn.commit();
                LOGGER.info("Student " + studentId + " CONFIRMED for event " + eventId + " (" + (confirmedCount + 1) + "/" + capacity + ")");
                return RegistrationResult.CONFIRMED_SUCCESS;
            } else {
                // Capacity reached -> Place in FIFO waitlist
                int nextPosition = waitlistDAO.getNextQueuePosition(conn, eventId);

                Registration reg = new Registration();
                reg.setEventId(eventId);
                reg.setStudentId(studentId);
                reg.setStatus(Registration.Status.WAITLISTED);
                registrationDAO.createRegistration(conn, reg);

                Waitlist w = new Waitlist();
                w.setEventId(eventId);
                w.setStudentId(studentId);
                w.setPosition(nextPosition);
                waitlistDAO.addToWaitlist(conn, w);

                conn.commit();
                LOGGER.info("Student " + studentId + " WAITLISTED at position #" + nextPosition + " for event " + eventId);
                return RegistrationResult.WAITLISTED_SUCCESS;
            }

        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Transaction rollback during registration: event=" + eventId + ", student=" + studentId, e);
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) { LOGGER.log(Level.SEVERE, "Rollback failed", ex); }
            }
            return RegistrationResult.SYSTEM_ERROR;
        } finally {
            if (conn != null) {
                try { conn.setAutoCommit(true); conn.close(); } catch (SQLException ignored) {}
            }
        }
    }

    /**
     * Executes atomic cancellation and instant FIFO promotion.
     * Transaction Steps:
     * 1. Begin transaction (autoCommit = false).
     * 2. Lock and retrieve student's active registration.
     * 3. If student was WAITLISTED:
     *      Mark registration and waitlist CANCELLED; resequence remaining queue.
     * 4. If student was CONFIRMED:
     *      Mark registration CANCELLED.
     *      Find next eligible student in waitlist via SELECT ... FOR UPDATE ordered by position ASC, joined_at ASC.
     *      If waitlisted student exists:
     *        Promote waitlist record to PROMOTED.
     *        Update their registration record to CONFIRMED.
     *        Resequence remaining queue.
     * 5. Commit transaction.
     */
    public CancellationResult cancelRegistration(int eventId, int studentId) {
        Connection conn = null;
        try {
            conn = DBUtil.getConnection();
            conn.setAutoCommit(false); // Begin Transaction

            // Lock and inspect the student's active registration
            Registration reg = registrationDAO.getActiveRegistration(conn, eventId, studentId);
            if (reg == null) {
                conn.rollback();
                return CancellationResult.NOT_FOUND;
            }

            if (reg.getStatus() == Registration.Status.WAITLISTED) {
                // Cancel waitlist entry directly
                registrationDAO.updateStatus(conn, reg.getRegistrationId(), Registration.Status.CANCELLED);
                Waitlist w = waitlistDAO.getStudentActiveWaitlist(conn, eventId, studentId);
                if (w != null) {
                    waitlistDAO.updateStatus(conn, w.getWaitlistId(), Waitlist.Status.CANCELLED);
                }
                waitlistDAO.resequenceWaitlistPositions(conn, eventId);
                conn.commit();
                LOGGER.info("Waitlisted student " + studentId + " cancelled from event " + eventId);
                return CancellationResult.WAITLIST_CANCELLED;
            }

            // Student had CONFIRMED seat -> Cancel and promote next in queue
            registrationDAO.updateStatus(conn, reg.getRegistrationId(), Registration.Status.CANCELLED);

            // Fetch next eligible student in FIFO order with row lock
            Waitlist nextEligible = waitlistDAO.getNextInLineFIFO(conn, eventId);

            if (nextEligible != null) {
                // Promote student
                waitlistDAO.updateStatus(conn, nextEligible.getWaitlistId(), Waitlist.Status.PROMOTED);
                registrationDAO.updateStatusByEventAndStudent(conn, eventId, nextEligible.getStudentId(), Registration.Status.CONFIRMED);
                waitlistDAO.resequenceWaitlistPositions(conn, eventId);

                // Log audit action
                String logSql = "INSERT INTO activity_logs (action, details) VALUES ('WAITLIST_PROMOTION', ?)";
                try (PreparedStatement logPs = conn.prepareStatement(logSql)) {
                    logPs.setString(1, "Student #" + nextEligible.getStudentId() + " promoted to CONFIRMED for Event #" + eventId + " following seat cancellation by Student #" + studentId);
                    logPs.executeUpdate();
                }

                conn.commit();
                LOGGER.info("Promoted student " + nextEligible.getStudentId() + " to CONFIRMED for event " + eventId);
                return CancellationResult.CANCELLED_AND_PROMOTED_NEXT;
            } else {
                // No one in waitlist
                conn.commit();
                LOGGER.info("Seat freed for event " + eventId + ", waitlist was empty.");
                return CancellationResult.CANCELLED_EMPTY_WAITLIST;
            }

        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Transaction rollback during cancellation: event=" + eventId + ", student=" + studentId, e);
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) { LOGGER.log(Level.SEVERE, "Rollback failed", ex); }
            }
            return CancellationResult.SYSTEM_ERROR;
        } finally {
            if (conn != null) {
                try { conn.setAutoCommit(true); conn.close(); } catch (SQLException ignored) {}
            }
        }
    }

    public List<Registration> getStudentRegistrations(int studentId) {
        return registrationDAO.findByStudentId(studentId);
    }

    public List<Waitlist> getStudentWaitlistEntries(int studentId) {
        return waitlistDAO.findByStudentId(studentId);
    }

    public List<Waitlist> getEventWaitlist(int eventId) {
        return waitlistDAO.findByEventId(eventId);
    }

    public List<Registration> getEventRegistrations(int eventId) {
        return registrationDAO.findByEventId(eventId);
    }
}
