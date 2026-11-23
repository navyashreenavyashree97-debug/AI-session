import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api';
import { 
  BookOpen, Target, FileText, ClipboardList, Download, 
  Clock, Award, ArrowRight, CheckCircle2, ChevronRight 
} from 'lucide-react';
import BloomBadge from '../../components/BloomBadge';

export default function StudentCourseView() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [objectives, setObjectives] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assessments'); // assessments, objectives, materials

  useEffect(() => {
    Promise.all([
      api.courses.getById(courseId),
      api.objectives.getByCourse(courseId),
      api.materials.getByCourse(courseId),
      api.assessments.getByCourse(courseId),
    ])
      .then(([cData, oData, mData, aData]) => {
        setCourse(cData.course);
        setObjectives(oData.objectives);
        setMaterials(mData.materials);
        setAssessments(aData.assessments);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return <div className="py-16 text-center text-slate-400 text-sm animate-pulse">Loading course classroom...</div>;
  }

  if (!course) {
    return <div className="py-16 text-center text-rose-500 text-sm">Course not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Course Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
            {course.code}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500">{course.department}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">{course.title}</h1>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          {course.description || 'Course classroom syllabus and materials.'}
        </p>
        <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-500 border-t border-slate-100">
          <span>Instructor: <strong className="text-slate-700">{course.faculty_name}</strong></span>
          <span>Semester: <strong className="text-slate-700">{course.semester}</strong></span>
          <span>Academic Year: <strong className="text-slate-700">{course.academic_year}</strong></span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab('assessments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'assessments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Assessments & Quizzes ({assessments.length})
        </button>

        <button
          onClick={() => setActiveTab('objectives')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'objectives'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          Bloom's Learning Objectives ({objectives.length})
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'materials'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Study Materials ({materials.length})
        </button>
      </div>

      {/* Tab 1: Assessments */}
      {activeTab === 'assessments' && (
        <div className="space-y-4">
          {assessments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessments.map((a) => (
                <div key={a.id} className="bloom-card p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Published Assessment
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Limit: {a.attempt_limit} Attempt(s)
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-800 mb-1">{a.title}</h3>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                      {a.description || 'Complete this assessment to evaluate your Bloom\'s cognitive mastery.'}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-600 py-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{a.duration_minutes} Minutes</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>{a.total_marks} Marks ({a.passing_marks}% Pass)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                    <Link
                      to={`/student/take-assessment/${a.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      Start Assessment <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
              <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No published assessments for this course yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Bloom's Learning Objectives */}
      {activeTab === 'objectives' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {objectives.map((obj) => (
              <div key={obj.id} className="bloom-card p-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {obj.topic}
                  </span>
                  <BloomBadge level={obj.bloom_level} size="sm" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">{obj.title}</h4>
                <p className="text-xs text-slate-500 mb-3">{obj.description}</p>
                {obj.expected_outcome && (
                  <div className="p-2.5 rounded-lg bg-slate-50 text-[11px] text-slate-600 border border-slate-100">
                    <span className="font-bold text-slate-700 block">Expected Outcome:</span>
                    {obj.expected_outcome}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Study Materials */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          {materials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {materials.map((mat) => (
                <div key={mat.id} className="bloom-card p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">
                      {mat.file_type} Document • {mat.topic}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">{mat.title}</h4>
                    <p className="text-xs text-slate-500 mb-3">{mat.description || 'Course reference notes.'}</p>
                  </div>
                  <a
                    href={mat.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File ({mat.file_size_kb} KB)
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No study materials uploaded for this course yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
