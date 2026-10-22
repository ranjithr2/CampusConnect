<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.campusconnect.model.User" %>
<%@ page import="com.campusconnect.model.Event" %>
<%@ page import="com.campusconnect.model.Registration" %>
<%@ page import="java.util.List" %>
<%
    User student = (User) session.getAttribute("currentUser");
    Long confirmedCount = (Long) request.getAttribute("confirmedCount");
    Long waitlistCount = (Long) request.getAttribute("waitlistCount");
    Integer attendedCount = (Integer) request.getAttribute("attendedCount");
    List<Event> upcomingEvents = (List<Event>) request.getAttribute("upcomingEvents");
    List<Registration> myRegs = (List<Registration>) request.getAttribute("myRegistrations");
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Dashboard — CampusConnect</title>
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
                <li><a href="<%= request.getContextPath() %>/student/dashboard" class="active">Dashboard</a></li>
                <li><a href="<%= request.getContextPath() %>/#events">Discover Events</a></li>
                <li><a href="<%= request.getContextPath() %>/student/registrations">My Registrations</a></li>
                <li><a href="<%= request.getContextPath() %>/student/waitlist">Waitlist Queue</a></li>
                <li><a href="<%= request.getContextPath() %>/student/attendance">My Attendance</a></li>
                <li><a href="<%= request.getContextPath() %>/auth/logout" class="btn btn-secondary btn-sm">Sign Out</a></li>
            </ul>
        </div>
    </nav>

    <main class="container">
        
        <!-- Welcome Banner -->
        <div style="background: #ffffff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.5rem 2rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
                <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--primary);">Welcome back, <%= student.getName() %>!</h1>
                <p style="color: var(--text-muted); font-size: 0.9rem;">
                    <%= student.getDepartment() %> • <%= student.getEmail() %>
                </p>
            </div>
            <div>
                <a href="<%= request.getContextPath() %>/#events" class="btn btn-primary">
                    + Explore & Register Events
                </a>
            </div>
        </div>

        <!-- Metrics Row -->
        <div class="metrics-grid">
            <div class="metric-card">
                <span class="metric-title">Confirmed Seats</span>
                <div class="metric-value"><%= confirmedCount != null ? confirmedCount : 0 %></div>
                <div class="metric-desc">Upcoming events confirmed</div>
            </div>
            <div class="metric-card">
                <span class="metric-title">Waitlisted Events</span>
                <div class="metric-value" style="color: #d97706;"><%= waitlistCount != null ? waitlistCount : 0 %></div>
                <div class="metric-desc">In FIFO promotion queue</div>
            </div>
            <div class="metric-card">
                <span class="metric-title">Attended Past Events</span>
                <div class="metric-value" style="color: #059669;"><%= attendedCount != null ? attendedCount : 0 %></div>
                <div class="metric-desc">Verified attendance records</div>
            </div>
        </div>

        <!-- Active Registrations Table -->
        <div style="margin-bottom: 2.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">My Active Registrations</h2>
                <a href="<%= request.getContextPath() %>/student/registrations" style="font-size: 0.88rem; font-weight: 600;">View All →</a>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Event Title</th>
                            <th>Category</th>
                            <th>Date & Time</th>
                            <th>Venue</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <% if (myRegs != null && !myRegs.isEmpty()) { 
                            for (Registration r : myRegs) { %>
                            <tr>
                                <td style="font-weight: 600;"><%= r.getEventTitle() %></td>
                                <td><%= r.getEventCategory() %></td>
                                <td><%= r.getEventDate() %> at <%= r.getEventTime() %></td>
                                <td><%= r.getEventVenue() %></td>
                                <td>
                                    <% if (r.getStatus() == Registration.Status.CONFIRMED) { %>
                                        <span class="badge badge-confirmed">Confirmed</span>
                                    <% } else if (r.getStatus() == Registration.Status.WAITLISTED) { %>
                                        <span class="badge badge-waitlisted">Waitlisted</span>
                                    <% } else { %>
                                        <span class="badge badge-cancelled">Cancelled</span>
                                    <% } %>
                                </td>
                                <td>
                                    <% if (r.getStatus() != Registration.Status.CANCELLED) { %>
                                        <form action="<%= request.getContextPath() %>/student/cancel" method="POST" style="display:inline;">
                                            <input type="hidden" name="eventId" value="<%= r.getEventId() %>">
                                            <button type="submit" class="btn btn-secondary btn-sm" data-confirm="Are you sure you want to cancel your seat? If waitlisted students exist, the next student will be promoted automatically.">
                                                Cancel Seat
                                            </button>
                                        </form>
                                    <% } else { %>
                                        <span style="color: var(--text-light); font-size: 0.85rem;">None</span>
                                    <% } %>
                                </td>
                            </tr>
                        <%  } 
                           } else { %>
                            <tr>
                                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                                    You have not registered for any events yet. <a href="<%= request.getContextPath() %>/#events">Browse events now</a>.
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
