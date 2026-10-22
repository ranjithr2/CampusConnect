package com.campusconnect.dao;

import com.campusconnect.model.Event;
import com.campusconnect.util.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for events table.
 * Includes aggregated queries for capacity tracking and waitlists.
 */
public class EventDAO {
    private static final Logger LOGGER = Logger.getLogger(EventDAO.class.getName());

    public List<Event> findAllUpcoming() {
        String sql = "SELECT e.*, u.name AS creator_name, " +
                     "(SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.event_id AND r.status = 'CONFIRMED') AS confirmed_count, " +
                     "(SELECT COUNT(*) FROM waitlist w WHERE w.event_id = e.event_id AND w.status = 'WAITING') AS waitlist_count " +
                     "FROM events e " +
                     "JOIN users u ON e.created_by = u.user_id " +
                     "WHERE e.status = 'UPCOMING' AND e.event_date >= CURRENT_DATE " +
                     "ORDER BY e.event_date ASC, e.start_time ASC";

        List<Event> list = new ArrayList<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapResultSetToEvent(rs));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching upcoming events", e);
        }
        return list;
    }

    public List<Event> findAll() {
        String sql = "SELECT e.*, u.name AS creator_name, " +
                     "(SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.event_id AND r.status = 'CONFIRMED') AS confirmed_count, " +
                     "(SELECT COUNT(*) FROM waitlist w WHERE w.event_id = e.event_id AND w.status = 'WAITING') AS waitlist_count " +
                     "FROM events e " +
                     "JOIN users u ON e.created_by = u.user_id " +
                     "ORDER BY e.event_date DESC, e.start_time DESC";

        List<Event> list = new ArrayList<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapResultSetToEvent(rs));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching all events", e);
        }
        return list;
    }

    public Event findById(int eventId) {
        String sql = "SELECT e.*, u.name AS creator_name, " +
                     "(SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.event_id AND r.status = 'CONFIRMED') AS confirmed_count, " +
                     "(SELECT COUNT(*) FROM waitlist w WHERE w.event_id = e.event_id AND w.status = 'WAITING') AS waitlist_count " +
                     "FROM events e " +
                     "JOIN users u ON e.created_by = u.user_id " +
                     "WHERE e.event_id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, eventId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToEvent(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error finding event by id: " + eventId, e);
        }
        return null;
    }

    public int createEvent(Event event) throws SQLException {
        String sql = "INSERT INTO events (title, description, category, event_date, start_time, venue, capacity, status, banner_url, created_by) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, event.getTitle());
            ps.setString(2, event.getDescription());
            ps.setString(3, event.getCategory());
            ps.setDate(4, event.getEventDate());
            ps.setTime(5, event.getStartTime());
            ps.setString(6, event.getVenue());
            ps.setInt(7, event.getCapacity());
            ps.setString(8, event.getStatus().name());
            ps.setString(9, event.getBannerUrl());
            ps.setInt(10, event.getCreatedBy());

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

    public boolean updateEvent(Event event) throws SQLException {
        String sql = "UPDATE events SET title = ?, description = ?, category = ?, event_date = ?, start_time = ?, venue = ?, capacity = ?, status = ? " +
                     "WHERE event_id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, event.getTitle());
            ps.setString(2, event.getDescription());
            ps.setString(3, event.getCategory());
            ps.setDate(4, event.getEventDate());
            ps.setTime(5, event.getStartTime());
            ps.setString(6, event.getVenue());
            ps.setInt(7, event.getCapacity());
            ps.setString(8, event.getStatus().name());
            ps.setInt(9, event.getEventId());

            return ps.executeUpdate() > 0;
        }
    }

    public boolean cancelEvent(int eventId) throws SQLException {
        String sql = "UPDATE events SET status = 'CANCELLED' WHERE event_id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, eventId);
            return ps.executeUpdate() > 0;
        }
    }

    public int countActiveEvents() {
        String sql = "SELECT COUNT(*) FROM events WHERE status = 'UPCOMING'";
        try (Connection conn = DBUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error counting active events", e);
        }
        return 0;
    }

    public Map<String, Integer> getCategoryDistribution() {
        String sql = "SELECT category, COUNT(*) as count FROM events GROUP BY category";
        Map<String, Integer> map = new LinkedHashMap<>();
        try (Connection conn = DBUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                map.put(rs.getString("category"), rs.getInt("count"));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error getting category distribution", e);
        }
        return map;
    }

    private Event mapResultSetToEvent(ResultSet rs) throws SQLException {
        Event event = new Event();
        event.setEventId(rs.getInt("event_id"));
        event.setTitle(rs.getString("title"));
        event.setDescription(rs.getString("description"));
        event.setCategory(rs.getString("category"));
        event.setEventDate(rs.getDate("event_date"));
        event.setStartTime(rs.getTime("start_time"));
        event.setVenue(rs.getString("venue"));
        event.setCapacity(rs.getInt("capacity"));
        event.setStatus(Event.Status.valueOf(rs.getString("status")));
        event.setBannerUrl(rs.getString("banner_url"));
        event.setCreatedBy(rs.getInt("created_by"));
        event.setCreatedAt(rs.getTimestamp("created_at"));
        event.setUpdatedAt(rs.getTimestamp("updated_at"));

        try {
            event.setCreatorName(rs.getString("creator_name"));
        } catch (SQLException ignored) {}

        try {
            event.setConfirmedRegistrations(rs.getInt("confirmed_count"));
        } catch (SQLException ignored) {}

        try {
            event.setWaitlistedCount(rs.getInt("waitlist_count"));
        } catch (SQLException ignored) {}

        return event;
    }
}
