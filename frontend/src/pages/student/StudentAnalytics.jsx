import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { 
  Award, TrendingUp, CheckCircle2, AlertTriangle, 
  Clock, Lightbulb, Sparkles, BookOpen, ChevronRight 
} from 'lucide-react';
import BloomRadarChart from '../../components/BloomRadarChart';
import BloomBarChart from '../../components/BloomBarChart';
import BloomBadge, { BLOOM_CONFIG } from '../../components/BloomBadge';

export default function StudentAnalytics() {
  const [profile, setProfile] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.analytics.getStudentProfile(),
      api.attempts.getHistory(),
      api.recommendations.getStudent(),
    ])
      .then(([pData, aData, rData]) => {
        setProfile(pData.profile);
        setAttempts(aData.attempts);
        setRecommendations(rData.recommendations);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm animate-pulse">Calculating cognitive mastery metrics...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Cognitive Growth & Bloom's Mastery Profile
        </h1>
        <p className="text-xs text-slate-500">
          Continuous multidimensional tracking of your learning abilities across the 6 revised Bloom's levels
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bloom-card p-4">
          <span className="text-xs font-medium text-slate-500">Overall Average</span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{profile?.overall_average || 0}%</p>
        </div>
        <div className="bloom-card p-4">
          <span className="text-xs font-medium text-slate-500">Assessments Evaluated</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{profile?.total_completed || 0}</p>
        </div>
        <div className="bloom-card p-4">
          <span className="text-xs font-medium text-slate-500">Mastered Levels</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{profile?.strengths?.length || 0} / 6</p>
        </div>
        <div className="bloom-card p-4">
          <span className="text-xs font-medium text-slate-500">Developing Gaps</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{profile?.weaknesses?.length || 0} / 6</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bloom-card p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Cumulative Cognitive Radar</h3>
          <p className="text-xs text-slate-500 mb-4">Mastery mapping across the six Bloom's dimensions</p>
          <BloomRadarChart data={profile?.bloom_radar} />
        </div>

        <div className="bloom-card p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Bloom's Mastery Status Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">Level-by-level scoring comparison</p>
          <BloomBarChart data={profile?.bloom_radar} />
        </div>
      </div>

      {/* Strengths & Weaknesses Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bloom-card p-6 bg-emerald-50/40 border-emerald-200 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Your Cognitive Strengths (Mastered ≥ 75%)
          </h4>
          <p className="text-xs text-emerald-800/80">
            You demonstrate strong capability in these cognitive domains. Keep reinforcing these foundations:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {profile?.strengths?.length > 0 ? (
              profile.strengths.map((lvl) => (
                <BloomBadge key={lvl} level={lvl} />
              ))
            ) : (
              <p className="text-xs text-slate-500">Take more assessments to establish strengths.</p>
            )}
          </div>
        </div>

        <div className="bloom-card p-6 bg-rose-50/40 border-rose-200 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Identified Cognitive Gaps (Developing &lt; 50%)
          </h4>
          <p className="text-xs text-rose-800/80">
            These areas require targeted problem-solving and deeper conceptual study:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {profile?.weaknesses?.length > 0 ? (
              profile.weaknesses.map((lvl) => (
                <BloomBadge key={lvl} level={lvl} />
              ))
            ) : (
              <p className="text-xs text-slate-500">No critical cognitive gaps detected!</p>
            )}
          </div>
        </div>
      </div>

      {/* Historical Growth Timeline */}
      <div className="bloom-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Longitudinal Assessment History & Progress
            </h3>
            <p className="text-xs text-slate-500">Track how your score and cognitive mastery develop over time</p>
          </div>
        </div>

        {attempts.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {attempts.map((att) => (
              <div key={att.id} className="p-4 bg-white flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{att.assessment_title}</h4>
                  <p className="text-[11px] text-slate-500">
                    Course: {att.course_title} • Submitted {att.submit_time ? new Date(att.submit_time).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-indigo-600">{att.percentage}%</span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      ({att.score}/{att.total_possible_marks})
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    att.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {att.passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">No assessment history recorded yet.</p>
        )}
      </div>

      {/* All AI Recommendations Repository */}
      <div className="bloom-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Personalized AI Remediation History
        </h3>
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Course: {rec.course_title}
                </span>
                <BloomBadge level={rec.primary_weak_bloom} size="sm" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{rec.recommendation_summary}</p>
              {rec.actionable_steps?.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 block">Recommended Steps:</span>
                  {rec.actionable_steps.map((st, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
