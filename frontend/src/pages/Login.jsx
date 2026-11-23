import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, LogIn, AlertCircle, KeyRound, Mail, 
  Sparkles, CheckCircle2, Shield, Layers, BarChart2, Cpu 
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login({ email, password });
      if (user.role === 'faculty') {
        navigate('/faculty/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Error: Invalid username or inactive account.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-100">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
        {/* Left Column: Login Form */}
        <div className="md:col-span-6 p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Header / Academy Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-forest-900 text-brandlime-400 flex items-center justify-center font-black text-sm shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-forest-950 tracking-tight">Green Valley Academy</h2>
                <p className="text-[10px] text-slate-400 font-medium">Powered by BloomAnalytics Engine</p>
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back</h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sign in to manage courses, assessments, Bloom's objectives, and cognitive reports.
              </p>
            </div>

            {/* Quick Demo Fill Buttons */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                1-Click Quick Demo Sign In
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('faculty@demo.edu', 'Faculty@123')}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-forest-900 hover:bg-forest-800 text-brandlime-400 text-left transition-colors truncate"
                >
                  <span className="block font-bold">Faculty Demo</span>
                  <span className="text-[10px] text-slate-300 block truncate">faculty@demo.edu</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('student@demo.edu', 'Student@123')}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-brandlime-400 hover:bg-brandlime-300 text-forest-950 text-left transition-colors truncate"
                >
                  <span className="block font-bold">Student Demo</span>
                  <span className="text-[10px] text-forest-800 block truncate">student@demo.edu</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  USERNAME / EMAIL
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandlime-500/40 focus:border-brandlime-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  PASSWORD
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandlime-500/40 focus:border-brandlime-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-brandlime-400 hover:bg-brandlime-300 text-forest-950 font-bold text-xs tracking-wider uppercase shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Don't have an account?</span>
            <Link to="/register" className="text-forest-900 font-bold hover:underline">
              Create account
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Command Center (matching user screenshot) */}
        <div className="md:col-span-6 bg-forest-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden border-l border-forest-800">
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-800 text-brandlime-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brandlime-400" />
              Integrated Educational Web App
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              A complete daily command center for learning operations.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Curriculum objectives, assessment autograding, and cognitive radar analytics mapped to the six revised levels of Bloom's Taxonomy.
            </p>

            {/* 4 Feature Cards (exact layout from screenshot) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-forest-800/80 border border-forest-700/60 space-y-1">
                <div className="w-7 h-7 rounded-lg bg-brandlime-400/20 text-brandlime-400 flex items-center justify-center mb-2">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">360°</h3>
                <p className="text-[11px] text-slate-300">Student Lifecycle</p>
              </div>

              <div className="p-4 rounded-2xl bg-forest-800/80 border border-forest-700/60 space-y-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-400/20 text-emerald-400 flex items-center justify-center mb-2">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Fast</h3>
                <p className="text-[11px] text-slate-300">Bloom Assessments</p>
              </div>

              <div className="p-4 rounded-2xl bg-forest-800/80 border border-forest-700/60 space-y-1">
                <div className="w-7 h-7 rounded-lg bg-teal-400/20 text-teal-400 flex items-center justify-center mb-2">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Clean</h3>
                <p className="text-[11px] text-slate-300">Cognitive Ledgers</p>
              </div>

              <div className="p-4 rounded-2xl bg-forest-800/80 border border-forest-700/60 space-y-1">
                <div className="w-7 h-7 rounded-lg bg-brandlime-400/20 text-brandlime-400 flex items-center justify-center mb-2">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Live</h3>
                <p className="text-[11px] text-slate-300">AI Reports & Insights</p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-6">
            Admissions, courses, Bloom's evaluation, tests, and automated remediation.
          </p>
        </div>
      </div>
    </div>
  );
}
