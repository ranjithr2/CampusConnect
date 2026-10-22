# CampusConnect — College Event Management System with Smart Waitlist & Attendance Tracking

> **Tagline:** One Campus. Every Event. Seamlessly Connected.  
> **Course/Level:** Final Year Engineering Project / Capstone Project Submission  
> **Architecture:** Full-Stack Enterprise Java Web Application (Jakarta EE 10 / Servlet 6.0, JSP, JDBC, MySQL 8.0, Apache Tomcat 10.1, Maven)

---

## 1. Executive Summary

**CampusConnect** is a centralized college event discovery, capacity governance, and verifiable attendance management platform built to address real-world collegiate challenges:
- High demand technical workshops, hackathons, and guest seminars quickly exceed room capacity.
- Manual paper or Google Form registrations cause severe overbooking, race conditions, lack of waitlist fairness, and duplicate entries.
- Attendance auditing is often fragmented with no reliable record for certificate issuance.

CampusConnect solves this using a high-concurrency **Smart FIFO Waitlist Algorithm** powered by MySQL transaction isolation and row-level locking (`SELECT ... FOR UPDATE`). When confirmed participants cancel, waitlisted students are automatically promoted to confirmed seats in strict chronological order with zero downtime and zero overbooking.

---

## 2. Technology Stack & Architectural Decision Record

| Layer | Technology | Version | Rationale & Specifications |
| :--- | :--- | :--- | :--- |
| **Language** | Java | 21 LTS | Modern language features, pattern matching, strong typing, and performance. |
| **Server Engine** | Jakarta Servlet | 6.0.0 | Pure enterprise MVC server-side controllers deployed on Tomcat 10.1. |
| **Presentation** | JSP & JSTL | 3.1 / 3.0 | Server-rendered dynamic views using JSTL standard tags without scriptlet clutter. |
| **Database** | MySQL Community Server | 8.0+ | Relational integrity, foreign key constraints, ACID transaction isolation. |
| **Connectivity** | MySQL Connector/J | 8.3.0 | High-performance Type-4 pure Java JDBC driver. |
| **Security** | jBCrypt | 0.4 | 60-character salted password hashes to prevent rainbow table attacks. |
| **Build & Packaging** | Apache Maven | 3.9+ | Standardized dependency management producing `campusconnect.war`. |
| **Web Container** | Apache Tomcat | 10.1.x | Certified Jakarta EE 10 web container handling HTTP/2, sessions, and filters. |
| **Frontend Style** | Modern CSS3 & Vanilla JS | Clean Slate SaaS | Custom responsive design tokens, zero-dependency lightweight interactions. |

---

## 3. High-Level Architecture (MVC Pattern)

```
       Browser (Client)
             │
             ▼
    ┌─────────────────┐
    │  EncodingFilter │   (UTF-8 Request/Response Enforcement)
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │   AuthFilter    │   (RBAC: Protects /student/* and /admin/*)
    └────────┬────────┘
             │
      ┌──────┴──────┐
      ▼             ▼
┌──────────────┐ ┌──────────────┐
│  AuthServlet │ │ Student/Admin│   (Controllers / Servlets)
└──────┬───────┘ └──────┬───────┘
       │                │
       ▼                ▼
┌───────────────────────────────┐
│     Business Service Layer    │   (AuthService, EventService,
│   (Waitlist Concurrency)      │    WaitlistService, AttendanceService)
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│    Data Access Object (DAO)   │   (UserDAO, EventDAO, RegistrationDAO,
│      (PreparedStatement)      │    WaitlistDAO, AttendanceDAO)
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│    JDBC Connection Utility    │   (DBUtil: Env Fallback, Connection Life)
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│       MySQL 8.0 Database      │   (InnoDB: Row Locking FOR UPDATE,
│        (campusconnect)        │    Foreign Keys, Constraints)
└───────────────────────────────┘
```

---

## 4. Database Schema & Relational Design

The system runs on the `campusconnect` relational database using the **InnoDB** storage engine.

### Tables Breakdown

1. **`users`**:
   - `user_id` (INT, PK, AUTO_INCREMENT)
   - `name` (VARCHAR(100))
   - `email` (VARCHAR(150), UNIQUE)
   - `password_hash` (VARCHAR(255), BCrypt 60-char hash)
   - `role` (ENUM('STUDENT', 'ADMIN'))
   - `department` (VARCHAR(100))
   - `phone` (VARCHAR(20))
   - `created_at`, `updated_at` (TIMESTAMP)

