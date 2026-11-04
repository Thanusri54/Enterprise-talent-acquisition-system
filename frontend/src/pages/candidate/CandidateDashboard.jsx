import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import store from '../../services/store';
import { 
  Briefcase, 
  FileCheck2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  GitMerge, 
  ArrowRight, 
  UserCircle, 
  Sparkles, 
  Video, 
  ExternalLink,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Building
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CandidateDashboard = () => {
  const { user, getOrCreateCandidateProfile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [candProfile, setCandProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCandidateDashboardData = async () => {
    setLoading(true);
    try {
      const profile = await getOrCreateCandidateProfile(user);
      setCandProfile(profile);

      const [jobsRes, appsRes, intvsRes] = await Promise.all([
        api.get('/jobs'),
        profile && profile.id ? api.get(`/applications/candidate/${profile.id}`).catch(() => api.get('/applications')) : api.get('/applications'),
        api.get('/interviews')
      ]);

      setJobs(jobsRes.data || []);
      
      const allApps = appsRes.data || [];
      const myApps = allApps.filter(a => 
        (profile && String(a.candidateId) === String(profile.id)) || 
        a.candidateEmail === user?.email || 
        a.candidateName === user?.name
      );
      setApplications(myApps);

      const allIntvs = intvsRes.data || [];
      const myIntvs = allIntvs.filter(i => 
        (profile && String(i.candidateId) === String(profile.id)) ||
        i.candidateName === user?.name ||
        i.candidateEmail === user?.email
      );
      setInterviews(myIntvs);
    } catch (err) {
      console.error('Error loading candidate dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidateDashboardData();
  }, [user]);

  const openJobsCount = jobs.filter(j => j.status === 'OPEN').length;
  const inReviewCount = applications.filter(a => a.status === 'SCREENING').length;
  const shortlistedCount = applications.filter(a => a.status === 'SHORTLISTED').length;
  const scheduledIntvsCount = interviews.filter(i => i.status === 'SCHEDULED').length;
  const selectedCount = applications.filter(a => a.status === 'SELECTED' || a.status === 'HIRED').length;

  const kpiCards = [
    { title: 'Available Jobs', value: openJobsCount, icon: Briefcase, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', link: '/candidate/jobs' },
    { title: 'My Applications', value: applications.length, icon: FileCheck2, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', link: '/candidate/applications' },
    { title: 'In Screening Review', value: inReviewCount, icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', link: '/candidate/applications' },
    { title: 'Shortlisted Talent', value: shortlistedCount, icon: GitMerge, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', link: '/candidate/applications' },
    { title: 'Scheduled Interviews', value: scheduledIntvsCount, icon: Calendar, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', link: '/candidate/interviews' },
    { title: 'Hiring Decision / Offers', value: selectedCount, icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', link: '/candidate/applications' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-100">Welcome, {user?.name || 'Candidate'}!</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Candidate Workspace
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Track your job applications in real-time through the recruitment pipeline, view scheduled interview sessions, and explore open requisitions.
          </p>
        </div>

        <div className="flex items-center space-x-3 relative z-10">
          <Link
            to="/candidate/jobs"
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-600/20 flex items-center space-x-2"
          >
            <span>Explore Open Requisitions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 transition-all hover:scale-[1.01] group"
            >
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-slate-500 group-hover:text-cyan-400 transition-colors">&rarr;</span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-100">{card.value}</div>
                <div className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">{card.title}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Tracking Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-cyan-400" />
              <span>My Active Applications ({applications.length})</span>
            </h3>
            <Link to="/candidate/applications" className="text-xs text-cyan-400 hover:underline font-semibold">
              View All Tracker &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-slate-500 text-xs">Loading application records...</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs space-y-3">
                <div>You haven't submitted any job applications yet.</div>
                <Link
                  to="/candidate/jobs"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-600/30"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Browse Open Requisitions</span>
                </Link>
              </div>
            ) : (
              applications.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-100 truncate">{app.jobTitle}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 font-mono">
                        APP-{app.id}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {app.department || 'Engineering'} • Applied: {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Recent'}
                    </div>
                  </div>

                  <div className="shrink-0 pl-3">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase border ${
                      app.status === 'SELECTED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                      app.status === 'SHORTLISTED' ? 'bg-indigo-950 text-indigo-400 border-indigo-800' :
                      app.status === 'INTERVIEW' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                      app.status === 'REJECTED' ? 'bg-rose-950 text-rose-400 border-rose-800' :
                      'bg-slate-900 text-slate-300 border-slate-700'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Scheduled Interviews Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Upcoming Scheduled Interviews</span>
            </h3>
            <Link to="/candidate/interviews" className="text-xs text-cyan-400 hover:underline font-semibold">
              Full Schedule &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-slate-500 text-xs">Loading interview schedule...</div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No interviews currently scheduled. You will receive an invitation once shortlisted.
              </div>
            ) : (
              interviews.slice(0, 3).map((intv) => (
                <div
                  key={intv.id}
                  className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-100">{intv.jobTitle}</div>
                    <div className="text-[11px] text-cyan-400 font-semibold mt-0.5">{intv.interviewType || 'Technical Interview'}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Interviewer: {intv.interviewerName}</div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-mono">
                      {intv.status}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {intv.scheduledTime ? new Date(intv.scheduledTime).toLocaleDateString() : 'Active'}
                    </div>
                    {intv.meetingLink && (
                      <div>
                        <a
                          href={intv.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-[11px] text-cyan-400 hover:underline font-semibold"
                        >
                          <Video className="w-3 h-3" />
                          <span>Join Room</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
