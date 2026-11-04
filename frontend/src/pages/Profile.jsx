import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import store from '../services/store';
import { UserCircle, Mail, Phone, MapPin, Briefcase, Award, Save, Key, CheckCircle, FileText, Globe } from 'lucide-react';

const Profile = () => {
  const { user, token, getOrCreateCandidateProfile } = useAuth();
  const toast = useToast();
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '+91 98765 43210',
    location: 'Hyderabad',
    title: 'Senior Software Engineer',
    skills: 'Java, Spring Boot, Microservices, React, SQL',
    experienceYears: 4,
    education: 'B.Tech Computer Science',
    resumeUrl: 'https://example.com/resumes/candidate.pdf',
    summary: 'Experienced developer specializing in enterprise backend microservices and modern frontend architectures.'
  });

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.role === 'CANDIDATE') {
        const profile = await getOrCreateCandidateProfile(user);
        if (profile) {
          setCandidateProfile(profile);
          setFormData({
            fullName: profile.fullName || user.name || '',
            email: profile.email || user.email || '',
            phone: profile.phone || '+91 98765 43210',
            location: profile.location || 'Hyderabad',
            title: profile.title || 'Senior Software Engineer',
            skills: profile.skills || 'Java, Spring Boot, Microservices, React, SQL',
            experienceYears: profile.experienceYears || 4,
            education: profile.education || 'B.Tech Computer Science',
            resumeUrl: profile.resumeUrl || 'https://example.com/resumes/candidate.pdf',
            summary: profile.summary || 'Experienced software developer specializing in enterprise microservices and Web applications.'
          });
        }
      }
    } catch (err) {
      console.error('Error loading candidate profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!candidateProfile || !candidateProfile.id) return;
    setSaving(true);
    setSuccessMsg('');

    try {
      const updateData = {
        ...formData,
        fullName: formData.fullName || user?.name,
        email: user?.email
      };

      const res = await api.put(`/candidates/${candidateProfile.id}`, updateData);
      setCandidateProfile(res.data);
      store.updateCandidate(candidateProfile.id, res.data);
      store.logActivity(`Updated Candidate Profile for ${user.name}`, user.name);
      store.logAudit(user.name, 'CANDIDATE', 'UPDATE', 'CANDIDATE', `CAND-${candidateProfile.id}`, 'Updated Candidate Service Profile');

      setSuccessMsg('Candidate Profile successfully saved and synced with Candidate Service!');
      toast.success('Candidate profile successfully saved and synced with Candidate Service!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update candidate profile in Candidate Service.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <UserCircle className="w-5 h-5 text-cyan-400" />
            <span>{user.role === 'CANDIDATE' ? 'Candidate Profile & Resume Management' : 'User Account Details'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {user.role === 'CANDIDATE' 
              ? 'Candidate Service Backend Record (Source of Truth for Recruiters & Hiring Managers)' 
              : 'Authenticated session details & JWT Security Credentials'}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-2xl text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* User Badge */}
        <div className="flex items-center space-x-4 border-b border-slate-800 pb-5">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-2xl">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">{user.name}</h2>
            <p className="text-xs text-cyan-400 font-semibold">{user.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase">
                Role: {user.role}
              </span>
              {candidateProfile && (
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
                  Candidate ID: CAND-{candidateProfile.id}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Candidate Profile Editor Form */}
        {user.role === 'CANDIDATE' && candidateProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span>Candidate Career & Professional Resume Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text" required name="fullName" value={formData.fullName} onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Email Address (Auth Identity)</label>
                <input
                  type="email" disabled value={user.email}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-500 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text" name="phone" value={formData.phone} onChange={handleChange}
                  placeholder="+91 98765 43210" className="w-full bg-slate-800 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Location / City</label>
                <input
                  type="text" name="location" value={formData.location} onChange={handleChange}
                  placeholder="Hyderabad" className="w-full bg-slate-800 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Professional Title</label>
                <input
                  type="text" name="title" value={formData.title} onChange={handleChange}
                  placeholder="Senior Microservices Engineer" className="w-full bg-slate-800 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Total Experience (Years)</label>
                <input
                  type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Highest Qualification / Education</label>
              <input
                type="text" name="education" value={formData.education} onChange={handleChange}
                placeholder="B.Tech Computer Science / M.Tech" className="w-full bg-slate-800 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Primary Technical Skills (Comma-separated)</label>
              <input
                type="text" name="skills" value={formData.skills} onChange={handleChange}
                placeholder="Java, Spring Boot, Microservices, React, SQL..." className="w-full bg-slate-800 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Resume Document URL</label>
              <input
                type="text" name="resumeUrl" value={formData.resumeUrl} onChange={handleChange}
                placeholder="https://drive.google.com/resume.pdf" className="w-full bg-slate-800 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Professional Summary & Bio</label>
              <textarea
                rows="3" name="summary" value={formData.summary} onChange={handleChange}
                placeholder="Key accomplishments and career summary..." className="w-full bg-slate-800 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:border-cyan-500"
              ></textarea>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Candidate Profile...' : 'Save Candidate Profile to Backend'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-4 py-2 text-xs">
            <div>
              <span className="text-slate-500 font-semibold uppercase text-[10px]">Department</span>
              <div className="text-slate-200 font-medium mt-0.5">{user.department}</div>
            </div>
            <div>
              <span className="text-slate-500 font-semibold uppercase text-[10px]">User Account ID</span>
              <div className="text-slate-200 font-mono mt-0.5">USR-{user.id}</div>
            </div>
          </div>
        )}

        {/* Active JWT Token Details */}
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <Key className="w-4 h-4 text-cyan-400" />
            <span>Active Bearer JWT Security Token</span>
          </h3>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-400 break-all select-all">
            {token}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
