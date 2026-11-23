import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { HelpCircle, Filter, Trash2, Edit2, Plus, Sparkles, Check } from 'lucide-react';
import BloomBadge, { BLOOM_CONFIG } from '../../components/BloomBadge';
import Modal from '../../components/Modal';

export default function QuestionBank() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [bloomFilter, setBloomFilter] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit / Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [topic, setTopic] = useState('');
  const [bloomLevel, setBloomLevel] = useState('UNDERSTAND');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [marks, setMarks] = useState(1);
  const [difficulty, setDifficulty] = useState('Medium');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.courses.getAll().then((data) => {
      setCourses(data.courses);
      if (data.courses.length > 0) {
        setSelectedCourseId(data.courses[0].id);
        loadQuestions(data.courses[0].id, '');
      } else {
        setLoading(false);
      }
    });
  }, []);

  const loadQuestions = (courseId, filter) => {
    setLoading(true);
    api.questions.getByCourse(courseId, filter)
      .then((data) => setQuestions(data.questions))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCourseChange = (e) => {
    const id = parseInt(e.target.value);
    setSelectedCourseId(id);
    loadQuestions(id, bloomFilter);
  };

  const handleBloomFilterChange = (lvl) => {
    const newFilter = bloomFilter === lvl ? '' : lvl;
    setBloomFilter(newFilter);
    loadQuestions(selectedCourseId, newFilter);
  };

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setTopic('General Concepts');
    setBloomLevel('UNDERSTAND');
    setQuestionText('');
    setOptions(['Option A', 'Option B', 'Option C', 'Option D']);
    setCorrectAnswer('Option A');
    setExplanation('');
    setMarks(1);
    setDifficulty('Medium');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setTopic(q.topic);
    setBloomLevel(q.bloom_level);
    setQuestionText(q.question_text);
    setOptions(q.options || ['', '', '', '']);
    setCorrectAnswer(q.correct_answer);
    setExplanation(q.explanation || '');
    setMarks(q.marks || 1);
    setDifficulty(q.difficulty || 'Medium');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        course_id: selectedCourseId,
        topic,
        bloom_level: bloomLevel,
        question_text: questionText,
        question_type: 'mcq',
        options,
        correct_answer: correctAnswer,
        explanation,
        marks: parseInt(marks),
        difficulty,
      };

      if (editingQuestion) {
        await api.questions.update(editingQuestion.id, payload);
      } else {
        await api.questions.create(payload);
      }
      setIsModalOpen(false);
      loadQuestions(selectedCourseId, bloomFilter);
    } catch (err) {
      setError(err.message || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this question from question bank?')) {
      try {
        await api.questions.delete(id);
        loadQuestions(selectedCourseId, bloomFilter);
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Question Bank Repository</h1>
          <p className="text-xs text-slate-500">Repository of assessment items mapped to Bloom's Taxonomy</p>
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

          <button
            onClick={handleOpenCreate}
            disabled={!selectedCourseId}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-forest-900 hover:bg-forest-800 text-brandlime-400 shadow-xs disabled:opacity-50"
          >
            <Plus className="w-4 h-4 text-brandlime-400" />
            Add Manual Question
          </button>
        </div>
      </div>

      {/* Bloom's Level Filter Pills */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Filter by Level:
        </span>
        <button
          onClick={() => handleBloomFilterChange('')}
          className={`px-3 py-1 text-xs font-bold rounded-xl border transition-all ${
            bloomFilter === ''
              ? 'bg-forest-900 text-brandlime-400 border-forest-950'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          All Levels ({questions.length})
        </button>
        {Object.keys(BLOOM_CONFIG).map((lvl) => (
          <button
            key={lvl}
            onClick={() => handleBloomFilterChange(lvl)}
            className={`transition-all ${bloomFilter === lvl ? 'scale-105 ring-2 ring-forest-900/40' : 'opacity-85'}`}
          >
            <BloomBadge level={lvl} size="sm" />
          </button>
        ))}
      </div>

      {/* Dark Forest Green Header Table (matching user screenshot) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="bg-forest-900 px-4 py-3 text-white flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Question Bank Master Catalog
          </h3>
          <span className="text-[11px] text-brandlime-300 font-semibold">
            {questions.length} Items Indexed
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs animate-pulse">Loading question bank...</div>
        ) : questions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest-850 text-slate-200 border-b border-forest-800">
                <tr>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">#</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">BLOOM LEVEL</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">TOPIC</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">QUESTION STEM</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">DIFFICULTY & MARKS</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questions.map((q, idx) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <BloomBadge level={q.bloom_level} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {q.topic}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <p className="font-bold text-slate-900 line-clamp-1">{q.question_text}</p>
                      <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        Answer: {q.correct_answer}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="font-bold text-forest-900">{q.difficulty}</span> • {q.marks} Mark(s)
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(q)}
                          className="p-1.5 text-slate-500 hover:text-forest-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">No questions found in this category.</div>
        )}

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
          <span>{questions.length} questions • Page 1 of 1</span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200">Prev</span>
            <span className="font-bold text-forest-900">1</span>
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200">Next</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Add Question to Bank'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Topic *</label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Bloom's Level *</label>
              <select
                value={bloomLevel}
                onChange={(e) => setBloomLevel(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300"
              >
                {Object.keys(BLOOM_CONFIG).map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Question Text *</label>
            <textarea
              rows={2}
              required
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Options (4 choices)</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400 w-4">{String.fromCharCode(65 + i)}</span>
                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[i] = e.target.value;
                      setOptions(newOpts);
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Correct Answer *</label>
              <input
                type="text"
                required
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Exact text of correct option"
                className="w-full px-3 py-1.5 text-xs font-bold text-forest-900 rounded-xl border border-brandlime-400 bg-brandlime-50/40"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Marks Awarded</label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Explanation</label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-forest-900 hover:bg-forest-800 text-brandlime-400 uppercase tracking-wider shadow-xs"
            >
              {saving ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
