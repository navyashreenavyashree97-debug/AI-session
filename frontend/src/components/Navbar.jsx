import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, Search, Bell, Plus, Sparkles, 
  BookOpen, ClipboardList, CheckCircle2 
} from 'lucide-react';

export default function Navbar() {
  const { user, isFaculty } = useAuth();
  const navigate = useNavigate();

  // Get initials
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link to={isFaculty ? "/faculty/dashboard" : "/student/dashboard"} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-forest-900 text-brandlime-400 flex items-center justify-center font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-brandlime-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-forest-950 tracking-tight text-base">Green Valley Academy</span>
                <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded bg-brandlime-100 text-forest-900 border border-brandlime-300">
                  Bloom Analytics
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Cognitive Learning & Operations Web App</p>
            </div>
          </Link>
        </div>

        {/* Center: Global Search Bar (matching screenshot "Q Search anything here") */}
        {user && (
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search courses, objectives, questions, students..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brandlime-400/40 focus:border-brandlime-500 transition-all"
              />
            </div>
          </div>
        )}

        {/* Right: Quick Action Buttons & User Profile */}
        {user ? (
          <div className="flex items-center gap-3">
            {/* Quick Action Pills matching user screenshot */}
            {isFaculty ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/faculty/courses"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-forest-900 text-white hover:bg-forest-800 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-brandlime-400" />
                  New Course
                </Link>
                <Link
                  to="/faculty/ai-generator"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-brandlime-400 text-forest-950 hover:bg-brandlime-300 transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-forest-950" />
                  AI Studio
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/student/browse"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-brandlime-400 text-forest-950 hover:bg-brandlime-300 transition-colors shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-forest-950" />
                  Browse Catalog
                </Link>
              </div>
            )}

            {/* Notification Bell */}
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-brandlime-500 absolute top-2 right-2 ring-2 ring-white"></span>
            </button>

            {/* User Avatar with Initials Badge */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-forest-900 text-brandlime-400 flex items-center justify-center font-extrabold text-xs ring-2 ring-brandlime-400/40">
                {initials}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-500 capitalize mt-0.5">{user.role} Member</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-600 hover:text-forest-900 px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-bold text-forest-950 bg-brandlime-400 hover:bg-brandlime-300 px-4 py-2 rounded-xl shadow-xs transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
