import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Briefcase, MapPin, DollarSign, ArrowLeft, Users, FileCheck2, ExternalLink, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const jobRes = await api.get(`/jobs/${id}`);
        setJob(jobRes.data);

        const appRes = await api.get(`/applications/job/${id}`);
        setApplications(appRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobData();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-xs">
      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3"></div>
      <span>Loading job specification details...</span>
    </div>
  );

  if (!job) return (
    <div className="text-center py-16 space-y-3">
      <div className="text-rose-400 text-sm font-semibold">Job requisition not found.</div>
      <Link to="/jobs" className="text-xs text-cyan-400 hover:underline inline-block">&larr; Return to Requisitions</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <Link to="/jobs" className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:underline font-semibold">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Requisitions Directory</span>
      </Link>

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase font-mono">
              {job.department}
            </span>
            <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              REQ-{job.id}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-100 mt-2">{job.title}</h1>

          <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{job.location} ({job.workMode || 'Hybrid'})</span>
            </span>
            <span className="flex items-center space-x-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-500" />
              <span>₹{job.minSalary || '12L'} - ₹{job.maxSalary || '18L'}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{job.minExperience}-{job.maxExperience} Yrs Exp</span>
            </span>
            <span>Employment: <strong className="text-slate-200">{job.employmentType}</strong></span>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
            job.status === 'OPEN' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700' : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            Status: {job.status}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Openings: <strong className="text-cyan-400">{job.openings}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Requisition Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Role Overview & Objective</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{job.description || 'No overview provided.'}</p>
            </div>

            {job.responsibilities && (
              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Core Responsibilities</h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
              </div>
            )}

            {job.qualifications && (
              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Required Qualifications</h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{job.qualifications}</p>
              </div>
            )}

            {job.requiredSkills && (
              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2.5">Required Technical Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(job.requiredSkills) ? job.requiredSkills : job.requiredSkills.split(',')).map((sk, i) => (
                    <span key={i} className="text-xs bg-slate-800 text-cyan-300 px-3 py-1 rounded-xl border border-slate-700 font-mono font-medium">
                      {sk.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Applicants */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Applicants for Requisition ({applications.length})</span>
              <Link to="/pipeline" className="text-cyan-400 text-[11px] hover:underline flex items-center space-x-1">
                <span>Pipeline Board &rarr;</span>
              </Link>
            </h3>

            {applications.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-800 rounded-xl">
                No candidates have applied for this position yet.
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-slate-100">{app.candidateName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{app.candidateEmail}</div>
                      <div className="text-[10px] text-cyan-400 mt-1 font-mono font-semibold">Stage: {app.status}</div>
                    </div>
                    <Link
                      to={`/candidates/${app.candidateId}`}
                      className="p-2 bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-slate-950 rounded-xl transition-colors border border-slate-700/60"
                      title="View Candidate Dossier"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
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

export default JobDetails;
