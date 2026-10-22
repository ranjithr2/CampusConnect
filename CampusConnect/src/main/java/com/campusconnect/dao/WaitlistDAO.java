package com.campusconnect.dao;

import com.campusconnect.model.Waitlist;
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
 * Data Access Object for waitlist table.
 * Implements FIFO queue queries with row locks for concurrent safety.
 */
public class WaitlistDAO {
    private static final Logger LOGGER = Logger.getLogger(WaitlistDAO.class.getName());

    public List<Waitlist> findByEventId(int eventId) {
        String sql = "SELECT w.*, u.name AS student_name, u.email AS student_email, u.department AS student_department, " +
                     "e.title AS event_title, e.event_date " +
                     "FROM waitlist w " +
                     "JOIN users u ON w.student_id = u.user_id " +
                     "JOIN events e ON w.event_id = e.event_id " +
                     "WHERE w.event_id = ? " +
                     "ORDER BY w.position ASC, w.joined_at ASC";

        List<Waitlist> list = new ArrayList<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, eventId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapResultSetToWaitlist(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error finding waitlist for event: " + eventId, e);
        }
        return list;
    }

    public List<Waitlist> findByStudentId(int studentId) {
        String sql = "SELECT w.*, e.title AS event_title, e.event_date, " +
                     "u.name AS student_name, u.email AS student_email, u.department AS student_department " +
                     "FROM waitlist w " +
                     "JOIN events e ON w.event_id = e.event_id " +
                     "JOIN users u ON w.student_id = u.user_id " +
                     "WHERE w.student_id = ? " +
                     "ORDER BY w.joined_at DESC";

        List<Waitlist> list = new ArrayList<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapResultSetToWaitlist(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error finding waitlist for student: " + studentId, e);
        }
        return list;
    }

    public Waitlist getStudentActiveWaitlist(Connection conn, int eventId, int studentId) throws SQLException {
        String sql = "SELECT * FROM waitlist WHERE event_id = ? AND student_id = ? AND status = 'WAITING' LIMIT 1 FOR UPDATE";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, eventId);
            ps.setInt(2, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToWaitlist(rs);
                }
            }
        }
        return null;
    }

    public int getNextQueuePosition(Connection conn, int eventId) throws SQLException {
        String sql = "SELECT COALESCE(MAX(position), 0) + 1 FROM waitlist WHERE event_id = ? AND status = 'WAITING'";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, eventId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }
        return 1;
    }

    public int addToWaitlist(Connection conn, Waitlist waitlist) throws SQLException {
        String sql = "INSERT INTO waitlist (event_id, student_id, position, status) VALUES (?, ?, ?, 'WAITING')";
        try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, waitlist.getEventId());
            ps.setInt(2, waitlist.getStudentId());
            ps.setInt(3, waitlist.getPosition());

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

    /**
     * Retrieves the next eligible student in strict FIFO order (lowest position, earliest joined_at)
     * using SELECT ... FOR UPDATE to prevent race conditions during concurrent promotions.
     */
    public Waitlist getNextInLineFIFO(Connection conn, int eventId) throws SQLException {
        String sql = "SELECT * FROM waitlist " +
                     "WHERE event_id = ? AND status = 'WAITING' " +
                     "ORDER BY position ASC, joined_at ASC, waitlist_id ASC LIMIT 1 FOR UPDATE";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, eventId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToWaitlist(rs);
                }
            }
        }
        return null;
    }

    public boolean updateStatus(Connection conn, int waitlistId, Waitlist.Status status) throws SQLException {
        String sql = "UPDATE waitlist SET status = ? WHERE waitlist_id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status.name());
            ps.setInt(2, waitlistId);
            return ps.executeUpdate() > 0;
        }
    }

    public void resequenceWaitlistPositions(Connection conn, int eventId) throws SQLException {
        String selectSql = "SELECT waitlist_id FROM waitlist WHERE event_id = ? AND status = 'WAITING' ORDER BY position ASC, joined_at ASC FOR UPDATE";
        String updateSql = "UPDATE waitlist SET position = ? WHERE waitlist_id = ?";

        List<Integer> ids = new ArrayList<>();
        try (PreparedStatement ps = conn.prepareStatement(selectSql)) {
            ps.setInt(1, eventId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ids.add(rs.getInt("waitlist_id"));
                }
            }
        }

        try (PreparedStatement ps = conn.prepareStatement(updateSql)) {
            int pos = 1;
            for (Integer id : ids) {
                ps.setInt(1, pos++);
                ps.setInt(2, id);
                ps.addBatch();
            }
            ps.executeBatch();
        }
    }

    public int countTotalWaitlisted() {
        String sql = "SELECT COUNT(*) FROM waitlist WHERE status = 'WAITING'";
        try (Connection conn = DBUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error counting total waitlisted students", e);
        }
        return 0;
    }

    private Waitlist mapResultSetToWaitlist(ResultSet rs) throws SQLException {
        Waitlist w = new Waitlist();
        w.setWaitlistId(rs.getInt("waitlist_id"));
        w.setEventId(rs.getInt("event_id"));
        w.setStudentId(rs.getInt("student_id"));
        w.setPosition(rs.getInt("position"));
        w.setStatus(Waitlist.Status.valueOf(rs.getString("status")));
        w.setJoinedAt(rs.getTimestamp("joined_at"));
        w.setUpdatedAt(rs.getTimestamp("updated_at"));

        try { w.setEventTitle(rs.getString("event_title")); } catch (SQLException ignored) {}
        try { w.setEventDate(rs.getString("event_date")); } catch (SQLException ignored) {}
        try { w.setStudentName(rs.getString("student_name")); } catch (SQLException ignored) {}
        try { w.setStudentEmail(rs.getString("student_email")); } catch (SQLException ignored) {}
        try { w.setStudentDepartment(rs.getString("student_department")); } catch (SQLException ignored) {}

        return w;
    }
}
