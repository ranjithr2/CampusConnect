package com.campusconnect.dao;

import com.campusconnect.model.Attendance;
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
 * Data Access Object for attendance tracking.
 */
public class AttendanceDAO {
    private static final Logger LOGGER = Logger.getLogger(AttendanceDAO.class.getName());

    public List<Attendance> findByEventId(int eventId) {
        String sql = "SELECT a.*, u.name AS student_name, u.email AS student_email, u.department AS student_department, " +
                     "m.name AS marked_by_name, e.title AS event_title, e.event_date " +
                     "FROM attendance a " +
                     "JOIN users u ON a.student_id = u.user_id " +
                     "JOIN events e ON a.event_id = e.event_id " +
                     "LEFT JOIN users m ON a.marked_by = m.user_id " +
                     "WHERE a.event_id = ? " +
                     "ORDER BY u.name ASC";

        List<Attendance> list = new ArrayList<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, eventId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapResultSetToAttendance(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error finding attendance for event: " + eventId, e);
        }
        return list;
    }

    public List<Attendance> findByStudentId(int studentId) {
        String sql = "SELECT a.*, e.title AS event_title, e.event_date, u.name AS student_name, " +
                     "m.name AS marked_by_name " +
                     "FROM attendance a " +
                     "JOIN events e ON a.event_id = e.event_id " +
                     "JOIN users u ON a.student_id = u.user_id " +
                     "LEFT JOIN users m ON a.marked_by = m.user_id " +
                     "WHERE a.student_id = ? " +
                     "ORDER BY e.event_date DESC";

        List<Attendance> list = new ArrayList<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapResultSetToAttendance(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error finding attendance for student: " + studentId, e);
        }
        return list;
    }

    /**
     * Marks or updates student attendance using an atomic INSERT ON DUPLICATE KEY UPDATE.
     */
    public boolean recordAttendance(int eventId, int studentId, Attendance.Status status, int markedBy) {
        String sql = "INSERT INTO attendance (event_id, student_id, status, marked_by) " +
                     "VALUES (?, ?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by), marked_at = CURRENT_TIMESTAMP";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, eventId);
            ps.setInt(2, studentId);
            ps.setString(3, status.name());
            ps.setInt(4, markedBy);

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error recording attendance for student " + studentId + " in event " + eventId, e);
        }
        return false;
    }

    public int countAttendedEventsForStudent(int studentId) {
        String sql = "SELECT COUNT(*) FROM attendance WHERE student_id = ? AND status = 'PRESENT'";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error counting attended events for student: " + studentId, e);
        }
        return 0;
    }

    public double calculateOverallAttendanceRate() {
        String sql = "SELECT " +
                     "SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS rate " +
                     "FROM attendance";
        try (Connection conn = DBUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) {
                return rs.getDouble("rate");
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error calculating overall attendance rate", e);
        }
        return 0.0;
    }

    private Attendance mapResultSetToAttendance(ResultSet rs) throws SQLException {
        Attendance a = new Attendance();
        a.setAttendanceId(rs.getInt("attendance_id"));
        a.setEventId(rs.getInt("event_id"));
        a.setStudentId(rs.getInt("student_id"));
        a.setStatus(Attendance.Status.valueOf(rs.getString("status")));
        a.setMarkedAt(rs.getTimestamp("marked_at"));
        a.setMarkedBy(rs.getInt("marked_by"));

        try { a.setEventTitle(rs.getString("event_title")); } catch (SQLException ignored) {}
        try { a.setEventDate(rs.getString("event_date")); } catch (SQLException ignored) {}
        try { a.setStudentName(rs.getString("student_name")); } catch (SQLException ignored) {}
        try { a.setStudentEmail(rs.getString("student_email")); } catch (SQLException ignored) {}
        try { a.setStudentDepartment(rs.getString("student_department")); } catch (SQLException ignored) {}
        try { a.setMarkedByName(rs.getString("marked_by_name")); } catch (SQLException ignored) {}

        return a;
    }
}
