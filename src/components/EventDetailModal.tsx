import React from 'react';
import { CampusEvent, Registration, WaitlistEntry, User } from '../types/campus';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Clock4,
  Award,
  Sparkles,
  ShieldCheck,
  Building2,
  Share2
} from 'lucide-react';

interface EventDetailModalProps {
  event: CampusEvent | null;
  onClose: () => void;
  currentUser: User | null;
  registrations: Registration[];
  waitlist: WaitlistEntry[];
  onRegister: (eventId: number) => void;
  onCancel: (eventId: number) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  currentUser,
  registrations,
  waitlist,
  onRegister,
  onCancel
}) => {
  if (!event) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-blue-950 to-indigo-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-block bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
            {event.category}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold pr-8 leading-snug">
            {event.title}
          </h2>
          <p className="text-blue-200 text-xs mt-1">
            Organized by {event.creatorName || 'College Academic Affairs'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Key Details Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Date
              </span>
              <p className="font-bold text-slate-900 text-sm mt-1">{event.eventDate}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Time
              </span>
              <p className="font-bold text-slate-900 text-sm mt-1">{event.startTime}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> Venue
              </span>
              <p className="font-bold text-slate-900 text-sm mt-1 truncate">{event.venue}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2">About this Event</h4>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Capacity & Live Waitlist Meter */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Live Seat Capacity
              </span>
              <span className="font-extrabold text-slate-900">
                {confirmedCount} / {event.capacity} Confirmed ({pct}%)
              </span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isFull ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${pct}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
              <span>{isFull ? '0 Seats Left' : `${event.capacity - confirmedCount} Seats Available`}</span>
              {waitlistQueue.length > 0 && (
                <span className="text-amber-700 font-semibold">
                  ⚡ {waitlistQueue.length} student{waitlistQueue.length > 1 ? 's' : ''} in FIFO waitlist
                </span>
              )}
            </div>
          </div>

          {/* What to Expect */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="font-bold text-slate-900 text-sm mb-2">Participation Requirements & Perks</h4>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Open to all registered university undergraduate and graduate students.</li>
              <li>Official college participation certificate issued upon faculty attendance verification.</li>
              <li>Smart Waitlist Protection: If a registered seat is vacated, waitlisted students are notified instantly.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer / Registration Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 w-full sm:w-auto text-center sm:text-left">
            {currentUser ? (
              <span>Acting as: <strong>{currentUser.name}</strong> ({currentUser.role})</span>
            ) : (
              <span>Sign in as a student to register</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 px-4 py-2.5 rounded-xl cursor-pointer"
            >
              Close
            </button>

            {userReg ? (
              <button
                onClick={() => {
                  onCancel(event.eventId);
                  onClose();
                }}
                className="text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Cancel My Seat
              </button>
            ) : userWaitlist ? (
              <button
                onClick={() => {
                  onCancel(event.eventId);
                  onClose();
                }}
                className="text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Leave Waitlist (Position #{userWaitlist.position})
              </button>
            ) : currentUser?.role === 'STUDENT' ? (
              <button
                onClick={() => {
                  onRegister(event.eventId);
                  onClose();
                }}
                className={`text-xs font-semibold text-white px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer ${
                  isFull ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-900 hover:bg-blue-950'
                }`}
              >
                {isFull ? 'Join FIFO Waitlist' : 'Confirm Registration'}
              </button>
            ) : null}
          </div>
        </div>

      </div>
    </div>
  );
};
