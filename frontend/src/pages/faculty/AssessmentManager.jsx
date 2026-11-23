import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { 
  ClipboardList, Plus, Clock, Award, Calendar, 
  RotateCcw, Trash2, Globe, EyeOff, CheckCircle2, 
  AlertCircle, BookOpen, Layers 
} from 'lucide-react';
import BloomBadge from '../../components/BloomBadge';
import Modal from '../../components/Modal';

export default function AssessmentManager() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assessments, setAssessments] = useState([]);
  const [questionBank, setQuestionBank] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passingMarks, setPassingMarks] = useState(50);
  const [attemptLimit, setAttemptLimit] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.courses.getAll().then((data) => {
      setCourses(data.courses);
      if (data.courses.length > 0) {
        setSelectedCourseId(data.courses[0].id);
        loadAssessments(data.courses[0].id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const loadAssessments = (courseId) => {
    setLoading(true);
    Promise.all([
      api.assessments.getByCourse(courseId),
      api.questions.getByCourse(courseId),
    ])
      .then(([assData, qData]) => {
        setAssessments(assData.assessments);
        setQuestionBank(qData.questions);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCourseChange = (e) => {
    const id = parseInt(e.target.value);
    setSelectedCourseId(id);
    loadAssessments(id);
  };

  const handleOpenCreate = () => {
    setTitle('');
    setDescription('');
    setDurationMinutes(30);
    setPassingMarks(50);
    setAttemptLimit(1);
    setIsPublished(false);
    setSelectedQuestionIds(questionBank.map((q) => q.id));
    setError('');
    setIsModalOpen(true);
  };

  const toggleQuestionSelection = (qId) => {
    if (selectedQuestionIds.includes(qId)) {
      setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== qId));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, qId]);
    }
  };

  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    if (selectedQuestionIds.length === 0) {
      setError('Please select at least one question from the Question Bank.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await api.assessments.create({
        course_id: selectedCourseId,
        title,
        description,
        duration_minutes: parseInt(durationMinutes),
        passing_marks: parseInt(passingMarks),
        attempt_limit: parseInt(attemptLimit),
        is_published: isPublished,
        question_ids: selectedQuestionIds,
      });

      setIsModalOpen(false);
      loadAssessments(selectedCourseId);
    } catch (err) {
      setError(err.message || 'Failed to create assessment');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (assessment) => {
    try {
      await api.assessments.togglePublish(assessment.id);
      loadAssessments(selectedCourseId);
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete assessment "${title}"?`)) {
      try {
        await api.assessments.delete(id);
        loadAssessments(selectedCourseId);
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
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Assessments & Examination Publishing</h1>
          <p className="text-xs text-slate-500">Configure time limits, passing cutoffs, and publish Bloom's mapped tests</p>
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
            disabled={!selectedCourseId || questionBank.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-forest-900 hover:bg-forest-800 text-brandlime-400 shadow-xs disabled:opacity-50"
          >
            <Plus className="w-4 h-4 text-brandlime-400" />
            Create Assessment
          </button>
        </div>
      </div>

      {/* Dark Forest Green Header Table (matching user screenshot) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="bg-forest-900 px-4 py-3 text-white flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider">
            All Course Assessments & Examinations
          </h3>
          <span className="text-[11px] text-brandlime-300 font-semibold">
            {assessments.length} Assessments Registered
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs animate-pulse">Loading assessments...</div>
        ) : assessments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest-850 text-slate-200 border-b border-forest-800">
                <tr>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">ASSESSMENT TITLE</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">DURATION</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">MARKS & PASS %</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">ATTEMPTS LIMIT</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">STATUS</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 max-w-sm">
                      <p className="font-bold text-slate-900">{a.title}</p>
                      <p className="text-[11px] text-slate-500">{a.question_count} Questions • {a.attempt_count} Student Attempts</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {a.duration_minutes} Mins
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">
                      {a.total_marks} Marks ({a.passing_marks}% Passing)
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      Max: {a.attempt_limit} Attempt(s)
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleTogglePublish(a)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                          a.is_published
                            ? 'bg-brandlime-100 text-forest-950 border-brandlime-400 hover:bg-brandlime-200'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {a.is_published ? (
                          <>
                            <Globe className="w-3 h-3 text-forest-950" />
                            Published (Live)
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-slate-400" />
                            Draft (Hidden)
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(a.id, a.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Assessment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">No assessments created for this course yet.</div>
        )}

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
          <span>{assessments.length} assessments • Page 1 of 1</span>
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
        title="Create & Configure Assessment"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveAssessment} className="space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Assessment Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mid-Term Bloom's Comprehensive Evaluation"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Description / Instructions</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions for students regarding time limit and topics..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Duration (Minutes)</label>
              <input
                type="number"
                min={5}
                max={180}
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Passing Score (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={passingMarks}
                onChange={(e) => setPassingMarks(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Attempt Limit</label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={attemptLimit}
                onChange={(e) => setAttemptLimit(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
              />
            </div>
          </div>

          {/* Select Questions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Select Questions ({selectedQuestionIds.length} of {questionBank.length} selected)
              </label>
              <button
                type="button"
                onClick={() =>
                  setSelectedQuestionIds(
                    selectedQuestionIds.length === questionBank.length
                      ? []
                      : questionBank.map((q) => q.id)
                  )
                }
                className="text-[11px] font-bold text-forest-900 hover:underline"
              >
                {selectedQuestionIds.length === questionBank.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto custom-scrollbar border border-slate-200 rounded-xl divide-y divide-slate-100 p-2 space-y-1">
              {questionBank.map((q) => {
                const isChecked = selectedQuestionIds.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleQuestionSelection(q.id)}
                    className={`p-2.5 rounded-lg text-xs cursor-pointer flex items-start gap-2.5 transition-colors ${
                      isChecked ? 'bg-brandlime-50/70 border border-brandlime-400' : 'hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-forest-900 focus:ring-brandlime-400"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <BloomBadge level={q.bloom_level} size="sm" />
                        <span className="text-[10px] text-slate-400 font-mono">({q.marks} Marks)</span>
                        <span className="text-[10px] text-forest-900 font-bold">{q.topic}</span>
                      </div>
                      <p className="text-slate-800 line-clamp-1">{q.question_text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="publishNow"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="rounded text-forest-900 focus:ring-brandlime-400"
            />
            <label htmlFor="publishNow" className="text-xs font-semibold text-slate-700">
              Publish immediately (visible to all enrolled students)
            </label>
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
              {saving ? 'Creating...' : 'Confirm & Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
