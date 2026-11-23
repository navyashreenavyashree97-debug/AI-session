import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, UserCheck, UserPlus, GraduationCap, 
  Percent, AlertCircle, FileCheck, ClipboardList, 
  Award, TrendingUp, Sparkles, Filter, Calendar, 
  BookOpen, Plus, CheckCircle2, ChevronRight, Search 
} from 'lucide-react';
import BloomRadarChart from '../../components/BloomRadarChart';
import BloomBarChart from '../../components/BloomBarChart';
import BloomBadge, { BLOOM_CONFIG } from '../../components/BloomBadge';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [allAssessments, setAllAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter toolbar state (matching user screenshot)
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [selectedBloomFilter, setSelectedBloomFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    api.courses.getAll()
      .then((data) => {
        setCourses(data.courses);
        if (data.courses.length > 0) {
          setSelectedCourse(data.courses[0]);
          loadCourseData(data.courses[0].id);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const loadCourseData = (courseId) => {
    setLoading(true);
    Promise.all([
      api.analytics.getFacultyCourse(courseId),
      api.questions.getByCourse(courseId),
      api.assessments.getByCourse(courseId),
    ])
      .then(([aData, qData, assData]) => {
        setAnalytics(aData.analytics);
        setAllQuestions(qData.questions);
        setAllAssessments(assData.assessments);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCourseChange = (e) => {
    const courseId = parseInt(e.target.value);
    const found = courses.find((c) => c.id === courseId);
    setSelectedCourse(found);
    if (found) {
      loadCourseData(found.id);
    }
  };

  const handleApplyFilter = () => {
    if (selectedCourse) {
      loadCourseData(selectedCourse.id);
    }
  };

  const nowFormatted = new Date().toLocaleString();

  return (
    <div className="space-y-5">
      {/* Top Welcome Header Bar (matching screenshot: "Hello, Aarav Mehta - Green Valley Academy operations dashboard") */}
      <div className="bg-forest-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brandlime-400"></span>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
              Hello, {user?.name || 'Dr. Alan Turing'}
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Green Valley Academy operations & Bloom's cognitive learning dashboard
          </p>
        </div>

        {/* Action Pills in Header */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link
            to="/faculty/courses"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-forest-800 text-slate-200 hover:text-white hover:bg-forest-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-brandlime-400" />
            New Course
          </Link>
          <Link
            to="/faculty/assessments"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-brandlime-400 text-forest-950 hover:bg-brandlime-300 transition-colors shadow-xs"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Assessments
          </Link>
        </div>
      </div>

      {/* Filter Toolbar (matching screenshot: Academic year, Class, Section, Dates, Apply) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Academic Year:</span>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 font-semibold bg-white focus:outline-none"
          >
            <option value="2026-2027">2026-2027</option>
            <option value="2025-2026">2025-2026</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Course / Class:</span>
          <select
            value={selectedCourse?.id || ''}
            onChange={handleCourseChange}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 font-semibold bg-white focus:outline-none max-w-xs"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Bloom Level:</span>
          <select
            value={selectedBloomFilter}
            onChange={(e) => setSelectedBloomFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 font-semibold bg-white focus:outline-none"
          >
            <option value="ALL">All Levels (1 to 6)</option>
            <option value="REMEMBER">Remember</option>
            <option value="UNDERSTAND">Understand</option>
            <option value="APPLY">Apply</option>
            <option value="ANALYZE">Analyze</option>
            <option value="EVALUATE">Evaluate</option>
            <option value="CREATE">Create</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-xl border border-slate-300 text-slate-600 bg-white"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-xl border border-slate-300 text-slate-600 bg-white"
          />
        </div>

        <button
          onClick={handleApplyFilter}
          className="ml-auto px-4 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs tracking-wider uppercase transition-colors"
        >
          Apply
        </button>
      </div>

      {/* Subheader Title */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Live Operations Dashboard</h2>
          <p className="text-[11px] text-slate-400">Last refreshed: {nowFormatted}</p>
        </div>
      </div>

      {/* 12 Live KPI Cards Grid (exact layout matching screenshot) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Students */}
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Students</span>
            <div className="w-6 h-6 rounded-full bg-brandlime-100 text-forest-900 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-forest-900" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{analytics?.total_students || 8}</p>
        </div>

        {/* Card 2: Active Students */}
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Students</span>
            <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{analytics?.total_students || 8}</p>
        </div>

        {/* Card 3: New Enrollments */}
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">New Enrollments</span>
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
              <UserPlus className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">2</p>
        </div>

        {/* Card 4: Total Faculty */}
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Teachers</span>
            <div className="w-6 h-6 rounded-full bg-forest-900 text-brandlime-400 flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">3</p>
        </div>

        {/* Card 5: Class Average Mastery */}
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Class Mastery %</span>
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {analytics?.average_percentage ? `${analytics.average_percentage}%` : '100%'}
          </p>
        </div>

        {/* Card 6: Unassessed Objectives / Pending */}
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cognitive Objectives</span>
            <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">6 Levels</p>
        </div>

        {/* Card 7: Completed Attempts */}
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Completed Attempts</span>
            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{analytics?.total_attempts || 1}</p>
        </div>

        {/* Card 8: Pending / Draft Assessments */}
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Assessments</span>
            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <ClipboardList className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{allAssessments.length || 1}</p>
        </div>

        {/* Card 9: Question Bank Items */}
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Question Bank Items</span>
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{allQuestions.length || 8}</p>
        </div>

        {/* Card 10: Cohort Pass Rate */}
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cohort Pass Rate</span>
            <div className="w-6 h-6 rounded-full bg-brandlime-200 text-forest-950 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">
            {analytics?.pass_rate !== undefined ? `${analytics.pass_rate}%` : '100%'}
          </p>
        </div>

        {/* Card 11: Weak Topics Flagged */}
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Flagged Weak Topics</span>
            <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">
            {analytics?.difficult_topics?.length || 2}
          </p>
        </div>

        {/* Card 12: AI Recommendations */}
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">AI Remediation Plans</span>
            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-700 mt-2">Active</p>
        </div>
      </div>

      {/* Visual Analytics Row: Radar Chart & Level Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Class Cognitive Mastery Radar</h3>
              <p className="text-[11px] text-slate-400">Cohort mastery mapped to the 6 Revised Bloom's levels</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-brandlime-100 text-forest-900 border border-brandlime-300">
              Bloom's 6 Tiers
            </span>
          </div>
          <BloomRadarChart data={analytics?.bloom_radar} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Level-Wise Mastery Scores</h3>
              <p className="text-[11px] text-slate-400">Benchmarked performance across cognitive categories</p>
            </div>
            <Link
              to="/faculty/analytics"
              className="text-xs font-bold text-forest-900 hover:text-brandlime-600 inline-flex items-center gap-1"
            >
              Full Analytics <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <BloomBarChart data={analytics?.bloom_radar} />
        </div>
      </div>

      {/* Data Tables Section (matching the Dark Forest Green Header style in user's image) */}
      <div className="space-y-5">
        {/* Table 1: Student Cognitive Roster */}
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
          {/* Table Header Bar */}
          <div className="bg-forest-900 px-4 py-3 text-white flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Student Admission & Cognitive Master
            </h3>
            <span className="text-[11px] text-brandlime-300">
              {analytics?.student_performance?.length || 1} Registered Students
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest-850 text-slate-200 border-b border-forest-800">
                <tr>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">ADMISSION NUMBER</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">STUDENT NAME</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">CLASS / COURSE</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">ATTEMPTS</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">MASTERY SCORE</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">STATUS</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics?.student_performance?.map((st, idx) => (
                  <tr key={st.student_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">
                      GVA-ADM-{1001 + idx}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{st.student_name}</td>
                    <td className="py-3 px-4 text-slate-600">{selectedCourse?.code || 'CS301'}</td>
                    <td className="py-3 px-4 text-slate-600">{st.attempts_count}</td>
                    <td className="py-3 px-4 font-black text-emerald-600">{st.average_score}%</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brandlime-100 text-forest-900 border border-brandlime-300">
                        <CheckCircle2 className="w-3 h-3 text-forest-900" />
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/faculty/analytics?studentId=${st.student_id}&courseId=${selectedCourse?.id}`}
                        className="font-bold text-forest-900 hover:text-brandlime-600 hover:underline"
                      >
                        Drilldown
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
            <span>{analytics?.student_performance?.length || 1} records • Page 1 of 1</span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200">Prev</span>
              <span className="font-bold text-forest-900">1</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200">Next</span>
            </div>
          </div>
        </div>

        {/* Table 2: Classes & Sections */}
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="bg-forest-900 px-4 py-3 text-white flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Classes, Courses & Sections
            </h3>
            <span className="text-[11px] text-brandlime-300">{courses.length} Active Courses</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest-850 text-slate-200 border-b border-forest-800">
                <tr>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">CLASS / CODE</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">COURSE TITLE</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">TEACHER IN CHARGE</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">ACADEMIC YEAR</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">ENROLLED</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{c.title}</td>
                    <td className="py-3 px-4 text-slate-600">{c.faculty_name}</td>
                    <td className="py-3 px-4 text-slate-500">{c.academic_year}</td>
                    <td className="py-3 px-4 font-bold text-forest-900">{c.enrolled_count} Students</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brandlime-100 text-forest-900 border border-brandlime-300">
                        <CheckCircle2 className="w-3 h-3 text-forest-900" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
