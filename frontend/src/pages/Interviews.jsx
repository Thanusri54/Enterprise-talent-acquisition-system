import React, { useState, useEffect } from 'react';
import api from '../services/api';
import store from '../services/store';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Calendar, Plus, Video, Star, MessageSquare, Filter, Search, Clock, CheckCircle2, XCircle, User, Award, ShieldAlert } from 'lucide-react';

const Interviews = () => {
  const { user } = useAuth();
  const toast = useToast();
  const role = user?.role || 'ADMIN';
  const [interviews, setInterviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [evaluationInterview, setEvaluationInterview] = useState(null);

  // Schedule Form State
  const [scheduleData, setScheduleData] = useState({
    candidateId: '',
    jobId: '',
    interviewerId: '',
    round: 'Technical Round',
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM',
    mode: 'Online',
    meetingLink: 'https://meet.company.com/interview-room',
    location: 'Google Meet',
    notes: 'Evaluate core technical skills, architecture patterns, and team alignment.'
  });

  // Competency Evaluation Form State (Enterprise 6 Dimensions)
  const [evalData, setEvalData] = useState({
    technicalRating: 5,
    problemSolvingRating: 5,
    systemDesignRating: 4,
    communicationRating: 4,
    teamworkRating: 5,
    leadershipRating: 4,
    recommendation: 'STRONG_HIRE',
    strengths: 'Strong technical grasp, excellent problem solving, clear API design concepts.',
    weaknesses: 'Can elaborate more on cloud infrastructure trade-offs under high scale.',
    detailedFeedback: 'Candidate demonstrated outstanding proficiency in microservices and database design.',
    finalComments: 'Strong recommendation for hire.'
  });

  const fetchInterviewsData = async () => {
    setLoading(true);
    try {
      const [intRes, candRes, jobRes, userRes, appRes] = await Promise.all([
        api.get('/interviews'),
        api.get('/candidates'),
        api.get('/jobs'),
        api.get('/auth/users'),
        api.get('/applications')
      ]);
      setInterviews(intRes.data || []);
      setCandidates(candRes.data || []);
      setJobs(jobRes.data || []);
      setUsers(userRes.data || []);
      setApplications(appRes.data || []);
    } catch (err) {
      console.error('Failed to load interviews data:', err);
      toast.error('Failed to load interviews data from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviewsData();
  }, []);

  const handleScheduleChange = (e) => {
    setScheduleData({ ...scheduleData, [e.target.name]: e.target.value });
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleData.candidateId || !scheduleData.jobId) {
      toast.error('Please select both Candidate and Job Requisition.');
      return;
    }

    const cand = candidates.find(c => String(c.id) === String(scheduleData.candidateId));
    const job = jobs.find(j => String(j.id) === String(scheduleData.jobId));
    const selectedInterviewer = users.find(u => String(u.id) === String(scheduleData.interviewerId));
    const matchingApp = applications.find(a => String(a.candidateId) === String(scheduleData.candidateId));

    try {
      // 1. Post to Interview Service
      const intvRes = await api.post('/interviews', {
        applicationId: matchingApp ? matchingApp.id : 1,
        candidateId: Number(scheduleData.candidateId),
        candidateName: cand ? cand.fullName : 'Candidate',
        jobId: Number(scheduleData.jobId),
        jobTitle: job ? job.title : 'Job Requisition',
        interviewerId: Number(scheduleData.interviewerId || 4),
        interviewerName: selectedInterviewer ? selectedInterviewer.name : 'Senior Tech Lead',
        scheduledTime: `${scheduleData.date}T10:00:00`,
        durationMinutes: 60,
        interviewType: scheduleData.round,
        meetingLink: scheduleData.meetingLink || 'https://meet.company.com/interview-room',
        status: 'SCHEDULED'
      });

      // 2. Update Application & Pipeline status to INTERVIEW in backend
      if (matchingApp) {
        try {
          await api.patch(`/applications/${matchingApp.id}/status`, { status: 'INTERVIEW' });
          const pipeRes = await api.get(`/pipeline/application/${matchingApp.id}`);
          if (pipeRes.data) {
            await api.post(`/pipeline/${pipeRes.data.id}/move`, {
              toStage: 'INTERVIEW',
              forceMove: true,
              movedByName: 'Recruiter',
              comments: `Scheduled ${scheduleData.round} interview with ${selectedInterviewer ? selectedInterviewer.name : 'Interviewer'}`
            });
          }
        } catch (syncErr) {}
      }

      try {
        await api.patch(`/candidates/${scheduleData.candidateId}/status`, { status: 'INTERVIEW' });
      } catch (candErr) {}

      store.logActivity(`Scheduled ${scheduleData.round} for ${cand ? cand.fullName : 'Candidate'} with ${selectedInterviewer ? selectedInterviewer.name : 'Interviewer'}`, 'Recruiter');
      store.logAudit('Recruiter', 'RECRUITER', 'CREATE', 'INTERVIEW', `INT-${intvRes.data.id}`, `Scheduled interview for ${cand ? cand.fullName : 'Candidate'}`);

      toast.success(`Interview successfully scheduled with ${cand ? cand.fullName : 'Candidate'}!`);
      setShowScheduleModal(false);
      fetchInterviewsData();
    } catch (err) {
      console.error('Interview schedule error:', err);
      toast.error(err.response?.data?.message || 'Failed to schedule interview.');
    }
  };

  const handleEvalChange = (e) => {
    setEvalData({ ...evalData, [e.target.name]: e.target.value });
  };

  const handleEvalSubmit = async (e) => {
    e.preventDefault();
    if (!evaluationInterview) return;

    const overall = ((
      Number(evalData.technicalRating) +
      Number(evalData.problemSolvingRating) +
      Number(evalData.systemDesignRating || 5) +
      Number(evalData.communicationRating) +
      Number(evalData.teamworkRating) +
      Number(evalData.leadershipRating)
    ) / 6).toFixed(1);

    const feedbackText = `[${evalData.recommendation}] Score: ${overall}/5. Strengths: ${evalData.strengths}. Notes: ${evalData.detailedFeedback}`;

    try {
      await api.put(`/interviews/${evaluationInterview.id}/feedback`, {
        feedback: feedbackText,
        rating: Math.round(Number(overall)),
        overallRating: Number(overall),
        recommendation: evalData.recommendation,
        strengths: evalData.strengths,
        weaknesses: evalData.weaknesses,
        detailedFeedback: evalData.detailedFeedback,
        status: 'COMPLETED'
      });

      store.logActivity(`${user?.name || 'Interviewer'} submitted interview feedback for ${evaluationInterview.candidateName} (Rating: ${overall}/5 - ${evalData.recommendation})`, user?.name || 'Interviewer');
      store.logAudit(user?.name || 'Interviewer', 'INTERVIEWER', 'SUBMIT_FEEDBACK', 'INTERVIEW', `INT-${evaluationInterview.id}`, `Submitted feedback for ${evaluationInterview.candidateName}`);

      toast.success(`Scorecard evaluation successfully submitted for ${evaluationInterview.candidateName}!`);
      setEvaluationInterview(null);
      fetchInterviewsData();
    } catch (err) {
      console.error('Failed to submit evaluation feedback:', err);
      toast.error('Failed to submit evaluation feedback.');
    }
  };

  const filteredInterviews = interviews.filter(i => {
    if (role === 'CANDIDATE') {
      const currentEmail = user?.email || '';
      const currentName = user?.name || '';
      const matchesCandidate = i.candidateName === currentName || i.candidateEmail === currentEmail;
      if (!matchesCandidate) return false;
    } else if (role === 'INTERVIEWER') {
      const currentName = user?.name || 'Senior Tech Lead';
      const matchesInterviewer = i.interviewerName === currentName || i.interviewerId === user?.id || true;
      if (!matchesInterviewer) return false;
    }

    if (activeTab === 'SCHEDULED' && i.status !== 'SCHEDULED') return false;
    if (activeTab === 'COMPLETED' && i.status !== 'COMPLETED') return false;
    if (activeTab === 'CANCELLED' && i.status !== 'CANCELLED') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = i.candidateName && i.candidateName.toLowerCase().includes(q);
      const matchJob = i.jobTitle && i.jobTitle.toLowerCase().includes(q);
      const matchInterviewer = i.interviewerName && i.interviewerName.toLowerCase().includes(q);
      if (!matchName && !matchJob && !matchInterviewer) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                <span>Evaluation Center & Interview Hub</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Interview Service :8086
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Technical evaluation rounds, calendar scheduling, and structured 6-competency scorecards
              </p>
            </div>
          </div>
        </div>

        {role !== 'INTERVIEWER' && role !== 'CANDIDATE' && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Interview</span>
          </button>
        )}
      </div>

      {/* Filter and View Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full md:w-auto">
          {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'ALL' ? 'All Sessions' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search & Active Counter */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate, job, interviewer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="text-xs text-slate-400 font-mono whitespace-nowrap bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            Sessions: <strong className="text-amber-400">{filteredInterviews.length}</strong>
          </div>
        </div>
      </div>

      {/* Interview Cards List */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-xs flex flex-col items-center justify-center">
          <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
          <span>Loading interview sessions from backend...</span>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
          No interview sessions found matching current filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredInterviews.map((item) => {
            const initials = (item.candidateName || 'Candidate')
              .split(' ')
              .map(p => p[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all hover:shadow-amber-950/20"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600/30 to-orange-600/30 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 uppercase font-mono">
                            {item.interviewType || item.round || 'TECHNICAL'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-100 mt-1">{item.candidateName}</h3>
                        <p className="text-xs text-cyan-400 font-medium">{item.jobTitle}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                      item.status === 'COMPLETED' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700' :
                      item.status === 'SCHEDULED' ? 'bg-amber-950/60 text-amber-400 border-amber-700 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Scheduled Details Box */}
                  <div className="mt-3.5 space-y-2 text-xs text-slate-300 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Date & Time:</span>
                      </span>
                      <span className="font-semibold text-amber-400 font-mono">
                        {item.scheduledTime ? new Date(item.scheduledTime).toLocaleString() : `${item.date || 'Today'} ${item.time || '11:00 AM'}`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>Evaluator / Interviewer:</span>
                      </span>
                      <span className="font-semibold text-cyan-300">{item.interviewerName}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-slate-300">{item.durationMinutes || 60} mins</span>
                    </div>
                  </div>

                  {/* Virtual Meeting Link */}
                  {item.meetingLink && (
                    <div className="mt-3">
                      <a
                        href={item.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-2 text-xs text-amber-400 hover:text-amber-300 hover:underline font-semibold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Launch Virtual Interview Room &rarr;</span>
                      </a>
                    </div>
                  )}

                  {/* Recorded Feedback Card */}
                  {item.feedback && (
                    <div className="mt-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="font-bold text-amber-400 flex items-center space-x-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>Rating: {item.rating || 5} / 5.0</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                          EVALUATED
                        </span>
                      </div>

                      <p className="text-slate-300 italic text-[11px] leading-relaxed">
                        "{item.feedback}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Scorecard Action Button */}
                {item.status === 'SCHEDULED' && role !== 'CANDIDATE' && (
                  <button
                    onClick={() => setEvaluationInterview(item)}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open Competency Scorecard & Submit Evaluation</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Schedule Interview */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Schedule Candidate Interview</span>
            </h3>

            <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Select Candidate *</label>
                <select
                  required name="candidateId" value={scheduleData.candidateId} onChange={handleScheduleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-500"
                >
                  <option value="">-- Choose Candidate --</option>
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.title || c.currentJobTitle || 'Candidate'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Select Job Requisition *</label>
                <select
                  required name="jobId" value={scheduleData.jobId} onChange={handleScheduleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-500"
                >
                  <option value="">-- Choose Job --</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title} ({j.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Assign Interviewer *</label>
                <select
                  required name="interviewerId" value={scheduleData.interviewerId} onChange={handleScheduleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-500"
                >
                  <option value="">-- Choose Interviewer --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role} - {u.department})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Interview Round</label>
                  <select
                    name="round" value={scheduleData.round} onChange={handleScheduleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  >
                    <option value="HR Screening">HR Screening</option>
                    <option value="Technical Round">Technical Round</option>
                    <option value="System Architecture">System Architecture</option>
                    <option value="Managerial & Cultural Fit">Managerial & Cultural Fit</option>
                    <option value="Final Offer Discussion">Final Offer Discussion</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Mode</label>
                  <select
                    name="mode" value={scheduleData.mode} onChange={handleScheduleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  >
                    <option value="Online">Online (Google Meet / Zoom)</option>
                    <option value="Offline">In-Office (Hyderabad HQ)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Date</label>
                  <input
                    type="date" required name="date" value={scheduleData.date} onChange={handleScheduleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Time</label>
                  <input
                    type="text" required name="time" value={scheduleData.time} onChange={handleScheduleChange}
                    placeholder="11:00 AM" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Virtual Meeting Link / Location</label>
                <input
                  type="text" name="meetingLink" value={scheduleData.meetingLink} onChange={handleScheduleChange}
                  placeholder="https://meet.company.com/room-id" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button" onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs hover:from-amber-400 hover:to-amber-500 shadow-md"
                >
                  Confirm & Schedule (Syncs INTERVIEW Stage)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Evaluation Feedback Form */}
      {evaluationInterview && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 pb-3 border-b border-slate-800">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Submit Structured Competency Evaluation Scorecard</span>
            </h3>

            <div className="mt-2 text-xs text-slate-400">
              Candidate: <strong className="text-slate-100">{evaluationInterview.candidateName}</strong> &bull; Requisition: <span className="text-cyan-400 font-semibold">{evaluationInterview.jobTitle}</span>
            </div>

            <form onSubmit={handleEvalSubmit} className="mt-4 space-y-4 text-xs">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Competency Ratings (1 to 5 Stars)</h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Technical Skills</label>
                    <select name="technicalRating" value={evalData.technicalRating} onChange={handleEvalChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-slate-100">
                      {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Star{r>1?'s':''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Problem Solving</label>
                    <select name="problemSolvingRating" value={evalData.problemSolvingRating} onChange={handleEvalChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-slate-100">
                      {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Star{r>1?'s':''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">System Design</label>
                    <select name="systemDesignRating" value={evalData.systemDesignRating || 4} onChange={handleEvalChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-slate-100">
                      {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Star{r>1?'s':''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Communication</label>
                    <select name="communicationRating" value={evalData.communicationRating} onChange={handleEvalChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-slate-100">
                      {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Star{r>1?'s':''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Teamwork & Culture</label>
                    <select name="teamworkRating" value={evalData.teamworkRating} onChange={handleEvalChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-slate-100">
                      {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Star{r>1?'s':''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Leadership</label>
                    <select name="leadershipRating" value={evalData.leadershipRating} onChange={handleEvalChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-slate-100">
                      {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Star{r>1?'s':''}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Final Hiring Recommendation *</label>
                <select name="recommendation" value={evalData.recommendation} onChange={handleEvalChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-bold">
                  <option value="STRONG_HIRE">STRONG HIRE - Exceeds Expectations</option>
                  <option value="HIRE">HIRE - Meets Expectations</option>
                  <option value="HOLD">HOLD - Consider for Other Openings</option>
                  <option value="NO_HIRE">NO HIRE - Below Threshold</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Key Strengths</label>
                <textarea rows="2" name="strengths" value={evalData.strengths} onChange={handleEvalChange} placeholder="Technical strengths..." className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"></textarea>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Areas for Development / Weaknesses</label>
                <textarea rows="2" name="weaknesses" value={evalData.weaknesses} onChange={handleEvalChange} placeholder="Growth opportunities..." className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"></textarea>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Detailed Technical Feedback & Notes *</label>
                <textarea rows="3" required name="detailedFeedback" value={evalData.detailedFeedback} onChange={handleEvalChange} placeholder="Detailed notes for Hiring Committee..." className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button" onClick={() => setEvaluationInterview(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs hover:from-amber-400 hover:to-amber-500 shadow-md"
                >
                  Submit Scorecard to Interview Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interviews;
