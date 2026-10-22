package com.campusconnect.util;

import org.mindrot.jbcrypt.BCrypt;

/**
 * Utility class for strong password hashing and verification using BCrypt.
 * Never stores or logs plaintext passwords.
 */
public class PasswordUtil {

    private PasswordUtil() {
    }

    /**
     * Hashes a plaintext password using BCrypt with a secure salt work factor of 10.
     * @param plainTextPassword Plaintext password string
     * @return 60-character BCrypt hash
     */
    public static String hashPassword(String plainTextPassword) {
        if (plainTextPassword == null || plainTextPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be blank");
        }
        return BCrypt.hashpw(plainTextPassword, BCrypt.gensalt(10));
    }

    /**
     * Verifies a candidate plaintext password against an existing BCrypt hash.
     * @param plainTextPassword Candidate password
     * @param hashedPassword Existing hash from database
     * @return true if matches, false otherwise
     */
    public static boolean checkPassword(String plainTextPassword, String hashedPassword) {
        if (plainTextPassword == null || hashedPassword == null || hashedPassword.trim().isEmpty()) {
            return false;
        }
        try {
            return BCrypt.checkpw(plainTextPassword, hashedPassword);
        } catch (Exception e) {
            return false;
        }
    }
}
