import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import {
  BarChart3, Users, Award, TrendingUp, AlertTriangle,
  ArrowLeft, Search, User, CheckCircle2, ChevronRight
} from 'lucide-react';
import BloomRadarChart from '../../components/BloomRadarChart';
import BloomBarChart from '../../components/BloomBarChart';
import BloomBadge, { BLOOM_CONFIG } from '../../components/BloomBadge';

export default function FacultyAnalytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStudentId = searchParams.get('studentId');
  const initialCourseId = searchParams.get('courseId');

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId || '');
  const [analytics, setAnalytics] = useState(null);
  const [studentDrilldown, setStudentDrilldown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.courses.getAll().then((data) => {
      setCourses(data.courses);
      const targetCourseId = initialCourseId || (data.courses.length > 0 ? data.courses[0].id : '');
      setSelectedCourseId(targetCourseId);
      if (targetCourseId) {
        loadCourseAnalytics(targetCourseId);
        if (initialStudentId) {
          loadStudentDrilldown(initialStudentId, targetCourseId);
        }
      } else {
        setLoading(false);
      }
    });
  }, []);

  const loadCourseAnalytics = (courseId) => {
    setLoading(true);
    api.analytics.getFacultyCourse(courseId)
      .then((data) => {
        setAnalytics(data.analytics);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const loadStudentDrilldown = (studentId, courseId) => {
    api.analytics.getFacultyStudentDrilldown(studentId, courseId)
      .then((data) => {
        setStudentDrilldown(data.profile);
      })
      .catch(console.error);
  };

  const handleCourseChange = (e) => {
    const id = parseInt(e.target.value);
    setSelectedCourseId(id);
    setStudentDrilldown(null);
    setSearchParams({});
    loadCourseAnalytics(id);
  };

  const handleSelectStudent = (studentId) => {
    loadStudentDrilldown(studentId, selectedCourseId);
    setSearchParams({ studentId, courseId: selectedCourseId });
  };

  const handleClearDrilldown = () => {
    setStudentDrilldown(null);
    setSearchParams({});
  };

  const filteredStudents = analytics?.student_performance?.filter((s) =>
    s.student_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Class Cognitive Analytics</h1>
          <p className="text-xs text-slate-500">
            Comprehensive Bloom's Taxonomy cognitive level performance and student diagnostics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={handleCourseChange}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs animate-pulse">Computing class analytics...</div>
      ) : studentDrilldown ? (
        /* Student Drilldown Mode */
        <div className="space-y-5">
          <button
            onClick={handleClearDrilldown}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-900 hover:text-brandlime-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Class-Wide Analytics
          </button>

          {/* Student Header Card */}
          <div className="bg-forest-900 rounded-2xl p-6 text-white shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brandlime-400">
                  Individual Student Cognitive Drilldown
                </span>
                <h2 className="text-2xl font-black mt-1">{studentDrilldown.student_name}</h2>
                <p className="text-xs text-slate-300">{studentDrilldown.student_email}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Overall Mastery</span>
                  <p className="text-3xl font-black text-brandlime-400">{studentDrilldown.overall_average}%</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Tests Completed</span>
                  <p className="text-3xl font-black text-white">{studentDrilldown.total_completed}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Individual Cognitive Mastery Radar</h3>
              <p className="text-[11px] text-slate-400 mb-3">Mastery profile across Bloom's 6 tiers for this student</p>
              <BloomRadarChart data={studentDrilldown.bloom_radar} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Bloom's Mastery Status Breakdown</h3>
              <p className="text-[11px] text-slate-400 mb-3">Detailed breakdown per cognitive category</p>
              <BloomBarChart data={studentDrilldown.bloom_radar} />
            </div>
          </div>

          {/* Strengths & Weaknesses Diagnostics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Demonstrated Cognitive Strengths (≥ 75% Mastery)
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {studentDrilldown.strengths.length > 0 ? (
                  studentDrilldown.strengths.map((lvl) => (
                    <BloomBadge key={lvl} level={lvl} />
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No mastery level above 75% yet.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Identified Cognitive Gaps (&lt; 50% Developing)
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {studentDrilldown.weaknesses.length > 0 ? (
                  studentDrilldown.weaknesses.map((lvl) => (
                    <BloomBadge key={lvl} level={lvl} />
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No critical cognitive deficits detected.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : analytics ? (
        /* Class-Wide Mode */
        <div className="space-y-5">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Cohort Cognitive Radar Chart</h3>
              <p className="text-[11px] text-slate-400 mb-3">Average mastery across all 6 revised Bloom's levels</p>
              <BloomRadarChart data={analytics.bloom_radar} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Level-Wise Mastery Breakdown</h3>
              <p className="text-[11px] text-slate-400 mb-3">Aggregated scoring benchmarked by cognitive tier</p>
              <BloomBarChart data={analytics.bloom_bar} />
            </div>
          </div>

          {/* Identified Problem Topics */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Most Challenging Curriculum Topics for this Cohort
            </h3>
            <p className="text-xs text-slate-500">
              Students scored lowest on questions associated with these topics. Focus review lectures here.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {analytics.difficult_topics.map((t, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-forest-50 text-forest-900 border border-forest-200 text-xs font-bold flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-forest-900"></span>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Dark Forest Green Header Table (matching user screenshot) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="bg-forest-900 px-4 py-3 text-white flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Student Cognitive Performance Roster
              </h3>
              <span className="text-[11px] text-brandlime-300 font-semibold">
                Click any student to inspect individual drilldown
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-forest-850 text-slate-200 border-b border-forest-800">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">STUDENT NAME</th>
                    <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">COMPLETED ATTEMPTS</th>
                    <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">AVERAGE MASTERY</th>
                    <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">LAST ACTIVE</th>
                    <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st) => (
                    <tr
                      key={st.student_id}
                      onClick={() => handleSelectStudent(st.student_id)}
                      className="hover:bg-brandlime-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-forest-900 text-brandlime-400 flex items-center justify-center font-black text-xs">
                          {st.student_name.charAt(0)}
                        </div>
                        {st.student_name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{st.attempts_count}</td>
                      <td className="py-3 px-4 font-black text-emerald-600">{st.average_score}%</td>
                      <td className="py-3 px-4 text-slate-400">
                        {st.last_active ? new Date(st.last_active).toLocaleDateString() : 'Active'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-forest-900 hover:text-brandlime-600">
                          Inspect <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
              <span>{filteredStudents.length} records • Page 1 of 1</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200">Prev</span>
                <span className="font-bold text-forest-900">1</span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200">Next</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
