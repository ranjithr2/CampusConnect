import { User, CampusEvent, Registration, WaitlistEntry, AttendanceRecord, ActivityLog } from '../types/campus';

export const INITIAL_USERS: User[] = [
  {
    userId: 1,
    name: 'Dr. Sarah Jenkins',
    email: 'admin@campusconnect.edu',
    role: 'ADMIN',
    department: 'Dean of Student Affairs',
    phone: '+1-555-0199'
  },
  {
    userId: 2,
    name: 'Prof. Alan Vance',
    email: 'alan.vance@campusconnect.edu',
    role: 'ADMIN',
    department: 'Computer Science & Engineering',
    phone: '+1-555-0198'
  },
  {
    userId: 3,
    name: 'Alex Mercer',
    email: 'alex.mercer@student.edu',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    phone: '+1-555-0101'
  },
  {
    userId: 4,
    name: 'Maya Lin',
    email: 'maya.lin@student.edu',
    role: 'STUDENT',
    department: 'Information Technology',
    phone: '+1-555-0102'
  },
  {
    userId: 5,
    name: 'David Kim',
    email: 'david.kim@student.edu',
    role: 'STUDENT',
    department: 'Electrical Engineering',
    phone: '+1-555-0103'
  },
  {
    userId: 6,
    name: 'Elena Rostova',
    email: 'elena.rostova@student.edu',
    role: 'STUDENT',
    department: 'Data Science & AI',
    phone: '+1-555-0104'
  },
  {
    userId: 7,
    name: 'Marcus Brody',
    email: 'marcus.brody@student.edu',
    role: 'STUDENT',
    department: 'Mechanical Engineering',
    phone: '+1-555-0105'
  },
  {
    userId: 8,
    name: 'Zoe Washington',
    email: 'zoe.washington@student.edu',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    phone: '+1-555-0106'
  },
  {
    userId: 9,
    name: 'Jordan Lee',
    email: 'jordan.lee@student.edu',
    role: 'STUDENT',
    department: 'Biotechnology',
    phone: '+1-555-0107'
  }
];

export const INITIAL_EVENTS: CampusEvent[] = [
  {
    eventId: 1,
    title: 'Generative AI & LLM Systems Workshop',
    description: 'Comprehensive hands-on workshop building production agentic pipelines with Gemini API, prompt tuning, and modern vector databases.',
    category: 'Technical Workshop',
    eventDate: '2026-10-26',
    startTime: '10:00 AM',
    venue: 'Turing Auditorium, Lab 401',
    capacity: 60,
    status: 'UPCOMING',
    createdBy: 1,
    creatorName: 'Dr. Sarah Jenkins'
  },
  {
    eventId: 2,
    title: 'Annual 36-Hour Hackathon: CodeGenesis',
    description: 'The marquee college coding marathon. Compete in tracks across Web3, FinTech, Healthcare, and Sustainable Tech for over $5,000 in grand prizes.',
    category: 'Coding Contest',
    eventDate: '2026-11-03',
    startTime: '09:00 AM',
    venue: 'Campus Innovation Center',
    capacity: 40,
    status: 'UPCOMING',
    createdBy: 1,
    creatorName: 'Dr. Sarah Jenkins'
  },
  {
    eventId: 3,
    title: 'Exclusive Hands-on Microservices Masterclass',
    description: 'High-intensity micro-lab covering Jakarta EE, distributed concurrency, and relational transaction isolation. Highly limited seats for close mentoring.',
    category: 'Technical Workshop',
    eventDate: '2026-10-28',
    startTime: '02:00 PM',
    venue: 'Advanced Systems Lab A2',
    capacity: 4, // Intentionally small to showcase waitlist FIFO queue!
    status: 'UPCOMING',
    createdBy: 2,
    creatorName: 'Prof. Alan Vance'
  },
  {
    eventId: 4,
    title: 'Quantum Computing & Post-Quantum Cryptography',
    description: 'Guest keynote by visiting researchers from national laboratories on lattice-based cryptography, Shor algorithm impact, and real-world quantum advantage.',
    category: 'Guest Seminar',
    eventDate: '2026-11-09',
    startTime: '11:00 AM',
    venue: 'Main Campus Grand Hall',
    capacity: 120,
    status: 'UPCOMING',
    createdBy: 1,
    creatorName: 'Dr. Sarah Jenkins'
  },
  {
    eventId: 5,
    title: 'Campus Rhythm: Inter-College Cultural Gala',
    description: 'An electrifying evening of college rock bands, theatrical performances, choreo showcases, and visual art exhibitions.',
    category: 'Cultural Fest',
    eventDate: '2026-11-16',
    startTime: '05:30 PM',
    venue: 'Open Air Amphitheatre',
    capacity: 250,
    status: 'UPCOMING',
    createdBy: 1,
    creatorName: 'Dr. Sarah Jenkins'
  },
  {
    eventId: 6,
    title: 'Cloud Native DevOps with Kubernetes & CI/CD',
    description: 'Complete workshop on container orchestration, automated pipelines, and zero-downtime blue/green deployments.',
    category: 'Technical Workshop',
    eventDate: '2026-10-19',
    startTime: '01:00 PM',
    venue: 'Computer Center Hall B',
    capacity: 30,
    status: 'COMPLETED',
    createdBy: 2,
    creatorName: 'Prof. Alan Vance'
  }
];

