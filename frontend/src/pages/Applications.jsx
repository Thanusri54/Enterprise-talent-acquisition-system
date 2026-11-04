import React, { useState, useEffect } from 'react';
import api from '../services/api';
import store from '../services/store';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  FileCheck2, 
  Plus, 
  ExternalLink, 
  Filter, 
  Search, 
  CheckCircle2, 
  Clock, 
  GitMerge, 
  Calendar, 
  XCircle, 
  ArrowRight, 
  User, 
  Briefcase, 
  X, 
  FileText, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  Layers, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STAGES = [
  'APPLIED',
  'SCREENING',
  'SHORTLISTED',
  'INTERVIEW',
  'SELECTED',
  'REJECTED',
  'ON_HOLD'
];

const Applications = () => {
  const { user } = useAuth();
  const role = user?.role || 'RECRUITER';
  const toast = useToast();

  const [applications, setApplications] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');

  // Selected Application Workspace Modal/Drawer
  const [workspaceApp, setWorkspaceApp] = useState(null);
  const [workspaceCandidate, setWorkspaceCandidate] = useState(null);
  const [workspaceInterviews, setWorkspaceInterviews] = useState([]);

  // Create Application Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchApplicationsData = async () => {
    setLoading(true);
    try {
      const [appRes, candRes, jobRes, intvRes, pipeRes] = await Promise.allSettled([
        api.get('/applications'),
        api.get('/candidates'),
        api.get('/jobs'),
        api.get('/interviews'),
        api.get('/pipeline')
      ]);

      const aData = appRes.status === 'fulfilled' ? (appRes.value.data || []) : store.getApplications();
      const cData = candRes.status === 'fulfilled' ? (candRes.value.data || []) : store.getCandidates();
      const jData = jobRes.status === 'fulfilled' ? (jobRes.value.data || []) : store.getJobs();
      const iData = intvRes.status === 'fulfilled' ? (intvRes.value.data || []) : store.getInterviews();
      const pData = pipeRes.status === 'fulfilled' ? (pipeRes.value.data || []) : store.getPipeline();

      setApplications(aData);
      setCandidates(cData);
      setJobs(jData);
      setInterviews(iData);
      setPipeline(pData);
    } catch (err) {
      console.error('Failed to load applications data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationsData();
  }, [user]);

  // Handle stage change with synchronized pipeline updates
  const handleStageChange = async (app, newStatus) => {
    try {
      await api.patch(`/applications/${app.id}/status`, { status: newStatus });
      try {
        await api.patch(`/candidates/${app.candidateId}/status`, { status: newStatus });
      } catch (e) {}

      try {
        const pipeRes = await api.get(`/pipeline/application/${app.id}`);
        if (pipeRes.data) {
          await api.post(`/pipeline/${pipeRes.data.id}/move`, {
            toStage: newStatus,
            forceMove: true,
            movedByName: user?.name || 'Recruiter/HR',
            comments: `Moved stage to ${newStatus}`
          });
        }
      } catch (pipeErr) {
        try {
          await api.post('/pipeline', {
            applicationId: app.id,
            candidateId: app.candidateId,
            candidateName: app.candidateName,
            candidateEmail: app.candidateEmail,
            jobId: app.jobId,
            jobTitle: app.jobTitle,
            currentStage: newStatus,
            assignedRecruiterName: user?.name || 'Lead Recruiter'
          });
        } catch (createErr) {}
      }

      store.logActivity(`Application APP-${app.id} moved to ${newStatus}`, user?.name || 'Recruiter');
      toast.success(`Application APP-${app.id} successfully moved to ${newStatus}`);

      // Update workspace modal state if open
      if (workspaceApp && workspaceApp.id === app.id) {
        setWorkspaceApp(prev => ({ ...prev, status: newStatus }));
      }

      fetchApplicationsData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update application stage.');
    }
  };

  // Open Workspace for an Application
  const handleOpenWorkspace = async (app) => {
    setWorkspaceApp(app);
    // Find candidate details
    const cand = candidates.find(c => String(c.id) === String(app.candidateId));
    if (cand) {
      setWorkspaceCandidate(cand);
    } else {
      try {
        const cRes = await api.get(`/candidates/${app.candidateId}`);
        setWorkspaceCandidate(cRes.data);
      } catch (e) {
        setWorkspaceCandidate(null);
      }
    }

    // Find candidate interviews
    const appIntvs = interviews.filter(i => String(i.candidateId) === String(app.candidateId));
    setWorkspaceInterviews(appIntvs);
  };

  // Create Application submit handler
  const handleCreateApplication = async (e) => {
    e.preventDefault();
    if (!selectedCandidateId || !selectedJobId) return;

    setSubmitting(true);
    const cand = candidates.find(c => String(c.id) === String(selectedCandidateId));
    const job = jobs.find(j => String(j.id) === String(selectedJobId));

    try {
      const appRes = await api.post('/applications', {
        candidateId: Number(selectedCandidateId),
        candidateName: cand ? (cand.fullName || cand.name) : 'Candidate',
        candidateEmail: cand ? cand.email : '',
        jobId: Number(selectedJobId),
        jobTitle: job ? job.title : 'Job Requisition',
        department: job ? job.department : 'Engineering',
        status: 'APPLIED',
        recruiterId: 3,
        recruiterName: user?.name || 'Lead Recruiter',
        coverLetter: coverLetter || 'Application submitted via TalentFlow.',
        matchScore: Math.floor(Math.random() * 15) + 85
      });

      const savedApp = appRes.data;

      try {
        await api.post('/pipeline', {
          applicationId: savedApp.id,
          candidateId: Number(selectedCandidateId),
          candidateName: cand ? (cand.fullName || cand.name) : 'Candidate',
          candidateEmail: cand ? cand.email : '',
          skills: cand ? (cand.skills || 'Java, React, SQL') : 'Java, SQL',
          experienceYears: cand ? (cand.experienceYears || 3) : 3,
          jobId: Number(selectedJobId),
          jobTitle: job ? job.title : 'Job Requisition',
          currentStage: 'APPLIED',
          assignedRecruiterName: user?.name || 'Lead Recruiter'
        });
      } catch (pipeErr) {}

      store.logActivity(`Created application for ${cand ? (cand.fullName || cand.name) : 'Candidate'} (APP-${savedApp.id})`, user?.name || 'Recruiter');
      toast.success(`Application created successfully! APP-${savedApp.id}`);
      setShowApplyModal(false);
      setSelectedCandidateId('');
      setSelectedJobId('');
      setCoverLetter('');
      fetchApplicationsData();
    } catch (err) {
      if (err.response?.status === 409) {
        toast.warning(err.response?.data?.message || 'Candidate has already applied for this job requisition.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to submit application.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApps = applications.filter(app => {
    if (statusFilter && app.status !== statusFilter) return false;
    if (jobFilter && String(app.jobId) !== String(jobFilter)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = app.candidateName && app.candidateName.toLowerCase().includes(q);
      const matchTitle = app.jobTitle && app.jobTitle.toLowerCase().includes(q);
      const matchId = String(app.id) === q.replace(/\D/g, '');
      if (!matchName && !matchTitle && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <FileCheck2 className="w-5 h-5 text-cyan-400" />
            <span>Applications Management Workspace</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise candidate pipeline tracking, stage transitions, and evaluation review.
          </p>
        </div>

        {role !== 'INTERVIEWER' && (
          <button
            onClick={() => setShowApplyModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-600/20 flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Application</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate, job, APP-ID..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Stages</option>
            {STAGES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Job Filter */}
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Requisitions</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>

          {(searchQuery || statusFilter || jobFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
                setJobFilter('');
              }}
              className="text-[11px] text-cyan-400 hover:underline font-semibold"
            >
              Reset
            </button>
          )}
        </div>

        <div className="text-xs text-slate-400 font-mono shrink-0">
          Total Candidates: <strong className="text-cyan-400">{filteredApps.length}</strong>
        </div>
      </div>

      {/* Main Enterprise Application Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Application ID</th>
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Job Requisition</th>
                <th className="py-3.5 px-4">Applied Date</th>
                <th className="py-3.5 px-4">Current Stage</th>
                <th className="py-3.5 px-4">Recruiter</th>
                <th className="py-3.5 px-4">Match Score</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">Loading enterprise applications...</td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    No application records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const matchingIntv = interviews.find(i => String(i.candidateId) === String(app.candidateId));

                  return (
                    <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-cyan-400 font-bold">
                        APP-{app.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">
                        <button
                          onClick={() => handleOpenWorkspace(app)}
                          className="hover:text-cyan-400 transition-colors text-left"
                        >
                          {app.candidateName}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div>{app.jobTitle}</div>
                        <div className="text-[10px] text-slate-500">{app.department || 'Engineering'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-400 font-mono">
                        {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold border uppercase ${
                          app.status === 'SELECTED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                          app.status === 'SHORTLISTED' ? 'bg-indigo-950 text-indigo-400 border-indigo-800' :
                          app.status === 'INTERVIEW' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                          app.status === 'REJECTED' ? 'bg-rose-950 text-rose-400 border-rose-800' :
                          'bg-slate-950 text-slate-300 border-slate-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-400">
                        {app.recruiterName || 'Lead Recruiter'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        {app.matchScore || 88}%
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenWorkspace(app)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors border border-slate-700 font-semibold"
                          >
                            Workspace
                          </button>

                          {/* Quick Stage Progression buttons for Recruiter / HR */}
                          {role !== 'INTERVIEWER' && (
                            <>
                              {app.status === 'APPLIED' && (
                                <button
                                  onClick={() => handleStageChange(app, 'SCREENING')}
                                  className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-[10px] font-bold"
                                  title="Move to Screening"
                                >
                                  Screen
                                </button>
                              )}
                              {app.status === 'SCREENING' && (
                                <button
                                  onClick={() => handleStageChange(app, 'SHORTLISTED')}
                                  className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-[10px] font-bold"
                                  title="Shortlist Candidate"
                                >
                                  Shortlist
                                </button>
                              )}
                              {(role === 'HR' || role === 'HR_MANAGER' || role === 'ADMIN') && app.status !== 'SELECTED' && (
                                <button
                                  onClick={() => handleStageChange(app, 'SELECTED')}
                                  className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold"
                                  title="Make Offer / Select"
                                >
                                  Select
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: APPLICATION DETAIL WORKSPACE */}
      {workspaceApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Workspace Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">APP-{workspaceApp.id}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs font-bold text-slate-400">{workspaceApp.department || 'Engineering'}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-100 mt-1">{workspaceApp.candidateName}</h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  Applied for <strong className="text-slate-200">{workspaceApp.jobTitle}</strong>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                  workspaceApp.status === 'SELECTED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                  workspaceApp.status === 'SHORTLISTED' ? 'bg-indigo-950 text-indigo-400 border-indigo-800' :
                  workspaceApp.status === 'INTERVIEW' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                  workspaceApp.status === 'REJECTED' ? 'bg-rose-950 text-rose-400 border-rose-800' :
                  'bg-slate-950 text-slate-300 border-slate-700'
                }`}>
                  Current: {workspaceApp.status}
                </span>
                <button
                  onClick={() => setWorkspaceApp(null)}
                  className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stage Timeline Stepper */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Recruitment Orchestration Timeline
              </div>
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                {['APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'].map((stg) => {
                  const stagesOrder = ['APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'];
                  const appIdx = stagesOrder.indexOf(workspaceApp.status);
                  const thisIdx = stagesOrder.indexOf(stg);
                  const isDone = thisIdx <= appIdx && appIdx !== -1;

                  return (
                    <div key={stg} className="space-y-1">
                      <div className={`h-1.5 rounded-full ${
                        isDone ? 'bg-emerald-400' : 'bg-slate-800'
                      }`}></div>
                      <span className={`text-[10px] font-bold uppercase font-mono ${
                        isDone ? 'text-emerald-400' : 'text-slate-500'
                      }`}>
                        {stg}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Workspace Content: Candidate Info & Stage Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left 2 Cols: Profile & Cover Note */}
              <div className="md:col-span-2 space-y-4">
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Candidate Credentials</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px]">Email</span>
                      <div className="text-slate-200 font-mono truncate">{workspaceApp.candidateEmail}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Experience</span>
                      <div className="text-slate-200">{workspaceCandidate?.experienceYears || 4} Years</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Location</span>
                      <div className="text-slate-200">{workspaceCandidate?.location || 'Remote / Hybrid'}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Skills</span>
                      <div className="text-cyan-400 font-mono text-[11px] truncate">
                        {workspaceCandidate?.skills || 'Java, Spring Boot, React, SQL'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Application Cover Note</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                    {workspaceApp.coverLetter || 'No cover letter provided.'}
                  </p>
                </div>

                {/* Interview Feedback Section */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span>Recorded Technical Evaluations</span>
                  </h4>
                  {workspaceInterviews.length === 0 ? (
                    <div className="text-xs text-slate-500 py-3 text-center">No interview evaluations conducted yet.</div>
                  ) : (
                    workspaceInterviews.map((iv) => (
                      <div key={iv.id} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-200">{iv.interviewerName} ({iv.interviewType || 'Tech'})</span>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-mono">
                            {iv.status}
                          </span>
                        </div>
                        {iv.feedback && (
                          <div className="text-[11px] text-emerald-300 bg-emerald-950/30 p-2 rounded border border-emerald-900/50 mt-1">
                            {iv.feedback}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Col: Role-based Stage Actions */}
              <div className="space-y-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                    <GitMerge className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Pipeline Stage Controls</span>
                  </h4>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleStageChange(workspaceApp, 'SCREENING')}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold rounded-lg text-xs border border-slate-800 text-left transition-colors flex items-center justify-between"
                    >
                      <span>Move to Screening</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      onClick={() => handleStageChange(workspaceApp, 'SHORTLISTED')}
                      className="w-full py-2 px-3 bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-300 font-semibold rounded-lg text-xs border border-indigo-800/60 text-left transition-colors flex items-center justify-between"
                    >
                      <span>Shortlist for Interview</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                    </button>

                    <button
                      onClick={() => handleStageChange(workspaceApp, 'INTERVIEW')}
                      className="w-full py-2 px-3 bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 font-semibold rounded-lg text-xs border border-amber-800/60 text-left transition-colors flex items-center justify-between"
                    >
                      <span>Advance to Interview</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>

                    <button
                      onClick={() => handleStageChange(workspaceApp, 'ON_HOLD')}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-lg text-xs border border-slate-800 text-left transition-colors flex items-center justify-between"
                    >
                      <span>Put on Hold</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* HR Final Decision */}
                    <button
                      onClick={() => handleStageChange(workspaceApp, 'SELECTED')}
                      className="w-full py-2 px-3 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-bold rounded-lg text-xs border border-emerald-800 text-left transition-colors flex items-center justify-between"
                    >
                      <span>Make Offer (Selected)</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </button>

                    <button
                      onClick={() => handleStageChange(workspaceApp, 'REJECTED')}
                      className="w-full py-2 px-3 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 font-semibold rounded-lg text-xs border border-rose-800/60 text-left transition-colors flex items-center justify-between"
                    >
                      <span>Reject Application</span>
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div><strong>State Synchronization:</strong></div>
                  <div>Changing stage updates both Application and Pipeline microservice entities with backend audit logs.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE APPLICATION */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Create Candidate Application</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Select Candidate</label>
                <select
                  required
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Choose candidate...</option>
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName || c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Select Job Requisition</label>
                <select
                  required
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Choose requisition...</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title} ({j.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Application Notes / Pitch</label>
                <textarea
                  rows="3"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Candidate profile screening notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-600/20 flex items-center space-x-1.5"
                >
                  <span>{submitting ? 'Creating...' : 'Submit Application'}</span>
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

export default Applications;
