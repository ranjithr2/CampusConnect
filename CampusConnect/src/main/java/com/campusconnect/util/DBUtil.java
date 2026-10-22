package com.campusconnect.util;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Database utility class managing JDBC Connections.
 * Safely loads credentials from environment variables or classpath database.properties.
 * Uses PreparedStatement practices throughout the application.
 */
public class DBUtil {
    private static final Logger LOGGER = Logger.getLogger(DBUtil.class.getName());
    private static final Properties PROPS = new Properties();

    private static String jdbcUrl;
    private static String jdbcUser;
    private static String jdbcPassword;
    private static String driverClass;

    static {
        try {
            // Attempt to load from properties file in classpath
            InputStream is = DBUtil.class.getClassLoader().getResourceAsStream("database.properties");
            if (is != null) {
                PROPS.load(is);
                is.close();
            }
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "database.properties not found in classpath. Falling back to env variables.");
        }

        // Environment variables take precedence over properties file
        jdbcUrl = System.getenv("DB_URL") != null ? System.getenv("DB_URL")
                : PROPS.getProperty("db.url", "jdbc:mysql://localhost:3306/campusconnect?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8");
        
        jdbcUser = System.getenv("DB_USER") != null ? System.getenv("DB_USER")
                : PROPS.getProperty("db.user", "root");

        jdbcPassword = System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD")
                : PROPS.getProperty("db.password", "root");

        driverClass = PROPS.getProperty("db.driver", "com.mysql.cj.jdbc.Driver");

        try {
            Class.forName(driverClass);
            LOGGER.info("MySQL JDBC Driver registered successfully: " + driverClass);
        } catch (ClassNotFoundException e) {
            LOGGER.log(Level.SEVERE, "Failed to load MySQL JDBC Driver: " + driverClass, e);
        }
    }

    private DBUtil() {
        // Prevent instantiation
    }

    /**
     * Obtains a new database connection from the driver.
     * @return Connection instance
     * @throws SQLException on connection failure
     */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(jdbcUrl, jdbcUser, jdbcPassword);
    }

    /**
     * Health check method to verify database reachability without exposing credentials.
     * @return true if database responds to a simple query, false otherwise
     */
    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed() && conn.isValid(3);
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Database health check ping failed: " + e.getMessage());
            return false;
        }
    }

    /**
     * Safely closes a Connection.
     */
    public static void close(Connection conn) {
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                LOGGER.log(Level.WARNING, "Error closing database connection", e);
            }
        }
    }
}
