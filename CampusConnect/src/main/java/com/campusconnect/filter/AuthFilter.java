package com.campusconnect.filter;

import com.campusconnect.model.User;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

/**
 * Security filter enforcing Role-Based Access Control (RBAC).
 * Intercepts protected paths (/student/* and /admin/*).
 */
@WebFilter(filterName = "AuthFilter", urlPatterns = {"/student/*", "/admin/*"})
public class AuthFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Initialization if needed
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        // Prevent browser caching for protected views
        resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        resp.setHeader("Pragma", "no-cache");
        resp.setDateHeader("Expires", 0);

        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("currentUser") : null;

        String path = req.getRequestURI();
        String contextPath = req.getContextPath();
        String relativePath = path.substring(contextPath.length());

        if (user == null) {
            // Unauthenticated -> redirect to login with return path
            resp.sendRedirect(contextPath + "/auth/login?redirect=" + req.getServletPath());
            return;
        }

        // Role-based access control
        if (relativePath.startsWith("/admin") && user.getRole() != User.Role.ADMIN) {
            // Unauthorized access to admin portal
            resp.sendRedirect(contextPath + "/WEB-INF/views/error/403.jsp");
            return;
        }

        if (relativePath.startsWith("/student") && user.getRole() != User.Role.STUDENT) {
            // Admin can also view or we keep strict boundary
            // We allow both or redirect appropriately
        }

        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        // Cleanup
    }
}
