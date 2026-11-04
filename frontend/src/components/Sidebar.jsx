import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileCheck2, 
  GitMerge, 
  Calendar,
  BarChart3, 
  ShieldCheck, 
  Layers, 
  LogOut,
  UserCheck,
  Bell,
  Settings,
  Sparkles
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const role = user?.role || 'ADMIN';

  const getRoleBadgeStyle = () => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'HR':
      case 'HR_MANAGER':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'RECRUITER':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'INTERVIEWER':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'CANDIDATE':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getRoleDisplayName = () => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'HR':
      case 'HR_MANAGER': return 'HR Director';
      case 'RECRUITER': return 'Lead Recruiter';
      case 'INTERVIEWER': return 'Technical Evaluator';
      case 'CANDIDATE': return 'Candidate';
      default: return role;
    }
  };

  const getNavSections = () => {
    switch (role) {
      case 'ADMIN':
        return [
          {
            title: 'MAIN WORKSPACE',
            items: [
              { name: 'Executive Dashboard', path: '/', icon: LayoutDashboard },
              { name: 'User Management', path: '/users', icon: UserCheck },
              { name: 'Job Requisitions', path: '/jobs', icon: Briefcase },
            ]
          },
          {
            title: 'TALENT PIPELINE',
            items: [
              { name: 'Candidates Directory', path: '/candidates', icon: Users },
              { name: 'Applications Pool', path: '/applications', icon: FileCheck2 },
              { name: 'Pipeline Orchestration', path: '/pipeline', icon: GitMerge },
              { name: 'Interview Schedules', path: '/interviews', icon: Calendar },
            ]
          },
          {
            title: 'GOVERNANCE & REPORTS',
            items: [
              { name: 'Reports & Analytics', path: '/analytics', icon: BarChart3 },
              { name: 'Audit & Compliance', path: '/audit', icon: ShieldCheck },
              { name: 'System Notifications', path: '/notifications', icon: Bell },
            ]
          }
        ];
      case 'HR':
      case 'HR_MANAGER':
        return [
          {
            title: 'STRATEGIC OVERVIEW',
            items: [
              { name: 'HR Executive Dashboard', path: '/', icon: LayoutDashboard },
              { name: 'Hiring Analytics', path: '/analytics', icon: BarChart3 },
              { name: 'Job Requisitions', path: '/jobs', icon: Briefcase },
            ]
          },
          {
            title: 'RECRUITMENT WORKFLOW',
            items: [
              { name: 'Candidates Directory', path: '/candidates', icon: Users },
              { name: 'Applications Review', path: '/applications', icon: FileCheck2 },
              { name: 'Pipeline Kanban', path: '/pipeline', icon: GitMerge },
              { name: 'Interview Oversight', path: '/interviews', icon: Calendar },
              { name: 'Audit Trail', path: '/audit', icon: ShieldCheck },
            ]
          }
        ];
      case 'RECRUITER':
        return [
          {
            title: 'PIPELINE WORKSPACE',
            items: [
              { name: 'Recruiter Dashboard', path: '/', icon: LayoutDashboard },
              { name: 'My Job Requisitions', path: '/jobs', icon: Briefcase },
              { name: 'Pipeline Kanban', path: '/pipeline', icon: GitMerge },
              { name: 'Applications Tracking', path: '/applications', icon: FileCheck2 },
            ]
          },
          {
            title: 'TALENT ENGAGEMENT',
            items: [
              { name: 'Candidates Directory', path: '/candidates', icon: Users },
              { name: 'Interview Coordination', path: '/interviews', icon: Calendar },
              { name: 'Recruitment Metrics', path: '/analytics', icon: BarChart3 },
            ]
          }
        ];
      case 'INTERVIEWER':
        return [
          {
            title: 'EVALUATION CENTER',
            items: [
              { name: 'Evaluator Dashboard', path: '/', icon: LayoutDashboard },
              { name: 'Assigned Interviews', path: '/interviews', icon: Calendar },
              { name: 'Candidate Dossiers', path: '/candidates', icon: Users },
            ]
          }
        ];
      case 'CANDIDATE':
        return [
          {
            title: 'CAREER PORTAL',
            items: [
              { name: 'Applicant Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
              { name: 'Explore Career Jobs', path: '/candidate/jobs', icon: Briefcase },
              { name: 'My Applications', path: '/candidate/applications', icon: FileCheck2 },
              { name: 'Interview Invitations', path: '/candidate/interviews', icon: Calendar },
              { name: 'Candidate Profile & CV', path: '/candidate/profile', icon: Users },
            ]
          }
        ];
      default:
        return [
          {
            title: 'WORKSPACE',
            items: [
              { name: 'Dashboard', path: '/', icon: LayoutDashboard },
              { name: 'Candidates', path: '/candidates', icon: Users },
              { name: 'Jobs', path: '/jobs', icon: Briefcase },
              { name: 'Applications', path: '/applications', icon: FileCheck2 },
              { name: 'Pipeline', path: '/pipeline', icon: GitMerge },
            ]
          }
        ];
    }
  };

  const navSections = getNavSections();

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-5 border-b border-slate-800/80 space-x-3 bg-slate-950/60 backdrop-blur">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-slate-100 tracking-tight flex items-center space-x-1.5">
              <span>TalentFlow</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold uppercase">
                Pro
              </span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-tight truncate">Enterprise Talent Acquisition</div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-170px)] scrollbar-thin">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/' || item.path === '/candidate/dashboard'}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 border border-cyan-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Footer Profile & Sign Out */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-200 truncate">{user?.name || 'TalentFlow User'}</div>
              <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded border font-semibold uppercase ${getRoleBadgeStyle()}`}>
                {getRoleDisplayName()}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign out of TalentFlow"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
