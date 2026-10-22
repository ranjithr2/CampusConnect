package com.campusconnect.dao;

import com.campusconnect.model.Registration;
import com.campusconnect.util.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for registrations table.
 * Supports transactional operations and capacity counting.
 */
public class RegistrationDAO {
    private static final Logger LOGGER = Logger.getLogger(RegistrationDAO.class.getName());

    public List<Registration> findByStudentId(int studentId) {
        String sql = "SELECT r.*, e.title AS event_title, e.event_date, e.start_time, e.venue, e.category " +
                     "FROM registrations r " +
                     "JOIN events e ON r.event_id = e.event_id " +
                     "WHERE r.student_id = ? " +
                     "ORDER BY r.registered_at DESC";

        List<Registration> list = new ArrayList<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapResultSetToRegistration(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error finding registrations for student: " + studentId, e);
        }
        return list;
    }

    public List<Registration> findByEventId(int eventId) {
        String sql = "SELECT r.*, u.name AS student_name, u.email AS student_email, u.department AS student_department " +
                     "FROM registrations r " +
                     "JOIN users u ON r.student_id = u.user_id " +
                     "WHERE r.event_id = ? " +
                     "ORDER BY r.registered_at ASC";

        List<Registration> list = new ArrayList<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, eventId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapResultSetToRegistration(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error finding registrations for event: " + eventId, e);
        }
        return list;
    }

    public Registration getActiveRegistration(Connection conn, int eventId, int studentId) throws SQLException {
        String sql = "SELECT * FROM registrations WHERE event_id = ? AND student_id = ? AND status IN ('CONFIRMED', 'WAITLISTED') LIMIT 1 FOR UPDATE";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, eventId);
            ps.setInt(2, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToRegistration(rs);
                }
            }
        }
        return null;
    }

    public int countConfirmedRegistrations(Connection conn, int eventId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM registrations WHERE event_id = ? AND status = 'CONFIRMED' FOR UPDATE";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, eventId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }
        return 0;
    }

    public int createRegistration(Connection conn, Registration reg) throws SQLException {
        String sql = "INSERT INTO registrations (event_id, student_id, status) VALUES (?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, reg.getEventId());
            ps.setInt(2, reg.getStudentId());
            ps.setString(3, reg.getStatus().name());

            int affected = ps.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        return rs.getInt(1);
                    }
                }
            }
        }
        return -1;
    }

    public boolean updateStatus(Connection conn, int registrationId, Registration.Status status) throws SQLException {
        String sql = "UPDATE registrations SET status = ? WHERE registration_id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status.name());
            ps.setInt(2, registrationId);
            return ps.executeUpdate() > 0;
        }
    }

    public boolean updateStatusByEventAndStudent(Connection conn, int eventId, int studentId, Registration.Status status) throws SQLException {
        String sql = "UPDATE registrations SET status = ? WHERE event_id = ? AND student_id = ? AND status = 'WAITLISTED'";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status.name());
            ps.setInt(2, eventId);
            ps.setInt(3, studentId);
            return ps.executeUpdate() > 0;
        }
    }

    public int countTotalConfirmed() {
        String sql = "SELECT COUNT(*) FROM registrations WHERE status = 'CONFIRMED'";
        try (Connection conn = DBUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error counting total confirmed registrations", e);
        }
        return 0;
    }

    private Registration mapResultSetToRegistration(ResultSet rs) throws SQLException {
        Registration reg = new Registration();
        reg.setRegistrationId(rs.getInt("registration_id"));
        reg.setEventId(rs.getInt("event_id"));
        reg.setStudentId(rs.getInt("student_id"));
        reg.setStatus(Registration.Status.valueOf(rs.getString("status")));
        reg.setRegisteredAt(rs.getTimestamp("registered_at"));
        reg.setUpdatedAt(rs.getTimestamp("updated_at"));

        try { reg.setEventTitle(rs.getString("event_title")); } catch (SQLException ignored) {}
        try { reg.setEventDate(rs.getString("event_date")); } catch (SQLException ignored) {}
        try { reg.setEventTime(rs.getString("start_time")); } catch (SQLException ignored) {}
        try { reg.setEventVenue(rs.getString("venue")); } catch (SQLException ignored) {}
        try { reg.setEventCategory(rs.getString("category")); } catch (SQLException ignored) {}
        try { reg.setStudentName(rs.getString("student_name")); } catch (SQLException ignored) {}
        try { reg.setStudentEmail(rs.getString("student_email")); } catch (SQLException ignored) {}
        try { reg.setStudentDepartment(rs.getString("student_department")); } catch (SQLException ignored) {}

        return reg;
    }
}
