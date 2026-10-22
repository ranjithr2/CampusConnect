package com.campusconnect.service;

import com.campusconnect.util.PasswordUtil;
import com.campusconnect.util.ValidationUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests validating pure logic for password hashing,
 * validation sanitization, and waitlist state computations.
 */
public class WaitlistLogicTest {

    @Test
    @DisplayName("Should successfully hash and verify candidate passwords via BCrypt")
    void testPasswordHashingAndVerification() {
        String plain = "Student@123";
        String hash = PasswordUtil.hashPassword(plain);

        assertNotNull(hash);
        assertTrue(hash.startsWith("$2a$10$") || hash.startsWith("$2a$"));
        assertTrue(PasswordUtil.checkPassword(plain, hash));
        assertFalse(PasswordUtil.checkPassword("WrongPassword", hash));
    }

    @Test
    @DisplayName("Should validate student email addresses correctly")
    void testEmailValidation() {
        assertTrue(ValidationUtil.isValidEmail("alex.mercer@student.edu"));
        assertTrue(ValidationUtil.isValidEmail("admin@campusconnect.edu"));
        assertFalse(ValidationUtil.isValidEmail("invalid-email"));
        assertFalse(ValidationUtil.isValidEmail(""));
        assertFalse(ValidationUtil.isValidEmail(null));
    }

    @Test
    @DisplayName("Should sanitize HTML input strings against Cross-Site Scripting (XSS)")
    void testHtmlEscaping() {
        String dangerousInput = "<script>alert('xss')</script>&\"'";
        String escaped = ValidationUtil.escapeHtml(dangerousInput);

        assertFalse(escaped.contains("<script>"));
        assertTrue(escaped.contains("&lt;script&gt;"));
        assertTrue(escaped.contains("&amp;"));
        assertTrue(escaped.contains("&quot;"));
    }

    @Test
    @DisplayName("Should validate positive capacity numbers")
    void testCapacityValidation() {
        assertTrue(ValidationUtil.isPositiveInt("50"));
        assertTrue(ValidationUtil.isPositiveInt("1"));
        assertFalse(ValidationUtil.isPositiveInt("0"));
        assertFalse(ValidationUtil.isPositiveInt("-10"));
        assertFalse(ValidationUtil.isPositiveInt("abc"));
    }
}
