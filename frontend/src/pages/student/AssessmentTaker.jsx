import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { 
  Clock, AlertTriangle, CheckCircle2, ChevronLeft, 
  ChevronRight, Send, AlertCircle 
} from 'lucide-react';
import BloomBadge from '../../components/BloomBadge';

export default function AssessmentTaker() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [attemptData, setAttemptData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { question_id: selected_option_text }
  const [secondsRemaining, setSecondsRemaining] = useState(1800);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Start attempt
    api.attempts.start(assessmentId)
      .then((data) => {
        setAttemptData(data);
        setQuestions(data.questions);
        setSecondsRemaining(data.duration_minutes * 60);
      })
      .catch((err) => {
        setError(err.message || 'Failed to start assessment. You may have reached your attempt limit.');
      })
      .finally(() => setLoading(false));
  }, [assessmentId]);

  // Countdown timer
  useEffect(() => {
    if (!attemptData || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Auto-submit on time expiration
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attemptData, secondsRemaining]);

  const handleSelectOption = (questionId, optionText) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionText,
    }));
  };

  const handleSubmit = async (isAuto = false) => {
    if (!isAuto && !window.confirm('Are you ready to submit your assessment? You cannot change your answers after submission.')) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.attempts.submit(attemptData.attempt_id, answers);
      // Redirect to detailed result report
      navigate(`/student/assessment-result/${attemptData.attempt_id}`);
    } catch (err) {
      alert(err.message || 'Submission error');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm animate-pulse">Launching secure assessment environment...</div>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-6 rounded-2xl border border-rose-200 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Cannot Start Assessment</h3>
        <p className="text-xs text-rose-600">{error}</p>
        <button
          onClick={() => navigate('/student/dashboard')}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIdx]?.question;
  const currentQId = currentQ?.id;
  const currentAnswer = answers[currentQId];

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Assessment Top Bar with Sticky Timer */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Assessment In Progress (Attempt #{attemptData.attempt_number})
          </span>
          <span className="text-xs font-semibold text-slate-700">
            Progress: {answeredCount} / {questions.length} Answered
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-sm font-bold ${
            secondsRemaining < 300 
              ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse' 
              : 'bg-slate-50 text-slate-800 border-slate-200'
          }`}>
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Submitting...' : 'Finish & Submit'}
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ && (
        <div className="bloom-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-indigo-700 font-mono bg-indigo-50 px-2.5 py-1 rounded-lg">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <BloomBadge level={currentQ.bloom_level} />
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Topic: {currentQ.topic}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-500 font-mono">
              {currentQ.marks} Mark(s)
            </span>
          </div>

          {/* Stem */}
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {currentQ.question_text}
          </h2>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options?.map((opt, optIdx) => {
              const isSelected = currentAnswer === opt;
              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQId, opt)}
                  className={`p-4 rounded-xl border text-xs sm:text-sm cursor-pointer flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 font-semibold shadow-xs ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="flex-1 leading-relaxed">{opt}</span>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Quick jump dots */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-xs">
              {questions.map((_, i) => {
                const isAns = answers[questions[i]?.question?.id] !== undefined;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      currentIdx === i
                        ? 'bg-indigo-600 text-white'
                        : isAns
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIdx === questions.length - 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
