import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import {
  Sparkles, Check, Edit2, Trash2, BookmarkPlus,
  AlertCircle, HelpCircle, ArrowRight, Brain
} from 'lucide-react';
import BloomBadge, { BLOOM_CONFIG } from '../../components/BloomBadge';
import Modal from '../../components/Modal';

export default function AIQuestionGenerator() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [topic, setTopic] = useState('Relational Normalization');
  const [bloomLevel, setBloomLevel] = useState('UNDERSTAND');
  const [count, setCount] = useState(3);
  const [difficulty, setDifficulty] = useState('Medium');

  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Editing state
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    api.courses.getAll().then((data) => {
      setCourses(data.courses);
      if (data.courses.length > 0) {
        setSelectedCourseId(data.courses[0].id);
      }
    });
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const data = await api.questions.generateAI({
        course_id: parseInt(selectedCourseId),
        topic,
        bloom_level: bloomLevel,
        count: parseInt(count),
        difficulty,
      });

      setGeneratedQuestions(data.questions);
      setSuccessMessage(data.message);
    } catch (err) {
      setError(err.message || 'AI generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToBank = async (q, index) => {
    try {
      await api.questions.create({
        course_id: parseInt(selectedCourseId),
        topic: q.topic || topic,
        bloom_level: q.bloom_level,
        question_text: q.question_text,
        question_type: 'mcq',
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        marks: q.marks || 1,
        difficulty: q.difficulty || difficulty,
        is_ai_generated: true,
      });

      const updated = [...generatedQuestions];
      updated[index] = { ...updated[index], saved: true };
      setGeneratedQuestions(updated);
    } catch (err) {
      alert(err.message || 'Failed to save question');
    }
  };

  const handleOpenEdit = (q, index) => {
    setEditingIndex(index);
    setEditingQuestion({ ...q });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updated = [...generatedQuestions];
    updated[editingIndex] = editingQuestion;
    setGeneratedQuestions(updated);
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900 text-brandlime-400 text-xs font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          AI Cognitive Question Synthesis
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">AI Question Generation Studio</h1>
        <p className="text-xs text-slate-500">
          Synthesize assessment questions strictly aligned to Bloom's cognitive tiers with full explanations.
        </p>
      </div>

      {/* Generator Configuration Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Target Course *</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandlime-500/40"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Topic or Module *</label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Normalization BCNF"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandlime-500/40"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Bloom's Taxonomy Level *</label>
              <select
                value={bloomLevel}
                onChange={(e) => setBloomLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandlime-500/40"
              >
                {Object.keys(BLOOM_CONFIG).map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl} - {BLOOM_CONFIG[lvl].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none"
              >
                <option value="Easy">Easy (Recall/Basic)</option>
                <option value="Medium">Medium (Standard)</option>
                <option value="Hard">Hard (Complex/Rigorous)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Question Count:</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${count === n
                        ? 'bg-forest-900 text-brandlime-400'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedCourseId}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-brandlime-400 text-xs font-bold uppercase tracking-wider shadow-xs disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-brandlime-400" />
                  Generating Questions with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-brandlime-400" />
                  Generate Questions with AI
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-3 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 text-xs rounded-xl bg-brandlime-50 border border-brandlime-300 text-forest-900 flex items-center gap-2 font-semibold">
          <Check className="w-4 h-4 shrink-0 text-forest-900" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Generated Questions Review & Edit Area */}
      {generatedQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="bg-forest-900 px-4 py-3 rounded-t-2xl text-white flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4 text-brandlime-400" />
              AI Generated Questions for Review & Refinement
            </h3>
            <span className="text-[11px] text-brandlime-300">
              Review, adjust, and commit to Question Bank
            </span>
          </div>

          <div className="space-y-3">
            {generatedQuestions.map((q, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${q.saved ? 'border-brandlime-500 bg-brandlime-50/20' : 'border-slate-200'
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-slate-400">Q{idx + 1}</span>
                    <BloomBadge level={q.bloom_level} />
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {q.difficulty}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {q.marks || 1} Mark(s)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(q, idx)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleSaveToBank(q, idx)}
                      disabled={q.saved}
                      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${q.saved
                          ? 'bg-brandlime-200 text-forest-950 border border-brandlime-400 cursor-default'
                          : 'bg-forest-900 hover:bg-forest-800 text-brandlime-400'
                        }`}
                    >
                      {q.saved ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-forest-950" />
                          Saved to Bank
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-3.5 h-3.5 text-brandlime-400" />
                          Save to Question Bank
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-3">{q.question_text}</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {q.options?.map((opt, optIdx) => {
                    const isCorrect = opt === q.correct_answer;
                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-xl text-xs border flex items-start gap-2 ${isCorrect
                            ? 'bg-brandlime-50 border-brandlime-400 text-forest-950 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                      >
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${isCorrect ? 'bg-forest-900 text-brandlime-400 font-bold' : 'bg-slate-200 text-slate-600'
                          }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    <span className="font-bold text-forest-900 block mb-0.5">Bloom's Rationale & Explanation:</span>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingQuestion && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Review and Edit AI Question"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Question Text</label>
              <textarea
                rows={3}
                required
                value={editingQuestion.question_text}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandlime-500/40"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Multiple Choice Options</label>
              <div className="space-y-2">
                {editingQuestion.options?.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400 w-4">{String.fromCharCode(65 + i)}</span>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...editingQuestion.options];
                        newOpts[i] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Correct Answer (Exact Option Text)</label>
              <input
                type="text"
                required
                value={editingQuestion.correct_answer}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, correct_answer: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold text-forest-900 rounded-xl border border-brandlime-400 bg-brandlime-50/40"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Explanation & Bloom's Rationale</label>
              <textarea
                rows={2}
                value={editingQuestion.explanation}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-forest-900 hover:bg-forest-800 text-brandlime-400 uppercase tracking-wider"
              >
                Apply Edits
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