2. **`events`**:
   - `event_id` (INT, PK, AUTO_INCREMENT)
   - `title` (VARCHAR(200))
   - `description` (TEXT)
   - `category` (VARCHAR(60))
   - `event_date` (DATE)
   - `start_time` (TIME)
   - `venue` (VARCHAR(150))
   - `capacity` (INT, CHECK capacity > 0)
   - `status` (ENUM('UPCOMING', 'COMPLETED', 'CANCELLED'))
   - `created_by` (INT, FK -> users.user_id)
   - `created_at`, `updated_at` (TIMESTAMP)

3. **`registrations`**:
   - `registration_id` (INT, PK, AUTO_INCREMENT)
   - `event_id` (INT, FK -> events.event_id ON DELETE CASCADE)
   - `student_id` (INT, FK -> users.user_id ON DELETE CASCADE)
   - `status` (ENUM('CONFIRMED', 'WAITLISTED', 'CANCELLED'))
   - `registered_at`, `updated_at` (TIMESTAMP)
   - *Constraint:* `UNIQUE KEY uk_event_student_active (event_id, student_id, status)` prevents duplicate simultaneous registrations.

4. **`waitlist`**:
   - `waitlist_id` (INT, PK, AUTO_INCREMENT)
   - `event_id` (INT, FK -> events.event_id ON DELETE CASCADE)
   - `student_id` (INT, FK -> users.user_id ON DELETE CASCADE)
   - `position` (INT, 1-based queue order)
   - `status` (ENUM('WAITING', 'PROMOTED', 'CANCELLED'))
   - `joined_at` (TIMESTAMP)

5. **`attendance`**:
   - `attendance_id` (INT, PK, AUTO_INCREMENT)
   - `event_id` (INT, FK -> events.event_id ON DELETE CASCADE)
   - `student_id` (INT, FK -> users.user_id ON DELETE CASCADE)
   - `status` (ENUM('PRESENT', 'ABSENT'))
   - `marked_at` (TIMESTAMP)
   - `marked_by` (INT, FK -> users.user_id)
   - *Constraint:* `UNIQUE KEY uk_event_student_attendance (event_id, student_id)` guarantees one authoritative attendance record per student per event.

6. **`activity_logs`**:
   - Audit trail capturing promotions, cancellations, and administrative events.

---

## 5. The Smart Waitlist Algorithm (Mathematical Proof of Concurrency Safety)

### Registration Flow with Atomic Capacity Verification
```java
conn.setAutoCommit(false); // 1. Start ACID Transaction

// 2. Obtain exclusive Row-Lock on the specific Event
String sql = "SELECT capacity, status FROM events WHERE event_id = ? FOR UPDATE";

// 3. Verify student has no active registration
Registration active = regDAO.getActiveRegistration(conn, eventId, studentId);
if (active != null) { conn.rollback(); return ALREADY_REGISTERED; }

// 4. Count currently CONFIRMED seats under lock
int confirmed = regDAO.countConfirmedRegistrations(conn, eventId);

if (confirmed < capacity) {
    // 5A. Seat available: Grant CONFIRMED
    regDAO.createRegistration(conn, eventId, studentId, CONFIRMED);
} else {
    // 5B. Full: Place at tail of FIFO waitlist queue
    int nextPos = waitlistDAO.getNextQueuePosition(conn, eventId);
    regDAO.createRegistration(conn, eventId, studentId, WAITLISTED);
    waitlistDAO.addToWaitlist(conn, eventId, studentId, nextPos);
}

conn.commit(); // 6. Commit atomically & release locks
```

### Cancellation Flow with Instant FIFO Promotion
```java
conn.setAutoCommit(false); // 1. Start ACID Transaction

// 2. Mark current student's registration as CANCELLED
regDAO.updateStatus(conn, regId, CANCELLED);

// 3. Fetch earliest eligible student using strict FIFO order with Row Lock
Waitlist next = waitlistDAO.getNextInLineFIFO(conn, eventId); 
// SQL: SELECT * FROM waitlist WHERE event_id = ? AND status = 'WAITING' 
//      ORDER BY position ASC, joined_at ASC, waitlist_id ASC LIMIT 1 FOR UPDATE

if (next != null) {
    // 4. Atomically promote waitlist record
    waitlistDAO.updateStatus(conn, next.getWaitlistId(), PROMOTED);
    regDAO.updateStatus(conn, next.getEventId(), next.getStudentId(), CONFIRMED);
    waitlistDAO.resequenceWaitlistPositions(conn, eventId);
    auditLog("Promoted Student #" + next.getStudentId());
}

conn.commit(); // 5. All promotions committed together
```

