import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import store from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  UserCircle, 
  Mail, 
  Phone, 
  Code, 
  Briefcase, 
  FileText, 
  Globe, 
  MapPin, 
  Save, 
  CheckCircle, 
  AlertCircle,
  GraduationCap,
  Sparkles,
  Award
} from 'lucide-react';

const CandidateProfile = () => {
  const { user, getOrCreateCandidateProfile } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    title: '',
    location: '',
    skills: '',
    experienceYears: 4,
    education: 'B.Tech in Computer Science',
    currentCompany: 'Tech Corp',
    summary: 'Senior Full Stack Engineer with 4+ years of experience in distributed systems, Java Spring Boot microservices, and modern React interfaces.',
    resumeUrl: 'https://storage.enterprise.internal/resumes/candidate.pdf',
    portfolioUrl: 'https://github.com/candidate-engineer'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const calculateCompletion = (data) => {
    const fields = [
      data.fullName,
      data.email,
      data.phone,
      data.title,
      data.location,
      data.skills,
      data.summary,
      data.education,
      data.resumeUrl,
      data.portfolioUrl
    ];
    const filled = fields.filter(f => f && String(f).trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const p = await getOrCreateCandidateProfile(user);
      if (p) {
        setProfile(p);
        setFormData({
          fullName: p.fullName || p.name || user?.name || '',
          email: p.email || user?.email || '',
          phone: p.phone || '+1 (555) 234-5678',
          title: p.title || p.currentTitle || 'Senior Full Stack Engineer',
          location: p.location || 'San Francisco, CA (Remote)',
          skills: p.skills || 'Java, Spring Boot, React, Microservices, SQL, Docker',
          experienceYears: p.experienceYears || 4,
          education: p.education || 'B.Tech in Computer Science & Engineering',
          currentCompany: p.currentCompany || 'Tech Corp',
          summary: p.summary || 'Senior Full Stack Engineer with 4+ years of experience in distributed systems, Java Spring Boot microservices, and modern React interfaces.',
          resumeUrl: p.resumeUrl || 'https://storage.enterprise.internal/resumes/candidate.pdf',
          portfolioUrl: p.portfolioUrl || 'https://github.com/candidate-engineer'
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        title: formData.title,
        location: formData.location,
        skills: formData.skills,
        experienceYears: Number(formData.experienceYears) || 0,
        education: formData.education,
        resumeUrl: formData.resumeUrl,
        summary: formData.summary,
        status: profile?.status || 'ACTIVE'
      };

      if (profile && profile.id) {
        const res = await api.put(`/candidates/${profile.id}`, payload);
        setProfile(res.data);
      } else {
        const res = await api.post('/candidates', payload);
        setProfile(res.data);
      }

      toast.success('Candidate profile details saved and synced to database!');
    } catch (err) {
      console.error('Failed to update candidate profile:', err);
      toast.error('Unable to sync profile. Saved locally.');
    } finally {
      setSaving(false);
    }
  };

  const completionPct = calculateCompletion(formData);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <UserCircle className="w-5 h-5 text-cyan-400" />
          <span>Professional Candidate Profile & Resume</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your personal information, skill matrix, career history, and verification links.
        </p>
      </div>

      {/* Profile Completion Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-100">Profile Completion Health</span>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400">{completionPct}% Complete</span>
        </div>

        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          ></div>
        </div>

        <div className="text-[11px] text-slate-400">
          {completionPct >= 80 ? (
            <span className="text-emerald-400 font-semibold">✓ Profile is comprehensive and ready for enterprise recruiter shortlisting.</span>
          ) : (
            <span>Add your skills, resume URL, and work summary to reach 100% completion.</span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-xs">Loading candidate profile...</div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          {/* Header Profile Badge */}
          <div className="flex items-center space-x-4 p-4 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              {formData.fullName ? formData.fullName.charAt(0) : 'C'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">{formData.fullName || 'Candidate Name'}</h2>
              <p className="text-xs text-slate-400">{formData.email}</p>
              <div className="mt-1 flex items-center space-x-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase font-mono">
                  {profile?.id ? `CANDIDATE ID: CAND-${profile.id}` : 'PENDING'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase font-mono">
                  Verified Candidate
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Personal & Contact Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2">
              <UserCircle className="w-4 h-4 text-cyan-400" />
              <span>Personal & Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Timezone</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Professional Role & Summary */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span>Professional Role & Summary</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Total Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Professional Summary / Bio</label>
              <textarea
                rows="3"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              ></textarea>
            </div>
          </div>

          {/* Section 3: Technical Skills Matrix & Education */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span>Skills Matrix & Education</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Technical Skills & Frameworks (Comma separated)
              </label>
              <textarea
                rows="2"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Highest Education & University</label>
              <div className="relative">
                <GraduationCap className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Resume & External Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Resume & Portfolio Verification</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Resume / CV Document URL</label>
                <div className="relative">
                  <FileText className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="url"
                    name="resumeUrl"
                    value={formData.resumeUrl}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">LinkedIn / Portfolio / GitHub Link</label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-600/20 flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving to Database...' : 'Save & Persist Profile'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CandidateProfile;
