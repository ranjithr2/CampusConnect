<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.campusconnect.model.DashboardStats" %>
<%@ page import="com.campusconnect.model.Event" %>
<%@ page import="com.campusconnect.model.User" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Map" %>
<%
    User admin = (User) session.getAttribute("currentUser");
    DashboardStats stats = (DashboardStats) request.getAttribute("stats");
    List<Event> events = (List<Event>) request.getAttribute("events");
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administrator Console — CampusConnect</title>
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
                <li><a href="<%= request.getContextPath() %>/admin/dashboard" class="active">Overview</a></li>
                <li><a href="<%= request.getContextPath() %>/admin/events">Event Management</a></li>
                <li><a href="<%= request.getContextPath() %>/admin/create-event">+ New Event</a></li>
                <li><a href="<%= request.getContextPath() %>/admin/reports">Analytics & Reports</a></li>
                <li><a href="<%= request.getContextPath() %>/auth/logout" class="btn btn-secondary btn-sm">Sign Out</a></li>
            </ul>
        </div>
    </nav>

    <main class="container">
        
        <div style="background: #ffffff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.5rem 2rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
                <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--primary);">College Event Administration</h1>
                <p style="color: var(--text-muted); font-size: 0.9rem;">
                    Logged in as <%= admin.getName() %> (<%= admin.getDepartment() %>)
                </p>
            </div>
            <div style="display: flex; gap: 0.75rem;">
                <a href="<%= request.getContextPath() %>/admin/create-event" class="btn btn-primary">
                    + Create New Event
                </a>
            </div>
        </div>

        <!-- Metrics Grid -->
        <div class="metrics-grid">
            <div class="metric-card">
                <span class="metric-title">Active Events</span>
                <div class="metric-value"><%= stats != null ? stats.getTotalActiveEvents() : 0 %></div>
                <div class="metric-desc">Upcoming campus events</div>
            </div>
            <div class="metric-card">
                <span class="metric-title">Confirmed Registrations</span>
                <div class="metric-value" style="color: #2563eb;"><%= stats != null ? stats.getTotalConfirmedRegistrations() : 0 %></div>
                <div class="metric-desc">Total allocated student seats</div>
            </div>
            <div class="metric-card">
                <span class="metric-title">Waitlisted Students</span>
                <div class="metric-value" style="color: #d97706;"><%= stats != null ? stats.getTotalWaitlistedStudents() : 0 %></div>
                <div class="metric-desc">In FIFO promotion queues</div>
            </div>
            <div class="metric-card">
                <span class="metric-title">Overall Attendance Rate</span>
                <div class="metric-value" style="color: #059669;">
                    <%= stats != null ? String.format("%.1f%%", stats.getOverallAttendanceRate()) : "0.0%" %>
                </div>
                <div class="metric-desc">Present check-in ratio</div>
            </div>
        </div>

        <!-- Active Events Quick Management -->
        <div style="margin-bottom: 2.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">Campus Events Overview</h2>
                <a href="<%= request.getContextPath() %>/admin/events" style="font-size: 0.88rem; font-weight: 600;">Manage All Events →</a>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Venue</th>
                            <th>Capacity / Seats</th>
                            <th>Waitlist</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <% if (events != null && !events.isEmpty()) { 
                            for (Event e : events) { 
                                boolean isFull = e.isFull();
                        %>
                            <tr>
                                <td style="font-weight: 600;"><%= e.getTitle() %></td>
                                <td><%= e.getCategory() %></td>
                                <td><%= e.getEventDate() %></td>
                                <td><%= e.getVenue() %></td>
                                <td>
                                    <strong><%= e.getConfirmedRegistrations() %></strong> / <%= e.getCapacity() %>
                                    <% if (isFull) { %>
                                        <span class="badge badge-waitlisted" style="margin-left: 0.35rem;">Full</span>
                                    <% } %>
                                </td>
                                <td>
                                    <% if (e.getWaitlistedCount() > 0) { %>
                                        <span class="badge badge-waitlisted"><%= e.getWaitlistedCount() %> queued</span>
                                    <% } else { %>
                                        <span style="color: var(--text-light); font-size: 0.85rem;">0</span>
                                    <% } %>
                                </td>
                                <td>
                                    <% if (e.getStatus() == Event.Status.UPCOMING) { %>
                                        <span class="badge badge-confirmed">Upcoming</span>
                                    <% } else if (e.getStatus() == Event.Status.COMPLETED) { %>
                                        <span class="badge badge-promoted">Completed</span>
                                    <% } else { %>
                                        <span class="badge badge-cancelled">Cancelled</span>
                                    <% } %>
                                </td>
                                <td>
                                    <div style="display: flex; gap: 0.4rem;">
                                        <a href="<%= request.getContextPath() %>/admin/participants?eventId=<%= e.getEventId() %>" class="btn btn-secondary btn-sm" title="View & Mark Attendance">
                                            Participants
                                        </a>
                                        <a href="<%= request.getContextPath() %>/admin/waitlist?eventId=<%= e.getEventId() %>" class="btn btn-secondary btn-sm" title="View Waitlist Queue">
                                            Queue
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        <%  } 
                           } else { %>
                            <tr>
                                <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                                    No events created yet.
                                </td>
                            </tr>
                        <% } %>
                    </tbody>
                </table>
            </div>
        </div>

    </main>

    <script src="<%= request.getContextPath() %>/assets/js/app.js"></script>
</body>
</html>
