import React, { useState, useEffect } from 'react';
import store from '../services/store';
import { ShieldCheck, Search, Filter, Download, FileText, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Audit = () => {
  const toast = useToast();
  const [logs, setLogs] = useState(store.getAuditLog());
  const [filterRole, setFilterRole] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let list = store.getAuditLog();
    if (filterRole) {
      list = list.filter(l => l.role === filterRole);
    }
    if (filterAction) {
      list = list.filter(l => l.action === filterAction);
    }
    if (search) {
      list = list.filter(l => 
        (l.user && l.user.toLowerCase().includes(search.toLowerCase())) ||
        (l.details && l.details.toLowerCase().includes(search.toLowerCase())) ||
        (l.entityId && l.entityId.toLowerCase().includes(search.toLowerCase()))
      );
    }
    setLogs(list);
  }, [filterRole, filterAction, search]);

  const handleExportCSV = () => {
    try {
      const headers = ['Timestamp', 'User', 'Role', 'Action', 'Target Entity', 'Entity ID', 'Details'];
      const rows = logs.map(l => [
        `"${l.timestamp || ''}"`,
        `"${l.user || ''}"`,
        `"${l.role || ''}"`,
        `"${l.action || ''}"`,
        `"${l.entity || ''}"`,
        `"${l.entityId || ''}"`,
        `"${(l.details || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `talentflow_audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Audit trail successfully exported to CSV!');
    } catch (err) {
      toast.error('Failed to export audit logs.');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-950/60 text-purple-400 border-purple-800';
      case 'HR':
      case 'HR_MANAGER': return 'bg-blue-950/60 text-blue-400 border-blue-800';
      case 'RECRUITER': return 'bg-emerald-950/60 text-emerald-400 border-emerald-800';
      case 'INTERVIEWER': return 'bg-amber-950/60 text-amber-400 border-amber-800';
      case 'CANDIDATE': return 'bg-cyan-950/60 text-cyan-400 border-cyan-800';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                <span>Enterprise Security & Audit Trail</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Compliance Tier-1
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Immutable audit logging for candidate movements, hiring actions, and role governance</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs transition-all flex items-center space-x-2 self-start md:self-auto shadow-sm"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user, entity ID, or activity details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="w-44">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="HR">HR</option>
            <option value="RECRUITER">RECRUITER</option>
            <option value="INTERVIEWER">INTERVIEWER</option>
            <option value="CANDIDATE">CANDIDATE</option>
          </select>
        </div>

        <div className="w-44">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="MOVE_STAGE">MOVE_STAGE</option>
            <option value="SUBMIT_FEEDBACK">SUBMIT_FEEDBACK</option>
            <option value="LOGIN">LOGIN</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">No audit records found matching criteria.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors font-mono text-[11px]">
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-100 font-sans">{log.user}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getRoleBadge(log.role)}`}>
                        {log.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-cyan-400 font-bold">{log.action}</td>
                    <td className="py-3.5 px-4 text-amber-400 font-bold whitespace-nowrap">{log.entity} ({log.entityId})</td>
                    <td className="py-3.5 px-4 text-slate-300 font-sans">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Audit;
