import React, { useState } from 'react';
import { User, CampusEvent, Registration, WaitlistEntry, AttendanceRecord } from '../types/campus';
import {
  CheckCircle2,
  Clock4,
  Award,
  Calendar,
  MapPin,
  Trash2,
  AlertTriangle,
  FileText,
  User as UserIcon,
  Shield
} from 'lucide-react';

interface StudentPortalProps {
  currentUser: User;
  events: CampusEvent[];
  registrations: Registration[];
  waitlist: WaitlistEntry[];
  attendance: AttendanceRecord[];
  allUsers: User[];
  onCancelRegistration: (eventId: number) => void;
  onExploreEvents: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  currentUser,
  events,
  registrations,
  waitlist,
  attendance,
  allUsers,
  onCancelRegistration,
  onExploreEvents
}) => {
  const [activeTab, setActiveTab] = useState<'registrations' | 'waitlist' | 'attendance' | 'profile'>('registrations');

  const myConfirmed = registrations.filter(
    (r) => r.studentId === currentUser.userId && r.status === 'CONFIRMED'
  );

  const myWaitlist = waitlist.filter(
    (w) => w.studentId === currentUser.userId && w.status === 'WAITING'
  );

  const myAttendance = attendance.filter((a) => a.studentId === currentUser.userId);
  const presentCount = myAttendance.filter((a) => a.status === 'PRESENT').length;

  return (
    <div className="space-y-6">
      {/* Student Welcome Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">{currentUser.name}</h1>
              <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                Student Account
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.department} • {currentUser.email}
            </p>
          </div>
        </div>

        <button
          onClick={onExploreEvents}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors self-start md:self-auto cursor-pointer"
        >
          + Discover More Events
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
            Confirmed Seats
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-900">{myConfirmed.length}</span>
            <span className="text-xs text-slate-500">Upcoming Events</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
            Waitlisted Enqueues
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-600">{myWaitlist.length}</span>
            <span className="text-xs text-slate-500">In FIFO Queue</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
            Attended Events
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">{presentCount}</span>
            <span className="text-xs text-slate-500">Verified Records</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'registrations'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Active Registrations ({myConfirmed.length})
        </button>
        <button
          onClick={() => setActiveTab('waitlist')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'waitlist'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Waitlist Status ({myWaitlist.length})
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Attendance Transcript ({myAttendance.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Profile
        </button>
      </div>

      {/* Tab 1: Confirmed Registrations */}
      {activeTab === 'registrations' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Confirmed Event Registrations
            </h3>
            <span className="text-xs text-slate-500">
              Guaranteed admission with registered student ID
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {myConfirmed.map((reg) => {
              const event = events.find((e) => e.eventId === reg.eventId);
              if (!event) return null;
              return (
                <div key={reg.registrationId} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                        {event.category}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        Confirmed Seat
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                      {event.title}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-3 mt-1.5">
                      <span>📅 {event.eventDate} at {event.startTime}</span>
                      <span>📍 {event.venue}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => onCancelRegistration(event.eventId)}
                    className="self-start sm:self-center text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel Registration
                  </button>
                </div>
              );
            })}

            {myConfirmed.length === 0 && (
              <div className="text-center py-12 px-4">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-sm">No Active Registrations</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  You are not currently confirmed for any upcoming events. Explore upcoming workshops and hackathons!
                </p>
                <button
                  onClick={onExploreEvents}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Browse Campus Events
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Waitlist Status */}
      {activeTab === 'waitlist' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">
              Current FIFO Waitlist Positions
            </h3>
            <p className="text-xs text-slate-500">
              When a confirmed attendee cancels, students in position #1 are automatically promoted to confirmed seats.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {myWaitlist.map((w) => {
              const event = events.find((e) => e.eventId === w.eventId);
              if (!event) return null;
              return (
                <div key={w.waitlistId} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold uppercase text-amber-700">Queue</span>
                      <span className="text-lg font-black text-amber-800 leading-none">#{w.position}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                          Waiting in FIFO Queue
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          Joined: {w.joinedAt}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {event.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Schedule: {event.eventDate} • Venue: {event.venue}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onCancelRegistration(event.eventId)}
                    className="self-start sm:self-center text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Leave Queue
                  </button>
                </div>
              );
            })}

            {myWaitlist.length === 0 && (
              <div className="text-center py-12 px-4">
                <Clock4 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-sm">No Active Waitlist Entries</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  You are not currently waiting on any full event queues.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Official Attendance Transcript */}
      {activeTab === 'attendance' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">
              Official College Attendance Transcript
            </h3>
            <p className="text-xs text-slate-500">
              Verifiable physical check-in recorded by authorized faculty event coordinators.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Event Title</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Attendance Status</th>
                  <th className="py-3 px-4">Recorded By</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myAttendance.map((rec) => {
                  const event = events.find((e) => e.eventId === rec.eventId);
                  const markedUser = allUsers.find((u) => u.userId === rec.markedBy);
                  return (
                    <tr key={rec.attendanceId} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {event?.title || `Event #${rec.eventId}`}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {event?.eventDate}
                      </td>
                      <td className="py-3.5 px-4">
                        {rec.status === 'PRESENT' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3 text-rose-600" /> Absent
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {markedUser?.name || 'Authorized Admin'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {rec.markedAt}
                      </td>
                    </tr>
                  );
                })}

                {myAttendance.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-xs text-slate-400">
                      No attendance records on file. Attend an upcoming event to have your presence officially marked!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-xl">
          <h3 className="font-bold text-slate-900 text-sm mb-4">
            Student Profile Details
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Student Name:</span>
              <span className="font-semibold text-slate-900">{currentUser.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">College Email:</span>
              <span className="font-semibold text-slate-900">{currentUser.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Academic Department:</span>
              <span className="font-semibold text-slate-900">{currentUser.department}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Role Privilege:</span>
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                {currentUser.role}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Password Security:</span>
              <span className="text-slate-600 font-mono text-xs">
                Encrypted via BCrypt (60-char hash)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
