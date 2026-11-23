import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, Brain, Target, BarChart2, Sparkles, 
  ArrowRight, CheckCircle2, Shield, Layers, BookOpen 
} from 'lucide-react';
import BloomBadge, { BLOOM_CONFIG } from '../components/BloomBadge';

export default function Home() {
  const { user, isFaculty } = useAuth();

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Revised Bloom's Taxonomy Pedagogical Framework
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          AI-Powered Student Learning Ability Analysis &{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Personalized Recommendations
          </span>
        </h1>

        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Evaluate deeper cognitive mastery beyond simple scores. Automatically map curriculum, generate questions with AI across Bloom's 6 levels, diagnose individual cognitive bottlenecks, and deliver targeted remediation.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {user ? (
            <Link
              to={isFaculty ? "/faculty/dashboard" : "/student/dashboard"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all"
              >
                Launch Demo Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 shadow-xs transition-all"
              >
                Create New Account
              </Link>
            </>
          )}
        </div>
      </section>

      {/* The 6 Revised Bloom's Taxonomy Levels Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            The Six Revised Levels of Bloom's Taxonomy
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Every learning objective, assessment question, and student attempt in this system is strictly aligned to these cognitive dimensions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(BLOOM_CONFIG).map(([levelKey, cfg], index) => (
            <div 
              key={levelKey} 
              className="bloom-card p-6 border-t-4"
              style={{ borderTopColor: cfg.color }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">Level 0{index + 1}</span>
                <BloomBadge level={levelKey} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{cfg.label}</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">{cfg.description}</p>
              <div className="text-xs text-slate-400 font-medium">
                Target Cognitive Verbs: <span className="text-slate-600">Recall, Explain, Solve, Inspect, Judge, Design</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto px-4 bg-slate-100/60 rounded-3xl p-8 sm:p-12 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
              Comprehensive Tools for Faculty & Interactive Growth for Students
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-800">AI Assessment Generator</h4>
                  <p className="text-sm text-slate-500">Draft questions mapped to specific Bloom's levels using Gemini with faculty review.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-800">Longitudinal Cognitive Radar</h4>
                  <p className="text-sm text-slate-500">Multidimensional radar charts revealing cognitive strengths and weaknesses.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-800">Smart Remediation Engine</h4>
                  <p className="text-sm text-slate-500">Actionable personalized study pathways tailored to individual cognitive gaps.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-4">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              Quick Academic Project Demo
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use pre-seeded accounts to immediately evaluate the system:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p className="font-bold text-amber-900">Faculty Demo</p>
                <p className="text-amber-800 font-mono mt-1">faculty@demo.edu</p>
                <p className="text-slate-500 mt-0.5">Password: Faculty@123</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="font-bold text-emerald-900">Student Demo</p>
                <p className="text-emerald-800 font-mono mt-1">student@demo.edu</p>
                <p className="text-slate-500 mt-0.5">Password: Student@123</p>
              </div>
            </div>
            <Link
              to="/login"
              className="block w-full py-2.5 text-center text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              Sign In to Demo Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
