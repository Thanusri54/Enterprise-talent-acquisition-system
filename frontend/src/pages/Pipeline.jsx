import React, { useState, useEffect } from 'react';
import api from '../services/api';
import KanbanBoard from '../components/KanbanBoard';
import { useToast } from '../context/ToastContext';
import { GitMerge, Filter, RefreshCw, BarChart2, Search, Users, CheckCircle2, Clock, Sparkles } from 'lucide-react';

const Pipeline = () => {
  const toast = useToast();
  const [kanbanData, setKanbanData] = useState({});
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchKanban = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pipeline/kanban', {
        params: { jobId: selectedJobId || undefined }
      });
      setKanbanData(res.data || {});
    } catch (err) {
      console.error('Failed to load Kanban pipeline:', err);
      toast.error('Failed to load recruitment pipeline data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        setJobs(res.data || []);
      } catch (err) {}
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    fetchKanban();
  }, [selectedJobId]);

  // Compute pipeline stage metrics
  const totalCandidates = Object.values(kanbanData).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0);
  const activeScreening = (kanbanData['SCREENING'] || []).length + (kanbanData['SHORTLISTED'] || []).length;
  const inInterviews = (kanbanData['INTERVIEW'] || []).length;
  const hiredSelected = (kanbanData['SELECTED'] || []).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <GitMerge className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                <span>Talent Pipeline Orchestration</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Real-time SOA
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-stage candidate progression engine synchronized with Application, Pipeline & Interview microservices
              </p>
            </div>
          </div>
        </div>

        {/* Action / Filter Bar */}
        <div className="flex items-center space-x-3 flex-wrap">
          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="w-60">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer transition-colors"
            >
              <option value="">All Requisitions ({jobs.length})</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchKanban}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded-xl border border-slate-800 transition-all shadow-sm"
            title="Refresh Board"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Funnel Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Total Active Talent</div>
            <div className="text-lg font-bold text-slate-100">{totalCandidates} Candidates</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-800/50">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">In Screening & Review</div>
            <div className="text-lg font-bold text-indigo-400">{activeScreening} In Review</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-800/50">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Active Evaluation</div>
            <div className="text-lg font-bold text-amber-400">{inInterviews} Sessions</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Hired / Selected</div>
            <div className="text-lg font-bold text-emerald-400">{hiredSelected} Selected</div>
          </div>
        </div>
      </div>

      {/* Kanban Board Component */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mb-3" />
          <span className="text-xs text-slate-400 font-medium">Synchronizing Pipeline State from Backend Engine...</span>
        </div>
      ) : (
        <KanbanBoard kanbanData={kanbanData} onRefresh={fetchKanban} searchQuery={searchQuery} />
      )}
    </div>
  );
};

export default Pipeline;
