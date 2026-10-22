<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.campusconnect.model.DashboardStats" %>
<%@ page import="com.campusconnect.model.Event" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Map" %>
<%
    DashboardStats stats = (DashboardStats) request.getAttribute("stats");
    List<Event> events = (List<Event>) request.getAttribute("events");
    Map<String, Integer> catDist = (stats != null) ? stats.getCategoryDistribution() : null;
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics & Reports — CampusConnect</title>
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
                <li><a href="<%= request.getContextPath() %>/admin/events">Event Management</a></li>
                <li><a href="<%= request.getContextPath() %>/admin/create-event">+ New Event</a></li>
                <li><a href="<%= request.getContextPath() %>/admin/reports" class="active">Analytics & Reports</a></li>
                <li><a href="<%= request.getContextPath() %>/auth/logout" class="btn btn-secondary btn-sm">Sign Out</a></li>
            </ul>
        </div>
    </nav>

    <main class="container">
        
        <div style="margin-bottom: 2rem;">
            <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--primary);">Analytics & Reporting Center</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
                Statistical aggregation calculated directly from MySQL relational tables using JDBC queries.
            </p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <span class="metric-title">Campus Attendance Rate</span>
                <div class="metric-value" style="color: #059669;">
                    <%= stats != null ? String.format("%.1f%%", stats.getOverallAttendanceRate()) : "0.0%" %>
                </div>
                <div class="metric-desc">Ratio of Present to total check-ins</div>
            </div>
            <div class="metric-card">
                <span class="metric-title">Active Registrations</span>
                <div class="metric-value"><%= stats != null ? stats.getTotalConfirmedRegistrations() : 0 %></div>
                <div class="metric-desc">Confirmed participant seats</div>
            </div>
            <div class="metric-card">
                <span class="metric-title">Waitlist Queue Load</span>
                <div class="metric-value" style="color: #d97706;"><%= stats != null ? stats.getTotalWaitlistedStudents() : 0 %></div>
                <div class="metric-desc">Students awaiting seat opening</div>
            </div>
        </div>

        <!-- Category Breakdown -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
            <div style="background:#fff; border:1px solid var(--border); border-radius:var(--radius-md); padding:1.5rem;">
                <h3 style="font-size:1.1rem; font-weight:700; color:var(--primary); margin-bottom:1rem;">Event Category Distribution</h3>
                <% if (catDist != null && !catDist.isEmpty()) { 
                    for (Map.Entry<String, Integer> entry : catDist.entrySet()) { %>
                    <div style="display:flex; justify-content:space-between; align-items:center; padding: 0.6rem 0; border-bottom:1px solid #f1f5f9;">
                        <span style="font-weight:600; font-size:0.9rem;"><%= entry.getKey() %></span>
                        <span class="badge badge-promoted"><%= entry.getValue() %> events</span>
                    </div>
                <%  } 
                   } else { %>
                    <p style="color:var(--text-muted);">No categories available.</p>
                <% } %>
            </div>

            <div style="background:#fff; border:1px solid var(--border); border-radius:var(--radius-md); padding:1.5rem;">
                <h3 style="font-size:1.1rem; font-weight:700; color:var(--primary); margin-bottom:1rem;">Capacity Utilization Summary</h3>
                <% if (events != null && !events.isEmpty()) { 
                    for (Event ev : events) { 
                        int pct = (ev.getCapacity() > 0) ? (int)((ev.getConfirmedRegistrations() * 100.0) / ev.getCapacity()) : 0;
                %>
                    <div style="margin-bottom: 1rem;">
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.25rem;">
                            <strong><%= ev.getTitle() %></strong>
                            <span><%= ev.getConfirmedRegistrations() %> / <%= ev.getCapacity() %> (<%= pct %>%)</span>
                        </div>
                        <div class="capacity-bar-container">
                            <div class="capacity-bar-fill <%= pct >= 100 ? "capacity-bar-full" : "" %>" style="width: <%= Math.min(100, pct) %>%;"></div>
                        </div>
                    </div>
                <%  } 
                   } %>
            </div>
        </div>

    </main>

    <script src="<%= request.getContextPath() %>/assets/js/app.js"></script>
</body>
</html>
