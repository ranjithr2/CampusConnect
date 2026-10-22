<%@ page contentType="text/html;charset=UTF-8" language="java" isErrorPage="true" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>403 Forbidden — CampusConnect</title>
    <link rel="stylesheet" href="<%= request.getContextPath() %>/assets/css/style.css">
</head>
<body style="display:flex; align-items:center; justify-content:center; min-height:100vh; text-align:center;">
    <div style="max-width:500px; padding:2rem; background:#fff; border:1px solid var(--border); border-radius:var(--radius-md);">
        <div style="font-size:3rem; margin-bottom:1rem;">🔒</div>
        <h1 style="font-size:1.75rem; color:var(--primary); margin-bottom:0.5rem;">403 — Access Forbidden</h1>
        <p style="color:var(--text-muted); margin-bottom:1.5rem;">
            You do not possess the required administrative credentials to access this protected resource.
        </p>
        <a href="<%= request.getContextPath() %>/" class="btn btn-primary">Return to Homepage</a>
    </div>
</body>
</html>
