package com.campusconnect.servlet;

import com.campusconnect.util.DBUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;

/**
 * Health check endpoint verifying JDBC database connectivity without exposing secrets.
 */
@WebServlet(urlPatterns = {"/health", "/api/health"})
public class HealthCheckServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        boolean dbOk = DBUtil.testConnection();

        resp.setStatus(dbOk ? HttpServletResponse.SC_OK : HttpServletResponse.SC_SERVICE_UNAVAILABLE);
        try (PrintWriter out = resp.getWriter()) {
            out.print("{\n");
            out.print("  \"status\": \"" + (dbOk ? "UP" : "DOWN") + "\",\n");
            out.print("  \"database\": \"" + (dbOk ? "CONNECTED" : "UNREACHABLE") + "\",\n");
            out.print("  \"engine\": \"MySQL 8.0 via MySQL Connector/J\",\n");
            out.print("  \"runtime\": \"Tomcat 10.1 / Jakarta Servlet 6.0\",\n");
            out.print("  \"javaVersion\": \"" + System.getProperty("java.version") + "\"\n");
            out.print("}");
        }
    }
}
