package com.campusconnect.service;

import com.campusconnect.dao.AttendanceDAO;
import com.campusconnect.model.Attendance;

import java.util.List;

/**
 * Service managing student attendance verification and statistics.
 */
public class AttendanceService {
    private final AttendanceDAO attendanceDAO;

    public AttendanceService() {
        this.attendanceDAO = new AttendanceDAO();
    }

    public boolean markAttendance(int eventId, int studentId, Attendance.Status status, int markedBy) {
        return attendanceDAO.recordAttendance(eventId, studentId, status, markedBy);
    }

    public List<Attendance> getEventAttendance(int eventId) {
        return attendanceDAO.findByEventId(eventId);
    }

    public List<Attendance> getStudentAttendanceHistory(int studentId) {
        return attendanceDAO.findByStudentId(studentId);
    }

    public int getStudentAttendedEventsCount(int studentId) {
        return attendanceDAO.countAttendedEventsForStudent(studentId);
    }

    public double getOverallAttendanceRate() {
        return attendanceDAO.calculateOverallAttendanceRate();
    }
}
