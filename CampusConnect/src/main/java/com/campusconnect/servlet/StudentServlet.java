package com.campusconnect.servlet;

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
 * Handles all Student Portal actions: dashboard, event discovery,
 * registration with waitlist support, cancellation, and attendance history.
 */
@WebServlet(urlPatterns = {
    "/student/dashboard",
    "/student/events",
    "/student/event-details",
    "/student/register",
    "/student/cancel",
    "/student/registrations",
    "/student/waitlist",
    "/student/attendance",
    "/student/profile"
})
public class StudentServlet extends HttpServlet {
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
        HttpSession session = req.getSession(false);
        User student = (User) session.getAttribute("currentUser");
        int studentId = student.getUserId();
        String path = req.getServletPath();

        switch (path) {
            case "/student/dashboard":
                List<Registration> studentRegs = waitlistService.getStudentRegistrations(studentId);
                List<Waitlist> studentWaitlist = waitlistService.getStudentWaitlistEntries(studentId);
                int attendedCount = attendanceService.getStudentAttendedEventsCount(studentId);

                long confirmedCount = studentRegs.stream().filter(r -> r.getStatus() == Registration.Status.CONFIRMED).count();
                long waitingCount = studentWaitlist.stream().filter(w -> w.getStatus() == Waitlist.Status.WAITING).count();

                req.setAttribute("confirmedCount", confirmedCount);
                req.setAttribute("waitlistCount", waitingCount);
                req.setAttribute("attendedCount", attendedCount);
                req.setAttribute("upcomingEvents", eventService.getUpcomingEvents());
                req.setAttribute("myRegistrations", studentRegs);

                req.getRequestDispatcher("/WEB-INF/views/student/dashboard.jsp").forward(req, resp);
                break;

            case "/student/events":
                req.setAttribute("events", eventService.getUpcomingEvents());
                req.getRequestDispatcher("/WEB-INF/views/student/events.jsp").forward(req, resp);
                break;

            case "/student/event-details":
                int eventId = Integer.parseInt(req.getParameter("id"));
                Event event = eventService.getEventById(eventId);
                req.setAttribute("event", event);
                req.getRequestDispatcher("/WEB-INF/views/student/event-details.jsp").forward(req, resp);
                break;

            case "/student/registrations":
                req.setAttribute("registrations", waitlistService.getStudentRegistrations(studentId));
                req.getRequestDispatcher("/WEB-INF/views/student/my-registrations.jsp").forward(req, resp);
                break;

            case "/student/waitlist":
                req.setAttribute("waitlistEntries", waitlistService.getStudentWaitlistEntries(studentId));
                req.getRequestDispatcher("/WEB-INF/views/student/waitlist-status.jsp").forward(req, resp);
                break;

            case "/student/attendance":
                req.setAttribute("attendanceHistory", attendanceService.getStudentAttendanceHistory(studentId));
                req.setAttribute("attendedCount", attendanceService.getStudentAttendedEventsCount(studentId));
                req.getRequestDispatcher("/WEB-INF/views/student/attendance.jsp").forward(req, resp);
                break;

            case "/student/profile":
                req.setAttribute("user", student);
                req.getRequestDispatcher("/WEB-INF/views/student/profile.jsp").forward(req, resp);
                break;

            default:
                resp.sendRedirect(req.getContextPath() + "/student/dashboard");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User student = (User) session.getAttribute("currentUser");
        int studentId = student.getUserId();
        String path = req.getServletPath();

        if ("/student/register".equals(path)) {
            int eventId = Integer.parseInt(req.getParameter("eventId"));
            WaitlistService.RegistrationResult result = waitlistService.registerStudentForEvent(eventId, studentId);

            switch (result) {
                case CONFIRMED_SUCCESS:
                    resp.sendRedirect(req.getContextPath() + "/student/registrations?msg=registered_confirmed");
                    break;
                case WAITLISTED_SUCCESS:
                    resp.sendRedirect(req.getContextPath() + "/student/waitlist?msg=registered_waitlisted");
                    break;
                case ALREADY_REGISTERED:
                    resp.sendRedirect(req.getContextPath() + "/student/events?error=already_registered");
                    break;
                case EVENT_NOT_OPEN:
                    resp.sendRedirect(req.getContextPath() + "/student/events?error=event_closed");
                    break;
                default:
                    resp.sendRedirect(req.getContextPath() + "/student/events?error=system_error");
            }
        } else if ("/student/cancel".equals(path)) {
            int eventId = Integer.parseInt(req.getParameter("eventId"));
            WaitlistService.CancellationResult result = waitlistService.cancelRegistration(eventId, studentId);

            if (result == WaitlistService.CancellationResult.CANCELLED_AND_PROMOTED_NEXT) {
                resp.sendRedirect(req.getContextPath() + "/student/registrations?msg=cancelled_promoted_next");
            } else if (result == WaitlistService.CancellationResult.CANCELLED_EMPTY_WAITLIST ||
                       result == WaitlistService.CancellationResult.WAITLIST_CANCELLED) {
                resp.sendRedirect(req.getContextPath() + "/student/registrations?msg=cancelled_success");
            } else {
                resp.sendRedirect(req.getContextPath() + "/student/registrations?error=cancel_failed");
            }
        }
    }
}
