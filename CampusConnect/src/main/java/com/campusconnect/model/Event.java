package com.campusconnect.model;

import java.io.Serializable;
import java.sql.Date;
import java.sql.Time;
import java.sql.Timestamp;

/**
 * Model representing a campus event.
 */
public class Event implements Serializable {
    private static final long serialVersionUID = 1L;

    public enum Status {
        UPCOMING, COMPLETED, CANCELLED
    }

    private int eventId;
    private String title;
    private String description;
    private String category;
    private Date eventDate;
    private Time startTime;
    private String venue;
    private int capacity;
    private Status status;
    private String bannerUrl;
    private int createdBy;
    private String creatorName;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    // Computed transient statistics for presentation
    private int confirmedRegistrations;
    private int waitlistedCount;
    private int attendedCount;

    public Event() {
    }

    public int getEventId() {
        return eventId;
    }

    public void setEventId(int eventId) {
        this.eventId = eventId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Date getEventDate() {
        return eventDate;
    }

    public void setEventDate(Date eventDate) {
        this.eventDate = eventDate;
    }

    public Time getStartTime() {
        return startTime;
    }

    public void setStartTime(Time startTime) {
        this.startTime = startTime;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getBannerUrl() {
        return bannerUrl;
    }

    public void setBannerUrl(String bannerUrl) {
        this.bannerUrl = bannerUrl;
    }

    public int getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(int createdBy) {
        this.createdBy = createdBy;
    }

    public String getCreatorName() {
        return creatorName;
    }

    public void setCreatorName(String creatorName) {
        this.creatorName = creatorName;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    public int getConfirmedRegistrations() {
        return confirmedRegistrations;
    }

    public void setConfirmedRegistrations(int confirmedRegistrations) {
        this.confirmedRegistrations = confirmedRegistrations;
    }

    public int getWaitlistedCount() {
        return waitlistedCount;
    }

    public void setWaitlistedCount(int waitlistedCount) {
        this.waitlistedCount = waitlistedCount;
    }

    public int getAttendedCount() {
        return attendedCount;
    }

    public void setAttendedCount(int attendedCount) {
        this.attendedCount = attendedCount;
    }

    public int getRemainingSeats() {
        return Math.max(0, capacity - confirmedRegistrations);
    }

    public boolean isFull() {
        return confirmedRegistrations >= capacity;
    }
}
