import React, { useState } from 'react';
import {
  User,
  CampusEvent,
  Registration,
  WaitlistEntry,
  AttendanceRecord,
  AttendanceStatus,
  ActivityLog
} from './types/campus';
import {
  INITIAL_USERS,
  INITIAL_EVENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_WAITLIST,
  INITIAL_ATTENDANCE,
  INITIAL_ACTIVITY_LOGS
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { EventCard } from './components/EventCard';
import { EventDetailModal } from './components/EventDetailModal';
import { WaitlistSimulator } from './components/WaitlistSimulator';
import { StudentPortal } from './components/StudentPortal';
import { AdminConsole } from './components/AdminConsole';
import {
  Calendar,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Info,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

export default function App() {
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]); // Default to Dr. Sarah Jenkins (Admin) so admin features and roster table are immediately accessible!
  const [currentTab, setCurrentTab] = useState<string>('home'); // Default to full Home Landing Page

  const [events, setEvents] = useState<CampusEvent[]>(INITIAL_EVENTS);
  const [registrations, setRegistrations] = useState<Registration[]>(INITIAL_REGISTRATIONS);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(INITIAL_WAITLIST);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);

  // Selected event for modal view
  const [selectedDetailEvent, setSelectedDetailEvent] = useState<CampusEvent | null>(null);

  // Filters for Events directory view
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // --- BUSINESS LOGIC: Registration ---
  const handleRegister = (eventId: number, studentId?: number) => {
    const targetStudentId = studentId || currentUser?.userId;
    if (!targetStudentId) {
      showToast('Please select a student identity first.', 'warning');
      return;
    }

    const event = events.find((e) => e.eventId === eventId);
    if (!event || event.status !== 'UPCOMING') {
      showToast('This event is not open for registration.', 'error');
      return;
    }

    // Check if already registered
    const existing = registrations.find(
      (r) => r.eventId === eventId && r.studentId === targetStudentId && r.status !== 'CANCELLED'
    );
    if (existing) {
      showToast('This student is already registered or waitlisted for this event.', 'warning');
      return;
    }

    const studentUser = allUsers.find((u) => u.userId === targetStudentId);
    const confirmedCount = registrations.filter(
      (r) => r.eventId === eventId && r.status === 'CONFIRMED'
    ).length;

    const timestamp = new Date().toLocaleTimeString();

    if (confirmedCount < event.capacity) {
      // Seat available: grant CONFIRMED
      const newRegId = Math.max(0, ...registrations.map((r) => r.registrationId)) + 1;
      const newReg: Registration = {
        registrationId: newRegId,
        eventId,
        studentId: targetStudentId,
        status: 'CONFIRMED',
        registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        studentName: studentUser?.name,
        studentEmail: studentUser?.email,
        studentDepartment: studentUser?.department
      };

      setRegistrations((prev) => [...prev, newReg]);

      const log: ActivityLog = {
        id: String(Date.now()),
        timestamp,
        action: 'REGISTRATION_CONFIRMED',
        details: `Seat confirmed for ${studentUser?.name} in "${event.title}" (${confirmedCount + 1}/${event.capacity}).`,
        type: 'success'
      };
      setActivityLogs((prev) => [log, ...prev]);

      showToast(`Success! Seat confirmed for "${event.title}".`, 'success');
    } else {
      // Capacity reached: append to FIFO Waitlist
      const eventWaiting = waitlist.filter(
        (w) => w.eventId === eventId && w.status === 'WAITING'
      );
      const nextPosition = eventWaiting.length + 1;

      const newRegId = Math.max(0, ...registrations.map((r) => r.registrationId)) + 1;
      const newReg: Registration = {
        registrationId: newRegId,
        eventId,
        studentId: targetStudentId,
        status: 'WAITLISTED',
        registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        studentName: studentUser?.name,
        studentEmail: studentUser?.email,
        studentDepartment: studentUser?.department
      };

      const newWaitId = Math.max(0, ...waitlist.map((w) => w.waitlistId)) + 1;
      const newWaitEntry: WaitlistEntry = {
        waitlistId: newWaitId,
        eventId,
        studentId: targetStudentId,
        position: nextPosition,
        status: 'WAITING',
        joinedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        studentName: studentUser?.name,
        studentEmail: studentUser?.email,
        studentDepartment: studentUser?.department
      };

      setRegistrations((prev) => [...prev, newReg]);
      setWaitlist((prev) => [...prev, newWaitEntry]);

      const log: ActivityLog = {
        id: String(Date.now()),
        timestamp,
        action: 'WAITLIST_ENQUEUED',
        details: `Event "${event.title}" is full. ${studentUser?.name} enqueued at FIFO Position #${nextPosition}.`,
        type: 'warning'
      };
      setActivityLogs((prev) => [log, ...prev]);

      showToast(`Event is full! Placed at Position #${nextPosition} in the Waitlist.`, 'info');
    }
  };

  // --- BUSINESS LOGIC: Cancellation & Instant FIFO Promotion ---
  const handleCancelRegistration = (eventId: number, studentId?: number) => {
    const targetStudentId = studentId || currentUser?.userId;
    if (!targetStudentId) return;

    const event = events.find((e) => e.eventId === eventId);
    const targetUser = allUsers.find((u) => u.userId === targetStudentId);
    const timestamp = new Date().toLocaleTimeString();

    // Find active registration
    const targetReg = registrations.find(
      (r) => r.eventId === eventId && r.studentId === targetStudentId && r.status !== 'CANCELLED'
    );
    if (!targetReg) return;

    if (targetReg.status === 'WAITLISTED') {
      // Cancel waitlist entry & resequence
      setRegistrations((prev) =>
        prev.map((r) =>
          r.registrationId === targetReg.registrationId ? { ...r, status: 'CANCELLED' } : r
        )
      );

      setWaitlist((prev) => {
        const withoutTarget = prev.map((w) =>
          w.eventId === eventId && w.studentId === targetStudentId
            ? { ...w, status: 'CANCELLED' as const }
            : w
        );
        let pos = 1;
        return withoutTarget.map((w) => {
          if (w.eventId === eventId && w.status === 'WAITING') {
            return { ...w, position: pos++ };
          }
          return w;
        });
      });

      const log: ActivityLog = {
        id: String(Date.now()),
        timestamp,
        action: 'WAITLIST_WITHDRAWAL',
        details: `${targetUser?.name} withdrew from waitlist queue for "${event?.title}".`,
        type: 'info'
      };
      setActivityLogs((prev) => [log, ...prev]);

      showToast('Withdrawn from waitlist queue.', 'info');
      return;
    }

    // Cancel CONFIRMED seat
    setRegistrations((prev) =>
      prev.map((r) =>
        r.registrationId === targetReg.registrationId ? { ...r, status: 'CANCELLED' } : r
      )
    );

    // Look for earliest WAITING candidate in FIFO queue
    const waitingCandidates = waitlist
      .filter((w) => w.eventId === eventId && w.status === 'WAITING')
      .sort((a, b) => a.position - b.position);

    if (waitingCandidates.length > 0) {
      const promoted = waitingCandidates[0];
      const promotedStudent = allUsers.find((u) => u.userId === promoted.studentId);

      // 1. Promote waitlist record
      setWaitlist((prev) => {
        const updated = prev.map((w) =>
          w.waitlistId === promoted.waitlistId
            ? { ...w, status: 'PROMOTED' as const }
            : w
        );
        let pos = 1;
        return updated.map((w) => {
          if (w.eventId === eventId && w.status === 'WAITING') {
            return { ...w, position: pos++ };
          }
          return w;
        });
      });

      // 2. Update registration from WAITLISTED to CONFIRMED
      setRegistrations((prev) =>
        prev.map((r) =>
          r.eventId === eventId && r.studentId === promoted.studentId && r.status === 'WAITLISTED'
            ? { ...r, status: 'CONFIRMED' }
            : r
        )
      );

      const log: ActivityLog = {
        id: String(Date.now()),
        timestamp,
        action: 'FIFO_PROMOTION_EXECUTED',
        details: `Vacancy created by ${targetUser?.name}. Student ${promotedStudent?.name} (Queue #1) automatically PROMOTED to CONFIRMED seat!`,
        type: 'promotion'
      };
      setActivityLogs((prev) => [log, ...prev]);

      showToast(
        `Seat cancelled for ${targetUser?.name}. Waitlist #1 (${promotedStudent?.name}) was automatically PROMOTED!`,
        'success'
      );
    } else {
      const log: ActivityLog = {
        id: String(Date.now()),
        timestamp,
        action: 'SEAT_CANCELLED_EMPTY_QUEUE',
        details: `Confirmed seat cancelled for ${targetUser?.name}. Waitlist queue was empty; seat is now available.`,
        type: 'info'
      };
      setActivityLogs((prev) => [log, ...prev]);

      showToast('Registration cancelled. Seat is now available.', 'info');
    }
  };

  // --- BUSINESS LOGIC: Attendance Marking ---
  const handleMarkAttendance = (eventId: number, studentId: number, status: AttendanceStatus) => {
    const adminId = currentUser?.role === 'ADMIN' ? currentUser.userId : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const studentUser = allUsers.find((u) => u.userId === studentId);
    const event = events.find((e) => e.eventId === eventId);

    setAttendance((prev) => {
      const exists = prev.find((a) => a.eventId === eventId && a.studentId === studentId);
      if (exists) {
        return prev.map((a) =>
          a.attendanceId === exists.attendanceId
            ? { ...a, status, markedAt: now, markedBy: adminId }
            : a
        );
      } else {
        const newId = Math.max(0, ...prev.map((a) => a.attendanceId)) + 1;
        return [
          ...prev,
          {
            attendanceId: newId,
            eventId,
            studentId,
            status,
            markedAt: now,
            markedBy: adminId,
            studentName: studentUser?.name
          }
        ];
      }
    });

    const log: ActivityLog = {
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString(),
      action: 'ATTENDANCE_RECORDED',
      details: `${studentUser?.name} marked ${status} for "${event?.title}" by ${currentUser?.name}.`,
      type: 'info'
    };
    setActivityLogs((prev) => [log, ...prev]);

    showToast(`Attendance marked as ${status} for ${studentUser?.name}.`, 'success');
  };

  // --- BUSINESS LOGIC: Event Management ---
  const handleCreateEvent = (newEventData: Omit<CampusEvent, 'eventId'>) => {
    const newId = Math.max(0, ...events.map((e) => e.eventId)) + 1;
    const createdEvent: CampusEvent = {
      ...newEventData,
      eventId: newId
    };
    setEvents((prev) => [createdEvent, ...prev]);

    const log: ActivityLog = {
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString(),
      action: 'EVENT_CREATED',
      details: `New event "${createdEvent.title}" (Cap: ${createdEvent.capacity}) published by ${currentUser?.name}.`,
      type: 'success'
    };
    setActivityLogs((prev) => [log, ...prev]);

    showToast(`Event "${createdEvent.title}" has been published!`, 'success');
  };

  const handleCancelEvent = (eventId: number) => {
    setEvents((prev) =>
      prev.map((e) => (e.eventId === eventId ? { ...e, status: 'CANCELLED' } : e))
    );
    showToast('Event has been cancelled.', 'info');
  };

  const handleResetSimulation = () => {
    setEvents(INITIAL_EVENTS);
    setRegistrations(INITIAL_REGISTRATIONS);
    setWaitlist(INITIAL_WAITLIST);
    setAttendance(INITIAL_ATTENDANCE);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    showToast('State successfully reset to initial seed dataset.', 'info');
  };

  // Filtered events for Directory
  const filteredEvents = events.filter((ev) => {
    const matchesCat = selectedCategory === 'ALL' || ev.category === selectedCategory;
    const matchesQuery =
      !searchQuery ||
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce duration-300">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : toast.type === 'warning'
                ? 'bg-amber-900 text-amber-100 border-amber-700'
                : toast.type === 'error'
                ? 'bg-rose-900 text-rose-100 border-rose-700'
                : 'bg-slate-900 text-slate-100 border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        allUsers={allUsers}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* VIEW 1: Home Landing Page */}
        {currentTab === 'home' && (
          <LandingPage
            events={events}
            currentUser={currentUser}
            registrations={registrations}
            waitlist={waitlist}
            onRegister={handleRegister}
            onCancel={handleCancelRegistration}
            onSelectEventDetail={(ev) => setSelectedDetailEvent(ev)}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {/* VIEW 2: All Events Directory */}
        {currentTab === 'events' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  Campus Events Directory
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  Discover Campus Events
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Browse upcoming technical workshops, coding contests, seminars, and cultural festivals.
                </p>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Showing <strong>{filteredEvents.length}</strong> events
              </div>
            </div>

            {/* Search & Category Filter Toolbar */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search events by title or keywords..."
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
                {['ALL', 'Technical Workshop', 'Coding Contest', 'Guest Seminar', 'Cultural Fest'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-blue-900 text-white shadow-2xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Events' : cat.replace('Technical ', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev) => (
                <div key={ev.eventId} className="relative group">
                  <EventCard
                    event={ev}
                    currentUser={currentUser}
                    registrations={registrations}
                    waitlist={waitlist}
                    onRegister={handleRegister}
                    onCancel={handleCancelRegistration}
                  />
                  <button
                    onClick={() => setSelectedDetailEvent(ev)}
                    className="mt-2 w-full text-center text-xs font-semibold text-slate-500 hover:text-blue-700 hover:underline py-1 cursor-pointer"
                  >
                    View Details & Schedule →
                  </button>
                </div>
              ))}

              {filteredEvents.length === 0 && (
                <div className="col-span-full text-center py-12 bg-white border border-slate-200 rounded-2xl p-6">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <h3 className="font-bold text-slate-800 text-sm">No Events Matched Filter</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Try adjusting your search query or select "All Events".
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: Interactive Smart Waitlist Concurrency Lab */}
        {currentTab === 'simulator' && (
          <WaitlistSimulator
            event={events.find((e) => e.eventId === 3) || events[0]}
            registrations={registrations}
            waitlist={waitlist}
            allUsers={allUsers}
            activityLogs={activityLogs}
            onCancelRegistration={handleCancelRegistration}
            onRegisterStudent={handleRegister}
            onResetSimulation={handleResetSimulation}
          />
        )}

        {/* VIEW 4: Student Portal */}
        {currentTab === 'student' && (
          currentUser?.role === 'STUDENT' ? (
            <StudentPortal
              currentUser={currentUser}
              events={events}
              registrations={registrations}
              waitlist={waitlist}
              attendance={attendance}
              allUsers={allUsers}
              onCancelRegistration={handleCancelRegistration}
              onExploreEvents={() => setCurrentTab('events')}
            />
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto">
              <ShieldCheck className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h2 className="font-bold text-lg text-slate-900 mb-1">Administrator Identity Active</h2>
              <p className="text-xs text-slate-500 mb-4">
                You are currently viewing the platform as an Administrator ({currentUser?.name}). Switch to a student identity using the top selector to access the personalized student dashboard.
              </p>
              <button
                onClick={() => setCurrentUser(allUsers.find((u) => u.role === 'STUDENT') || null)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
              >
                Switch to Student Identity (Alex Mercer)
              </button>
            </div>
          )
        )}

        {/* VIEW 5: Administrator Console & Student Registration Table */}
        {currentTab === 'admin' && (
          <AdminConsole
            currentUser={currentUser?.role === 'ADMIN' ? currentUser : allUsers[0]}
            events={events}
            registrations={registrations}
            waitlist={waitlist}
            attendance={attendance}
            allUsers={allUsers}
            onMarkAttendance={handleMarkAttendance}
            onCreateEvent={handleCreateEvent}
            onCancelEvent={handleCancelEvent}
            onAdminRegisterStudent={(evId, stuId) => handleRegister(evId, stuId)}
            onAdminCancelStudent={(evId, stuId) => handleCancelRegistration(evId, stuId)}
          />
        )}

      </main>

      {/* Event Details Modal */}
      {selectedDetailEvent && (
        <EventDetailModal
          event={selectedDetailEvent}
          onClose={() => setSelectedDetailEvent(null)}
          currentUser={currentUser}
          registrations={registrations}
          waitlist={waitlist}
          onRegister={handleRegister}
          onCancel={handleCancelRegistration}
        />
      )}

      {/* College Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                CC
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm">CampusConnect</span>
                <span className="text-slate-400 ml-2">— College Event Management System with Smart Waitlist</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-600 font-medium">
              <button onClick={() => setCurrentTab('home')} className="hover:text-blue-700 cursor-pointer">Home</button>
              <button onClick={() => setCurrentTab('events')} className="hover:text-blue-700 cursor-pointer">All Events</button>
              <button onClick={() => setCurrentTab('simulator')} className="hover:text-blue-700 cursor-pointer">Waitlist Concurrency Lab</button>
              <button onClick={() => setCurrentTab('student')} className="hover:text-blue-700 cursor-pointer">Student Portal</button>
              <button onClick={() => setCurrentTab('admin')} className="hover:text-blue-700 text-blue-900 font-bold cursor-pointer">Admin & Roster Table</button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <div>
              College Event Management System • Real-Time Capacity Governance • Verifiable Attendance Tracking
            </div>
            <div>
              One Campus. Every Event. Seamlessly Connected.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
