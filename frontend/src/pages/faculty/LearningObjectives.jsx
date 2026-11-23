import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Target, Plus, Edit2, Trash2, AlertCircle, BookOpen, Layers } from 'lucide-react';
import BloomBadge, { BLOOM_CONFIG } from '../../components/BloomBadge';
import Modal from '../../components/Modal';

export default function LearningObjectives() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState(null);

  // Form fields
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bloomLevel, setBloomLevel] = useState('UNDERSTAND');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.courses.getAll()
      .then((data) => {
        setCourses(data.courses);
        if (data.courses.length > 0) {
          setSelectedCourseId(data.courses[0].id);
          loadObjectives(data.courses[0].id);
        } else {
          setLoading(false);
        }
      })
      .catch(console.error);
  }, []);

  const loadObjectives = (courseId) => {
    setLoading(true);
    api.objectives.getByCourse(courseId)
      .then((data) => setObjectives(data.objectives))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCourseChange = (e) => {
    const id = parseInt(e.target.value);
    setSelectedCourseId(id);
    loadObjectives(id);
  };

  const handleOpenCreate = () => {
    setEditingObjective(null);
    setTopic('');
    setTitle('');
    setDescription('');
    setBloomLevel('UNDERSTAND');
    setExpectedOutcome('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (obj) => {
    setEditingObjective(obj);
    setTopic(obj.topic);
    setTitle(obj.title);
    setDescription(obj.description || '');
    setBloomLevel(obj.bloom_level);
    setExpectedOutcome(obj.expected_outcome || '');
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
        title,
        description,
        bloom_level: bloomLevel,
        expected_outcome: expectedOutcome,
      };

      if (editingObjective) {
        await api.objectives.update(editingObjective.id, payload);
      } else {
        await api.objectives.create(payload);
      }
      setIsModalOpen(false);
      loadObjectives(selectedCourseId);
    } catch (err) {
      setError(err.message || 'Failed to save learning objective.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete learning objective "${title}"?`)) {
      try {
        await api.objectives.delete(id);
        loadObjectives(selectedCourseId);
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
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Bloom's Taxonomy Learning Objectives
          </h1>
          <p className="text-xs text-slate-500">
            Curriculum learning outcomes mapped to Remember, Understand, Apply, Analyze, Evaluate, and Create
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

          <button
            onClick={handleOpenCreate}
            disabled={!selectedCourseId}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-forest-900 hover:bg-forest-800 text-brandlime-400 shadow-xs disabled:opacity-50"
          >
            <Plus className="w-4 h-4 text-brandlime-400" />
            Add Objective
          </button>
        </div>
      </div>

      {/* Bloom's Level Summary Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Level Distribution:</span>
        <div className="flex flex-wrap gap-2">
          {Object.keys(BLOOM_CONFIG).map((lvl) => {
            const count = objectives.filter((o) => o.bloom_level === lvl).length;
            return (
              <div key={lvl} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <BloomBadge level={lvl} size="sm" />
                <span className="font-bold text-slate-700">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dark Forest Green Table (matching user screenshot) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="bg-forest-900 px-4 py-3 text-white flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Curriculum Objectives & Cognitive Taxonomy Mapping
          </h3>
          <span className="text-[11px] text-brandlime-300 font-semibold">
            {objectives.length} Objectives Defined
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs animate-pulse">Loading objectives...</div>
        ) : objectives.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest-850 text-slate-200 border-b border-forest-800">
                <tr>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">TOPIC / MODULE</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">BLOOM'S TIER</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">OBJECTIVE TITLE</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">EXPECTED LEARNING OUTCOME</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">QUESTIONS</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {objectives.map((obj) => (
                  <tr key={obj.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                        {obj.topic}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <BloomBadge level={obj.bloom_level} size="sm" />
                    </td>
                    <td className="py-3 px-4 max-w-xs font-semibold text-slate-800">
                      {obj.title}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm italic">
                      "{obj.expected_outcome || 'N/A'}"
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {obj.question_count} items
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(obj)}
                          className="p-1.5 text-slate-500 hover:text-forest-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Objective"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(obj.id, obj.title)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Objective"
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
          <div className="py-12 text-center text-slate-400 text-xs">No learning objectives defined yet.</div>
        )}

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
          <span>{objectives.length} objectives • Page 1 of 1</span>
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
        title={editingObjective ? 'Edit Learning Objective' : 'Define Bloom\'s Learning Objective'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Topic / Unit *</label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Normalization or SQL Queries"
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
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Objective Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Explain 1NF, 2NF, 3NF and BCNF"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandlime-500/40"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Objective Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed explanation of what the student will study..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandlime-500/40"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Expected Learning Outcome</label>
            <textarea
              rows={2}
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              placeholder="e.g. Students will be able to eliminate insertion and deletion anomalies by decomposing unnormalized relations."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandlime-500/40"
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
              {saving ? 'Saving...' : editingObjective ? 'Save Changes' : 'Confirm & Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
