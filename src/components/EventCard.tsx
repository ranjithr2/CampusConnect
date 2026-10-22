import React from 'react';
import { CampusEvent, Registration, WaitlistEntry, User } from '../types/campus';
import { Calendar, Clock, MapPin, Users, CheckCircle2, AlertCircle, Clock4 } from 'lucide-react';

interface EventCardProps {
  event: CampusEvent;
  currentUser: User | null;
  registrations: Registration[];
  waitlist: WaitlistEntry[];
  onRegister: (eventId: number) => void;
  onCancel: (eventId: number) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  currentUser,
  registrations,
  waitlist,
  onRegister,
  onCancel
}) => {
  const confirmedRegs = registrations.filter(
    (r) => r.eventId === event.eventId && r.status === 'CONFIRMED'
  );
  const confirmedCount = confirmedRegs.length;
  const isFull = confirmedCount >= event.capacity;
  const pct = Math.min(100, Math.round((confirmedCount / event.capacity) * 100));

  const userReg = currentUser
    ? registrations.find(
        (r) => r.eventId === event.eventId && r.studentId === currentUser.userId && r.status !== 'CANCELLED'
      )
    : null;

  const userWaitlist = currentUser
    ? waitlist.find(
        (w) => w.eventId === event.eventId && w.studentId === currentUser.userId && w.status === 'WAITING'
      )
    : null;

  const waitlistQueue = waitlist.filter(
    (w) => w.eventId === event.eventId && w.status === 'WAITING'
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            {event.category}
          </span>
          {event.status === 'COMPLETED' ? (
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              Completed
            </span>
          ) : isFull ? (
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Clock4 className="w-3 h-3" /> Event Full
            </span>
          ) : (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              {event.capacity - confirmedCount} Seats Available
            </span>
          )}
        </div>

        <h3 className="font-bold text-lg text-slate-900 mb-2 leading-snug">
          {event.title}
        </h3>

        <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
          {event.description}
        </p>

        {/* Event Schedule Info */}
        <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{event.eventDate}</span>
            <span className="text-slate-300">•</span>
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{event.startTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
      </div>

      {/* Card Footer / Capacity & Registration */}
      <div className="px-5 pb-5 pt-2 bg-slate-50/50 border-t border-slate-100">
        {/* Capacity Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-500 font-medium">Capacity Utilization</span>
            <span className="font-bold text-slate-800">
              {confirmedCount} / {event.capacity} ({pct}%)
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFull ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${pct}%` }}
            ></div>
          </div>
          {waitlistQueue.length > 0 && (
            <p className="text-[11px] text-amber-700 mt-1 font-medium">
              ⚡ {waitlistQueue.length} student{waitlistQueue.length > 1 ? 's' : ''} waiting in FIFO queue
            </p>
          )}
        </div>

        {/* Action Button or User State */}
        {userReg ? (
          <div className="flex items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">Seat Confirmed</p>
                <p className="text-[10px] text-emerald-700">Official Roster</p>
              </div>
            </div>
            <button
              onClick={() => onCancel(event.eventId)}
              className="text-xs font-semibold text-rose-700 hover:text-rose-800 bg-white hover:bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            >
              Cancel Seat
            </button>
          </div>
        ) : userWaitlist ? (
          <div className="flex items-center justify-between gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
            <div className="flex items-center gap-2">
              <Clock4 className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900">
                  Waitlist Position #{userWaitlist.position}
                </p>
                <p className="text-[10px] text-amber-700">Auto-promoted on vacancy</p>
              </div>
            </div>
            <button
              onClick={() => onCancel(event.eventId)}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            >
              Leave Queue
            </button>
          </div>
        ) : currentUser?.role === 'STUDENT' ? (
          <button
            onClick={() => onRegister(event.eventId)}
            disabled={event.status !== 'UPCOMING'}
            className={`w-full py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer ${
              isFull
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-blue-900 hover:bg-blue-950 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isFull ? 'Event Full — Join FIFO Waitlist' : 'Register for Event'}
          </button>
        ) : (
          <div className="text-center py-2 text-xs font-medium text-slate-500">
            {currentUser?.role === 'ADMIN' ? (
              <span className="text-blue-700 font-semibold">Admin View • Manage via Console</span>
            ) : (
              <span>Select student identity above to register</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
