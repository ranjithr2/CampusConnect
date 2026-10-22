import React from 'react';
import { User } from '../types/campus';
import {
  GraduationCap,
  Sparkles,
  Calendar,
  ShieldCheck,
  UserCheck,
  Users
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  allUsers: User[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  setCurrentUser,
  allUsers
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Top University Header Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white">CampusConnect Portal</span>
            <span className="text-slate-500">•</span>
            <span className="hidden sm:inline">College Event Management with Smart Waitlist & Attendance Tracking</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-[11px] sm:text-xs">Active Role:</span>
            <select
              className="bg-slate-800 text-slate-100 border border-slate-700 text-xs rounded px-2.5 py-1 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
              value={currentUser?.userId || ''}
              onChange={(e) => {
                const uid = Number(e.target.value);
                const user = allUsers.find((u) => u.userId === uid) || null;
                setCurrentUser(user);
              }}
            >
              <optgroup label="Administrators">
                {allUsers
                  .filter((u) => u.role === 'ADMIN')
                  .map((u) => (
                    <option key={u.userId} value={u.userId}>
                      Admin: {u.name} ({u.department.split(' ')[0]})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Students">
                {allUsers
                  .filter((u) => u.role === 'STUDENT')
                  .map((u) => (
                    <option key={u.userId} value={u.userId}>
                      Student: {u.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-blue-950 font-sans">
                  Campus<span className="text-blue-600">Connect</span>
                </span>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  College Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Event Management & Attendance System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => setCurrentTab('home')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                currentTab === 'home'
                  ? 'bg-blue-50 text-blue-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setCurrentTab('events')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                currentTab === 'events'
                  ? 'bg-blue-50 text-blue-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              All Events
            </button>

            <button
              onClick={() => setCurrentTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer relative ${
                currentTab === 'simulator'
                  ? 'bg-blue-50 text-blue-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Waitlist Concurrency Lab
              <span className="ml-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-sm">
                FIFO
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('student')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                currentTab === 'student'
                  ? 'bg-blue-50 text-blue-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Student Portal
            </button>

            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-blue-900 text-white font-bold shadow-xs'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Admin Section & Roster Table
            </button>
          </nav>

          {/* Current User Identity Display */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800">{currentUser?.name}</span>
              <span className="text-[10px] text-slate-500 font-medium">
                {currentUser?.role === 'ADMIN' ? 'Administrator' : 'Student'}
              </span>
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shadow-2xs ${
              currentUser?.role === 'ADMIN' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900 border border-blue-300'
            }`}>
              {currentUser?.name.split(' ').map((n) => n[0]).join('')}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="lg:hidden flex items-center overflow-x-auto gap-2 px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs">
        <button
          onClick={() => setCurrentTab('home')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 cursor-pointer ${currentTab === 'home' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
        >
          Home
        </button>
        <button
          onClick={() => setCurrentTab('events')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 cursor-pointer ${currentTab === 'events' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
        >
          Events
        </button>
        <button
          onClick={() => setCurrentTab('simulator')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 cursor-pointer ${currentTab === 'simulator' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
        >
          Waitlist Lab
        </button>
        <button
          onClick={() => setCurrentTab('student')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 cursor-pointer ${currentTab === 'student' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
        >
          Student Portal
        </button>
        <button
          onClick={() => setCurrentTab('admin')}
          className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 cursor-pointer ${currentTab === 'admin' ? 'bg-blue-900 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
        >
          Admin & Roster Table
        </button>
      </div>
    </header>
  );
};
