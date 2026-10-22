<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.campusconnect.service.EventService" %>
<%@ page import="com.campusconnect.model.Event" %>
<%@ page import="java.util.List" %>
<%
    EventService eventService = new EventService();
    List<Event> upcomingEvents = eventService.getUpcomingEvents();
    Object currentUser = session.getAttribute("currentUser");
    String userRole = (String) session.getAttribute("userRole");
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CampusConnect — College Event Management System</title>
    <link rel="stylesheet" href="<%= request.getContextPath() %>/assets/css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>

    <!-- Top Navigation Bar -->
    <nav class="navbar">
        <div class="nav-container">
            <a href="<%= request.getContextPath() %>/" class="brand">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
                    <path d="M6 6h10"></path><path d="M6 10h10"></path>
                </svg>
                <span>CampusConnect</span>
                <span class="brand-badge">Enterprise</span>
            </a>

            <ul class="nav-links">
                <li><a href="#events">Upcoming Events</a></li>
                <li><a href="#features">Smart Waitlist</a></li>
                <li><a href="#attendance">Attendance</a></li>
                <% if (currentUser == null) { %>
                    <li><a href="<%= request.getContextPath() %>/auth/login" class="btn btn-secondary btn-sm">Sign In</a></li>
                    <li><a href="<%= request.getContextPath() %>/auth/register" class="btn btn-primary btn-sm">Register as Student</a></li>
                <% } else if ("ADMIN".equals(userRole)) { %>
                    <li><a href="<%= request.getContextPath() %>/admin/dashboard" class="btn btn-primary btn-sm">Admin Console</a></li>
                    <li><a href="<%= request.getContextPath() %>/auth/logout" class="btn btn-secondary btn-sm">Logout</a></li>
                <% } else { %>
                    <li><a href="<%= request.getContextPath() %>/student/dashboard" class="btn btn-primary btn-sm">Student Dashboard</a></li>
                    <li><a href="<%= request.getContextPath() %>/auth/logout" class="btn btn-secondary btn-sm">Logout</a></li>
                <% } %>
            </ul>
        </div>
    </nav>

    <!-- Hero Section -->
    <header class="hero">
        <div style="max-width: 900px; margin: 0 auto;">
            <div style="display: inline-block; background: rgba(255,255,255,0.12); padding: 0.35rem 1rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.2);">
                ✦ Full-Stack Jakarta EE 10 • Java 21 • MySQL Connector/J
            </div>
            <h1>One Campus. Every Event.<br><span style="color: #60a5fa;">Seamlessly Connected.</span></h1>
            <p>
                Experience unified college event discovery, zero-overbooking capacity control,
                atomic FIFO waitlist promotions, and verifiable attendance records.
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <a href="#events" class="btn btn-primary" style="background: #2563eb; padding: 0.8rem 1.75rem; font-size: 1rem;">
                    Explore Campus Events
                </a>
                <% if (currentUser == null) { %>
                    <a href="<%= request.getContextPath() %>/auth/login" class="btn btn-secondary" style="padding: 0.8rem 1.75rem; font-size: 1rem;">
                        Portal Login
                    </a>
                <% } %>
            </div>
        </div>
    </header>

    <!-- Main Container -->
    <main class="container" id="events">
        
        <!-- Search & Filter Controls -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
            <div>
                <h2 style="font-size: 1.75rem; font-weight: 800; color: var(--primary);">Featured Upcoming Events</h2>
                <p style="color: var(--text-muted); font-size: 0.95rem;">Real-time event status streamed live from MySQL database</p>
            </div>
            <div style="display: flex; gap: 0.75rem;">
                <input type="text" id="eventSearchInput" class="form-control" placeholder="Search event by title..." style="width: 240px;">
                <select id="categoryFilter" class="form-control" style="width: 170px;">
                    <option value="ALL">All Categories</option>
                    <option value="Technical Workshop">Workshops</option>
                    <option value="Coding Contest">Coding Contests</option>
                    <option value="Guest Seminar">Seminars</option>
                    <option value="Cultural Fest">Cultural</option>
                </select>
            </div>
        </div>

        <!-- Event Cards Grid -->
        <div class="events-grid">
            <% if (upcomingEvents != null && !upcomingEvents.isEmpty()) { 
                for (Event ev : upcomingEvents) { 
                    int confirmed = ev.getConfirmedRegistrations();
                    int cap = ev.getCapacity();
                    int pct = (cap > 0) ? (int)((confirmed * 100.0) / cap) : 0;
                    boolean isFull = ev.isFull();
            %>
                <div class="event-card" data-title="<%= ev.getTitle() %>" data-category="<%= ev.getCategory() %>">
                    <div class="event-card-header">
                        <span class="event-category-badge"><%= ev.getCategory() %></span>
                        <h3 class="event-card-title"><%= ev.getTitle() %></h3>
                        <p style="color: var(--text-muted); font-size: 0.88rem; line-height: 1.4; margin-bottom: 0.5rem;">
                            <%= ev.getDescription().length() > 110 ? ev.getDescription().substring(0, 107) + "..." : ev.getDescription() %>
                        </p>
                    </div>

                    <div class="event-card-body">
                        <div class="event-meta">
                            <div><strong>📅 Date:</strong> <%= ev.getEventDate() %> at <%= ev.getStartTime() %></div>
                            <div><strong>📍 Venue:</strong> <%= ev.getVenue() %></div>
                            <div>
                                <strong>👥 Capacity:</strong> <%= confirmed %> / <%= cap %> seats
                                <% if (isFull) { %>
                                    <span class="badge badge-waitlisted" style="margin-left: 0.5rem;">Event Full</span>
                                <% } else { %>
                                    <span class="badge badge-confirmed" style="margin-left: 0.5rem;"><%= cap - confirmed %> Left</span>
                                <% } %>
                            </div>
                            <div class="capacity-bar-container">
                                <div class="capacity-bar-fill <%= isFull ? "capacity-bar-full" : "" %>" style="width: <%= Math.min(100, pct) %>%;"></div>
                            </div>
                        </div>

                        <div style="border-top: 1px solid var(--border); padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
                            <% if (currentUser != null && "STUDENT".equals(userRole)) { %>
                                <form action="<%= request.getContextPath() %>/student/register" method="POST" style="width: 100%;">
                                    <input type="hidden" name="eventId" value="<%= ev.getEventId() %>">
                                    <button type="submit" class="btn <%= isFull ? "btn-secondary" : "btn-primary" %>" style="width: 100%;">
                                        <%= isFull ? "Join FIFO Waitlist" : "Register Now" %>
                                    </button>
                                </form>
                            <% } else { %>
                                <a href="<%= request.getContextPath() %>/auth/login" class="btn btn-primary" style="width: 100%;">
                                    Sign In to Register
                                </a>
                            <% } %>
                        </div>
                    </div>
                </div>
            <%  } 
               } else { %>
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">📅</div>
                    <h3>No upcoming events currently scheduled</h3>
                    <p>New campus activities, seminars, and hackathons will appear here once published.</p>
                </div>
            <% } %>
        </div>

        <!-- Features Showcase Section -->
        <section id="features" style="margin-top: 5rem; padding-top: 3rem; border-top: 1px solid var(--border);">
            <div style="text-align: center; max-width: 700px; margin: 0 auto 3rem;">
                <h2 style="font-size: 2rem; font-weight: 800; color: var(--primary);">Smart Waitlist Concurrency Engine</h2>
                <p style="color: var(--text-muted);">How CampusConnect prevents race conditions and handles high-demand registrations with absolute mathematical consistency.</p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                <div class="metric-card">
                    <div class="metric-title">1. Atomic Capacity Check</div>
                    <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--text-main);">Row-Level Locking</h3>
                    <p style="color: var(--text-muted); font-size: 0.88rem;">
                        Uses <code>SELECT ... FOR UPDATE</code> inside active ACID transactions. Confirmed seats and capacity limits are verified atomically without race condition windows.
                    </p>
                </div>

                <div class="metric-card">
                    <div class="metric-title">2. Automatic FIFO Queuing</div>
                    <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--text-main);">First-In, First-Out Order</h3>
                    <p style="color: var(--text-muted); font-size: 0.88rem;">
                        When an event hits 100% capacity, incoming registrations automatically transition into the waitlist queue. Each student is assigned an explicit position number.
                    </p>
                </div>

                <div class="metric-card">
                    <div class="metric-title">3. Instant Promotion</div>
                    <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--text-main);">Zero-Downtime Fill</h3>
                    <p style="color: var(--text-muted); font-size: 0.88rem;">
                        The moment any confirmed attendee cancels, the system automatically promotes position #1 to CONFIRMED and resequences remaining students instantly.
                    </p>
                </div>
            </div>
        </section>

        <!-- Attendance Section -->
        <section id="attendance" style="margin-top: 4rem; padding: 2.5rem; background: #ffffff; border: 1px solid var(--border); border-radius: var(--radius-md);">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center;">
                <div>
                    <span class="brand-badge" style="margin-bottom: 0.75rem; display: inline-block;">Verifiable Records</span>
                    <h2 style="font-size: 1.75rem; font-weight: 800; color: var(--primary); margin-bottom: 0.75rem;">Real-Time Attendance Audit</h2>
                    <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1rem;">
                        Faculty and event coordinators can mark Present/Absent status directly from the Admin Portal.
                        Prevents duplicate records through unique SQL constraints and provides students with an authoritative event transcript.
                    </p>
                    <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem; color: var(--text-main);">
                        <li>✓ One-click Present/Absent toggling</li>
                        <li>✓ Live percentage calculations across completed events</li>
                        <li>✓ Individual student participation transcripts</li>
                    </ul>
                </div>
                <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1.5rem;">
                    <div style="font-weight: 700; margin-bottom: 1rem; color: var(--primary);">System Credentials for Demonstration</div>
                    <div style="background: #ffffff; border: 1px solid var(--border); border-radius: 6px; padding: 0.75rem 1rem; margin-bottom: 0.75rem; font-family: monospace; font-size: 0.85rem;">
                        <strong>Admin:</strong> admin@campusconnect.edu | <strong>Password:</strong> Admin@123
                    </div>
                    <div style="background: #ffffff; border: 1px solid var(--border); border-radius: 6px; padding: 0.75rem 1rem; font-family: monospace; font-size: 0.85rem;">
                        <strong>Student:</strong> alex.mercer@student.edu | <strong>Password:</strong> Student@123
                    </div>
                </div>
            </div>
        </section>

    </main>

    <!-- Footer -->
    <footer style="background: #ffffff; border-top: 1px solid var(--border); padding: 3rem 1.5rem; margin-top: 5rem; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
                <strong>CampusConnect</strong> — College Event Management System
            </div>
            <div>
                Developed with Java 21 LTS • Jakarta Servlets 6.0 • JSP • MySQL 8.0 • JDBC
            </div>
        </div>
    </footer>

    <script src="<%= request.getContextPath() %>/assets/js/app.js"></script>
</body>
</html>
