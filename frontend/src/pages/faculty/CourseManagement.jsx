import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { 
  BookOpen, Plus, Edit2, Trash2, Users, Calendar, 
  Clock, Building, CheckCircle2, AlertCircle 
} from 'lucide-react';
import Modal from '../../components/Modal';

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState('Fall 2026');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [duration, setDuration] = useState('16 Weeks');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
    setLoading(true);
    api.courses.getAll()
      .then((data) => setCourses(data.courses))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleOpenCreateModal = () => {
    setEditingCourse(null);
    setTitle('');
    setCode('');
    setDescription('');
    setDepartment('Computer Science & Engineering');
    setSemester('Fall 2026');
    setAcademicYear('2026-2027');
    setDuration('16 Weeks');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setTitle(course.title);
    setCode(course.code);
    setDescription(course.description || '');
    setDepartment(course.department);
    setSemester(course.semester);
    setAcademicYear(course.academic_year);
    setDuration(course.duration);
    setError('');
    setIsModalOpen(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        title,
        code,
        description,
        department,
        semester,
        academic_year: academicYear,
        duration,
      };

      if (editingCourse) {
        await api.courses.update(editingCourse.id, payload);
      } else {
        await api.courses.create(payload);
      }
      setIsModalOpen(false);
      loadCourses();
    } catch (err) {
      setError(err.message || 'Failed to save course.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete course "${title}"? All objectives, questions, materials, and assessments will be permanently removed.`)) {
      try {
        await api.courses.delete(id);
        loadCourses();
      } catch (err) {
        alert(err.message || 'Failed to delete course');
      }
    }
  };

  const handleViewStudents = async (course) => {
    setSelectedCourseForStudents(course);
    try {
      const data = await api.courses.getStudents(course.id);
      setEnrolledStudents(data.students);
      setIsStudentsModalOpen(true);
    } catch (err) {
      alert(err.message || 'Failed to fetch enrolled students');
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Courses & Classes Management</h1>
          <p className="text-xs text-slate-500">Configure curriculum modules, academic years, and view student enrollment</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-brandlime-400 text-xs font-bold shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-brandlime-400" />
          Create New Course
        </button>
      </div>

      {/* Courses Dark Header Table (matching user screenshot) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="bg-forest-900 px-4 py-3 text-white flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider">
            All Registered Courses & Class Directory
          </h3>
          <span className="text-[11px] text-brandlime-300 font-semibold">
            {courses.length} Active Courses
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs animate-pulse">Loading course database...</div>
        ) : courses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest-850 text-slate-200 border-b border-forest-800">
                <tr>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">COURSE CODE</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">TITLE & SYLLABUS</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">DEPARTMENT</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">TERM & DURATION</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider">ENROLLMENT</th>
                  <th className="py-2.5 px-4 font-semibold uppercase text-[10px] tracking-wider text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-forest-900">
                      <span className="px-2 py-0.5 rounded bg-forest-50 border border-forest-200 text-forest-950">
                        {course.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-slate-900">{course.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{course.description || 'No description'}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{course.department}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {course.semester} • {course.duration}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleViewStudents(course)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-brandlime-100 hover:bg-brandlime-200 text-forest-950 border border-brandlime-300 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        {course.enrolled_count} Students
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(course)}
                          className="p-1.5 text-slate-500 hover:text-forest-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Course"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id, course.title)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Course"
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
          <div className="py-12 text-center text-slate-400 text-xs">No courses registered yet.</div>
        )}

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
          <span>{courses.length} courses • Page 1 of 1</span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200">Prev</span>
            <span className="font-bold text-forest-900">1</span>
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200">Next</span>
          </div>
        </div>
      </div>

      {/* Create / Edit Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? 'Edit Course Details' : 'Create New Academic Course'}
      >
        <form onSubmit={handleSaveCourse} className="space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Course Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Database Management Systems"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandlime-500/40"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Course Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS301"
                className="w-full px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandlime-500/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Course Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline syllabus, key topics, and prerequisites..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandlime-500/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Department</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Course Duration</label>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 16 Weeks"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Semester</label>
              <input
                type="text"
                required
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g. Fall 2026"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Academic Year</label>
              <input
                type="text"
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g. 2026-2027"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
              />
            </div>
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
              {saving ? 'Saving...' : editingCourse ? 'Save Changes' : 'Confirm & Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Enrolled Students Modal */}
      <Modal
        isOpen={isStudentsModalOpen}
        onClose={() => setIsStudentsModalOpen(false)}
        title={`Enrolled Students - ${selectedCourseForStudents?.title || ''}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Total Enrolled: <span className="font-bold text-slate-800">{enrolledStudents.length}</span> students
          </p>

          {enrolledStudents.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {enrolledStudents.map((st) => (
                <div key={st.id} className="p-3 bg-white flex items-center justify-between text-xs hover:bg-slate-50">
                  <div>
                    <p className="font-bold text-slate-800">{st.name}</p>
                    <p className="text-slate-500">{st.email} • Roll: {st.student_id_number || 'N/A'}</p>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Enrolled: {st.enrolled_at ? new Date(st.enrolled_at).toLocaleDateString() : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-xs text-slate-400">No students enrolled yet.</p>
          )}

          <div className="text-right pt-2">
            <button
              onClick={() => setIsStudentsModalOpen(false)}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
