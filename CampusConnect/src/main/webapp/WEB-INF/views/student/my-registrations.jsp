<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.campusconnect.model.Registration" %>
<%@ page import="java.util.List" %>
<%
    List<Registration> registrations = (List<Registration>) request.getAttribute("registrations");
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Event Registrations — CampusConnect</title>
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
                <li><a href="<%= request.getContextPath() %>/student/registrations" class="active">My Registrations</a></li>
                <li><a href="<%= request.getContextPath() %>/student/waitlist">Waitlist Queue</a></li>
                <li><a href="<%= request.getContextPath() %>/student/attendance">My Attendance</a></li>
                <li><a href="<%= request.getContextPath() %>/auth/logout" class="btn btn-secondary btn-sm">Sign Out</a></li>
            </ul>
        </div>
    </nav>

    <main class="container">
        
        <div style="margin-bottom: 2rem;">
            <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--primary);">My Event Registrations</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
                History of all your confirmed registrations, waitlist enrollments, and past events.
            </p>
        </div>

        <% String msg = request.getParameter("msg");
           if ("registered_confirmed".equals(msg)) { %>
            <div class="alert alert-success">Your seat has been successfully confirmed!</div>
        <% } else if ("cancelled_promoted_next".equals(msg)) { %>
            <div class="alert alert-success">Your registration has been cancelled. The next eligible student in the waitlist has been promoted to your seat!</div>
        <% } else if ("cancelled_success".equals(msg)) { %>
            <div class="alert alert-success">Your registration has been cancelled.</div>
        <% } %>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Event Title</th>
                        <th>Category</th>
                        <th>Schedule</th>
                        <th>Venue</th>
                        <th>Status</th>
                        <th>Registered Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <% if (registrations != null && !registrations.isEmpty()) { 
                        for (Registration r : registrations) { %>
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
                            <td style="color: var(--text-muted); font-size: 0.85rem;"><%= r.getRegisteredAt() %></td>
                            <td>
                                <% if (r.getStatus() != Registration.Status.CANCELLED) { %>
                                    <form action="<%= request.getContextPath() %>/student/cancel" method="POST" style="display:inline;">
                                        <input type="hidden" name="eventId" value="<%= r.getEventId() %>">
                                        <button type="submit" class="btn btn-secondary btn-sm" data-confirm="Are you sure you want to cancel this registration?">
                                            Cancel Seat
                                        </button>
                                    </form>
                                <% } else { %>
                                    <span style="color: var(--text-light); font-size: 0.85rem;">Cancelled</span>
                                <% } %>
                            </td>
                        </tr>
                    <%  } 
                       } else { %>
                        <tr>
                            <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                                No event registrations found.
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
