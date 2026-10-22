-- =============================================================================
-- CampusConnect — College Event Management System
-- Sample Development Data Script
-- Target: MySQL 8.0+ Community Server / MySQL Workbench
-- =============================================================================

USE campusconnect;

-- Clear previous sample records in reverse dependency order
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE activity_logs;
TRUNCATE TABLE attendance;
TRUNCATE TABLE waitlist;
TRUNCATE TABLE registrations;
TRUNCATE TABLE events;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. Insert Users
-- Passwords:
-- Admin: 'Admin@123'    -> BCrypt: $2a$10$wT8m9xVfG31A8qY1v8mJceK2a2yN7lE1jO3bO0c3.7E6pW1.BqmQW
-- Student: 'Student@123' -> BCrypt: $2a$10$eK6uX6qZ5C7uL3oO7hN2fe5dI7wT8m9xVfG31A8qY1v8mJceK2a2y
-- (These can be regenerated or reset locally via AuthService / PasswordUtil)
-- -----------------------------------------------------------------------------
INSERT INTO users (user_id, name, email, password_hash, role, department, phone) VALUES
(1, 'Dr. Sarah Jenkins', 'admin@campusconnect.edu', '$2a$10$wT8m9xVfG31A8qY1v8mJceK2a2yN7lE1jO3bO0c3.7E6pW1.BqmQW', 'ADMIN', 'Dean of Student Affairs', '+1-555-0199'),
(2, 'Prof. Alan Vance', 'alan.vance@campusconnect.edu', '$2a$10$wT8m9xVfG31A8qY1v8mJceK2a2yN7lE1jO3bO0c3.7E6pW1.BqmQW', 'ADMIN', 'Computer Science & Engineering', '+1-555-0198'),
(3, 'Alex Mercer', 'alex.mercer@student.edu', '$2a$10$eK6uX6qZ5C7uL3oO7hN2fe5dI7wT8m9xVfG31A8qY1v8mJceK2a2y', 'STUDENT', 'Computer Science & Engineering', '+1-555-0101'),
(4, 'Maya Lin', 'maya.lin@student.edu', '$2a$10$eK6uX6qZ5C7uL3oO7hN2fe5dI7wT8m9xVfG31A8qY1v8mJceK2a2y', 'STUDENT', 'Information Technology', '+1-555-0102'),
(5, 'David Kim', 'david.kim@student.edu', '$2a$10$eK6uX6qZ5C7uL3oO7hN2fe5dI7wT8m9xVfG31A8qY1v8mJceK2a2y', 'STUDENT', 'Electrical Engineering', '+1-555-0103'),
(6, 'Elena Rostova', 'elena.rostova@student.edu', '$2a$10$eK6uX6qZ5C7uL3oO7hN2fe5dI7wT8m9xVfG31A8qY1v8mJceK2a2y', 'STUDENT', 'Data Science', '+1-555-0104'),
(7, 'Marcus Brody', 'marcus.brody@student.edu', '$2a$10$eK6uX6qZ5C7uL3oO7hN2fe5dI7wT8m9xVfG31A8qY1v8mJceK2a2y', 'STUDENT', 'Mechanical Engineering', '+1-555-0105'),
(8, 'Zoe Washington', 'zoe.washington@student.edu', '$2a$10$eK6uX6qZ5C7uL3oO7hN2fe5dI7wT8m9xVfG31A8qY1v8mJceK2a2y', 'STUDENT', 'Computer Science & Engineering', '+1-555-0106'),
(9, 'Jordan Lee', 'jordan.lee@student.edu', '$2a$10$eK6uX6qZ5C7uL3oO7hN2fe5dI7wT8m9xVfG31A8qY1v8mJceK2a2y', 'STUDENT', 'Biotechnology', '+1-555-0107');

