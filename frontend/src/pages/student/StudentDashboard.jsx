import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, ClipboardList, Award, Lightbulb, ArrowRight, 
  Sparkles, CheckCircle2, AlertCircle, Clock, Compass 
} from 'lucide-react';
import BloomRadarChart from '../../components/BloomRadarChart';
import BloomBadge from '../../components/BloomBadge';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.courses.getAll(),
      api.analytics.getStudentProfile(),
      api.recommendations.getStudent(),
    ])
      .then(([cData, pData, rData]) => {
        setCourses(cData.courses);
        setProfile(pData.profile);
        setRecommendations(rData.recommendations);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      {/* Top Welcome Header Bar (matching screenshot) */}
      <div className="bg-forest-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brandlime-400"></span>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
              Hello, {user?.name || 'Ada Lovelace'}
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Green Valley Academy student learning portal & adaptive cognitive pathway
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link
            to="/student/browse"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-brandlime-400 text-forest-950 hover:bg-brandlime-300 transition-colors shadow-xs"
          >
            <Compass className="w-3.5 h-3.5" />
            Browse Courses
          </Link>
        </div>
      </div>

      {/* KPI Cards (matching user screenshot) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Enrolled Courses</span>
            <div className="w-6 h-6 rounded-full bg-brandlime-100 text-forest-900 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-forest-900" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{courses.length}</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Completed Tests</span>
            <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center">
              <ClipboardList className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{profile?.total_completed || 1}</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cognitive Score</span>
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{profile?.overall_average || 66.7}%</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">AI Remediation</span>
            <div className="w-6 h-6 rounded-full bg-forest-900 text-brandlime-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-forest-900 mt-2">{recommendations.length} Active</p>
        </div>
      </div>

      {/* Main Grid: Bloom's Radar & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bloom's Cognitive Radar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900">Your Cognitive Radar</h3>
              <span className="text-[10px] uppercase font-bold text-forest-900 bg-brandlime-100 px-2 py-0.5 rounded border border-brandlime-300">
                Bloom's 6 Tiers
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">Mastery profile from your completed assessments</p>
          </div>

          <BloomRadarChart data={profile?.bloom_radar} />

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <Link
              to="/student/analytics"
              className="text-xs font-bold text-forest-900 hover:text-brandlime-600 inline-flex items-center gap-1"
            >
              Inspect Growth Timeline <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* AI Recommendations & Courses */}
        <div className="lg:col-span-2 space-y-5">
          {recommendations.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-forest-900 text-brandlime-400 flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Personalized AI Remediation Guidance</h3>
                    <p className="text-[11px] text-slate-400">
                      Course: <span className="font-semibold text-slate-700">{recommendations[0].course_title}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Identified Gap:</span>
                  <BloomBadge level={recommendations[0].primary_weak_bloom} size="sm" />
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {recommendations[0].recommendation_summary}
              </p>

              {recommendations[0].actionable_steps?.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                    Recommended Learning Actions:
                  </p>
                  <div className="space-y-1">
                    {recommendations[0].actionable_steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-forest-900 mt-0.5 shrink-0" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Enrolled Courses Dark Header Table (matching user screenshot) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="bg-forest-900 px-4 py-3 text-white flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider">
                My Enrolled Classes & Courses
              </h3>
              <Link to="/student/browse" className="text-[11px] text-brandlime-300 font-bold hover:underline">
                + Browse More
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-forest-850 text-slate-200 border-b border-forest-800">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">CODE</th>
                    <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">COURSE TITLE</th>
                    <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">INSTRUCTOR</th>
                    <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-forest-900">{c.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{c.title}</td>
                      <td className="py-3 px-4 text-slate-600">{c.faculty_name}</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/student/course/${c.id}`}
                          className="font-bold text-forest-900 hover:text-brandlime-600 inline-flex items-center gap-1"
                        >
                          Enter Course <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
