<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create New Event — CampusConnect</title>
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
                <li><a href="<%= request.getContextPath() %>/admin/create-event" class="active">+ New Event</a></li>
                <li><a href="<%= request.getContextPath() %>/admin/reports">Analytics & Reports</a></li>
                <li><a href="<%= request.getContextPath() %>/auth/logout" class="btn btn-secondary btn-sm">Sign Out</a></li>
            </ul>
        </div>
    </nav>

    <main class="container">
        
        <div class="form-card">
            <div style="margin-bottom: 1.75rem;">
                <h1 style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">Create College Event</h1>
                <p style="color: var(--text-muted); font-size: 0.88rem;">Publish a new campus seminar, technical workshop, hackathon, or cultural activity</p>
            </div>

            <% String error = (String) request.getAttribute("errorMessage");
               if (error != null) { %>
                <div class="alert alert-error"><%= error %></div>
            <% } %>

            <form action="<%= request.getContextPath() %>/admin/create-event" method="POST">
                <div class="form-group">
                    <label class="form-label">Event Title *</label>
                    <input type="text" name="title" class="form-control" required placeholder="e.g. AI & Robotics Symposium">
                </div>

                <div class="form-group">
                    <label class="form-label">Description *</label>
                    <textarea name="description" class="form-control" rows="4" required placeholder="Outline event objectives, speakers, prerequisites, and itinerary..."></textarea>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Category *</label>
                        <select name="category" class="form-control" required>
                            <option value="Technical Workshop">Technical Workshop</option>
                            <option value="Coding Contest">Coding Contest</option>
                            <option value="Guest Seminar">Guest Seminar</option>
                            <option value="Cultural Fest">Cultural Fest</option>
                            <option value="Hackathon">Hackathon</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Total Seat Capacity *</label>
                        <input type="number" name="capacity" class="form-control" required min="1" max="1000" placeholder="e.g. 50">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Event Date *</label>
                        <input type="date" name="date" class="form-control" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Start Time *</label>
                        <input type="time" name="time" class="form-control" required value="10:00">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Venue / Room *</label>
                    <input type="text" name="venue" class="form-control" required placeholder="e.g. Turing Auditorium, Lab 401">
                </div>

                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button type="submit" class="btn btn-primary" style="flex: 1;">
                        Publish Event
                    </button>
                    <a href="<%= request.getContextPath() %>/admin/dashboard" class="btn btn-secondary">
                        Cancel
                    </a>
                </div>
            </form>
        </div>

    </main>

    <script src="<%= request.getContextPath() %>/assets/js/app.js"></script>
</body>
</html>
