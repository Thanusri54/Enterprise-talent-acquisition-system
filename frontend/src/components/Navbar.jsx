import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Bell, 
  User, 
  LogOut, 
  Search, 
  Sparkles, 
  UserCheck, 
  Plus, 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ChevronDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Navbar = () => {
  const { user, logout, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState({ candidates: [], jobs: [], applications: [] });

  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Application', desc: 'Candidate applied for Senior Java Developer', time: '10m ago', unread: true },
    { id: 2, title: 'Interview Scheduled', desc: 'Technical evaluation set for Senior Tech Lead', time: '1h ago', unread: true },
    { id: 3, title: 'Feedback Submitted', desc: 'Interviewer recorded rating 5/5 (SELECT)', time: '3h ago', unread: false },
    { id: 4, title: 'Candidate Shortlisted', desc: 'Application APP-7 moved to Shortlisted stage', time: '5h ago', unread: false },
  ]);

  const searchRef = useRef(null);
  const actionRef = useRef(null);
  const notifRef = useRef(null);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (actionRef.current && !actionRef.current.contains(event.target)) {
        setShowQuickActions(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search handler
  const handleSearchChange = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);

    if (q.trim().length >= 2) {
      setShowSearchDropdown(true);
      try {
        const [candRes, jobRes, appRes] = await Promise.allSettled([
          api.get(`/candidates?query=${encodeURIComponent(q)}`),
          api.get(`/jobs?search=${encodeURIComponent(q)}`),
          api.get('/applications')
        ]);

        const candidates = candRes.status === 'fulfilled' ? (candRes.value.data || []).slice(0, 3) : [];
        const jobs = jobRes.status === 'fulfilled' ? (jobRes.value.data || []).slice(0, 3) : [];
        const allApps = appRes.status === 'fulfilled' ? (appRes.value.data || []) : [];
        const apps = allApps.filter(a => 
          (a.candidateName && a.candidateName.toLowerCase().includes(q.toLowerCase())) ||
          (a.jobTitle && a.jobTitle.toLowerCase().includes(q.toLowerCase())) ||
          String(a.id) === q.replace(/\D/g, '')
        ).slice(0, 3);

        setSearchResults({ candidates, jobs, applications: apps });
      } catch (err) {}
    } else {
      setShowSearchDropdown(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      if (user?.role === 'CANDIDATE') {
        navigate(`/candidate/jobs?search=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/candidates?query=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  const handleRoleSwitch = async (e) => {
    const roleEmailMap = {
      'ADMIN': 'admin@company.com',
      'HR': 'hr@company.com',
      'RECRUITER': 'recruiter@company.com',
      'INTERVIEWER': 'interviewer@company.com',
      'CANDIDATE': 'candidate.portal@test.com'
    };
    const targetEmail = roleEmailMap[e.target.value];
    if (targetEmail) {
      const res = await login(targetEmail, 'password123');
      if (res.success) {
        toast.info(`Switched role to ${e.target.value}`);
        if (e.target.value === 'CANDIDATE') {
          navigate('/candidate/dashboard');
        } else {
          navigate('/');
        }
      }
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    toast.success('All notifications marked as read');
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Global Search Bar */}
      <div className="relative w-72 lg:w-96" ref={searchRef}>
        <form onSubmit={handleSearchSubmit}>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
            placeholder={user?.role === 'CANDIDATE' ? "Search jobs by title or skill..." : "Search candidates, jobs, applications..."}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-500 transition-all"
          />
        </form>

        {/* Live Search Auto-Suggest Popover */}
        {showSearchDropdown && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 space-y-3 animate-in fade-in max-h-96 overflow-y-auto">
            {searchResults.candidates.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">Candidates</div>
                {searchResults.candidates.map(c => (
                  <Link
                    key={c.id}
                    to={`/candidates/${c.id}`}
                    onClick={() => setShowSearchDropdown(false)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-xs transition-colors"
                  >
                    <span className="font-semibold text-slate-200">{c.fullName || c.name}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">{c.title || 'Engineer'}</span>
                  </Link>
                ))}
              </div>
            )}

            {searchResults.jobs.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">Job Requisitions</div>
                {searchResults.jobs.map(j => (
                  <Link
                    key={j.id}
                    to={user?.role === 'CANDIDATE' ? '/candidate/jobs' : `/jobs/${j.id}`}
                    onClick={() => setShowSearchDropdown(false)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-xs transition-colors"
                  >
                    <span className="font-semibold text-slate-200">{j.title}</span>
                    <span className="text-[10px] text-slate-400">{j.department}</span>
                  </Link>
                ))}
              </div>
            )}

            {searchResults.candidates.length === 0 && searchResults.jobs.length === 0 && (
              <div className="p-3 text-center text-xs text-slate-500">
                Press enter to search for <strong className="text-cyan-400">"{searchQuery}"</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* SOA Mesh Health Indicator */}
        <div className="hidden xl:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] text-slate-300 font-medium">SOA Mesh: 7/7 Services UP</span>
        </div>

        {/* Quick Actions Dropdown (Only for staff roles) */}
        {user?.role !== 'CANDIDATE' && (
          <div className="relative" ref={actionRef}>
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-600/20 flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {showQuickActions && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in">
                <Link
                  to="/jobs"
                  onClick={() => setShowQuickActions(false)}
                  className="flex items-center space-x-2.5 p-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  <span>Post Job Requisition</span>
                </Link>
                <Link
                  to="/interviews"
                  onClick={() => setShowQuickActions(false)}
                  className="flex items-center space-x-2.5 p-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Schedule Interview</span>
                </Link>
                <Link
                  to="/candidates"
                  onClick={() => setShowQuickActions(false)}
                  className="flex items-center space-x-2.5 p-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Add Candidate</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Quick Role Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] text-slate-400 hidden lg:inline font-semibold">Active Role:</span>
          <select
            value={user?.role === 'HR_MANAGER' ? 'HR' : (user?.role || 'RECRUITER')}
            onChange={handleRoleSwitch}
            className="bg-transparent text-cyan-300 font-bold text-xs focus:outline-none cursor-pointer"
          >
            <option value="RECRUITER" className="bg-slate-900 text-slate-100">Recruiter</option>
            <option value="HR" className="bg-slate-900 text-slate-100">HR Manager</option>
            <option value="INTERVIEWER" className="bg-slate-900 text-slate-100">Interviewer</option>
            <option value="CANDIDATE" className="bg-slate-900 text-slate-100">Candidate</option>
            <option value="ADMIN" className="bg-slate-900 text-slate-100">Admin</option>
          </select>
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-100">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-cyan-400 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl border text-xs transition-colors ${
                      n.unread ? 'bg-slate-950/80 border-cyan-500/30' : 'bg-slate-950/40 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 text-xs">{n.title}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-cyan-400 hover:underline font-semibold"
                >
                  View full activity history &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Logout */}
        {user && (
          <div className="flex items-center space-x-2 pl-3 border-l border-slate-800">
            <Link
              to={user.role === 'CANDIDATE' ? '/candidate/profile' : '/profile'}
              className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 hover:border-cyan-500 transition-colors"
              title="User Profile"
            >
              <User className="w-4 h-4" />
            </Link>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
