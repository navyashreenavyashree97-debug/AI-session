import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api';
import { 
  Award, CheckCircle2, XCircle, ArrowLeft, Sparkles, 
  Lightbulb, AlertTriangle, BookOpen, Clock, Layers 
} from 'lucide-react';
import BloomRadarChart from '../../components/BloomRadarChart';
import BloomBarChart from '../../components/BloomBarChart';
import BloomBadge from '../../components/BloomBadge';

export default function AssessmentResult() {
  const { attemptId } = useParams();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.attempts.getResult(attemptId)
      .then((data) => setResultData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm animate-pulse">Generating your Bloom's cognitive report...</div>;
  }

  if (!resultData) {
    return <div className="py-20 text-center text-rose-500 text-sm">Attempt result not found.</div>;
  }

  const { attempt, answers, recommendation } = resultData;
  const bloomAnalysis = attempt.bloom_analysis || {};
  const bloomBreakdown = bloomAnalysis.bloom_breakdown || {};
  const weakTopics = bloomAnalysis.weak_topics || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top back navigation */}
      <div>
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Score Header Card */}
      <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-lg ${
        attempt.passed
          ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700'
          : 'bg-gradient-to-r from-amber-600 via-rose-600 to-purple-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider inline-block">
              {attempt.passed ? 'Assessment Passed' : 'Assessment Completed - Remediation Needed'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{attempt.assessment_title}</h1>
            <p className="text-xs text-white/80">Course: {attempt.course_title}</p>
          </div>

          <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 self-start sm:self-auto">
            <div className="text-center">
              <span className="text-[11px] text-white/70 font-semibold block">Score</span>
              <p className="text-3xl font-black">{attempt.score} / {attempt.total_possible_marks}</p>
            </div>
            <div className="h-10 w-px bg-white/20"></div>
            <div className="text-center">
              <span className="text-[11px] text-white/70 font-semibold block">Percentage</span>
              <p className="text-3xl font-black">{attempt.percentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bloom's Cognitive Radar & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bloom-card p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Your Cognitive Mastery Radar</h3>
          <p className="text-xs text-slate-500 mb-4">Mastery achieved across each Bloom's Taxonomy dimension</p>
          <BloomRadarChart data={bloomBreakdown} />
        </div>

        <div className="bloom-card p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Level-Wise Scoring Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">Percentage score benchmarked by cognitive tier</p>
          <BloomBarChart data={bloomBreakdown} />
        </div>
      </div>

      {/* AI Recommendation Box */}
      {recommendation && (
        <div className="bloom-card p-6 sm:p-8 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 border-indigo-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Personalized AI Remediation Guidance</h3>
                <p className="text-xs text-slate-500">Targeted feedback addressing your cognitive bottlenecks</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Primary Gap:</span>
              <BloomBadge level={recommendation.primary_weak_bloom} />
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white/90 p-4 rounded-2xl border border-indigo-100 shadow-xs">
            {recommendation.recommendation_summary}
          </p>

          {/* Actionable Steps */}
          {recommendation.actionable_steps?.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Actionable Remediation Steps:
              </h4>
              <div className="space-y-1.5">
                {recommendation.actionable_steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Resources */}
          {recommendation.suggested_resources?.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Suggested Study Materials:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommendation.suggested_resources.map((res, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase block mb-1">{res.type}</span>
                    <p className="font-bold text-slate-800">{res.title}</p>
                    <p className="text-slate-400 mt-0.5">Focus: {res.focus}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Question by Question Detailed Feedback */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Question-by-Question Detailed Review</h3>
        <div className="space-y-4">
          {answers.map((ans, idx) => {
            const q = ans.question;
            const isCorrect = ans.is_correct;
            return (
              <div
                key={ans.id}
                className={`bloom-card p-6 border-l-4 ${
                  isCorrect ? 'border-l-emerald-500' : 'border-l-rose-500'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-slate-400">Q{idx + 1}</span>
                    <BloomBadge level={q.bloom_level} />
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {q.topic}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Score: {ans.marks_awarded} / {q.marks}
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-800 mb-3">{q.question_text}</h4>

                {/* Options display */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {q.options?.map((opt, i) => {
                    const isStudentChoice = ans.student_answer === opt;
                    const isRealCorrect = q.correct_answer === opt;

                    let style = 'bg-slate-50 border-slate-200 text-slate-600';
                    if (isRealCorrect) {
                      style = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                    } else if (isStudentChoice && !isCorrect) {
                      style = 'bg-rose-50 border-rose-400 text-rose-900 font-bold';
                    }

                    return (
                      <div key={i} className={`p-2.5 rounded-xl text-xs border flex items-center justify-between ${style}`}>
                        <span>{opt}</span>
                        {isStudentChoice && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/10">
                            Your Choice
                          </span>
                        )}
                        {isRealCorrect && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-100">
                    <span className="font-bold text-slate-800 block mb-0.5">Explanation & Cognitive Rationale:</span>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
