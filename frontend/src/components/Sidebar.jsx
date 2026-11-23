import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Target,
  FileText,
  Sparkles,
  HelpCircle,
  ClipboardList,
  BarChart3,
  Compass,
  Lightbulb,
  Award,
  ChevronLeft,
  ChevronRight,
  LogOut,
  GraduationCap,
  Users
} from 'lucide-react';

export default function Sidebar() {
  const { isFaculty, logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const facultyNav = [
    { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    { name: 'Courses & Classes', path: '/faculty/courses', icon: BookOpen },
    { name: "Bloom's Objectives", path: '/faculty/objectives', icon: Target },
    { name: 'Course Documents', path: '/faculty/materials', icon: FileText },
    { name: 'AI Question Studio', path: '/faculty/ai-generator', icon: Sparkles, badge: 'AI' },
    { name: 'Question Bank', path: '/faculty/question-bank', icon: HelpCircle },
    { name: 'Assessments', path: '/faculty/assessments', icon: ClipboardList },
    { name: 'Class Analytics', path: '/faculty/analytics', icon: BarChart3 },
  ];

  const studentNav = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Browse Courses', path: '/student/browse', icon: Compass },
    { name: 'My Enrolled Courses', path: '/student/my-courses', icon: BookOpen },
    { name: 'Active Assessments', path: '/student/assessments', icon: ClipboardList },
    { name: 'Cognitive Radar Profile', path: '/student/analytics', icon: Award },
    { name: 'AI Recommendations', path: '/student/recommendations', icon: Lightbulb, badge: 'Smart' },
  ];

  const navItems = isFaculty ? facultyNav : studentNav;

  return (
    <aside
      className={`bg-forest-900 text-white min-h-[calc(100vh-4rem)] p-3 flex flex-col justify-between shrink-0 transition-all duration-300 border-r border-forest-950/40 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="space-y-4">
        {/* Academy Branding Card inside Sidebar */}
        <div className="flex items-center gap-3 p-2 bg-forest-800/60 rounded-xl border border-forest-700/50">
          <div className="w-10 h-10 rounded-xl bg-brandlime-400 text-forest-950 flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
            {isFaculty ? 'GVA' : 'STU'}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="text-xs font-bold text-white tracking-tight truncate">
                Green Valley Academy
              </h2>
              <p className="text-[10px] text-brandlime-300 font-medium truncate">
                {isFaculty ? 'Faculty Operations' : 'Student Learning Hub'}
              </p>
            </div>
          )}
        </div>

        {/* Section Label */}
        {!collapsed && (
          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400/70">
            {isFaculty ? 'Academic Modules' : 'Learning Navigation'}
          </p>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brandlime-400 text-forest-950 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-forest-800/80'
                  }`
                }
                title={collapsed ? item.name : undefined}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-forest-950/20 text-forest-950">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls: Collapse & Logout */}
      <div className="pt-3 border-t border-forest-800/80 space-y-1.5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-forest-800/60 transition-colors"
          title={collapsed ? 'Expand Menu' : 'Collapse Menu'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
