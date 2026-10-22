-- =============================================================================
-- CampusConnect — College Event Management System
-- Database Schema Script
-- Target: MySQL 8.0+ Community Server / MySQL Workbench
-- =============================================================================

CREATE DATABASE IF NOT EXISTS campusconnect
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campusconnect;

-- -----------------------------------------------------------------------------
-- 1. Table: users
-- Stores both students and college administrators with role-based access control.
-- Passwords are encrypted using BCrypt (60-character hash).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    department VARCHAR(100) DEFAULT 'Computer Science & Engineering',
    phone VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 2. Table: events
-- Stores college events organized by faculties, departments, or clubs.
-- Tracks capacity, schedule, status, and creator.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(60) NOT NULL, -- Workshop, Coding Contest, Seminar, Cultural, Technical, Hackathon
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    venue VARCHAR(150) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    status ENUM('UPCOMING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'UPCOMING',
    banner_url VARCHAR(255) DEFAULT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_events_date (event_date),
    INDEX idx_events_status (status),
    INDEX idx_events_category (category)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 3. Table: registrations
-- Tracks student event registrations.
-- Statuses:
--   CONFIRMED: Student holds an active seat.
--   WAITLISTED: Event was full at registration time; placed in queue.
--   CANCELLED: Student voluntarily cancelled their registration.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registrations (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('CONFIRMED', 'WAITLISTED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_reg_event (event_id),
    INDEX idx_reg_student (student_id),
    INDEX idx_reg_status (status),
    -- Ensure a student cannot have duplicate simultaneous active registrations
    UNIQUE KEY uk_event_student_active (event_id, student_id, status)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 4. Table: waitlist
-- FIFO queue for full events.
-- When a confirmed student cancels, the student with the lowest position
-- and earliest joined_at is atomically promoted to CONFIRMED.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS waitlist (
    waitlist_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    student_id INT NOT NULL,
    position INT NOT NULL,
    status ENUM('WAITING', 'PROMOTED', 'CANCELLED') NOT NULL DEFAULT 'WAITING',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_waitlist_event_status (event_id, status, position),
    INDEX idx_waitlist_student (student_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 5. Table: attendance
-- Records physical or virtual check-in by authorized administrators.
-- Prevents duplicate attendance for the same student and event.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('PRESENT', 'ABSENT') NOT NULL,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    marked_by INT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    UNIQUE KEY uk_event_student_attendance (event_id, student_id),
    INDEX idx_attendance_event (event_id),
    INDEX idx_attendance_status (status)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 6. Table: activity_logs
-- Audit trail for key administrative actions and waitlist promotions.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(80) NOT NULL,
    details TEXT NOT NULL,
    performed_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_activity_created (created_at)
) ENGINE=InnoDB;