---

## 6. Development & Deployment Guide (Step-by-Step for VS Code & Tomcat 10.1)

### Prerequisites Checklist
- [x] **JDK 21 LTS** installed (`java -version` returns `openjdk version "21.x"`).
- [x] **MySQL Community Server 8.0+** running locally on port 3306.
- [x] **Apache Tomcat 10.1.x** extracted locally (e.g. `C:\apache-tomcat-10.1.x`).
- [x] **Apache Maven 3.9+** (`mvn -v`).
- [x] **Visual Studio Code** with "Extension Pack for Java" and "Community Server Connectors" (optional).

### Step 1: Database Setup
1. Launch **MySQL Workbench** or command line `mysql -u root -p`.
2. Execute `database/schema.sql`:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
3. Execute `database/sample-data.sql` to populate demo events and accounts:
   ```bash
   mysql -u root -p < database/sample-data.sql
   ```

### Step 2: Configure Database Credentials
Navigate to `src/main/resources/` and copy `database.properties.example` to `database.properties`:
```properties
db.url=jdbc:mysql://localhost:3306/campusconnect?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8
db.user=root
db.password=YourMySQLPassword
db.driver=com.mysql.cj.jdbc.Driver
```
*(Alternatively, set system environment variables `DB_URL`, `DB_USER`, and `DB_PASSWORD`).*

### Step 3: Build the Project with Maven
Open terminal inside the `CampusConnect/` folder:
```bash
mvn clean package
```
Maven compiles all Java 21 classes, runs JUnit tests, and packages the web application into:
`target/campusconnect.war`

### Step 4: Deploy to Apache Tomcat 10.1
1. Copy `target/campusconnect.war` into your Tomcat `webapps/` folder:
   ```bash
   cp target/campusconnect.war /path/to/apache-tomcat-10.1.x/webapps/
   ```
2. Start Tomcat:
   - **Windows:** Run `bin\startup.bat`
   - **macOS/Linux:** Run `bin/startup.sh`
3. Open your browser and navigate to:
   `http://localhost:8080/campusconnect/`

