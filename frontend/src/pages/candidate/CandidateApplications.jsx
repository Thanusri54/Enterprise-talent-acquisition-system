import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import store from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { 
  FileCheck2, 
  Filter, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  GitMerge, 
  Calendar, 
  XCircle, 
  Layers, 
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const RECRUITMENT_STAGES = ['APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'DECISION'];

const CandidateApplications = () => {
  const { user, getOrCreateCandidateProfile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchCandidateApplications = async () => {
    setLoading(true);
    try {
      const profile = await getOrCreateCandidateProfile(user);
      let appRes;
      if (profile && profile.id) {
        try {
          appRes = await api.get(`/applications/candidate/${profile.id}`);
        } catch (e) {
          appRes = await api.get('/applications');
        }
      } else {
        appRes = await api.get('/applications');
      }

      const allApps = appRes.data || [];
      const myApps = allApps.filter(app => 
        (profile && String(app.candidateId) === String(profile.id)) ||
        app.candidateEmail === user?.email ||
        app.candidateName === user?.name
      );

      setApplications(myApps);
    } catch (err) {
      console.error('Failed to load candidate applications:', err);
      const myApps = store.getApplications().filter(app => 
        app.candidateEmail === user?.email || app.candidateName === user?.name
      );
      setApplications(myApps);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateApplications();
  }, [user]);

  const getStageIndex = (status) => {
    switch (status) {
      case 'APPLIED': return 0;
      case 'SCREENING': return 1;
      case 'SHORTLISTED': return 2;
      case 'INTERVIEW': return 3;
      case 'SELECTED':
      case 'HIRED':
      case 'REJECTED':
      case 'ON_HOLD': return 4;
      default: return 0;
    }
  };

  const filteredApps = applications.filter(app => {
    if (statusFilter && app.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <FileCheck2 className="w-5 h-5 text-cyan-400" />
            <span>My Application Tracker</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time pipeline progression, interview status, and final hiring decisions.
          </p>
        </div>

        <Link
          to="/candidate/jobs"
          className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-600/20 flex items-center space-x-1.5"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Browse More Jobs</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center space-x-3 text-xs">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400 font-semibold">Filter by Stage:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Stages</option>
            <option value="APPLIED">APPLIED</option>
            <option value="SCREENING">SCREENING</option>
            <option value="SHORTLISTED">SHORTLISTED</option>
            <option value="INTERVIEW">INTERVIEW</option>
            <option value="SELECTED">SELECTED / OFFER</option>
            <option value="REJECTED">REJECTED</option>
            <option value="ON_HOLD">ON_HOLD</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Total Submissions: <strong className="text-cyan-400">{filteredApps.length}</strong>
        </div>
      </div>

      {/* Applications Cards with Interactive Stepper */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs">Loading application records...</div>
        ) : filteredApps.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs space-y-3">
            <FileCheck2 className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-slate-300">No applications found</div>
            <p>You have not submitted applications matching the selected criteria.</p>
          </div>
        ) : (
          filteredApps.map((app) => {
            const currentStageIdx = getStageIndex(app.status);
            const isDecision = currentStageIdx === 4;

            return (
              <div
                key={app.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">APP-{app.id}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs font-semibold text-slate-400">{app.department || 'Engineering'}</span>
                    </div>
                    <h2 className="text-base font-bold text-slate-100 mt-1">{app.jobTitle}</h2>
                  </div>

                  <div className="text-right flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                      app.status === 'SELECTED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                      app.status === 'SHORTLISTED' ? 'bg-indigo-950 text-indigo-400 border-indigo-800' :
                      app.status === 'INTERVIEW' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                      app.status === 'REJECTED' ? 'bg-rose-950 text-rose-400 border-rose-800' :
                      'bg-slate-950 text-slate-300 border-slate-800'
                    }`}>
                      Current Status: {app.status}
                    </span>
                  </div>
                </div>

                {/* 5-Stage Visual Progress Stepper */}
                <div className="pt-2">
                  <div className="grid grid-cols-5 gap-2 relative">
                    {RECRUITMENT_STAGES.map((stg, idx) => {
                      const isCompleted = idx < currentStageIdx || (idx === currentStageIdx && isDecision && app.status === 'SELECTED');
                      const isCurrent = idx === currentStageIdx && (!isDecision || app.status !== 'SELECTED');
                      const isRejected = isDecision && app.status === 'REJECTED' && idx === 4;

                      return (
                        <div key={stg} className="text-center space-y-1.5">
                          <div className={`h-1.5 rounded-full transition-all duration-300 ${
                            isRejected ? 'bg-rose-500' :
                            isCompleted ? 'bg-emerald-400' :
                            isCurrent ? 'bg-cyan-400 animate-pulse' :
                            'bg-slate-800'
                          }`}></div>
                          <div className={`text-[10px] font-bold uppercase tracking-wider ${
                            isRejected ? 'text-rose-400' :
                            isCompleted ? 'text-emerald-400' :
                            isCurrent ? 'text-cyan-400 font-extrabold' :
                            'text-slate-500'
                          }`}>
                            {idx === 4 ? (app.status === 'SELECTED' ? 'OFFER / SELECTED' : app.status === 'REJECTED' ? 'REJECTED' : 'DECISION') : stg}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Application Details Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">Submission Date</span>
                    <div className="text-slate-200 font-mono mt-0.5">
                      {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Recent'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">Assigned Recruiter</span>
                    <div className="text-slate-200 mt-0.5">{app.recruiterName || 'Lead Recruiter'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">Next Expected Step</span>
                    <div className="text-cyan-400 font-semibold mt-0.5">
                      {app.status === 'APPLIED' && 'Recruiter Profile Screening'}
                      {app.status === 'SCREENING' && 'Recruiter Shortlisting'}
                      {app.status === 'SHORTLISTED' && 'Technical Evaluation Scheduling'}
                      {app.status === 'INTERVIEW' && 'Evaluator Scorecard Review'}
                      {app.status === 'SELECTED' && 'Offer Finalized (Selected)'}
                      {app.status === 'REJECTED' && 'Application Concluded'}
                      {app.status === 'ON_HOLD' && 'Review on Hold'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CandidateApplications;
