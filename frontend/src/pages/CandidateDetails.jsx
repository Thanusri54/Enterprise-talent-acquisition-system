import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import store from '../services/store';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, FileText, ArrowLeft, GitMerge, Calendar, ExternalLink, Award, Globe, Plus, CheckCircle2, Star } from 'lucide-react';

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [candidate, setCandidate] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [pipeline, setPipeline] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidateData = async () => {
      setLoading(true);
      try {
        const candRes = await api.get(`/candidates/${id}`);
        if (candRes.data) {
          const c = candRes.data;
          setCandidate({
            ...c,
            fullName: c.fullName || c.name || 'Candidate',
            currentJobTitle: c.title || 'Software Engineer',
            currentCompany: c.currentCompany || 'Tech Corp',
            totalExperience: c.experienceYears || 3,
            primarySkills: Array.isArray(c.skills) ? c.skills : (c.skills ? c.skills.split(',').map(s => s.trim()) : ['Java', 'SQL']),
            status: c.status || 'NEW'
          });
        }
      } catch (err) {
        const local = store.getCandidateById(id);
        if (local) setCandidate(local);
      }

      try {
        const appRes = await api.get(`/applications/candidate/${id}`).catch(() => api.get('/applications'));
        const allApps = appRes.data || [];
        setApplications(allApps.filter(a => String(a.candidateId) === String(id)));
      } catch (e) {
        setApplications(store.getApplications().filter(a => a.candidateId === Number(id)));
      }

      try {
        const intvRes = await api.get('/interviews');
        const allInts = intvRes.data || [];
        setInterviews(allInts.filter(i => String(i.candidateId) === String(id)));
      } catch (e) {
        setInterviews(store.getInterviews().filter(i => i.candidateId === Number(id)));
      }

      try {
        const pipeRes = await api.get('/pipeline');
        const allPipes = pipeRes.data || [];
        setPipeline(allPipes.find(p => String(p.candidateId) === String(id)));
      } catch (e) {}

      setLoading(false);
    };

    fetchCandidateData();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    if (!candidate) return;
    try {
      await api.patch(`/candidates/${candidate.id}/status`, { status: newStatus });
      if (applications.length > 0) {
        for (const app of applications) {
          try {
            await api.patch(`/applications/${app.id}/status`, { status: newStatus });
            const pipeRes = await api.get(`/pipeline/application/${app.id}`);
            if (pipeRes.data) {
              await api.post(`/pipeline/${pipeRes.data.id}/move`, {
                toStage: newStatus,
                forceMove: true,
                movedByName: 'HR / Recruiter',
                comments: `Candidate status updated to ${newStatus}`
              });
            }
          } catch (e) {}
        }
      }
      toast.success(`Candidate status updated to ${newStatus}`);
    } catch (err) {
      console.warn('Backend status update notice:', err);
      toast.error('Failed to update candidate status in backend.');
    }
    store.updateCandidate(candidate.id, { status: newStatus });
    setCandidate(prev => ({ ...prev, status: newStatus }));
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500 text-xs">Loading candidate profile...</div>;
  }

  if (!candidate) {
    return (
      <div className="space-y-4 text-center py-12">
        <div className="text-rose-400 text-sm">Candidate profile not found.</div>
        <Link to="/candidates" className="text-xs text-cyan-400 hover:underline font-semibold">&larr; Back to Directory</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/candidates" className="inline-flex items-center space-x-1 text-xs text-cyan-400 hover:underline font-semibold">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Candidate Directory</span>
      </Link>

      {/* Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 border border-cyan-500/30 text-slate-950 flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-cyan-500/20">
            {candidate.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-100">{candidate.fullName}</h1>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                {candidate.candidateId || `CAND-${candidate.id}`}
              </span>
            </div>
            <p className="text-xs text-cyan-400 font-semibold mt-0.5">{candidate.currentJobTitle} at <span className="text-slate-300">{candidate.currentCompany || 'Tech Corp'}</span></p>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{candidate.email}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{candidate.phone}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{candidate.location}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-lg text-xs font-bold border uppercase ${
            candidate.status === 'SELECTED' || candidate.status === 'HIRED' ? 'bg-green-950/60 text-green-400 border-green-700' :
            candidate.status === 'SHORTLISTED' ? 'bg-indigo-950/60 text-indigo-400 border-indigo-700' :
            candidate.status === 'INTERVIEW' ? 'bg-amber-950/60 text-amber-400 border-amber-700' :
            candidate.status === 'REJECTED' ? 'bg-rose-950/60 text-rose-400 border-rose-700' :
            'bg-slate-800 text-slate-300 border-slate-700'
          }`}>
            {candidate.status}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleUpdateStatus('SHORTLISTED')}
              className="px-3 py-1 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-800"
            >
              Shortlist
            </button>
            <button
              onClick={() => navigate('/interviews')}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs shadow-sm"
            >
              Schedule Interview
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal, Skills, Education */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Candidate Details</h3>

            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Experience & Compensation</div>
              <div className="text-xs font-bold text-slate-200 mt-0.5">{candidate.totalExperience} Years Total ({candidate.relevantExperience || candidate.totalExperience} Yrs Relevant)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Expected: <strong className="text-cyan-400">{candidate.expectedSalary || '15 LPA'}</strong> &bull; Notice: {candidate.noticePeriod || '30 Days'}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Education</div>
              <div className="text-xs text-slate-200 mt-0.5 font-semibold">{candidate.highestQualification}</div>
              <div className="text-[11px] text-slate-400">{candidate.university} ({candidate.graduationYear || '2020'}) &bull; {candidate.cgpa || ''}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Primary Skills</div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(Array.isArray(candidate.primarySkills) ? candidate.primarySkills : (candidate.primarySkills || '').split(',')).map((sk, i) => (
                  <span key={i} className="text-[10px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded border border-slate-700">
                    {sk.trim()}
                  </span>
                ))}
              </div>
            </div>

            {candidate.certifications && (
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Certifications</div>
                <div className="text-xs text-slate-300 mt-1">
                  {(Array.isArray(candidate.certifications) ? candidate.certifications.join(', ') : candidate.certifications)}
                </div>
              </div>
            )}

            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Social & Portfolio</div>
              <div className="flex flex-col space-y-1 mt-2 text-xs">
                {candidate.linkedin && (
                  <a href={candidate.linkedin} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline truncate">
                    LinkedIn Profile &rarr;
                  </a>
                )}
                {candidate.github && (
                  <a href={candidate.github} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline truncate">
                    GitHub Profile &rarr;
                  </a>
                )}
              </div>
            </div>

            <a
              href={candidate.resumeUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className="mt-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border border-slate-700"
            >
              <FileText className="w-4 h-4" />
              <span>Download Candidate Resume</span>
            </a>
          </div>
        </div>

        {/* Right Column: Work Experience, Applications, Interview History, Pipeline Journey */}
        <div className="lg:col-span-2 space-y-6">
          {/* Work Experience */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span>Professional Experience History</span>
            </h3>

            {(!candidate.experiences || candidate.experiences.length === 0) ? (
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300">
                <div className="font-bold text-slate-100">{candidate.currentJobTitle}</div>
                <div className="text-[11px] text-cyan-400">{candidate.currentCompany} &bull; 2021 - Present</div>
                <p className="text-slate-400 mt-2">Specialized in enterprise application development, microservices architecture, and API integration.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {candidate.experiences.map((exp, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="font-bold text-slate-100 text-xs">{exp.designation}</div>
                    <div className="text-[11px] text-cyan-400">{exp.company} &bull; {exp.startDate} - {exp.endDate}</div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Job Applications */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Job Requisition Applications ({applications.length})</span>
            </h3>

            {applications.length === 0 ? (
              <div className="text-xs text-slate-500 py-4">No active applications.</div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{app.jobTitle}</h4>
                      <p className="text-[10px] text-cyan-400">Department: {app.department} &bull; Applied: {app.appliedDate}</p>
                    </div>

                    <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interview History & Ratings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Interviews & Evaluation Feedback ({interviews.length})</span>
            </h3>

            {interviews.length === 0 ? (
              <div className="text-xs text-slate-500 py-4">No interview records scheduled.</div>
            ) : (
              <div className="space-y-3">
                {interviews.map((intv) => (
                  <div key={intv.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-slate-100">{intv.round} - {intv.jobTitle}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Interviewer: <strong className="text-cyan-400">{intv.interviewerName}</strong> &bull; {intv.date} {intv.time}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${intv.status === 'COMPLETED' ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                        {intv.status}
                      </span>
                    </div>

                    {intv.feedback && (
                      <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                          <span className="font-bold text-amber-400 flex items-center space-x-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>Score: {intv.rating || intv.feedback?.overallRating || 5} / 5.0</span>
                          </span>
                          <span className="font-bold text-cyan-400 uppercase">
                            {intv.feedback?.recommendation ? `Rec: ${intv.feedback.recommendation}` : 'COMPLETED'}
                          </span>
                        </div>
                        <div className="text-slate-300 mt-1 italic">
                          "{typeof intv.feedback === 'string' ? intv.feedback : (intv.feedback.detailedFeedback || intv.feedback.strengths || JSON.stringify(intv.feedback))}"
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetails;
