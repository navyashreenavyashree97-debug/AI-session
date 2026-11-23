import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { Compass, BookOpen, Check, Building, Calendar, Clock, ArrowRight } from 'lucide-react';

export default function BrowseCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
    setLoading(true);
    api.courses.browse()
      .then((data) => setCourses(data.courses))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    try {
      await api.courses.enroll(courseId);
      loadCourses();
    } catch (err) {
      alert(err.message || 'Failed to enroll');
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Course Catalog</h1>
        <p className="text-xs text-slate-500">
          Browse academic courses and enroll to access materials, Bloom's objectives, and assessments
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm animate-pulse">Loading catalog...</div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div key={c.id} className="bloom-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {c.code}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {c.enrolled_count} Students Enrolled
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-800 mb-1">{c.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {c.description || 'University course syllabus and materials.'}
                </p>

                <div className="space-y-1.5 py-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.semester} • {c.academic_year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.duration} • Instructor: {c.faculty_name}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {c.is_enrolled ? (
                  <Link
                    to={`/student/course/${c.id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Enrolled (Go to Course)
                  </Link>
                ) : (
                  <button
                    onClick={() => handleEnroll(c.id)}
                    disabled={enrollingId === c.id}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-50"
                  >
                    {enrollingId === c.id ? 'Enrolling...' : 'Enroll in Course'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <Compass className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Courses in Catalog</h3>
          <p className="text-xs text-slate-500">Courses published by faculty will appear here.</p>
        </div>
      )}
    </div>
  );
}
