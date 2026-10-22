<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.campusconnect.model.Waitlist" %>
<%@ page import="java.util.List" %>
<%
    List<Waitlist> waitlist = (List<Waitlist>) request.getAttribute("waitlistEntries");
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Waitlist Queue Status — CampusConnect</title>
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
                <li><a href="<%= request.getContextPath() %>/student/waitlist" class="active">Waitlist Queue</a></li>
                <li><a href="<%= request.getContextPath() %>/student/attendance">My Attendance</a></li>
                <li><a href="<%= request.getContextPath() %>/auth/logout" class="btn btn-secondary btn-sm">Sign Out</a></li>
            </ul>
        </div>
    </nav>

    <main class="container">
        
        <div style="margin-bottom: 2rem;">
            <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--primary);">My Waitlist Status</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
                Track your real-time position in high-demand event waitlists. Promotions occur automatically when registered students cancel.
            </p>
        </div>

        <% String msg = request.getParameter("msg");
           if ("registered_waitlisted".equals(msg)) { %>
            <div class="alert alert-success">
                Event is currently at maximum capacity. You have been successfully added to the FIFO Waitlist queue!
            </div>
        <% } %>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Event Title</th>
                        <th>Event Date</th>
                        <th>Current Queue Position</th>
                        <th>Queue Status</th>
                        <th>Joined At</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <% if (waitlist != null && !waitlist.isEmpty()) { 
                        for (Waitlist w : waitlist) { %>
                        <tr>
                            <td style="font-weight: 600;"><%= w.getEventTitle() %></td>
                            <td><%= w.getEventDate() %></td>
                            <td>
                                <% if (w.getStatus() == Waitlist.Status.WAITING) { %>
                                    <span style="font-weight: 800; font-size: 1.1rem; color: #d97706;">#<%= w.getPosition() %></span> in line
                                <% } else { %>
                                    <span style="color: var(--text-muted);">-</span>
                                <% } %>
                            </td>
                            <td>
                                <% if (w.getStatus() == Waitlist.Status.WAITING) { %>
                                    <span class="badge badge-waiting">Waiting in Queue</span>
                                <% } else if (w.getStatus() == Waitlist.Status.PROMOTED) { %>
                                    <span class="badge badge-promoted">Promoted to Confirmed!</span>
                                <% } else { %>
                                    <span class="badge badge-cancelled">Cancelled</span>
                                <% } %>
                            </td>
                            <td style="color: var(--text-muted); font-size: 0.85rem;"><%= w.getJoinedAt() %></td>
                            <td>
                                <% if (w.getStatus() == Waitlist.Status.WAITING) { %>
                                    <form action="<%= request.getContextPath() %>/student/cancel" method="POST" style="display:inline;">
                                        <input type="hidden" name="eventId" value="<%= w.getEventId() %>">
                                        <button type="submit" class="btn btn-secondary btn-sm" data-confirm="Leave the waitlist queue for this event?">
                                            Leave Queue
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
                            <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                                You are not currently on any waitlist queues.
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
