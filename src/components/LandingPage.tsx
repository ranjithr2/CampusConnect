import React from 'react';
import { CampusEvent, Registration, WaitlistEntry, User } from '../types/campus';
import { EventCard } from './EventCard';
import {
  Calendar,
  Sparkles,
  Users,
  CheckCircle2,
  Clock4,
  Award,
  ArrowRight,
  ShieldCheck,
  Building,
  GraduationCap,
  Layers,
  UserCheck2,
  TableProperties
} from 'lucide-react';

interface LandingPageProps {
  events: CampusEvent[];
  currentUser: User | null;
  registrations: Registration[];
  waitlist: WaitlistEntry[];
  onRegister: (eventId: number) => void;
  onCancel: (eventId: number) => void;
  onSelectEventDetail: (event: CampusEvent) => void;
  onNavigateTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  events,
  currentUser,
  registrations,
  waitlist,
  onRegister,
  onCancel,
  onSelectEventDetail,
  onNavigateTab
}) => {
  const activeEvents = events.filter((e) => e.status === 'UPCOMING');
  const totalConfirmed = registrations.filter((r) => r.status === 'CONFIRMED').length;
  const totalWaitlisted = waitlist.filter((w) => w.status === 'WAITING').length;

  return (
    <div className="space-y-12">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white rounded-3xl p-8 sm:p-14 shadow-xl border border-blue-900/40">
        
        {/* Background glow & decorative shapes */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-3xl space-y-6">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/25 text-blue-200 text-xs font-semibold px-3 py-1.5 rounded-full">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>CampusConnect • College Event Management System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            One Campus. Every Event.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-200">
              Seamlessly Connected.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            A centralized platform for college event discovery, student registrations,
            capacity governance, automatic FIFO waitlist promotions, and verifiable faculty attendance tracking.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('events')}
              className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              Explore Campus Events
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateTab('admin')}
              className="bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <TableProperties className="w-4 h-4" />
              Student Registration Roster Table
            </button>

            <button
              onClick={() => onNavigateTab('simulator')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Waitlist Concurrency Lab
            </button>

            <button
              onClick={() => onNavigateTab('student')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserCheck2 className="w-4 h-4 text-blue-300" />
              Student Portal
            </button>
          </div>
        </div>

        {/* Live System Counter Strip */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">{activeEvents.length}</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Upcoming Events</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-400">{totalConfirmed}</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Confirmed Seats</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">{totalWaitlisted}</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Queued in FIFO Waitlist</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">0 Overbooking</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Row-Lock Guarantee</div>
          </div>
        </div>
      </section>

      {/* 2. Featured Events Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
              Live Campus Schedule
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Featured Events & Workshops
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time seat capacities synced directly with database transactions.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('events')}
            className="text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            View All Events & Filters →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.slice(0, 6).map((ev) => (
            <div key={ev.eventId} className="relative group">
              <EventCard
                event={ev}
                currentUser={currentUser}
                registrations={registrations}
                waitlist={waitlist}
                onRegister={onRegister}
                onCancel={onCancel}
              />
              <button
                onClick={() => onSelectEventDetail(ev)}
                className="mt-2 w-full text-center text-xs font-semibold text-slate-500 hover:text-blue-700 hover:underline py-1 cursor-pointer"
              >
                View Details & Schedule →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Admin Roster Showcase Feature Card */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            Admin Oversight
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Master Student Registration Directory & Table
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Administrators can view all registered and unregistered students across campus in a single comprehensive table,
            filter by specific events or departments, and enroll or manage attendees with one click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-emerald-700 font-black text-sm bg-emerald-100 px-2 py-0.5 rounded">Registered (Confirmed)</span>
            <h3 className="font-bold text-slate-900 text-sm mt-2">Confirmed Participant Seats</h3>
            <p className="text-xs text-slate-600">
              Instantly view every student with guaranteed admission and their allocated seats.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-rose-700 font-black text-sm bg-rose-100 px-2 py-0.5 rounded">Not Registered</span>
            <h3 className="font-bold text-slate-900 text-sm mt-2">Unregistered Student Tracking</h3>
            <p className="text-xs text-slate-600">
              Easily identify students who have not yet signed up and manually enroll them if required.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-amber-700 font-black text-sm bg-amber-100 px-2 py-0.5 rounded">FIFO Waitlist</span>
            <h3 className="font-bold text-slate-900 text-sm mt-2">Queue Position #1, #2...</h3>
            <p className="text-xs text-slate-600">
              Review real-time waitlist priorities for high-demand events that reached 100% capacity.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3">
            <TableProperties className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">Manage All Campus Registrations:</span>
              <span className="text-slate-600">Filter by event, check attendance, and view student records.</span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('admin')}
            className="bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Open Admin Table →
          </button>
        </div>
      </section>

      {/* 4. Core Concurrency Highlight: Smart FIFO Waitlist Engine */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            Core Algorithm
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Smart FIFO Waitlist & Concurrency Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Guarantees mathematical fairness and zero overbooking through serialized transactions and row-level locks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">Row-Level Locking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every registration request acquires an exclusive lock, blocking concurrent threads from reading stale capacity.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">Strict FIFO Sequencing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When capacity hits 100%, students are appended to a persistent waitlist table with an explicit queue position number.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">Instant Auto-Promotion</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When a confirmed attendee cancels, the engine atomically promotes position #1 to CONFIRMED and resequences the queue.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">Experience the algorithm in action:</span>
              <span className="text-slate-600">Simulate cancellations, queue promotions, and transaction rollback.</span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('simulator')}
            className="bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Launch Interactive Concurrency Lab →
          </button>
        </div>
      </section>

      {/* 5. Role Based Access Showcase */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Student Experience</h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
              Explore upcoming campus events, view real-time remaining capacity, register in one click,
              track FIFO waitlist queues, and access your verified participation transcript.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 mb-6">
              <li className="flex items-center gap-2">✓ Real-time ticket and waitlist position tracking</li>
              <li className="flex items-center gap-2">✓ One-click registration cancellation with auto-seat handover</li>
              <li className="flex items-center gap-2">✓ Official verified attendance history transcript</li>
            </ul>
          </div>

          <button
            onClick={() => onNavigateTab('student')}
            className="bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-colors cursor-pointer w-full text-center"
          >
            Go to Student Portal →
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Administrator Governance</h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
              Comprehensive event lifecycle management for department chairs, faculties, and club coordinators.
              Publish events, manage capacities, mark on-site attendance, and inspect the master registration table.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 mb-6">
              <li className="flex items-center gap-2">✓ Student registration roster table with Registered/Not Registered badges</li>
              <li className="flex items-center gap-2">✓ On-site Present/Absent attendance marking with one click</li>
              <li className="flex items-center gap-2">✓ Real-time attendance rate and capacity utilization analytics</li>
            </ul>
          </div>

          <button
            onClick={() => onNavigateTab('admin')}
            className="bg-slate-900 hover:bg-slate-950 text-white font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-colors cursor-pointer w-full text-center"
          >
            Access Admin Console & Roster →
          </button>
        </div>
      </section>

    </div>
  );
};
