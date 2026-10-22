<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In — CampusConnect</title>
    <link rel="stylesheet" href="<%= request.getContextPath() %>/assets/css/style.css">
</head>
<body style="display: flex; flex-direction: column; min-height: 100vh;">

    <nav class="navbar">
        <div class="nav-container">
            <a href="<%= request.getContextPath() %>/" class="brand">
                <span>CampusConnect</span>
            </a>
            <div>
                <a href="<%= request.getContextPath() %>/" class="btn btn-secondary btn-sm">← Back to Home</a>
            </div>
        </div>
    </nav>

    <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem 1.5rem;">
        <div class="form-card" style="width: 100%; max-width: 440px;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--primary);">Welcome Back</h2>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Sign in to your CampusConnect account</p>
            </div>

            <% String error = (String) request.getAttribute("errorMessage");
               if (error != null) { %>
                <div class="alert alert-error"><%= error %></div>
            <% } %>

            <% String msg = request.getParameter("msg");
               if ("registered_success".equals(msg)) { %>
                <div class="alert alert-success">Registration successful! You can now log in below.</div>
            <% } else if ("logged_out".equals(msg)) { %>
                <div class="alert alert-success">You have been logged out securely.</div>
            <% } %>

            <form action="<%= request.getContextPath() %>/auth/login" method="POST">
                <input type="hidden" name="redirect" value="<%= request.getParameter("redirect") != null ? request.getParameter("redirect") : "" %>">

                <div class="form-group">
                    <label class="form-label">College Email Address</label>
                    <input type="email" name="email" class="form-control" required placeholder="e.g. alex.mercer@student.edu" 
                           value="<%= request.getAttribute("enteredEmail") != null ? request.getAttribute("enteredEmail") : "" %>">
                </div>

                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" name="password" class="form-control" required placeholder="••••••••">
                </div>

                <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.75rem; margin-top: 0.5rem;">
                    Sign In
                </button>
            </form>

            <div style="text-align: center; margin-top: 1.5rem; font-size: 0.88rem; color: var(--text-muted);">
                Don't have an account? <a href="<%= request.getContextPath() %>/auth/register" style="font-weight: 600;">Register as Student</a>
            </div>

            <!-- Demo Credentials Helper -->
            <div style="margin-top: 2rem; padding: 1rem; background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.8rem;">
                <div style="font-weight: 700; color: var(--text-main); margin-bottom: 0.4rem;">Demo Accounts:</div>
                <div>👤 <strong>Admin:</strong> admin@campusconnect.edu | Admin@123</div>
                <div>🎓 <strong>Student:</strong> alex.mercer@student.edu | Student@123</div>
            </div>
        </div>
    </div>

    <script src="<%= request.getContextPath() %>/assets/js/app.js"></script>
</body>
</html>
