import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import store from '../services/store';
import { 
  Users, 
  Briefcase, 
  FileCheck2, 
  GitMerge, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  Activity, 
  Calendar, 
  UserCheck, 
  Plus, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Star, 
  Layers, 
  ShieldCheck, 
  Video, 
  MessageSquare,
  Building,
  Target,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie 
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

const FUNNEL_COLORS = ['#38bdf8', '#818cf8', '#a78bfa', '#c084fc', '#34d399', '#10b981', '#f43f5e'];

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role || 'RECRUITER';
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [activities, setActivities] = useState([]);

  // Interviewer Evaluation Modal State
  const [selectedEvalInterview, setSelectedEvalInterview] = useState(null);
  const [ratings, setRatings] = useState({
    technical: 5,
    problemSolving: 5,
    communication: 4,
    domainKnowledge: 5,
    cultureFit: 4
  });
  const [recommendation, setRecommendation] = useState('STRONG HIRE');
  const [feedbackNotes, setFeedbackNotes] = useState('Candidate demonstrated exceptional domain understanding and optimal coding complexity.');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [jobsRes, appsRes, candRes, intvRes, pipeRes, usersRes] = await Promise.allSettled([
        api.get('/jobs'),
        api.get('/applications'),
        api.get('/candidates'),
        api.get('/interviews'),
        api.get('/pipeline'),
        api.get('/auth/users')
      ]);

      const jData = jobsRes.status === 'fulfilled' ? (jobsRes.value.data || []) : store.getJobs();
      const aData = appsRes.status === 'fulfilled' ? (appsRes.value.data || []) : store.getApplications();
      const cData = candRes.status === 'fulfilled' ? (candRes.value.data || []) : store.getCandidates();
      const iData = intvRes.status === 'fulfilled' ? (intvRes.value.data || []) : store.getInterviews();
      const pData = pipeRes.status === 'fulfilled' ? (pipeRes.value.data || []) : store.getPipeline();
      const uData = usersRes.status === 'fulfilled' ? (usersRes.value.data || []) : store.getUsers();

      setJobs(jData);
      setApplications(aData);
      setCandidates(cData);
      setInterviews(iData);
      setPipeline(pData);
      setUsersList(uData);
      setActivities(store.getActivityLog());
    } catch (e) {
      console.error('Dashboard data load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Funnel Data Calculations
  const getStageCount = (stageName) => {
    const fromPipe = pipeline.filter(p => (p.currentStage || p.stage) === stageName).length;
    const fromApps = applications.filter(a => a.status === stageName).length;
    return Math.max(fromPipe, fromApps);
  };

  const appliedCount = getStageCount('APPLIED');
  const screeningCount = getStageCount('SCREENING');
  const shortlistedCount = getStageCount('SHORTLISTED');
  const interviewCount = getStageCount('INTERVIEW');
  const selectedCount = Math.max(getStageCount('SELECTED'), applications.filter(a => a.status === 'SELECTED' || a.status === 'HIRED').length);
  const rejectedCount = getStageCount('REJECTED');
  const onHoldCount = getStageCount('ON_HOLD');

  const totalFunnel = appliedCount + screeningCount + shortlistedCount + interviewCount + selectedCount || 1;

  const funnelStages = [
    { stage: 'APPLIED', count: appliedCount, pct: Math.round((appliedCount / totalFunnel) * 100), color: '#38bdf8' },
    { stage: 'SCREENING', count: screeningCount, pct: Math.round((screeningCount / totalFunnel) * 100), color: '#818cf8' },
    { stage: 'SHORTLISTED', count: shortlistedCount, pct: Math.round((shortlistedCount / totalFunnel) * 100), color: '#a78bfa' },
    { stage: 'INTERVIEW', count: interviewCount, pct: Math.round((interviewCount / totalFunnel) * 100), color: '#fbbf24' },
    { stage: 'SELECTED', count: selectedCount, pct: Math.round((selectedCount / totalFunnel) * 100), color: '#34d399' },
  ];

  // Submit Interview Feedback Handler
  const handleOpenFeedback = (intv) => {
    setSelectedEvalInterview(intv);
    setRatings({ technical: 5, problemSolving: 5, communication: 4, domainKnowledge: 5, cultureFit: 4 });
    setRecommendation('STRONG HIRE');
    setFeedbackNotes('Candidate displayed excellent technical proficiency, clean code structure, and clear communication.');
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedEvalInterview) return;

    setSubmittingFeedback(true);
    const avgScore = ((ratings.technical + ratings.problemSolving + ratings.communication + ratings.domainKnowledge + ratings.cultureFit) / 5).toFixed(1);

    const formattedFeedback = `[${recommendation}] Score: ${avgScore}/5. Technical: ${ratings.technical}/5, Problem Solving: ${ratings.problemSolving}/5, Comm: ${ratings.communication}/5. Notes: ${feedbackNotes}`;

    try {
      await api.put(`/interviews/${selectedEvalInterview.id}/feedback`, {
        status: 'COMPLETED',
        rating: Math.round(Number(avgScore)),
        overallRating: Number(avgScore),
        recommendation,
        detailedFeedback: formattedFeedback,
        strengths: `Technical (${ratings.technical}/5), Problem Solving (${ratings.problemSolving}/5)`,
        weaknesses: 'None noted'
      });

      store.logActivity(`Interviewer submitted scorecard for ${selectedEvalInterview.candidateName} (${recommendation})`, user?.name || 'Interviewer');
      toast.success(`Scorecard submitted successfully! (${recommendation} - Rating: ${avgScore}/5)`);
      setSelectedEvalInterview(null);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit interview evaluation.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // -------------------------------------------------------------
  // 1. RECRUITER DASHBOARD
  // -------------------------------------------------------------
  const renderRecruiterDashboard = () => (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-100">Welcome back, {user?.name || 'Recruiter'}!</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Recruiter Workspace
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pipeline velocity is high. {interviews.filter(i => i.status === 'SCHEDULED').length} interviews scheduled, {applications.filter(a => a.status === 'APPLIED').length} new applications waiting for review.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            to="/jobs"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center space-x-1.5 border border-slate-700"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Create Job</span>
          </Link>
          <Link
            to="/interviews"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center space-x-1.5 border border-slate-700"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Schedule</span>
          </Link>
          <Link
            to="/pipeline"
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-600/20 flex items-center space-x-1.5"
          >
            <span>Kanban Pipeline</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recruiter KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Link to="/jobs" className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all hover:scale-[1.01]">
          <div className="flex justify-between items-center text-cyan-400">
            <Briefcase className="w-5 h-5" />
            <span className="text-[10px] text-slate-500 font-mono">LIVE</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-3">{jobs.filter(j => j.status === 'OPEN').length}</div>
          <div className="text-[11px] text-slate-400 font-medium">Open Positions</div>
        </Link>

        <Link to="/applications" className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all hover:scale-[1.01]">
          <div className="flex justify-between items-center text-blue-400">
            <FileCheck2 className="w-5 h-5" />
            <span className="text-[10px] text-slate-500 font-mono">POOL</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-3">{applications.length}</div>
          <div className="text-[11px] text-slate-400 font-medium">Total Applications</div>
        </Link>

        <Link to="/pipeline" className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all hover:scale-[1.01]">
          <div className="flex justify-between items-center text-indigo-400">
            <GitMerge className="w-5 h-5" />
            <span className="text-[10px] text-indigo-400 font-mono">{screeningCount}</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-3">{screeningCount}</div>
          <div className="text-[11px] text-slate-400 font-medium">In Screening</div>
        </Link>

        <Link to="/pipeline" className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all hover:scale-[1.01]">
          <div className="flex justify-between items-center text-purple-400">
            <Star className="w-5 h-5" />
            <span className="text-[10px] text-purple-400 font-mono">PRIORITY</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-3">{shortlistedCount}</div>
          <div className="text-[11px] text-slate-400 font-medium">Shortlisted Talent</div>
        </Link>

        <Link to="/interviews" className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all hover:scale-[1.01]">
          <div className="flex justify-between items-center text-amber-400">
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] text-amber-400 font-mono">TODAY</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-3">{interviews.filter(i => i.status === 'SCHEDULED').length}</div>
          <div className="text-[11px] text-slate-400 font-medium">Interviews Active</div>
        </Link>

        <Link to="/pipeline" className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all hover:scale-[1.01]">
          <div className="flex justify-between items-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] text-emerald-400 font-mono">OFFER</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-3">{selectedCount}</div>
          <div className="text-[11px] text-slate-400 font-medium">Selected / Offers</div>
        </Link>
      </div>

      {/* Recruiter Hiring Funnel Progress */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Orchestrated Hiring Funnel (Live Progression)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Stage counts and conversion rates derived from backend repository</p>
          </div>
          <Link to="/pipeline" className="text-xs text-cyan-400 hover:underline font-semibold flex items-center space-x-1">
            <span>Manage Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {funnelStages.map((stg, i) => (
            <div key={stg.stage} className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2 relative">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 text-[11px]">{stg.stage}</span>
                <span className="text-xs font-mono font-bold" style={{ color: stg.color }}>{stg.count}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(stg.pct, 8)}%`, backgroundColor: stg.color }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
                <span>Funnel Share:</span>
                <span>{stg.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recruiter Dual Column: Recent Applications & Scheduled Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Needing Review */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-blue-400" />
              <span>Recent Applications ({applications.length})</span>
            </h3>
            <Link to="/applications" className="text-xs text-cyan-400 hover:underline">View All &rarr;</Link>
          </div>

          <div className="space-y-2.5">
            {applications.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No applications received yet.</div>
            ) : (
              applications.slice(0, 4).map((app) => (
                <div key={app.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-100 truncate">{app.candidateName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 font-mono">
                        APP-{app.id}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{app.jobTitle} • {app.department || 'Engineering'}</div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      app.status === 'SELECTED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                      app.status === 'SHORTLISTED' ? 'bg-indigo-950 text-indigo-400 border-indigo-800' :
                      app.status === 'INTERVIEW' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                      app.status === 'REJECTED' ? 'bg-rose-950 text-rose-400 border-rose-800' :
                      'bg-slate-900 text-slate-300 border-slate-700'
                    }`}>
                      {app.status}
                    </span>
                    <Link
                      to={`/candidates/${app.candidateId}`}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Review Candidate"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Interviews Calendar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Upcoming Scheduled Interviews</span>
            </h3>
            <Link to="/interviews" className="text-xs text-cyan-400 hover:underline">Full Schedule &rarr;</Link>
          </div>

          <div className="space-y-2.5">
            {interviews.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No interviews scheduled today.</div>
            ) : (
              interviews.slice(0, 4).map((intv) => (
                <div key={intv.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-100">{intv.candidateName}</div>
                    <div className="text-[11px] text-cyan-400 font-semibold">{intv.jobTitle} • {intv.interviewType || 'Technical'}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Interviewer: {intv.interviewerName}</div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-mono">
                      {intv.status}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      {intv.scheduledTime ? new Date(intv.scheduledTime).toLocaleDateString() : 'Active'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // 2. HR MANAGER DASHBOARD
  // -------------------------------------------------------------
  const renderHrDashboard = () => (
    <div className="space-y-6">
      {/* Executive HR Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-100">HR Executive Dashboard</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Strategic Talent Governance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Global talent requisition health, time-to-hire velocity, and stage conversion analytics.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            to="/analytics"
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5"
          >
            <span>Full Analytics Report</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* HR Strategic KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-center text-emerald-400">
            <Briefcase className="w-5 h-5" />
            <span className="text-[10px] text-slate-500 font-mono">REQ</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-3">{jobs.filter(j => j.status === 'OPEN').length}</div>
          <div className="text-[11px] text-slate-400 font-medium">Open Positions</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-center text-cyan-400">
            <Users className="w-5 h-5" />
            <span className="text-[10px] text-slate-500 font-mono">TALENT</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-3">{candidates.length}</div>
          <div className="text-[11px] text-slate-400 font-medium">Candidate Talent Pool</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-center text-blue-400">
            <FileCheck2 className="w-5 h-5" />
            <span className="text-[10px] text-slate-500 font-mono">FLOW</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-3">{applications.length}</div>
          <div className="text-[11px] text-slate-400 font-medium">Applications Received</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-center text-amber-400">
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] text-slate-500 font-mono">EVAL</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-3">{interviews.length}</div>
          <div className="text-[11px] text-slate-400 font-medium">Conducted Interviews</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-center text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] text-emerald-400 font-mono">HIRED</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-3">{selectedCount}</div>
          <div className="text-[11px] text-slate-400 font-medium">Selected / Offers</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-center text-teal-400">
            <Clock className="w-5 h-5" />
            <span className="text-[10px] text-teal-400 font-mono">AVG</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-3">14.2 d</div>
          <div className="text-[11px] text-slate-400 font-medium">Average Time to Hire</div>
        </div>
      </div>

      {/* Funnel Bottleneck Identification & Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Pipeline Stage Dwell & Conversion Analysis</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Real-time</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelStages} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <XAxis dataKey="stage" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {funnelStages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start space-x-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-slate-300">
              <strong className="text-amber-300">Pipeline Insight:</strong> Candidates in <span className="text-cyan-400 font-semibold">SCREENING</span> ({screeningCount}) are moving smoothly to <span className="text-purple-400 font-semibold">SHORTLISTED</span>. Highest conversion occurs at technical evaluation.
            </div>
          </div>
        </div>

        {/* Recruiter Team Workload */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Recruiting Team Allocation</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200">Lead Recruiter</span>
                <span className="text-[10px] text-cyan-400 font-mono font-bold">100% Assigned</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Managing {applications.length} active candidates across {jobs.length} requisitions.
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full w-4/5 rounded-full"></div>
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200">Senior Tech Lead (Interviewer)</span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">{interviews.length} Sessions</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Evaluation turnaround time: <strong>&lt; 24 hours</strong>.
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-3/5 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // 3. INTERVIEWER DASHBOARD
  // -------------------------------------------------------------
  const renderInterviewerDashboard = () => {
    const myInterviews = interviews.filter(i => 
      i.interviewerName === user?.name || 
      i.interviewerId === user?.id || 
      role === 'INTERVIEWER'
    );
    const pendingEvaluations = myInterviews.filter(i => i.status === 'SCHEDULED');
    const completedEvaluations = myInterviews.filter(i => i.status === 'COMPLETED');

    return (
      <div className="space-y-6">
        {/* Evaluator Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-100">Interviewer Evaluation Center</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Technical Evaluator
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Review assigned candidate applications, submit standardized 5-dimension competency scorecards, and submit hiring consensus.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono">
              Pending Scorecards: <strong className="text-amber-400">{pendingEvaluations.length}</strong>
            </span>
          </div>
        </div>

        {/* Evaluation KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-xs font-semibold text-slate-400">Total Assigned</div>
            <div className="text-2xl font-bold text-slate-100 mt-2">{myInterviews.length}</div>
            <div className="text-[10px] text-slate-500 mt-1">Candidate sessions</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-xs font-semibold text-amber-400">Pending Feedback</div>
            <div className="text-2xl font-bold text-amber-400 mt-2">{pendingEvaluations.length}</div>
            <div className="text-[10px] text-slate-500 mt-1">Awaiting evaluation scorecards</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-xs font-semibold text-emerald-400">Completed Reviews</div>
            <div className="text-2xl font-bold text-emerald-400 mt-2">{completedEvaluations.length}</div>
            <div className="text-[10px] text-slate-500 mt-1">Recorded in database</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-xs font-semibold text-cyan-400">Avg. Scorecard Rating</div>
            <div className="text-2xl font-bold text-cyan-400 mt-2">4.8 / 5.0</div>
            <div className="text-[10px] text-slate-500 mt-1">Objective evaluation quality</div>
          </div>
        </div>

        {/* Active Interviews & Feedback Action List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Assigned Interviews & Candidate Evaluation Queue</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live Sessions</span>
          </div>

          <div className="space-y-3">
            {myInterviews.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                No interview sessions currently assigned to your account.
              </div>
            ) : (
              myInterviews.map((intv) => (
                <div
                  key={intv.id}
                  className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-sm font-bold text-slate-100">{intv.candidateName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                        INT-{intv.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                        intv.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}>
                        {intv.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      Requisition: <strong className="text-slate-200">{intv.jobTitle}</strong> • Round: <span className="text-cyan-300 font-semibold">{intv.interviewType || 'Technical'}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Scheduled: {intv.scheduledTime ? new Date(intv.scheduledTime).toLocaleString() : 'Today 2:00 PM'} • Duration: 60 mins
                    </div>
                    {intv.feedback && (
                      <div className="mt-2 text-[11px] text-emerald-300 bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/60 leading-snug">
                        <strong>Recorded Feedback:</strong> {intv.feedback}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <Link
                      to={`/candidates/${intv.candidateId}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs transition-colors border border-slate-700"
                    >
                      View Dossier
                    </Link>
                    {intv.meetingLink && (
                      <a
                        href={intv.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold rounded-lg text-xs transition-colors border border-slate-700 flex items-center space-x-1"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleOpenFeedback(intv)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md shadow-amber-600/20 flex items-center space-x-1"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>{intv.status === 'COMPLETED' ? 'Update Feedback' : 'Submit Scorecard'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // 4. ADMIN DASHBOARD
  // -------------------------------------------------------------
  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Admin Executive Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-100">System Administration & Mesh Console</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Admin Governance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Global talent engine oversight, Eureka registered microservices, and user identity administration.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Link
            to="/users"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-purple-600/20 flex items-center space-x-1.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>Manage System Users</span>
          </Link>
        </div>
      </div>

      {/* Admin KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-semibold">System Users</div>
          <div className="text-xl font-bold text-purple-400 mt-1">{usersList.length || 5}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-semibold">Active Jobs</div>
          <div className="text-xl font-bold text-cyan-400 mt-1">{jobs.length}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-semibold">Candidates</div>
          <div className="text-xl font-bold text-blue-400 mt-1">{candidates.length}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-semibold">Applications</div>
          <div className="text-xl font-bold text-indigo-400 mt-1">{applications.length}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-semibold">Interviews</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{interviews.length}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-semibold">Selections</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{selectedCount}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-semibold">Rejections</div>
          <div className="text-xl font-bold text-rose-400 mt-1">{rejectedCount}</div>
        </div>
      </div>

      {/* Microservice Architecture Topology */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Eureka Distributed SOA Service Registry</span>
          </h3>
          <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>All Services UP</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {[
            { name: 'API-GATEWAY', port: 8080, type: 'Reactive Gateway / Netty', status: 'UP' },
            { name: 'AUTH-SERVICE', port: 8081, type: 'JWT / Spring Security', status: 'UP' },
            { name: 'CANDIDATE-SERVICE', port: 8082, type: 'Candidate JPA Entity', status: 'UP' },
            { name: 'JOB-SERVICE', port: 8083, type: 'Requisition Catalog', status: 'UP' },
            { name: 'APPLICATION-SERVICE', port: 8084, type: 'Workflow State Engine', status: 'UP' },
            { name: 'PIPELINE-SERVICE', port: 8085, type: 'Kanban Orchestration', status: 'UP' },
            { name: 'INTERVIEW-SERVICE', port: 8086, type: 'Scorecard Evaluation', status: 'UP' },
            { name: 'EUREKA-SERVER', port: 8761, type: 'Service Discovery Node', status: 'UP' },
          ].map((srv) => (
            <div key={srv.name} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">{srv.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">Port: :{srv.port}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">{srv.type}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {srv.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Route according to role */}
      {role === 'ADMIN' && renderAdminDashboard()}
      {(role === 'HR' || role === 'HR_MANAGER') && renderHrDashboard()}
      {role === 'RECRUITER' && renderRecruiterDashboard()}
      {role === 'INTERVIEWER' && renderInterviewerDashboard()}
      {role === 'CANDIDATE' && renderRecruiterDashboard() /* Candidate layout has separate dashboard */}

      {/* Modal: Interviewer Evaluation Scorecard */}
      {selectedEvalInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  <span>Structured Competency Evaluation</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Candidate: <strong className="text-slate-200">{selectedEvalInterview.candidateName}</strong> • Requisition: <span className="text-cyan-400">{selectedEvalInterview.jobTitle}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedEvalInterview(null)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-4 text-xs">
              {/* 5-Dimension Competency Scorecard */}
              <div className="space-y-2.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Competency Scorecards (1 to 5 Points)
                </label>

                {[
                  { key: 'technical', label: 'Technical Skills & Architecture' },
                  { key: 'problemSolving', label: 'Problem Solving & Algorithmic Design' },
                  { key: 'communication', label: 'Communication & Articulation' },
                  { key: 'domainKnowledge', label: 'Domain Knowledge & Microservices' },
                  { key: 'cultureFit', label: 'Culture Fit & Collaboration' },
                ].map((crit) => (
                  <div key={crit.key} className="flex justify-between items-center p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="font-semibold text-slate-300">{crit.label}</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setRatings(prev => ({ ...prev, [crit.key]: score }))}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                            ratings[crit.key] === score
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall Recommendation */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Overall Hiring Recommendation
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['STRONG HIRE', 'HIRE', 'HOLD', 'NO HIRE'].map((rec) => (
                    <button
                      key={rec}
                      type="button"
                      onClick={() => setRecommendation(rec)}
                      className={`py-2 px-2.5 rounded-xl font-bold text-xs transition-all border ${
                        recommendation === rec
                          ? rec === 'STRONG HIRE' || rec === 'HIRE'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                            : rec === 'HOLD'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {rec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Feedback Textarea */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Detailed Evaluation Notes & Consensus
                </label>
                <textarea
                  rows="3"
                  required
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="Elaborate on candidate technical strengths, live coding test outcomes, and team fit..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedEvalInterview(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5"
                >
                  <span>{submittingFeedback ? 'Submitting...' : 'Confirm & Save Scorecard'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
