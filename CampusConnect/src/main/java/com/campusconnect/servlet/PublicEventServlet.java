package com.campusconnect.servlet;

import com.campusconnect.model.Event;
import com.campusconnect.service.EventService;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

/**
 * Publicly accessible servlet for discovering campus events without required authentication.
 */
@WebServlet(urlPatterns = {"/events", "/event-details"})
public class PublicEventServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private EventService eventService;

    @Override
    public void init() throws ServletException {
        this.eventService = new EventService();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String path = req.getServletPath();

        if ("/event-details".equals(path)) {
            String idStr = req.getParameter("id");
            if (idStr != null) {
                int eventId = Integer.parseInt(idStr);
                Event event = eventService.getEventById(eventId);
                req.setAttribute("event", event);
            }
            req.getRequestDispatcher("/WEB-INF/views/public/event-details.jsp").forward(req, resp);
        } else {
            List<Event> upcomingEvents = eventService.getUpcomingEvents();
            req.setAttribute("events", upcomingEvents);
            req.getRequestDispatcher("/WEB-INF/views/public/events.jsp").forward(req, resp);
        }
    }
}
