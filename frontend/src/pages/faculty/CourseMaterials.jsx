import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { FileText, Upload, Trash2, Download, AlertCircle, Plus, File, Folder } from 'lucide-react';
import Modal from '../../components/Modal';

export default function CourseMaterials() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Upload Form
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('General');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.courses.getAll()
      .then((data) => {
        setCourses(data.courses);
        if (data.courses.length > 0) {
          setSelectedCourseId(data.courses[0].id);
          loadMaterials(data.courses[0].id);
        } else {
          setLoading(false);
        }
      })
      .catch(console.error);
  }, []);

  const loadMaterials = (courseId) => {
    setLoading(true);
    api.materials.getByCourse(courseId)
      .then((data) => setMaterials(data.materials))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCourseChange = (e) => {
    const id = parseInt(e.target.value);
    setSelectedCourseId(id);
    loadMaterials(id);
  };

  const handleOpenUpload = () => {
    setTitle('');
    setTopic('General');
    setDescription('');
    setSelectedFile(null);
    setError('');
    setIsModalOpen(true);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('course_id', selectedCourseId);
      formData.append('title', title);
      formData.append('topic', topic);
      formData.append('description', description);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await api.materials.upload(formData);
      setIsModalOpen(false);
      loadMaterials(selectedCourseId);
    } catch (err) {
      setError(err.message || 'Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete material "${title}"?`)) {
      try {
        await api.materials.delete(id);
        loadMaterials(selectedCourseId);
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
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Course Documents & Study Materials</h1>
          <p className="text-xs text-slate-500">Upload lecture presentations, problem sets, and reading materials</p>
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
            onClick={handleOpenUpload}
            disabled={!selectedCourseId}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-forest-900 hover:bg-forest-800 text-brandlime-400 shadow-xs disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-brandlime-400" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Dark Forest Green Header Table (matching user screenshot) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="bg-forest-900 px-4 py-3 text-white flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Student Documents & Material Repository
          </h3>
          <span className="text-[11px] text-brandlime-300 font-semibold">
            {materials.length} Documents Available
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs animate-pulse">Loading documents...</div>
        ) : materials.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest-850 text-slate-200 border-b border-forest-800">
                <tr>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">DOCUMENT TITLE</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">TOPIC</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">FILE NAME</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">SIZE & FORMAT</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">UPLOAD DATE</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{mat.title}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-forest-50 border border-forest-200 text-forest-900 font-semibold">
                        {mat.topic}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{mat.file_name}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="font-bold uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 mr-1.5">
                        {mat.file_type}
                      </span>
                      {mat.file_size_kb} KB
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {mat.uploaded_at ? new Date(mat.uploaded_at).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={mat.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-forest-900 hover:text-brandlime-600"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </a>
                        <button
                          onClick={() => handleDelete(mat.id, mat.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
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
          <div className="py-12 text-center text-slate-400 text-xs">No documents uploaded yet.</div>
        )}

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
          <span>{materials.length} records • Page 1 of 1</span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200">Prev</span>
            <span className="font-bold text-forest-900">1</span>
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200">Next</span>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Course Study Material"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Material Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit 2: Normalization & Functional Dependencies Notes"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandlime-500/40"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Topic / Module</label>
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
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Description / Summary</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of contents covered in this material..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandlime-500/40"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Select Document (PDF, Word, PPT, TXT)</label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-forest-50 file:text-forest-900 hover:file:bg-forest-100"
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
              disabled={uploading}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-forest-900 hover:bg-forest-800 text-brandlime-400 uppercase tracking-wider shadow-xs"
            >
              {uploading ? 'Uploading...' : 'Confirm Upload'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
