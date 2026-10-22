package com.campusconnect.service;

import com.campusconnect.dao.EventDAO;
import com.campusconnect.dao.RegistrationDAO;
import com.campusconnect.dao.WaitlistDAO;
import com.campusconnect.model.DashboardStats;
import com.campusconnect.model.Event;
import com.campusconnect.util.ValidationUtil;

import java.sql.Date;
import java.sql.SQLException;
import java.sql.Time;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Service managing college events and administrative lifecycle.
 */
public class EventService {
    private static final Logger LOGGER = Logger.getLogger(EventService.class.getName());
    private final EventDAO eventDAO;
    private final RegistrationDAO registrationDAO;
    private final WaitlistDAO waitlistDAO;

    public EventService() {
        this.eventDAO = new EventDAO();
        this.registrationDAO = new RegistrationDAO();
        this.waitlistDAO = new WaitlistDAO();
    }

    public List<Event> getUpcomingEvents() {
        return eventDAO.findAllUpcoming();
    }

    public List<Event> getAllEvents() {
        return eventDAO.findAll();
    }

    public Event getEventById(int eventId) {
        return eventDAO.findById(eventId);
    }

    public boolean createEvent(String title, String description, String category, String dateStr,
                               String timeStr, String venue, int capacity, int createdBy) throws IllegalArgumentException {
        validateEventInput(title, description, category, dateStr, timeStr, venue, capacity);

        Event event = new Event();
        event.setTitle(ValidationUtil.escapeHtml(title.trim()));
        event.setDescription(description.trim());
        event.setCategory(ValidationUtil.escapeHtml(category.trim()));
        event.setEventDate(Date.valueOf(dateStr.trim()));
        event.setStartTime(Time.valueOf(timeStr.trim() + (timeStr.trim().length() == 5 ? ":00" : "")));
        event.setVenue(ValidationUtil.escapeHtml(venue.trim()));
        event.setCapacity(capacity);
        event.setStatus(Event.Status.UPCOMING);
        event.setCreatedBy(createdBy);

        try {
            return eventDAO.createEvent(event) > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Failed to create event", e);
            return false;
        }
    }

    public boolean updateEvent(int eventId, String title, String description, String category,
                               String dateStr, String timeStr, String venue, int capacity, String status) throws IllegalArgumentException {
        validateEventInput(title, description, category, dateStr, timeStr, venue, capacity);

        Event existing = eventDAO.findById(eventId);
        if (existing == null) {
            throw new IllegalArgumentException("Event not found.");
        }

        // Prevent setting capacity below currently confirmed count
        if (capacity < existing.getConfirmedRegistrations()) {
            throw new IllegalArgumentException("Cannot reduce event capacity (" + capacity + 
                ") below currently confirmed registrations (" + existing.getConfirmedRegistrations() + ").");
        }

        existing.setTitle(ValidationUtil.escapeHtml(title.trim()));
        existing.setDescription(description.trim());
        existing.setCategory(ValidationUtil.escapeHtml(category.trim()));
        existing.setEventDate(Date.valueOf(dateStr.trim()));
        existing.setStartTime(Time.valueOf(timeStr.trim() + (timeStr.trim().length() == 5 ? ":00" : "")));
        existing.setVenue(ValidationUtil.escapeHtml(venue.trim()));
        existing.setCapacity(capacity);
        if (status != null) {
            existing.setStatus(Event.Status.valueOf(status.trim().toUpperCase()));
        }

        try {
            return eventDAO.updateEvent(existing);
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Failed to update event", e);
            return false;
        }
    }

    public boolean cancelEvent(int eventId) {
        try {
            return eventDAO.cancelEvent(eventId);
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Failed to cancel event: " + eventId, e);
            return false;
        }
    }

    public DashboardStats getAdminDashboardMetrics() {
        DashboardStats stats = new DashboardStats();
        stats.setTotalActiveEvents(eventDAO.countActiveEvents());
        stats.setTotalConfirmedRegistrations(registrationDAO.countTotalConfirmed());
        stats.setTotalWaitlistedStudents(waitlistDAO.countTotalWaitlisted());
        stats.setCategoryDistribution(eventDAO.getCategoryDistribution());
        return stats;
    }

    private void validateEventInput(String title, String description, String category, String dateStr,
                                    String timeStr, String venue, int capacity) {
        if (!ValidationUtil.isNotEmpty(title)) throw new IllegalArgumentException("Event title is required.");
        if (!ValidationUtil.isNotEmpty(description)) throw new IllegalArgumentException("Event description is required.");
        if (!ValidationUtil.isNotEmpty(category)) throw new IllegalArgumentException("Event category is required.");
        if (!ValidationUtil.isNotEmpty(venue)) throw new IllegalArgumentException("Event venue is required.");
        if (capacity <= 0) throw new IllegalArgumentException("Capacity must be a positive number.");
        if (!ValidationUtil.isNotEmpty(dateStr)) throw new IllegalArgumentException("Valid event date is required.");
        if (!ValidationUtil.isNotEmpty(timeStr)) throw new IllegalArgumentException("Valid start time is required.");
    }
}
