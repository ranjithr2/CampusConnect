import React, { useState } from 'react';
import { CampusEvent, Registration, WaitlistEntry, User, ActivityLog } from '../types/campus';
import {
  Sparkles,
  Users,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Clock4,
  Cpu,
  Layers,
  Lock,
  Database
} from 'lucide-react';

interface WaitlistSimulatorProps {
  event: CampusEvent;
  registrations: Registration[];
  waitlist: WaitlistEntry[];
  allUsers: User[];
  activityLogs: ActivityLog[];
  onCancelRegistration: (eventId: number, studentId: number) => void;
  onRegisterStudent: (eventId: number, studentId: number) => void;
  onResetSimulation: () => void;
}

export const WaitlistSimulator: React.FC<WaitlistSimulatorProps> = ({
  event,
  registrations,
  waitlist,
  allUsers,
  activityLogs,
  onCancelRegistration,
  onRegisterStudent,
  onResetSimulation
}) => {
  const [selectedSimStudent, setSelectedSimStudent] = useState<number>(9); // Jordan Lee
  const [isSimulatingTx, setIsSimulatingTx] = useState(false);
  const [txStep, setTxStep] = useState<string | null>(null);

  const confirmedList = registrations.filter(
    (r) => r.eventId === event.eventId && r.status === 'CONFIRMED'
  );
  const waitingList = waitlist
    .filter((w) => w.eventId === event.eventId && w.status === 'WAITING')
    .sort((a, b) => a.position - b.position);

  // Available students who aren't currently active for this event
  const activeStudentIds = new Set([
    ...confirmedList.map((c) => c.studentId),
    ...waitingList.map((w) => w.studentId)
  ]);
  const availableStudents = allUsers.filter(
    (u) => u.role === 'STUDENT' && !activeStudentIds.has(u.userId)
  );

  const handleSimulatedCancel = async (studentId: number) => {
    setIsSimulatingTx(true);
    setTxStep('1. START TRANSACTION (Isolation: REPEATABLE READ)');
    await new Promise((r) => setTimeout(r, 400));

    setTxStep('2. LOCK: SELECT capacity FROM events WHERE event_id=3 FOR UPDATE');
    await new Promise((r) => setTimeout(r, 450));

    setTxStep(`3. UPDATE registrations SET status='CANCELLED' FOR student #${studentId}`);
    await new Promise((r) => setTimeout(r, 400));

    setTxStep('4. SELECT * FROM waitlist WHERE status="WAITING" ORDER BY position ASC LIMIT 1 FOR UPDATE');
    await new Promise((r) => setTimeout(r, 450));

    if (waitingList.length > 0) {
      const nextStudent = waitingList[0];
      setTxStep(`5. ATOMIC PROMOTION: Student #${nextStudent.studentId} (${allUsers.find((u) => u.userId === nextStudent.studentId)?.name}) -> CONFIRMED`);
      await new Promise((r) => setTimeout(r, 500));
    }

    setTxStep('6. COMMIT TRANSACTION & Release MySQL Row Locks');
    await new Promise((r) => setTimeout(r, 350));

    onCancelRegistration(event.eventId, studentId);
    setIsSimulatingTx(false);
    setTxStep(null);
  };

  const handleSimulatedRegister = async (studentId: number) => {
    setIsSimulatingTx(true);
    setTxStep('1. START TRANSACTION (Isolation: REPEATABLE READ)');
    await new Promise((r) => setTimeout(r, 350));

    setTxStep('2. LOCK: SELECT capacity FROM events WHERE event_id=3 FOR UPDATE');
    await new Promise((r) => setTimeout(r, 400));

    if (confirmedList.length < event.capacity) {
      setTxStep(`3. CAPACITY AVAILABLE: Granting CONFIRMED seat to Student #${studentId}`);
    } else {
      setTxStep(`3. CAPACITY FULL (${confirmedList.length}/${event.capacity}): Appending to Waitlist FIFO queue`);
    }
    await new Promise((r) => setTimeout(r, 450));

    setTxStep('4. COMMIT TRANSACTION');
    await new Promise((r) => setTimeout(r, 300));

    onRegisterStudent(event.eventId, studentId);
    setIsSimulatingTx(false);
    setTxStep(null);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-blue-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Core Concurrency Engine
              </span>
              <span className="text-blue-300 text-xs font-mono">Algorithm: Strict FIFO with MySQL Row-Locks</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Smart Waitlist Concurrency Visualizer
            </h1>
            <p className="text-blue-200 text-sm mt-1 max-w-2xl leading-relaxed">
              Demonstrates atomic transaction guarantees, zero-overbooking invariants, and automatic
              first-in first-out promotions on capacity release using real Java backend logic.
            </p>
          </div>

          <button
            onClick={onResetSimulation}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all self-start lg:self-auto cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Initial State
          </button>
        </div>
      </div>

      {/* Target Event Info Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
              Target Testbed Event
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              {event.title}
            </h2>
            <p className="text-xs text-slate-500">
              Capacity: <strong className="text-slate-800">{event.capacity} Total Seats</strong> • Venue: {event.venue}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">Confirmed Seats</span>
              <p className="text-xl font-extrabold text-blue-900">
                {confirmedList.length} / {event.capacity}
              </p>
            </div>
            <div className="h-10 w-px bg-slate-200"></div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">Waitlist Queue</span>
              <p className="text-xl font-extrabold text-amber-600">
                {waitingList.length} in line
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Transaction Monitor (When action runs) */}
      {isSimulatingTx && (
        <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-xl shadow-lg border border-emerald-500/30 flex items-center gap-3 animate-pulse">
          <Database className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Executing JDBC ACID Transaction:</span>
            <span className="font-bold">{txStep}</span>
          </div>
        </div>
      )}

      {/* Interactive Arena: Left = Confirmed Roster, Right = Waitlist Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Confirmed Seats Column */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Confirmed Participants ({confirmedList.length} / {event.capacity})
                </h3>
                <p className="text-[11px] text-slate-500">Currently holding official event seats</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Capacity: {confirmedList.length >= event.capacity ? '100% Full' : `${event.capacity - confirmedList.length} Free`}
            </span>
          </div>

          <div className="space-y-2.5">
            {confirmedList.map((reg, idx) => {
              const student = allUsers.find((u) => u.userId === reg.studentId);
              return (
                <div
                  key={reg.registrationId}
                  className="p-3.5 bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {student?.name || `Student #${reg.studentId}`}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {student?.department} • {student?.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSimulatedCancel(reg.studentId)}
                    disabled={isSimulatingTx}
                    className="shrink-0 text-[11px] font-semibold text-rose-700 hover:text-rose-800 bg-white hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                    title="Simulate this student cancelling to trigger FIFO promotion"
                  >
                    Cancel Seat →
                  </button>
                </div>
              );
            })}

            {confirmedList.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                All confirmed seats are currently vacant.
              </div>
            )}
          </div>
        </div>

        {/* Waitlist Queue Column */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Clock4 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  FIFO Waitlist Queue ({waitingList.length} Students)
                </h3>
                <p className="text-[11px] text-slate-500">Ordered by join timestamp and queue position</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Strict Chronological Order
            </span>
          </div>

          <div className="space-y-2.5">
            {waitingList.map((entry) => {
              const student = allUsers.find((u) => u.userId === entry.studentId);
              const isFirst = entry.position === 1;
              return (
                <div
                  key={entry.waitlistId}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    isFirst
                      ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-full text-xs font-extrabold flex items-center justify-center shrink-0 ${
                        isFirst
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      #{entry.position}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {student?.name || `Student #${entry.studentId}`}
                        </p>
                        {isFirst && (
                          <span className="bg-amber-200/70 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-sm shrink-0">
                            NEXT IN LINE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        Joined: {entry.joinedAt} • {student?.department}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onCancelRegistration(event.eventId, entry.studentId)}
                    disabled={isSimulatingTx}
                    className="shrink-0 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Leave Queue
                  </button>
                </div>
              );
            })}

            {waitingList.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                Queue is currently empty. Incoming registrations will fill directly if space opens.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Simulator Control Dock: Register New Student into Scenario */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-2 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-600" />
          Simulate Incoming Student Registration
        </h4>
        <p className="text-xs text-slate-600 mb-3">
          Select an unregistered student to test queue entry:
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <select
            className="bg-white border border-slate-300 text-xs sm:text-sm rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            value={selectedSimStudent}
            onChange={(e) => setSelectedSimStudent(Number(e.target.value))}
          >
            {availableStudents.map((s) => (
              <option key={s.userId} value={s.userId}>
                {s.name} ({s.department})
              </option>
            ))}
          </select>

          <button
            onClick={() => handleSimulatedRegister(selectedSimStudent)}
            disabled={isSimulatingTx || availableStudents.length === 0}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            Enqueue Student into Event #3 →
          </button>
        </div>
      </div>

      {/* Real-Time Database Activity Audit Log */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-slate-500" />
          Real-Time Transaction Audit Trail (activity_logs table)
        </h4>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {activityLogs.map((log) => (
            <div
              key={log.id}
              className={`p-2.5 rounded-lg text-xs border flex items-start gap-3 ${
                log.type === 'promotion'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium'
                  : log.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span className="font-mono text-[10px] text-slate-400 shrink-0 mt-0.5">
                {log.timestamp}
              </span>
              <div className="flex-1">
                <span className="font-bold text-[11px] uppercase mr-2 tracking-wide">
                  [{log.action}]
                </span>
                <span>{log.details}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
