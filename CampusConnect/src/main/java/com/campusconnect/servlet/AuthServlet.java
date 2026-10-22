package com.campusconnect.servlet;

import com.campusconnect.model.User;
import com.campusconnect.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

/**
 * Handles authentication lifecycle: login, registration, and secure logout.
 */
@WebServlet(urlPatterns = {"/auth/login", "/auth/register", "/auth/logout"})
public class AuthServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private AuthService authService;

    @Override
    public void init() throws ServletException {
        this.authService = new AuthService();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String path = req.getServletPath();

        if ("/auth/logout".equals(path)) {
            HttpSession session = req.getSession(false);
            if (session != null) {
                session.invalidate();
            }
            resp.sendRedirect(req.getContextPath() + "/index.jsp?msg=logged_out");
            return;
        }

        if ("/auth/login".equals(path)) {
            req.getRequestDispatcher("/WEB-INF/views/auth/login.jsp").forward(req, resp);
            return;
        }

        if ("/auth/register".equals(path)) {
            req.getRequestDispatcher("/WEB-INF/views/auth/register.jsp").forward(req, resp);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String path = req.getServletPath();

        if ("/auth/login".equals(path)) {
            handleLogin(req, resp);
        } else if ("/auth/register".equals(path)) {
            handleRegister(req, resp);
        }
    }

    private void handleLogin(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String email = req.getParameter("email");
        String password = req.getParameter("password");

        User user = authService.authenticate(email, password);
        if (user != null) {
            // Mitigate session fixation by rotating session ID
            HttpSession session = req.getSession(true);
            req.changeSessionId();

            session.setAttribute("currentUser", user);
            session.setAttribute("userRole", user.getRole().name());
            session.setAttribute("userName", user.getName());
            session.setAttribute("userId", user.getUserId());

            String redirect = req.getParameter("redirect");
            if (redirect != null && !redirect.trim().isEmpty() && !redirect.contains("://")) {
                resp.sendRedirect(req.getContextPath() + redirect);
            } else if (user.getRole() == User.Role.ADMIN) {
                resp.sendRedirect(req.getContextPath() + "/admin/dashboard");
            } else {
                resp.sendRedirect(req.getContextPath() + "/student/dashboard");
            }
        } else {
            req.setAttribute("errorMessage", "Invalid email address or password. Please try again.");
            req.setAttribute("enteredEmail", email);
            req.getRequestDispatcher("/WEB-INF/views/auth/login.jsp").forward(req, resp);
        }
    }

    private void handleRegister(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String name = req.getParameter("name");
        String email = req.getParameter("email");
        String password = req.getParameter("password");
        String department = req.getParameter("department");
        String phone = req.getParameter("phone");

        try {
            boolean success = authService.registerStudent(name, email, password, department, phone);
            if (success) {
                resp.sendRedirect(req.getContextPath() + "/auth/login?msg=registered_success");
            } else {
                req.setAttribute("errorMessage", "Unable to complete registration. Please try again.");
                req.getRequestDispatcher("/WEB-INF/views/auth/register.jsp").forward(req, resp);
            }
        } catch (IllegalArgumentException e) {
            req.setAttribute("errorMessage", e.getMessage());
            req.setAttribute("enteredName", name);
            req.setAttribute("enteredEmail", email);
            req.setAttribute("enteredDepartment", department);
            req.setAttribute("enteredPhone", phone);
            req.getRequestDispatcher("/WEB-INF/views/auth/register.jsp").forward(req, resp);
        }
    }
}