-- -----------------------------------------------------------------------------
-- 2. Insert Events
-- -----------------------------------------------------------------------------
INSERT INTO events (event_id, title, description, category, event_date, start_time, venue, capacity, status, created_by) VALUES
(1, 'Generative AI & LLM Systems Workshop', 'Comprehensive hands-on workshop building production agentic pipelines with Gemini API and modern vector stores.', 'Technical Workshop', DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY), '10:00:00', 'Turing Auditorium, Lab 401', 60, 'UPCOMING', 1),
(2, 'Annual 36-Hour Hackathon: CodeGenesis', 'The marquee college coding marathon. Compete in tracks across Web3, FinTech, Healthcare, and Sustainable Tech for over $5,000 in grand prizes.', 'Coding Contest', DATE_ADD(CURRENT_DATE, INTERVAL 12 DAY), '09:00:00', 'Campus Innovation Center', 40, 'UPCOMING', 1),
(3, 'Exclusive Hands-on Microservices Masterclass', 'High-intensity micro-lab covering Jakarta EE, distributed concurrency, and relational transaction isolation. Highly limited seats for close mentoring.', 'Technical Workshop', DATE_ADD(CURRENT_DATE, INTERVAL 6 DAY), '14:00:00', 'Advanced Systems Lab A2', 4, 'UPCOMING', 2),
(4, 'Quantum Computing & Post-Quantum Cryptography', 'Guest keynote by visiting researchers from national laboratories on lattice-based cryptography and real-world quantum advantage.', 'Guest Seminar', DATE_ADD(CURRENT_DATE, INTERVAL 18 DAY), '11:00:00', 'Main Campus Grand Hall', 120, 'UPCOMING', 1),
(5, 'Campus Rhythm: Inter-College Cultural Gala', 'An electrifying evening of college rock bands, theatrical performances, choreo showcases, and visual art exhibitions.', 'Cultural Fest', DATE_ADD(CURRENT_DATE, INTERVAL 25 DAY), '17:30:00', 'Open Air Amphitheatre', 250, 'UPCOMING', 1),
(6, 'Cloud Native DevOps with Kubernetes & CI/CD', 'Complete workshop on container orchestration, automated pipelines, and zero-downtime blue/green deployments.', 'Technical Workshop', DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY), '13:00:00', 'Computer Center Hall B', 30, 'COMPLETED', 2);

-- -----------------------------------------------------------------------------
-- 3. Insert Registrations
-- Notice Event #3 has capacity = 4.
-- Users 3, 4, 5, 6 filled the 4 seats (CONFIRMED).
-- Users 7 and 8 joined after it filled, so they are placed in waitlist (WAITLISTED).
-- -----------------------------------------------------------------------------
INSERT INTO registrations (registration_id, event_id, student_id, status, registered_at) VALUES
-- Event 1: AI Workshop
(1, 1, 3, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 1, 4, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 1, 5, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Event 2: Hackathon
(4, 2, 3, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(5, 2, 6, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(6, 2, 7, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Event 3: Microservices Masterclass (Capacity = 4)
(7, 3, 3, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(8, 3, 4, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(9, 3, 5, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(10, 3, 6, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(11, 3, 7, 'WAITLISTED', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(12, 3, 8, 'WAITLISTED', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),

-- Event 6: Completed DevOps event
(13, 6, 3, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(14, 6, 4, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(15, 6, 5, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(16, 6, 6, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(17, 6, 7, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 4 DAY));

-- -----------------------------------------------------------------------------
-- 4. Insert Waitlist
-- For Event #3:
-- Position 1: Marcus Brody (student_id = 7)
-- Position 2: Zoe Washington (student_id = 8)
-- -----------------------------------------------------------------------------
INSERT INTO waitlist (waitlist_id, event_id, student_id, position, status, joined_at) VALUES
(1, 3, 7, 1, 'WAITING', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 3, 8, 2, 'WAITING', DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- -----------------------------------------------------------------------------
-- 5. Insert Attendance for Completed Event #6
-- -----------------------------------------------------------------------------
INSERT INTO attendance (attendance_id, event_id, student_id, status, marked_at, marked_by) VALUES
(1, 6, 3, 'PRESENT', DATE_SUB(NOW(), INTERVAL 3 DAY), 2),
(2, 6, 4, 'PRESENT', DATE_SUB(NOW(), INTERVAL 3 DAY), 2),
(3, 6, 5, 'ABSENT',  DATE_SUB(NOW(), INTERVAL 3 DAY), 2),
(4, 6, 6, 'PRESENT', DATE_SUB(NOW(), INTERVAL 3 DAY), 2),
(5, 6, 7, 'PRESENT', DATE_SUB(NOW(), INTERVAL 3 DAY), 2);

-- -----------------------------------------------------------------------------
-- 6. Insert Activity Logs
-- -----------------------------------------------------------------------------
INSERT INTO activity_logs (action, details, performed_by) VALUES
('SYSTEM_BOOTSTRAP', 'Initial system seeding and administrator provisioning completed.', 1),
('EVENT_CREATED', 'Created new flagship event: Generative AI & LLM Systems Workshop.', 1),
('EVENT_CREATED', 'Created new event: Exclusive Hands-on Microservices Masterclass (Cap: 4).', 2),
('WAITLIST_TRIGGERED', 'Event 3 reached maximum capacity (4/4). Waitlist queue initiated.', 2);
