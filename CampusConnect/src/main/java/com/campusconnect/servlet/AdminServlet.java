package com.campusconnect.servlet;

import com.campusconnect.model.Attendance;
import com.campusconnect.model.DashboardStats;
import com.campusconnect.model.Event;
import com.campusconnect.model.Registration;
import com.campusconnect.model.User;
import com.campusconnect.model.Waitlist;
import com.campusconnect.service.AttendanceService;
import com.campusconnect.service.EventService;
import com.campusconnect.service.WaitlistService;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.List;

/**
 * Handles all Administrator actions: dashboard metrics, event management,
 * participant inspections, waitlist queue review, attendance marking, and reports.
 */
@WebServlet(urlPatterns = {
    "/admin/dashboard",
    "/admin/events",
    "/admin/create-event",
    "/admin/edit-event",
    "/admin/cancel-event",
    "/admin/participants",
    "/admin/waitlist",
    "/admin/mark-attendance",
    "/admin/reports"
})
public class AdminServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private EventService eventService;
    private WaitlistService waitlistService;
    private AttendanceService attendanceService;

    @Override
    public void init() throws ServletException {
        this.eventService = new EventService();
        this.waitlistService = new WaitlistService();
        this.attendanceService = new AttendanceService();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String path = req.getServletPath();

        switch (path) {
            case "/admin/dashboard":
                DashboardStats stats = eventService.getAdminDashboardMetrics();
                stats.setOverallAttendanceRate(attendanceService.getOverallAttendanceRate());
                req.setAttribute("stats", stats);
                req.setAttribute("events", eventService.getAllEvents());
                req.getRequestDispatcher("/WEB-INF/views/admin/dashboard.jsp").forward(req, resp);
                break;

            case "/admin/events":
                req.setAttribute("events", eventService.getAllEvents());
                req.getRequestDispatcher("/WEB-INF/views/admin/events.jsp").forward(req, resp);
                break;

            case "/admin/create-event":
                req.getRequestDispatcher("/WEB-INF/views/admin/create-event.jsp").forward(req, resp);
                break;

            case "/admin/edit-event":
                int editId = Integer.parseInt(req.getParameter("id"));
                Event event = eventService.getEventById(editId);
                req.setAttribute("event", event);
                req.getRequestDispatcher("/WEB-INF/views/admin/edit-event.jsp").forward(req, resp);
                break;

            case "/admin/participants":
                int partEventId = Integer.parseInt(req.getParameter("eventId"));
                Event pEvent = eventService.getEventById(partEventId);
                List<Registration> registrations = waitlistService.getEventRegistrations(partEventId);
                List<Attendance> attendanceList = attendanceService.getEventAttendance(partEventId);
                req.setAttribute("event", pEvent);
                req.setAttribute("registrations", registrations);
                req.setAttribute("attendanceList", attendanceList);
                req.getRequestDispatcher("/WEB-INF/views/admin/participants.jsp").forward(req, resp);
                break;

            case "/admin/waitlist":
                int wlEventId = Integer.parseInt(req.getParameter("eventId"));
                Event wEvent = eventService.getEventById(wlEventId);
                List<Waitlist> waitlist = waitlistService.getEventWaitlist(wlEventId);
                req.setAttribute("event", wEvent);
                req.setAttribute("waitlist", waitlist);
                req.getRequestDispatcher("/WEB-INF/views/admin/waitlist.jsp").forward(req, resp);
                break;

            case "/admin/reports":
                DashboardStats reportStats = eventService.getAdminDashboardMetrics();
                reportStats.setOverallAttendanceRate(attendanceService.getOverallAttendanceRate());
                req.setAttribute("stats", reportStats);
                req.setAttribute("events", eventService.getAllEvents());
                req.getRequestDispatcher("/WEB-INF/views/admin/reports.jsp").forward(req, resp);
                break;

            default:
                resp.sendRedirect(req.getContextPath() + "/admin/dashboard");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User admin = (User) session.getAttribute("currentUser");
        int adminId = admin.getUserId();
        String path = req.getServletPath();

        if ("/admin/create-event".equals(path)) {
            String title = req.getParameter("title");
            String description = req.getParameter("description");
            String category = req.getParameter("category");
            String dateStr = req.getParameter("date");
            String timeStr = req.getParameter("time");
            String venue = req.getParameter("venue");
            int capacity = Integer.parseInt(req.getParameter("capacity"));

            try {
                boolean success = eventService.createEvent(title, description, category, dateStr, timeStr, venue, capacity, adminId);
                if (success) {
                    resp.sendRedirect(req.getContextPath() + "/admin/events?msg=created_success");
                } else {
                    req.setAttribute("errorMessage", "Failed to create event. Please verify parameters.");
                    req.getRequestDispatcher("/WEB-INF/views/admin/create-event.jsp").forward(req, resp);
                }
            } catch (IllegalArgumentException e) {
                req.setAttribute("errorMessage", e.getMessage());
                req.getRequestDispatcher("/WEB-INF/views/admin/create-event.jsp").forward(req, resp);
            }
        } else if ("/admin/edit-event".equals(path)) {
            int eventId = Integer.parseInt(req.getParameter("eventId"));
            String title = req.getParameter("title");
            String description = req.getParameter("description");
            String category = req.getParameter("category");
            String dateStr = req.getParameter("date");
            String timeStr = req.getParameter("time");
            String venue = req.getParameter("venue");
            int capacity = Integer.parseInt(req.getParameter("capacity"));
            String status = req.getParameter("status");

            try {
                boolean success = eventService.updateEvent(eventId, title, description, category, dateStr, timeStr, venue, capacity, status);
                if (success) {
                    resp.sendRedirect(req.getContextPath() + "/admin/events?msg=updated_success");
                } else {
                    resp.sendRedirect(req.getContextPath() + "/admin/edit-event?id=" + eventId + "&error=update_failed");
                }
            } catch (IllegalArgumentException e) {
                resp.sendRedirect(req.getContextPath() + "/admin/edit-event?id=" + eventId + "&error=" + e.getMessage());
            }
        } else if ("/admin/cancel-event".equals(path)) {
            int eventId = Integer.parseInt(req.getParameter("eventId"));
            eventService.cancelEvent(eventId);
            resp.sendRedirect(req.getContextPath() + "/admin/events?msg=cancelled_success");
        } else if ("/admin/mark-attendance".equals(path)) {
            int eventId = Integer.parseInt(req.getParameter("eventId"));
            int studentId = Integer.parseInt(req.getParameter("studentId"));
            String statusStr = req.getParameter("status");
            Attendance.Status status = Attendance.Status.valueOf(statusStr.toUpperCase());

            attendanceService.markAttendance(eventId, studentId, status, adminId);

            String redirect = req.getParameter("redirect");
            if (redirect != null && !redirect.isEmpty()) {
                resp.sendRedirect(req.getContextPath() + redirect);
            } else {
                resp.sendRedirect(req.getContextPath() + "/admin/participants?eventId=" + eventId + "&msg=attendance_updated");
            }
        }
    }
}
