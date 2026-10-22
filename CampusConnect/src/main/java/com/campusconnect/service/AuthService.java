package com.campusconnect.service;

import com.campusconnect.dao.UserDAO;
import com.campusconnect.model.User;
import com.campusconnect.util.PasswordUtil;
import com.campusconnect.util.ValidationUtil;

import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Service managing user authentication, registration, and credentials.
 */
public class AuthService {
    private static final Logger LOGGER = Logger.getLogger(AuthService.class.getName());
    private final UserDAO userDAO;

    public AuthService() {
        this.userDAO = new UserDAO();
    }

    public AuthService(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    /**
     * Authenticates a user with email and candidate plaintext password.
     * @return User object on success, null on invalid credentials
     */
    public User authenticate(String email, String password) {
        if (!ValidationUtil.isValidEmail(email) || !ValidationUtil.isNotEmpty(password)) {
            return null;
        }

        User user = userDAO.findByEmail(email);
        if (user != null && PasswordUtil.checkPassword(password, user.getPasswordHash())) {
            return user;
        }
        return null;
    }

    /**
     * Registers a new Student account.
     * Validates input, hashes password via BCrypt, and prevents duplicate emails.
     */
    public boolean registerStudent(String name, String email, String password, String department, String phone) throws IllegalArgumentException {
        if (!ValidationUtil.isNotEmpty(name)) {
            throw new IllegalArgumentException("Student full name is required.");
        }
        if (!ValidationUtil.isValidEmail(email)) {
            throw new IllegalArgumentException("A valid college email address is required.");
        }
        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters in length.");
        }
        if (userDAO.emailExists(email)) {
            throw new IllegalArgumentException("An account with this email address already exists.");
        }

        User user = new User();
        user.setName(ValidationUtil.escapeHtml(name.trim()));
        user.setEmail(email.trim().toLowerCase());
        user.setPasswordHash(PasswordUtil.hashPassword(password));
        user.setRole(User.Role.STUDENT);
        user.setDepartment(department != null ? ValidationUtil.escapeHtml(department.trim()) : "General");
        user.setPhone(phone != null ? ValidationUtil.escapeHtml(phone.trim()) : null);

        try {
            int newId = userDAO.createUser(user);
            return newId > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Failed to create student user", e);
            return false;
        }
    }

    public User getUserById(int userId) {
        return userDAO.findById(userId);
    }
}