### Demo Credentials for Evaluation
- **Administrator:** `admin@campusconnect.edu` / `Admin@123`
- **Student 1 (Full Workshop Attendee):** `alex.mercer@student.edu` / `Student@123`
- **Student 2 (Waitlisted #1):** `marcus.brody@student.edu` / `Student@123`
- **Student 3 (Waitlisted #2):** `zoe.washington@student.edu` / `Student@123`

---

## 7. Viva Voce Examination Preparation Guide (Q&A)

Here are the most common technical questions asked during engineering project viva examinations, along with model answers:

### Q1: Why did you choose Jakarta Servlet 6.0 and Tomcat 10.1 instead of javax.servlet?
**Answer:** Tomcat 10.1 implements the **Jakarta EE 10** specification where the namespace transitioned from legacy `javax.servlet.*` to modern `jakarta.servlet.*`. Using Jakarta Servlet 6.0 guarantees forward compatibility with modern Java 21 LTS runtime standards and prevents ClassNotFoundException / NoSuchMethodError incompatibilities.

### Q2: How does your waitlist algorithm prevent race conditions and overbooking?
**Answer:** In high-concurrency scenarios, two students might check seat availability simultaneously and both attempt to claim the final seat (Time-of-Check to Time-of-Use race condition). CampusConnect solves this inside an ACID database transaction (`conn.setAutoCommit(false)`) by using MySQL InnoDB row-level locking:
`SELECT capacity, status FROM events WHERE event_id = ? FOR UPDATE;`
This blocks concurrent threads from reading or modifying the event's registration count until the current transaction completes its seat check, inserts the registration, and executes `conn.commit()`.

### Q3: What is the difference between Statement and PreparedStatement? Why is PreparedStatement mandatory?
**Answer:**
1. **Performance:** `PreparedStatement` compiles SQL queries once at the database engine and caches the execution plan, speeding up repetitive query execution.
2. **Security:** `PreparedStatement` uses parameterized inputs (`?` placeholders). User inputs are strictly treated as data literals rather than executable SQL code, completely eliminating SQL Injection vulnerabilities.

### Q4: Why is BCrypt used instead of MD5 or SHA-256 for passwords?
**Answer:** MD5 and SHA-256 are fast cryptographic hashes designed for integrity verification, making them vulnerable to brute-force and hardware-accelerated rainbow table dictionary attacks. BCrypt includes an automatic random per-user salt and uses an adaptive work factor (iteration count) that deliberately consumes CPU cycles, rendering offline cracking attacks computationally infeasible.

### Q5: How is Role-Based Access Control (RBAC) enforced on the server?
**Answer:** Relying on hidden UI buttons is insecure because any user can make raw HTTP POST/GET requests. We enforce authorization at the servlet filter layer via `AuthFilter`. `AuthFilter` intercepts every incoming request matching `/student/*` or `/admin/*`, verifies the active HTTP session, extracts the authenticated `User` object, checks their `Role` enum, and redirects unauthorized attempts to `403 Forbidden`.

### Q6: What happens if a database operation fails halfway during waitlist promotion?
**Answer:** Because the cancellation and promotion are enclosed in an atomic transaction, the `catch (SQLException e)` block triggers `conn.rollback()`. This reverts all pending row updates, ensuring that the database is never left in an inconsistent state where a seat is vacated but no candidate is promoted.

---

## 8. Practical Testing Checklist

| Test Scenario | Input Data | Expected Result | Verified Status |
| :--- | :--- | :--- | :--- |
| **Student Registration** | Valid name, student.edu email, 6+ char password | Account created in `users` with BCrypt hash; redirected to login. | PASS |
| **Invalid Login** | Wrong password or nonexistent email | Clear error message displayed; session not created. | PASS |
| **RBAC Enforcement** | Student attempts direct GET `/admin/dashboard` | Intercepted by `AuthFilter`; redirected to `403.jsp`. | PASS |
| **Open Registration** | Register for Event #1 (60 cap, 3 confirmed) | Status is `CONFIRMED`; remaining seats decrease by 1. | PASS |
| **Over-Capacity Waitlist** | Register for Event #3 (4 cap, 4 confirmed) | Status is `WAITLISTED`; placed at queue position #3. | PASS |
| **FIFO Promotion** | Confirmed Student #3 cancels from Event #3 | Waitlist #1 (Marcus Brody) atomically promoted to `CONFIRMED`; queue resequenced. | PASS |
| **Attendance Check-in** | Admin clicks "Present" for Alex Mercer | Attendance record inserted; student profile reflects verified attendance. | PASS |
| **Duplicate Registration** | Same student registers twice for same event | Rejected by unique constraint and server-side validation. | PASS |

---

## 9. Suggested Project Report Structure for College Submission

1. **Chapter 1: Introduction & Problem Definition**
   - Background of College Event Organization
   - Existing Manual Systems vs Centralized Portals
   - Objectives and Scope of CampusConnect
2. **Chapter 2: Literature Survey & Requirement Analysis**
   - Comparison with Google Forms, Eventbrite, and basic student portals
   - Functional Requirements (Student, Admin, Waitlist Engine)
   - Non-Functional Requirements (Security, Concurrency, ACID Compliance)
3. **Chapter 3: System Architecture & Design**
   - Software Architecture (MVC, Servlets, JSP, JDBC, MySQL)
   - Entity Relationship (ER) Diagram & Relational Schemas
   - Data Flow Diagrams (DFD Level 0, 1, 2)
   - Concurrency Sequence Diagram for FIFO Waitlist Promotion
4. **Chapter 4: Implementation Details**
   - Transactional Row Locking Implementation (`SELECT ... FOR UPDATE`)
   - Security Filters and BCrypt Password Salting
   - Attendance Aggregation & Reporting Queries
5. **Chapter 5: Testing, Results & Snapshots**
   - Unit Testing with JUnit 5
   - Concurrency & Load Simulation
   - System Verification Table
6. **Chapter 6: Conclusion & Future Enhancements**
   - Summary of Achievements
   - Future Enhancements (QR Code badge scanning, SMS notifications, certificate PDF generation)
7. **References & Appendices**
   - Jakarta EE 10 Documentation, MySQL 8.0 Reference Manual.
