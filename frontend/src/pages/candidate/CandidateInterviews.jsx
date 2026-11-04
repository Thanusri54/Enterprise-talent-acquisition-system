import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import store from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Filter, Clock, UserCheck, Video, CheckCircle, AlertCircle } from 'lucide-react';

const CandidateInterviews = () => {
  const { user, getOrCreateCandidateProfile } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const profile = await getOrCreateCandidateProfile(user);
      const res = await api.get('/interviews');
      const allIntvs = res.data || [];

      const myIntvs = allIntvs.filter(i => 
        (profile && String(i.candidateId) === String(profile.id)) ||
        i.candidateEmail === user?.email ||
        i.candidateName === user?.name
      );

      setInterviews(myIntvs);
    } catch (err) {
      console.error('Failed to load candidate interviews:', err);
      const allIntvs = store.getInterviews();
      const myIntvs = allIntvs.filter(i => 
        i.candidateEmail === user?.email || i.candidateName === user?.name
      );
      setInterviews(myIntvs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [user]);

  const filteredInterviews = interviews.filter(i => {
    if (statusFilter && i.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>My Scheduled Interviews</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">View upcoming interview schedules, interviewers, and evaluation rounds</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3 text-xs">
          <Filter className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400 font-semibold">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Total Scheduled: <strong className="text-amber-400">{filteredInterviews.length}</strong>
        </div>
      </div>

      {/* Interviews Grid / Cards */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs">Loading interview schedules...</div>
      ) : filteredInterviews.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <div>No interview appointments found.</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Once your application is shortlisted by HR, scheduled interviews will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInterviews.map((intv) => (
            <div key={intv.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase">
                      APP-{intv.applicationId || 'REQ'}
                    </span>
                    <h3 className="font-bold text-sm text-slate-100 mt-2">{intv.jobTitle || 'Role Assessment'}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    intv.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                    intv.status === 'CANCELLED' ? 'bg-rose-950 text-rose-400 border-rose-800' :
                    'bg-amber-950 text-amber-400 border-amber-800'
                  }`}>
                    {intv.status || 'SCHEDULED'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      {intv.scheduledTime ? new Date(intv.scheduledTime).toLocaleString() : 'Date & Time Pending'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-300">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Interviewer: <strong>{intv.interviewerName || 'Lead Tech Evaluator'}</strong></span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-300">
                    <Video className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Format: <strong className="text-slate-200">{intv.interviewType || intv.round || 'Technical Round'}</strong></span>
                  </div>
                </div>

                {intv.meetingLink && (
                  <div className="mt-4 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px]">
                    <div className="text-slate-400 font-semibold mb-1">Meeting Link:</div>
                    <a 
                      href={intv.meetingLink} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline break-all"
                    >
                      {intv.meetingLink}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>INTV-{intv.id}</span>
                <span className="text-slate-400">Ensure resume & system check prior to session</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateInterviews;
