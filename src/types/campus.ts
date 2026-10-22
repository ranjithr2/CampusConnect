export type UserRole = 'STUDENT' | 'ADMIN';

export interface User {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  phone?: string;
}

export type EventStatus = 'UPCOMING' | 'COMPLETED' | 'CANCELLED';

export interface CampusEvent {
  eventId: number;
  title: string;
  description: string;
  category: 'Technical Workshop' | 'Coding Contest' | 'Guest Seminar' | 'Cultural Fest' | 'Hackathon';
  eventDate: string;
  startTime: string;
  venue: string;
  capacity: number;
  status: EventStatus;
  createdBy: number;
  creatorName?: string;
}

export type RegistrationStatus = 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED';

export interface Registration {
  registrationId: number;
  eventId: number;
  studentId: number;
  status: RegistrationStatus;
  registeredAt: string;
  updatedAt?: string;
  studentName?: string;
  studentEmail?: string;
  studentDepartment?: string;
}

export type WaitlistStatus = 'WAITING' | 'PROMOTED' | 'CANCELLED';

export interface WaitlistEntry {
  waitlistId: number;
  eventId: number;
  studentId: number;
  position: number;
  status: WaitlistStatus;
  joinedAt: string;
  studentName?: string;
  studentEmail?: string;
  studentDepartment?: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT';

export interface AttendanceRecord {
  attendanceId: number;
  eventId: number;
  studentId: number;
  status: AttendanceStatus;
  markedAt: string;
  markedBy: number;
  studentName?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  type: 'info' | 'success' | 'warning' | 'promotion';
}
