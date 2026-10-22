<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.campusconnect.model.Event" %>
<%@ page import="com.campusconnect.model.Registration" %>
<%@ page import="com.campusconnect.model.Attendance" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Map" %>
<%@ page import="java.util.HashMap" %>
<%
    Event event = (Event) request.getAttribute("event");
    List<Registration> registrations = (List<Registration>) request.getAttribute("registrations");
    List<Attendance> attendanceList = (List<Attendance>) request.getAttribute("attendanceList");

    Map<Integer, Attendance.Status> attendanceMap = new HashMap<>();
    if (attendanceList != null) {
        for (Attendance a : attendanceList) {
            attendanceMap.put(a.getStudentId(), a.getStatus());
        }
    }
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Participants & Attendance — <%= event != null ? event.getTitle() : "Event" %></title>
    <link rel="stylesheet" href="<%= request.getContextPath() %>/assets/css/style.css">
</head>
<body>

    <nav class="navbar">
        <div class="nav-container">
            <a href="<%= request.getContextPath() %>/" class="brand">
                <span>CampusConnect</span>
                <span class="brand-badge" style="background:#fef3c7; color:#b45309;">Admin Console</span>
            </a>
            <ul class="nav-links">
                <li><a href="<%= request.getContextPath() %>/admin/dashboard">Overview</a></li>
                <li><a href="<%= request.getContextPath() %>/admin/events" class="active">Event Management</a></li>
                <li><a href="<%= request.getContextPath() %>/admin/create-event">+ New Event</a></li>
                <li><a href="<%= request.getContextPath() %>/admin/reports">Analytics & Reports</a></li>
                <li><a href="<%= request.getContextPath() %>/auth/logout" class="btn btn-secondary btn-sm">Sign Out</a></li>
            </ul>
        </div>
    </nav>

    <main class="container">
        
        <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
                <a href="<%= request.getContextPath() %>/admin/dashboard" style="font-size: 0.85rem; font-weight: 600;">← Back to Events</a>
                <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--primary); margin-top: 0.25rem;">
                    <%= event != null ? event.getTitle() : "Event Participants" %>
                </h1>
                <p style="color: var(--text-muted); font-size: 0.9rem;">
                    <%= event.getCategory() %> • <%= event.getEventDate() %> at <%= event.getStartTime() %> • <%= event.getVenue() %>
                </p>
            </div>
            <div>
                <a href="<%= request.getContextPath() %>/admin/waitlist?eventId=<%= event.getEventId() %>" class="btn btn-secondary">
                    View FIFO Waitlist Queue (<%= event.getWaitlistedCount() %>)
                </a>
            </div>
        </div>

        <% String msg = request.getParameter("msg");
           if ("attendance_updated".equals(msg)) { %>
            <div class="alert alert-success">Attendance status has been updated successfully!</div>
        <% } %>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Seat Status</th>
                        <th>Registered At</th>
                        <th>Current Attendance</th>
                        <th>Mark Attendance</th>
                    </tr>
                </thead>
                <tbody>
                    <% if (registrations != null && !registrations.isEmpty()) { 
                        for (Registration r : registrations) { 
                            Attendance.Status attStatus = attendanceMap.get(r.getStudentId());
                    %>
                        <tr>
                            <td style="font-weight: 600;"><%= r.getStudentName() %></td>
                            <td><%= r.getStudentEmail() %></td>
                            <td><%= r.getStudentDepartment() %></td>
                            <td>
                                <% if (r.getStatus() == Registration.Status.CONFIRMED) { %>
                                    <span class="badge badge-confirmed">Confirmed</span>
                                <% } else if (r.getStatus() == Registration.Status.WAITLISTED) { %>
                                    <span class="badge badge-waitlisted">Waitlisted</span>
                                <% } else { %>
                                    <span class="badge badge-cancelled">Cancelled</span>
                                <% } %>
                            </td>
                            <td style="color: var(--text-muted); font-size: 0.85rem;"><%= r.getRegisteredAt() %></td>
                            <td>
                                <% if (attStatus == Attendance.Status.PRESENT) { %>
                                    <span class="badge badge-present">✓ Present</span>
                                <% } else if (attStatus == Attendance.Status.ABSENT) { %>
                                    <span class="badge badge-absent">✗ Absent</span>
                                <% } else { %>
                                    <span style="color: var(--text-light); font-size: 0.85rem;">Unrecorded</span>
                                <% } %>
                            </td>
                            <td>
                                <% if (r.getStatus() == Registration.Status.CONFIRMED) { %>
                                    <div style="display: flex; gap: 0.4rem;">
                                        <form action="<%= request.getContextPath() %>/admin/mark-attendance" method="POST" style="display:inline;">
                                            <input type="hidden" name="eventId" value="<%= event.getEventId() %>">
                                            <input type="hidden" name="studentId" value="<%= r.getStudentId() %>">
                                            <input type="hidden" name="status" value="PRESENT">
                                            <button type="submit" class="btn btn-sm <%= attStatus == Attendance.Status.PRESENT ? "btn-primary" : "btn-secondary" %>" title="Mark Present">
                                                Present
                                            </button>
                                        </form>

                                        <form action="<%= request.getContextPath() %>/admin/mark-attendance" method="POST" style="display:inline;">
                                            <input type="hidden" name="eventId" value="<%= event.getEventId() %>">
                                            <input type="hidden" name="studentId" value="<%= r.getStudentId() %>">
                                            <input type="hidden" name="status" value="ABSENT">
                                            <button type="submit" class="btn btn-sm <%= attStatus == Attendance.Status.ABSENT ? "btn-danger" : "btn-secondary" %>" title="Mark Absent">
                                                Absent
                                            </button>
                                        </form>
                                    </div>
                                <% } else { %>
                                    <span style="color: var(--text-light); font-size: 0.82rem;">Not Eligible</span>
                                <% } %>
                            </td>
                        </tr>
                    <%  } 
                       } else { %>
                        <tr>
                            <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                                No registrations found for this event yet.
                            </td>
                        </tr>
                    <% } %>
                </tbody>
            </table>
        </div>

    </main>

    <script src="<%= request.getContextPath() %>/assets/js/app.js"></script>
</body>
</html>
