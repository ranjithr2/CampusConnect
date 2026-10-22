import React, { useState } from 'react';
import {
  User,
  CampusEvent,
  Registration,
  WaitlistEntry,
  AttendanceRecord,
  AttendanceStatus
} from '../types/campus';
import {
  ShieldCheck,
  PlusCircle,
  Users,
  CheckCircle2,
  XCircle,
  Calendar,
  BarChart3,
  Search,
  Filter,
  Check,
  AlertCircle,
  UserX,
  UserCheck2,
  Clock4,
  Layers,
  Sparkles,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';

interface AdminConsoleProps {
  currentUser: User;
  events: CampusEvent[];
  registrations: Registration[];
  waitlist: WaitlistEntry[];
  attendance: AttendanceRecord[];
  allUsers: User[];
  onMarkAttendance: (eventId: number, studentId: number, status: AttendanceStatus) => void;
  onCreateEvent: (newEvent: Omit<CampusEvent, 'eventId'>) => void;
  onCancelEvent: (eventId: number) => void;
  onAdminRegisterStudent: (eventId: number, studentId: number) => void;
  onAdminCancelStudent: (eventId: number, studentId: number) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  currentUser,
  events,
  registrations,
  waitlist,
  attendance,
  allUsers,
  onMarkAttendance,
  onCreateEvent,
  onCancelEvent,
  onAdminRegisterStudent,
  onAdminCancelStudent
}) => {
  // Default to 'roster' tab as requested: "add a admin section with for admin can see all the details like table"
  const [activeTab, setActiveTab] = useState<'roster' | 'events' | 'attendance' | 'create' | 'reports'>('roster');

  // Filter and view controls for the master student registration table
  const [targetEventFilter, setTargetEventFilter] = useState<string>('ALL'); // 'ALL' or specific eventId
  const [registrationStatusFilter, setRegistrationStatusFilter] = useState<'ALL' | 'REGISTERED' | 'NOT_REGISTERED' | 'WAITLISTED'>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected student for quick inspection modal
  const [inspectedStudent, setInspectedStudent] = useState<User | null>(null);

  // Form State for creating an event
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCat, setFormCat] = useState<'Technical Workshop' | 'Coding Contest' | 'Guest Seminar' | 'Cultural Fest' | 'Hackathon'>('Technical Workshop');
  const [formDate, setFormDate] = useState('2026-11-10');
  const [formTime, setFormTime] = useState('10:00 AM');
  const [formVenue, setFormVenue] = useState('Turing Hall B');
  const [formCapacity, setFormCapacity] = useState(50);
  const [formSuccess, setFormSuccess] = useState(false);

  // All student users
  const students = allUsers.filter((u) => u.role === 'STUDENT');

  // Overall Analytics
  const activeEventsCount = events.filter((e) => e.status === 'UPCOMING').length;
  const totalConfirmed = registrations.filter((r) => r.status === 'CONFIRMED').length;
  const totalWaitlisted = waitlist.filter((w) => w.status === 'WAITING').length;
  const presentRecords = attendance.filter((a) => a.status === 'PRESENT').length;
  const totalAttendanceRecords = attendance.length;
  const attendanceRate = totalAttendanceRecords > 0 ? ((presentRecords / totalAttendanceRecords) * 100).toFixed(1) : '0.0';

  // Count registered vs unregistered students overall
  const registeredStudentIds = new Set(
    registrations.filter((r) => r.status === 'CONFIRMED').map((r) => r.studentId)
  );
  const waitlistedStudentIds = new Set(
    waitlist.filter((w) => w.status === 'WAITING').map((w) => w.studentId)
  );

  const registeredStudentsCount = students.filter((s) => registeredStudentIds.has(s.userId)).length;
  const unregisteredStudentsCount = students.length - registeredStudentsCount;

  // Filter students for the master registration table
  const filteredStudents = students.filter((s) => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches = s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.department.toLowerCase().includes(q);
      if (!matches) return false;
    }

    // Department filter
    if (deptFilter !== 'ALL' && s.department !== deptFilter) {
      return false;
    }

    // Target event filter logic
    if (targetEventFilter !== 'ALL') {
      const evId = Number(targetEventFilter);
      const reg = registrations.find((r) => r.eventId === evId && r.studentId === s.userId && r.status === 'CONFIRMED');
      const wl = waitlist.find((w) => w.eventId === evId && w.studentId === s.userId && w.status === 'WAITING');

      if (registrationStatusFilter === 'REGISTERED' && !reg) return false;
      if (registrationStatusFilter === 'WAITLISTED' && !wl) return false;
      if (registrationStatusFilter === 'NOT_REGISTERED' && (reg || wl)) return false;
    } else {
      // Global registration status filter
      const isReg = registeredStudentIds.has(s.userId);
      const isWl = waitlistedStudentIds.has(s.userId);

      if (registrationStatusFilter === 'REGISTERED' && !isReg) return false;
      if (registrationStatusFilter === 'WAITLISTED' && !isWl) return false;
      if (registrationStatusFilter === 'NOT_REGISTERED' && (isReg || isWl)) return false;
    }

    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateEvent({
      title: formTitle,
      description: formDesc,
      category: formCat,
      eventDate: formDate,
      startTime: formTime,
      venue: formVenue,
      capacity: Number(formCapacity),
      status: 'UPCOMING',
      createdBy: currentUser.userId,
      creatorName: currentUser.name
    });
    setFormSuccess(true);
    setFormTitle('');
    setFormDesc('');
    setTimeout(() => {
      setFormSuccess(false);
      setActiveTab('events');
    }, 1200);
  };

  const departments = Array.from(new Set(students.map((s) => s.department)));

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Administrator Dashboard
            </span>
            <span className="text-blue-300 text-xs">Logged in: <strong>{currentUser.name}</strong> ({currentUser.department})</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Student Registration & Event Administration
          </h1>
          <p className="text-blue-200 text-xs sm:text-sm mt-0.5">
            Real-time table view showing whether each student is registered, waitlisted, or unregistered across college events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            + Create New Event
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Total Enrolled Students</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{registeredStudentsCount} / {students.length}</div>
          <span className="text-[11px] text-slate-500">Students with confirmed seats</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Unregistered Students</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{unregisteredStudentsCount}</div>
          <span className="text-[11px] text-slate-500">Not registered for any event</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Waitlisted Students</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{totalWaitlisted}</div>
          <span className="text-[11px] text-slate-500">In FIFO promotion queues</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Campus Attendance Rate</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{attendanceRate}%</div>
          <span className="text-[11px] text-slate-500">Verified present check-ins</span>
        </div>
      </div>

      {/* Admin Navigation Subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'roster'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-700 bg-white hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-amber-400" />
          Student Registration Master Table ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'events'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Event Management ({events.length})
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'attendance'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Attendance Marking Roster
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'create'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          + Create Event
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics & Capacity
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MASTER STUDENT REGISTRATION STATUS TABLE (Requested Feature)       */}
      {/* ========================================================================= */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          
          {/* Table Header Controls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-900" />
                  Student Registration Status Directory
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect student enrollment status, confirmed seats, waitlist positions, or find students who have not yet registered.
                </p>
              </div>

              {/* Event Scope Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-semibold shrink-0">Filter by Event:</span>
                <select
                  className="bg-slate-50 border border-slate-300 text-xs rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-xs"
                  value={targetEventFilter}
                  onChange={(e) => setTargetEventFilter(e.target.value)}
                >
                  <option value="ALL">All Events (Overall Status)</option>
                  {events.map((ev) => (
                    <option key={ev.eventId} value={ev.eventId}>
                      {ev.title} ({ev.eventDate})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Pills and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
              
              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setRegistrationStatusFilter('ALL')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                    registrationStatusFilter === 'ALL'
                      ? 'bg-blue-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Students ({students.length})
                </button>

                <button
                  onClick={() => setRegistrationStatusFilter('REGISTERED')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer flex items-center gap-1 ${
                    registrationStatusFilter === 'REGISTERED'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Registered / Confirmed ({registeredStudentsCount})
                </button>

                <button
                  onClick={() => setRegistrationStatusFilter('NOT_REGISTERED')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer flex items-center gap-1 ${
                    registrationStatusFilter === 'NOT_REGISTERED'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  <UserX className="w-3.5 h-3.5" />
                  Not Registered ({unregisteredStudentsCount})
                </button>

                <button
                  onClick={() => setRegistrationStatusFilter('WAITLISTED')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer flex items-center gap-1 ${
                    registrationStatusFilter === 'WAITLISTED'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <Clock4 className="w-3.5 h-3.5" />
                  In Waitlist Queue ({totalWaitlisted})
                </button>
              </div>

              {/* Department Dropdown & Search Input */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-hidden"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search student by name/email..."
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Master Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Student Name & ID</th>
                    <th className="py-3 px-4">Department & Email</th>
                    <th className="py-3 px-4">
                      {targetEventFilter === 'ALL' ? 'Overall Registration Status' : 'Event Registration Status'}
                    </th>
                    <th className="py-3 px-4">Enrolled Events / Waitlists</th>
                    <th className="py-3 px-4">Verified Attendance</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => {
                    // Confirmed registrations for this student
                    const studentConfirmed = registrations.filter(
                      (r) => r.studentId === student.userId && r.status === 'CONFIRMED'
                    );

                    // Waitlisted entries for this student
                    const studentWaitlists = waitlist.filter(
                      (w) => w.studentId === student.userId && w.status === 'WAITING'
                    );

                    // Attendance history
                    const studentAtt = attendance.filter((a) => a.studentId === student.userId);
                    const presentCount = studentAtt.filter((a) => a.status === 'PRESENT').length;

                    // If a specific event is selected, compute event-specific status
                    let isSpecificEventReg = false;
                    let isSpecificEventWait = false;
                    let specificWaitPos = 0;
                    if (targetEventFilter !== 'ALL') {
                      const evId = Number(targetEventFilter);
                      isSpecificEventReg = studentConfirmed.some((r) => r.eventId === evId);
                      const wl = studentWaitlists.find((w) => w.eventId === evId);
                      if (wl) {
                        isSpecificEventWait = true;
                        specificWaitPos = wl.position;
                      }
                    }

                    const isAnyRegistered = studentConfirmed.length > 0;
                    const isAnyWaitlisted = studentWaitlists.length > 0;

                    return (
                      <tr key={student.userId} className="hover:bg-slate-50/60 transition-colors">
                        
                        {/* 1. Student Name & ID */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-xs shrink-0">
                              {student.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs sm:text-sm">
                                {student.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                ID: #STU-{student.userId.toString().padStart(4, '0')}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 2. Department & Email */}
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-slate-800 text-xs">{student.department}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{student.email}</p>
                        </td>

                        {/* 3. Registration Status (Crystal Clear Badge) */}
                        <td className="py-3.5 px-4">
                          {targetEventFilter === 'ALL' ? (
                            isAnyRegistered ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Registered ({studentConfirmed.length} Event{studentConfirmed.length > 1 ? 's' : ''})
                              </span>
                            ) : isAnyWaitlisted ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock4 className="w-3.5 h-3.5 text-amber-600" />
                                Waitlisted ({studentWaitlists.length})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <UserX className="w-3.5 h-3.5 text-rose-500" />
                                Not Registered
                              </span>
                            )
                          ) : isSpecificEventReg ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              CONFIRMED SEAT
                            </span>
                          ) : isSpecificEventWait ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock4 className="w-3.5 h-3.5 text-amber-600" />
                              WAITLIST POSITION #{specificWaitPos}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              <UserX className="w-3.5 h-3.5 text-slate-400" />
                              NOT REGISTERED
                            </span>
                          )}
                        </td>

                        {/* 4. Enrolled Events Pills */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex flex-wrap gap-1.5">
                            {studentConfirmed.map((reg) => {
                              const ev = events.find((e) => e.eventId === reg.eventId);
                              return (
                                <span
                                  key={reg.registrationId}
                                  className="text-[10px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-md truncate max-w-[150px]"
                                  title={`${ev?.title} (Confirmed)`}
                                >
                                  ✓ {ev?.title}
                                </span>
                              );
                            })}

                            {studentWaitlists.map((w) => {
                              const ev = events.find((e) => e.eventId === w.eventId);
                              return (
                                <span
                                  key={w.waitlistId}
                                  className="text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md truncate max-w-[150px]"
                                  title={`${ev?.title} (Waitlist #${w.position})`}
                                >
                                  ⏳ {ev?.title} (#{w.position})
                                </span>
                              );
                            })}

                            {!isAnyRegistered && !isAnyWaitlisted && (
                              <span className="text-slate-400 text-xs italic">
                                No event enrollments on record
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 5. Verified Attendance */}
                        <td className="py-3.5 px-4">
                          <div className="text-xs">
                            <span className="font-bold text-slate-800">{presentCount} Present</span>
                            <span className="text-slate-400 mx-1">•</span>
                            <span className="text-slate-500">{studentAtt.length - presentCount} Absent</span>
                          </div>
                        </td>

                        {/* 6. Admin Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {targetEventFilter !== 'ALL' && !isSpecificEventReg && !isSpecificEventWait && (
                              <button
                                onClick={() => onAdminRegisterStudent(Number(targetEventFilter), student.userId)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                              >
                                Enroll Student
                              </button>
                            )}

                            {targetEventFilter !== 'ALL' && (isSpecificEventReg || isSpecificEventWait) && (
                              <button
                                onClick={() => onAdminCancelStudent(Number(targetEventFilter), student.userId)}
                                className="text-rose-700 hover:bg-rose-50 border border-rose-200 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                              >
                                Remove
                              </button>
                            )}

                            <button
                              onClick={() => setInspectedStudent(student)}
                              className="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                        No students matched the chosen filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EVENT MANAGEMENT (CRUD)                                            */}
      {/* ========================================================================= */}
      {activeTab === 'events' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Event Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Capacity Status</th>
                  <th className="py-3 px-4">Waitlist</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => {
                  const confCount = registrations.filter(
                    (r) => r.eventId === ev.eventId && r.status === 'CONFIRMED'
                  ).length;
                  const wlCount = waitlist.filter(
                    (w) => w.eventId === ev.eventId && w.status === 'WAITING'
                  ).length;

                  return (
                    <tr key={ev.eventId} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {ev.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {ev.category}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {ev.eventDate} ({ev.startTime})
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800">
                          {confCount} / {ev.capacity}
                        </span>
                        {confCount >= ev.capacity && (
                          <span className="ml-1.5 bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-sm">
                            Full
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {wlCount > 0 ? (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded-full text-xs">
                            {wlCount} waiting
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            ev.status === 'UPCOMING'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : ev.status === 'COMPLETED'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {ev.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setTargetEventFilter(String(ev.eventId));
                              setActiveTab('roster');
                            }}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                          >
                            View Roster
                          </button>
                          {ev.status === 'UPCOMING' && (
                            <button
                              onClick={() => onCancelEvent(ev.eventId)}
                              className="text-slate-400 hover:text-rose-600 text-xs font-medium px-2 py-1 transition-colors cursor-pointer"
                              title="Cancel Event"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ATTENDANCE MARKING ROSTER                                          */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Event Attendance Check-In Roster
              </h3>
              <p className="text-xs text-slate-500">
                Mark students present or absent for completed or ongoing campus sessions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium shrink-0">Select Event:</span>
              <select
                className="bg-slate-50 border border-slate-300 text-xs rounded-lg px-3 py-1.5 text-slate-900 font-medium focus:outline-hidden"
                value={targetEventFilter === 'ALL' ? events[0]?.eventId : targetEventFilter}
                onChange={(e) => setTargetEventFilter(e.target.value)}
              >
                {events.map((ev) => (
                  <option key={ev.eventId} value={ev.eventId}>
                    {ev.title} ({ev.eventDate})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Current Attendance</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const evId = Number(targetEventFilter === 'ALL' ? events[0]?.eventId : targetEventFilter);
                  const isConfirmed = registrations.some(
                    (r) => r.eventId === evId && r.studentId === student.userId && r.status === 'CONFIRMED'
                  );
                  const att = attendance.find((a) => a.eventId === evId && a.studentId === student.userId);

                  if (!isConfirmed) return null; // Only confirmed attendees can have attendance marked

                  return (
                    <tr key={student.userId} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{student.name}</td>
                      <td className="py-3 px-4 text-slate-600">{student.department}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-xs">{student.email}</td>
                      <td className="py-3 px-4">
                        {att?.status === 'PRESENT' ? (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Present
                          </span>
                        ) : att?.status === 'ABSENT' ? (
                          <span className="text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" /> Absent
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Not Marked</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onMarkAttendance(evId, student.userId, 'PRESENT')}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                              att?.status === 'PRESENT'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => onMarkAttendance(evId, student.userId, 'ABSENT')}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                              att?.status === 'ABSENT'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CREATE EVENT                                                       */}
      {/* ========================================================================= */}
      {activeTab === 'create' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-2xl">
          <h3 className="font-bold text-slate-900 text-base mb-1">Publish New College Event</h3>
          <p className="text-xs text-slate-500 mb-5">
            Configure seat limits and schedules. New events immediately populate into the registration directory.
          </p>

          {formSuccess && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              Event published successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Event Title *</label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Distributed Database Concurrency Workshop"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
              <textarea
                required
                rows={3}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                placeholder="Objectives, speaker details, and room instructions..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                <select
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  value={formCat}
                  onChange={(e) => setFormCat(e.target.value as any)}
                >
                  <option value="Technical Workshop">Technical Workshop</option>
                  <option value="Coding Contest">Coding Contest</option>
                  <option value="Guest Seminar">Guest Seminar</option>
                  <option value="Cultural Fest">Cultural Fest</option>
                  <option value="Hackathon">Hackathon</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Seat Capacity *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={1000}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Venue *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  value={formVenue}
                  onChange={(e) => setFormVenue(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Publish Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: REPORTS & CAPACITY UTILIZATION                                     */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Event Capacity Utilization</h3>
              <div className="space-y-4">
                {events.map((ev) => {
                  const confCount = registrations.filter(
                    (r) => r.eventId === ev.eventId && r.status === 'CONFIRMED'
                  ).length;
                  const pct = Math.min(100, Math.round((confCount / ev.capacity) * 100));

                  return (
                    <div key={ev.eventId}>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-800 font-bold truncate max-w-[200px]">{ev.title}</span>
                        <span className="text-slate-500">{confCount} / {ev.capacity} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 100 ? 'bg-amber-500' : 'bg-blue-600'}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Department Enrollment Breakdown</h3>
              <div className="space-y-3">
                {departments.map((dept) => {
                  const deptStudents = students.filter((s) => s.department === dept);
                  const registeredInDept = deptStudents.filter((s) => registeredStudentIds.has(s.userId)).length;
                  const pct = Math.round((registeredInDept / deptStudents.length) * 100) || 0;

                  return (
                    <div key={dept} className="py-2 border-b border-slate-100 last:border-none">
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="font-semibold text-slate-700">{dept}</span>
                        <span className="text-slate-500">{registeredInDept} / {deptStudents.length} enrolled ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Inspection Modal */}
      {inspectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  Student Record
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{inspectedStudent.name}</h3>
                <p className="text-xs text-slate-500">{inspectedStudent.department} • {inspectedStudent.email}</p>
              </div>
              <button
                onClick={() => setInspectedStudent(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-500">Event Registrations on File</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {registrations
                  .filter((r) => r.studentId === inspectedStudent.userId)
                  .map((reg) => {
                    const ev = events.find((e) => e.eventId === reg.eventId);
                    return (
                      <div key={reg.registrationId} className="p-2.5 bg-slate-50 rounded-lg text-xs flex justify-between items-center">
                        <span className="font-semibold text-slate-800">{ev?.title}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            reg.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : reg.status === 'WAITLISTED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </div>
                    );
                  })}

                {registrations.filter((r) => r.studentId === inspectedStudent.userId).length === 0 && (
                  <p className="text-xs text-slate-400 italic">No registrations for this student yet.</p>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectedStudent(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