export const INITIAL_REGISTRATIONS: Registration[] = [
  // Event 1
  { registrationId: 1, eventId: 1, studentId: 3, status: 'CONFIRMED', registeredAt: '2026-10-19 10:14:00' },
  { registrationId: 2, eventId: 1, studentId: 4, status: 'CONFIRMED', registeredAt: '2026-10-20 11:20:00' },
  { registrationId: 3, eventId: 1, studentId: 5, status: 'CONFIRMED', registeredAt: '2026-10-21 09:45:00' },

  // Event 2
  { registrationId: 4, eventId: 2, studentId: 3, status: 'CONFIRMED', registeredAt: '2026-10-18 14:00:00' },
  { registrationId: 5, eventId: 2, studentId: 6, status: 'CONFIRMED', registeredAt: '2026-10-19 16:30:00' },
  { registrationId: 6, eventId: 2, studentId: 7, status: 'CONFIRMED', registeredAt: '2026-10-20 08:15:00' },

  // Event 3 (Capacity = 4, currently full with Alex, Maya, David, Elena)
  { registrationId: 7, eventId: 3, studentId: 3, status: 'CONFIRMED', registeredAt: '2026-10-21 08:00:00' },
  { registrationId: 8, eventId: 3, studentId: 4, status: 'CONFIRMED', registeredAt: '2026-10-21 08:10:00' },
  { registrationId: 9, eventId: 3, studentId: 5, status: 'CONFIRMED', registeredAt: '2026-10-21 08:25:00' },
  { registrationId: 10, eventId: 3, studentId: 6, status: 'CONFIRMED', registeredAt: '2026-10-21 08:30:00' },
  // Waitlisted students for Event 3
  { registrationId: 11, eventId: 3, studentId: 7, status: 'WAITLISTED', registeredAt: '2026-10-21 09:00:00' },
  { registrationId: 12, eventId: 3, studentId: 8, status: 'WAITLISTED', registeredAt: '2026-10-21 09:15:00' },

  // Event 6 (Completed)
  { registrationId: 13, eventId: 6, studentId: 3, status: 'CONFIRMED', registeredAt: '2026-10-15 10:00:00' },
  { registrationId: 14, eventId: 6, studentId: 4, status: 'CONFIRMED', registeredAt: '2026-10-15 10:30:00' },
  { registrationId: 15, eventId: 6, studentId: 5, status: 'CONFIRMED', registeredAt: '2026-10-16 11:00:00' },
  { registrationId: 16, eventId: 6, studentId: 6, status: 'CONFIRMED', registeredAt: '2026-10-16 12:00:00' },
  { registrationId: 17, eventId: 6, studentId: 7, status: 'CONFIRMED', registeredAt: '2026-10-16 14:00:00' }
];

export const INITIAL_WAITLIST: WaitlistEntry[] = [
  { waitlistId: 1, eventId: 3, studentId: 7, position: 1, status: 'WAITING', joinedAt: '2026-10-21 09:00:00' },
  { waitlistId: 2, eventId: 3, studentId: 8, position: 2, status: 'WAITING', joinedAt: '2026-10-21 09:15:00' }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { attendanceId: 1, eventId: 6, studentId: 3, status: 'PRESENT', markedAt: '2026-10-19 13:10:00', markedBy: 2 },
  { attendanceId: 2, eventId: 6, studentId: 4, status: 'PRESENT', markedAt: '2026-10-19 13:12:00', markedBy: 2 },
  { attendanceId: 3, eventId: 6, studentId: 5, status: 'ABSENT',  markedAt: '2026-10-19 13:15:00', markedBy: 2 },
  { attendanceId: 4, eventId: 6, studentId: 6, status: 'PRESENT', markedAt: '2026-10-19 13:18:00', markedBy: 2 },
  { attendanceId: 5, eventId: 6, studentId: 7, status: 'PRESENT', markedAt: '2026-10-19 13:20:00', markedBy: 2 }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: '1',
    timestamp: '10:00:00 AM',
    action: 'SYSTEM_BOOTSTRAP',
    details: 'System database initialized with Jakarta EE 10 & MySQL 8.0 schema.',
    type: 'info'
  },
  {
    id: '2',
    timestamp: '10:05:00 AM',
    action: 'CAPACITY_REACHED',
    details: 'Event #3 "Exclusive Hands-on Microservices Masterclass" hit capacity 4/4.',
    type: 'warning'
  },
  {
    id: '3',
    timestamp: '10:08:00 AM',
    action: 'WAITLIST_ENQUEUED',
    details: 'Student Marcus Brody enqueued at FIFO Position #1 for Event #3.',
    type: 'info'
  },
  {
    id: '4',
    timestamp: '10:12:00 AM',
    action: 'WAITLIST_ENQUEUED',
    details: 'Student Zoe Washington enqueued at FIFO Position #2 for Event #3.',
    type: 'info'
  }
];
