<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.campusconnect.model.Event" %>
<%@ page import="com.campusconnect.model.Waitlist" %>
<%@ page import="java.util.List" %>
<%
    Event event = (Event) request.getAttribute("event");
    List<Waitlist> waitlist = (List<Waitlist>) request.getAttribute("waitlist");
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FIFO Waitlist Queue — <%= event != null ? event.getTitle() : "Event" %></title>
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
                <a href="<%= request.getContextPath() %>/admin/participants?eventId=<%= event.getEventId() %>" style="font-size: 0.85rem; font-weight: 600;">← Back to Confirmed Participants</a>
                <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--primary); margin-top: 0.25rem;">
                    FIFO Waitlist Queue — <%= event.getTitle() %>
                </h1>
                <p style="color: var(--text-muted); font-size: 0.9rem;">
                    Capacity: <%= event.getConfirmedRegistrations() %> / <%= event.getCapacity() %> seats • Strictly ordered by queue position & join timestamp
                </p>
            </div>
            <div>
                <a href="<%= request.getContextPath() %>/admin/participants?eventId=<%= event.getEventId() %>" class="btn btn-secondary">
                    View Participant Roster
                </a>
            </div>
        </div>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Queue Position</th>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Joined At</th>
                        <th>Status</th>
                        <th>Promotion Priority</th>
                    </tr>
                </thead>
                <tbody>
                    <% if (waitlist != null && !waitlist.isEmpty()) { 
                        for (Waitlist w : waitlist) { %>
                        <tr>
                            <td>
                                <% if (w.getStatus() == Waitlist.Status.WAITING) { %>
                                    <span style="font-size: 1.25rem; font-weight: 800; color: #d97706;">#<%= w.getPosition() %></span>
                                <% } else { %>
                                    <span style="color: var(--text-light);">-</span>
                                <% } %>
                            </td>
                            <td style="font-weight: 600;"><%= w.getStudentName() %></td>
                            <td><%= w.getStudentEmail() %></td>
                            <td><%= w.getStudentDepartment() %></td>
                            <td style="color: var(--text-muted); font-size: 0.85rem;"><%= w.getJoinedAt() %></td>
                            <td>
                                <% if (w.getStatus() == Waitlist.Status.WAITING) { %>
                                    <span class="badge badge-waiting">Waiting</span>
                                <% } else if (w.getStatus() == Waitlist.Status.PROMOTED) { %>
                                    <span class="badge badge-promoted">Promoted to Confirmed</span>
                                <% } else { %>
                                    <span class="badge badge-cancelled">Cancelled</span>
                                <% } %>
                            </td>
                            <td>
                                <% if (w.getStatus() == Waitlist.Status.WAITING) { 
                                    if (w.getPosition() == 1) { %>
                                        <span class="badge badge-confirmed" style="background:#ecfdf5; color:#065f46;">Next in Line (Priority #1)</span>
                                    <% } else { %>
                                        <span style="color: var(--text-muted); font-size: 0.85rem;">In line (Behind <%= w.getPosition() - 1 %>)</span>
                                    <% }
                                   } else { %>
                                    <span style="color: var(--text-light); font-size: 0.85rem;">Processed</span>
                                <% } %>
                            </td>
                        </tr>
                    <%  } 
                       } else { %>
                        <tr>
                            <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                                No students currently in waitlist for this event.
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
