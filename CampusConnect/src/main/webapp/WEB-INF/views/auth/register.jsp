<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Registration — CampusConnect</title>
    <link rel="stylesheet" href="<%= request.getContextPath() %>/assets/css/style.css">
</head>
<body style="display: flex; flex-direction: column; min-height: 100vh;">

    <nav class="navbar">
        <div class="nav-container">
            <a href="<%= request.getContextPath() %>/" class="brand">
                <span>CampusConnect</span>
            </a>
            <div>
                <a href="<%= request.getContextPath() %>/auth/login" class="btn btn-secondary btn-sm">Already Registered? Sign In</a>
            </div>
        </div>
    </nav>

    <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem 1.5rem;">
        <div class="form-card" style="width: 100%; max-width: 480px;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--primary);">Student Account Registration</h2>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Join the campus network to register for workshops and competitions</p>
            </div>

            <% String error = (String) request.getAttribute("errorMessage");
               if (error != null) { %>
                <div class="alert alert-error"><%= error %></div>
            <% } %>

            <form action="<%= request.getContextPath() %>/auth/register" method="POST">
                <div class="form-group">
                    <label class="form-label">Full Name *</label>
                    <input type="text" name="name" class="form-control" required placeholder="e.g. Jordan Lee"
                           value="<%= request.getAttribute("enteredName") != null ? request.getAttribute("enteredName") : "" %>">
                </div>

                <div class="form-group">
                    <label class="form-label">College Email Address *</label>
                    <input type="email" name="email" class="form-control" required placeholder="e.g. jordan.lee@student.edu"
                           value="<%= request.getAttribute("enteredEmail") != null ? request.getAttribute("enteredEmail") : "" %>">
                </div>

                <div class="form-group">
                    <label class="form-label">Password * (Min. 6 characters)</label>
                    <input type="password" name="password" class="form-control" required minlength="6" placeholder="••••••••">
                </div>

                <div class="form-group">
                    <label class="form-label">Academic Department *</label>
                    <select name="department" class="form-control" required>
                        <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Data Science & AI">Data Science & AI</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Biotechnology">Biotechnology</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Contact Phone Number</label>
                    <input type="tel" name="phone" class="form-control" placeholder="+1-555-0100"
                           value="<%= request.getAttribute("enteredPhone") != null ? request.getAttribute("enteredPhone") : "" %>">
                </div>

                <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.75rem; margin-top: 0.5rem;">
                    Complete Registration
                </button>
            </form>

            <div style="text-align: center; margin-top: 1.5rem; font-size: 0.88rem; color: var(--text-muted);">
                Already have an account? <a href="<%= request.getContextPath() %>/auth/login" style="font-weight: 600;">Sign In</a>
            </div>
        </div>
    </div>

    <script src="<%= request.getContextPath() %>/assets/js/app.js"></script>
</body>
</html>
