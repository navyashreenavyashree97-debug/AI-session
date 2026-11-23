import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import CourseManagement from './pages/faculty/CourseManagement';
import LearningObjectives from './pages/faculty/LearningObjectives';
import CourseMaterials from './pages/faculty/CourseMaterials';
import AIQuestionGenerator from './pages/faculty/AIQuestionGenerator';
import QuestionBank from './pages/faculty/QuestionBank';
import AssessmentManager from './pages/faculty/AssessmentManager';
import FacultyAnalytics from './pages/faculty/FacultyAnalytics';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import BrowseCourses from './pages/student/BrowseCourses';
import StudentCourseView from './pages/student/StudentCourseView';
import AssessmentTaker from './pages/student/AssessmentTaker';
import AssessmentResult from './pages/student/AssessmentResult';
import StudentAnalytics from './pages/student/StudentAnalytics';

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm animate-pulse">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard'} replace />;
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full custom-scrollbar">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Faculty Portal */}
            <Route
              path="/faculty/dashboard"
              element={
                <ProtectedRoute requiredRole="faculty">
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/courses"
              element={
                <ProtectedRoute requiredRole="faculty">
                  <CourseManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/objectives"
              element={
                <ProtectedRoute requiredRole="faculty">
                  <LearningObjectives />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/materials"
              element={
                <ProtectedRoute requiredRole="faculty">
                  <CourseMaterials />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/ai-generator"
              element={
                <ProtectedRoute requiredRole="faculty">
                  <AIQuestionGenerator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/question-bank"
              element={
                <ProtectedRoute requiredRole="faculty">
                  <QuestionBank />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/assessments"
              element={
                <ProtectedRoute requiredRole="faculty">
                  <AssessmentManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/analytics"
              element={
                <ProtectedRoute requiredRole="faculty">
                  <FacultyAnalytics />
                </ProtectedRoute>
              }
            />

            {/* Student Portal */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/browse"
              element={
                <ProtectedRoute requiredRole="student">
                  <BrowseCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/my-courses"
              element={
                <ProtectedRoute requiredRole="student">
                  <BrowseCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/course/:courseId"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentCourseView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assessments"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/take-assessment/:assessmentId"
              element={
                <ProtectedRoute requiredRole="student">
                  <AssessmentTaker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assessment-result/:attemptId"
              element={
                <ProtectedRoute requiredRole="student">
                  <AssessmentResult />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/analytics"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/recommendations"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentAnalytics />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
