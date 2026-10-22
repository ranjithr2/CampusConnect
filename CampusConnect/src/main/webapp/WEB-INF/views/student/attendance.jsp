<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.campusconnect.model.Attendance" %>
<%@ page import="java.util.List" %>
<%
    List<Attendance> history = (List<Attendance>) request.getAttribute("attendanceHistory");
    Integer attendedCount = (Integer) request.getAttribute("attendedCount");
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Attendance Transcript — CampusConnect</title>
    <link rel="stylesheet" href="<%= request.getContextPath() %>/assets/css/style.css">
</head>
<body>

    <nav class="navbar">
        <div class="nav-container">
            <a href="<%= request.getContextPath() %>/" class="brand">
                <span>CampusConnect</span>
                <span class="brand-badge">Student Portal</span>
            </a>
            <ul class="nav-links">
                <li><a href="<%= request.getContextPath() %>/student/dashboard">Dashboard</a></li>
                <li><a href="<%= request.getContextPath() %>/#events">Discover Events</a></li>
                <li><a href="<%= request.getContextPath() %>/student/registrations">My Registrations</a></li>
                <li><a href="<%= request.getContextPath() %>/student/waitlist">Waitlist Queue</a></li>
                <li><a href="<%= request.getContextPath() %>/student/attendance" class="active">My Attendance</a></li>
                <li><a href="<%= request.getContextPath() %>/auth/logout" class="btn btn-secondary btn-sm">Sign Out</a></li>
            </ul>
        </div>
    </nav>

    <main class="container">
        
        <div style="margin-bottom: 2rem;">
            <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--primary);">Official Attendance Transcript</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
                Verifiable event check-in records marked by authorized college faculties and event coordinators.
            </p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <span class="metric-title">Attended Events</span>
                <div class="metric-value" style="color: #059669;"><%= attendedCount != null ? attendedCount : 0 %></div>
                <div class="metric-desc">Present check-in verified</div>
            </div>
        </div>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Event Title</th>
                        <th>Event Date</th>
                        <th>Attendance Status</th>
                        <th>Verified By</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    <% if (history != null && !history.isEmpty()) { 
                        for (Attendance a : history) { %>
                        <tr>
                            <td style="font-weight: 600;"><%= a.getEventTitle() %></td>
                            <td><%= a.getEventDate() %></td>
                            <td>
                                <% if (a.getStatus() == Attendance.Status.PRESENT) { %>
                                    <span class="badge badge-present">✓ Present</span>
                                <% } else { %>
                                    <span class="badge badge-absent">✗ Absent</span>
                                <% } %>
                            </td>
                            <td><%= a.getMarkedByName() != null ? a.getMarkedByName() : "Authorized Faculty" %></td>
                            <td style="color: var(--text-muted); font-size: 0.85rem;"><%= a.getMarkedAt() %></td>
                        </tr>
                    <%  } 
                       } else { %>
                        <tr>
                            <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                                No attendance records on file yet. Attendance is recorded on-site during completed events.
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
