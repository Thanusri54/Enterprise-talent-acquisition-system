import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  GitMerge, 
  Users, 
  Star,
  Layers,
  ArrowUpRight
} from 'lucide-react';

const DEMO_ROLES = [
  {
    role: 'Recruiter',
    email: 'recruiter@company.com',
    desc: 'Pipeline manager & sourcing',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  },
  {
    role: 'HR Manager',
    email: 'hr@company.com',
    desc: 'Strategic hiring & decisions',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  },
  {
    role: 'Interviewer',
    email: 'interviewer@company.com',
    desc: 'Competency scorecards',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  },
  {
    role: 'Candidate',
    email: 'candidate.portal@test.com',
    desc: 'Career portal & applications',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
  },
  {
    role: 'Admin',
    email: 'admin@company.com',
    desc: 'System governance & users',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  }
];

const Login = () => {
  const [email, setEmail] = useState('recruiter@company.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('Recruiter');
  const { login, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = await login(email, password);
    if (res.success) {
      toast.success('Authenticated successfully. Welcome to TalentFlow!');
      if (res.user && res.user.role === 'CANDIDATE') {
        navigate('/candidate/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setErrorMsg(res.error || 'Login failed. Please check your credentials.');
      toast.error(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleSelectDemoRole = (demo) => {
    setActiveTab(demo.role);
    setEmail(demo.email);
    setPassword('password123');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row text-slate-100">
      {/* Left Pane - Brand Showcase & Value Proposition */}
      <div className="lg:w-7/12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-100 tracking-tight flex items-center space-x-2">
                <span>TalentFlow</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold tracking-wider uppercase">
                  Enterprise
                </span>
              </div>
              <div className="text-xs text-slate-400">Enterprise Talent Acquisition Platform</div>
            </div>
          </div>
        </div>

        {/* Center Hero Statement */}
        <div className="my-12 lg:my-0 relative z-10 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs mb-6">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium">Intelligent Pipeline Orchestration</span>
          </div>

          <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
            Build exceptional teams, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">faster and smarter.</span>
          </h1>

          <p className="mt-4 text-sm lg:text-base text-slate-300 leading-relaxed">
            Manage candidates, collaborative interview scorecards, pipeline stages, and final hiring decisions from one intelligent enterprise workspace.
          </p>

          {/* Enterprise Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex items-center space-x-2.5 text-xs font-bold text-slate-200">
                <GitMerge className="w-4 h-4 text-cyan-400" />
                <span>Orchestrated Pipelines</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                7 synchronized stages from Applied to Selected with real-time stage sync.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex items-center space-x-2.5 text-xs font-bold text-slate-200">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Structured Evaluations</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                5-dimension competency ratings, strengths analysis, and hiring consensus.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex items-center space-x-2.5 text-xs font-bold text-slate-200">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Role-Based Governance</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Custom workspaces tailored for HR, Recruiters, Interviewers & Candidates.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex items-center space-x-2.5 text-xs font-bold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Enterprise SOA Security</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                JWT stateless authentication, Eureka discovery & API Gateway routing.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof / Metrics */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex flex-wrap gap-8 items-center text-xs text-slate-400">
          <div>
            <div className="text-lg font-bold text-slate-100">99.8%</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Service Mesh Uptime</div>
          </div>
          <div className="w-px h-8 bg-slate-800"></div>
          <div>
            <div className="text-lg font-bold text-slate-100">7 Nodes</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Microservice SOA</div>
          </div>
          <div className="w-px h-8 bg-slate-800"></div>
          <div>
            <div className="text-lg font-bold text-slate-100">100%</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Audit Traceability</div>
          </div>
        </div>
      </div>

      {/* Right Pane - Authentication Card */}
      <div className="lg:w-5/12 bg-slate-950 p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center relative">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Sign in to your workspace</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select a pre-configured enterprise role or sign in with your credentials.
            </p>
          </div>

          {/* Quick Role Selector Tabs */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Enterprise Role Profiles (1-Click Fill)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              {DEMO_ROLES.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleSelectDemoRole(demo)}
                  className={`py-1.5 px-2 rounded-lg text-left transition-all ${
                    activeTab === demo.role
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="text-xs font-bold leading-tight truncate">{demo.role}</div>
                  <div className="text-[9px] text-slate-400 truncate">{demo.email.split('@')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); toast.info('Default password for all seeded accounts is "password123".'); }} className="text-[11px] text-cyan-400 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-800 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Remember this workstation</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : `Sign In as ${activeTab}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* New Candidate Registration Link */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-400">Looking for career opportunities?</span>
            <Link
              to="/register"
              className="text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center space-x-1"
            >
              <span>Register as Candidate</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="text-center text-[11px] text-slate-600">
            TalentFlow Enterprise Platform • SOA Multi-Service Engine
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
