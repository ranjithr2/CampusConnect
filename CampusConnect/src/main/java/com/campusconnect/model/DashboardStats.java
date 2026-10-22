package com.campusconnect.model;

import java.io.Serializable;
import java.util.Map;

/**
 * Data Transfer Object for Dashboard Metrics and Aggregations.
 */
public class DashboardStats implements Serializable {
    private static final long serialVersionUID = 1L;

    // Student dashboard metrics
    private int upcomingRegistrationsCount;
    private int waitlistedEventsCount;
    private int attendedEventsCount;

    // Admin dashboard metrics
    private int totalActiveEvents;
    private int totalConfirmedRegistrations;
    private int totalWaitlistedStudents;
    private double overallAttendanceRate;
    private int completedEventsCount;
    private Map<String, Integer> categoryDistribution;
    private Map<String, Double> eventUtilizationMap;

    public DashboardStats() {
    }

    public int getUpcomingRegistrationsCount() {
        return upcomingRegistrationsCount;
    }

    public void setUpcomingRegistrationsCount(int upcomingRegistrationsCount) {
        this.upcomingRegistrationsCount = upcomingRegistrationsCount;
    }

    public int getWaitlistedEventsCount() {
        return waitlistedEventsCount;
    }

    public void setWaitlistedEventsCount(int waitlistedEventsCount) {
        this.waitlistedEventsCount = waitlistedEventsCount;
    }

    public int getAttendedEventsCount() {
        return attendedEventsCount;
    }

    public void setAttendedEventsCount(int attendedEventsCount) {
        this.attendedEventsCount = attendedEventsCount;
    }

    public int getTotalActiveEvents() {
        return totalActiveEvents;
    }

    public void setTotalActiveEvents(int totalActiveEvents) {
        this.totalActiveEvents = totalActiveEvents;
    }

    public int getTotalConfirmedRegistrations() {
        return totalConfirmedRegistrations;
    }

    public void setTotalConfirmedRegistrations(int totalConfirmedRegistrations) {
        this.totalConfirmedRegistrations = totalConfirmedRegistrations;
    }

    public int getTotalWaitlistedStudents() {
        return totalWaitlistedStudents;
    }

    public void setTotalWaitlistedStudents(int totalWaitlistedStudents) {
        this.totalWaitlistedStudents = totalWaitlistedStudents;
    }

    public double getOverallAttendanceRate() {
        return overallAttendanceRate;
    }

    public void setOverallAttendanceRate(double overallAttendanceRate) {
        this.overallAttendanceRate = overallAttendanceRate;
    }

    public int getCompletedEventsCount() {
        return completedEventsCount;
    }

    public void setCompletedEventsCount(int completedEventsCount) {
        this.completedEventsCount = completedEventsCount;
    }

    public Map<String, Integer> getCategoryDistribution() {
        return categoryDistribution;
    }

    public void setCategoryDistribution(Map<String, Integer> categoryDistribution) {
        this.categoryDistribution = categoryDistribution;
    }

    public Map<String, Double> getEventUtilizationMap() {
        return eventUtilizationMap;
    }

    public void setEventUtilizationMap(Map<String, Double> eventUtilizationMap) {
        this.eventUtilizationMap = eventUtilizationMap;
    }
}
