import React, { useState, useEffect } from 'react';
import api from '../services/api';
import store from '../services/store';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { Link, useSearchParams } from 'react-router-dom';
import { Users, Search, Plus, Mail, Phone, MapPin, ExternalLink, Trash2, Edit3, CheckCircle2, XCircle, Calendar, Sparkles, Award } from 'lucide-react';

const Candidates = () => {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [rawCandidates, setRawCandidates] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState('');
  const [expFilter, setExpFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [deleteConfirmCand, setDeleteConfirmCand] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    location: 'Hyderabad',
    address: '',
    currentCompany: '',
    currentJobTitle: '',
    totalExperience: 3,
    relevantExperience: 3,
    expectedSalary: '12 LPA',
    noticePeriod: '30 Days',
    highestQualification: 'B.Tech Computer Science',
    university: 'JNTU',
    graduationYear: 2021,
    cgpa: '8.5 CGPA',
    primarySkills: 'Java, Spring Boot, SQL, REST API',
    secondarySkills: 'Docker, Git',
    certifications: 'AWS Certified',
    languages: 'English, Hindi',
    linkedin: '',
    github: '',
    portfolio: '',
    source: 'LinkedIn',
    status: 'NEW'
  });

  const fetchCandidates = async () => {
    setLoading(true);
    let list = [];
    try {
      const res = await api.get('/candidates');
      if (res.data && res.data.length > 0) {
        list = res.data.map(c => ({
          ...c,
          fullName: c.fullName || c.name || 'Candidate',
          currentJobTitle: c.title || 'Software Engineer',
          currentCompany: c.currentCompany || 'Tech Corp',
          totalExperience: c.experienceYears || 3,
          primarySkills: Array.isArray(c.skills) ? c.skills : (c.skills ? c.skills.split(',').map(s => s.trim()) : ['Java', 'SQL']),
          status: c.status || 'NEW'
        }));
      } else {
        list = store.getCandidates();
      }
    } catch (err) {
      list = store.getCandidates();
    }
    setRawCandidates(list);
    applyFilters(list, searchQuery, statusFilter, expFilter);
    setLoading(false);
  };

  const applyFilters = (list, query, status, exp) => {
    let filtered = [...list];
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(c => 
        (c.fullName && c.fullName.toLowerCase().includes(q)) || 
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.currentJobTitle && c.currentJobTitle.toLowerCase().includes(q)) ||
        (Array.isArray(c.primarySkills) ? c.primarySkills.some(s => s.toLowerCase().includes(q)) : String(c.primarySkills).toLowerCase().includes(q))
      );
    }
    if (status) {
      filtered = filtered.filter(c => c.status === status);
    }
    if (exp) {
      const minExp = Number(exp);
      filtered = filtered.filter(c => (c.totalExperience || c.experienceYears || 0) >= minExp);
    }
    setCandidates(filtered);
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    applyFilters(rawCandidates, searchQuery, statusFilter, expFilter);
  }, [searchQuery, statusFilter, expFilter, rawCandidates]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveCandidate = async (e) => {
    e.preventDefault();
    try {
      if (editingCandidate) {
        store.updateCandidate(editingCandidate.id, formData);
        await api.put(`/candidates/${editingCandidate.id}`, {
          ...formData,
          name: formData.fullName,
          skills: Array.isArray(formData.primarySkills) ? formData.primarySkills.join(', ') : formData.primarySkills,
          experienceYears: Number(formData.totalExperience) || 3
        });
        toast.success(`Candidate profile for ${formData.fullName} updated.`);
      } else {
        store.addCandidate(formData);
        await api.post('/candidates', {
          ...formData,
          name: formData.fullName,
          skills: Array.isArray(formData.primarySkills) ? formData.primarySkills.join(', ') : formData.primarySkills,
          experienceYears: Number(formData.totalExperience) || 3
        });
        toast.success(`Candidate profile for ${formData.fullName} created.`);
      }
    } catch (err) {
      toast.error('Failed to save candidate to backend.');
    }
    setShowAddModal(false);
    setEditingCandidate(null);
    fetchCandidates();
  };

  const handleEditClick = (cand) => {
    setEditingCandidate(cand);
    setFormData({
      fullName: cand.fullName || '',
      email: cand.email || '',
      phone: cand.phone || '',
      dob: cand.dob || '',
      gender: cand.gender || 'Male',
      location: cand.location || 'Hyderabad',
      address: cand.address || '',
      currentCompany: cand.currentCompany || '',
      currentJobTitle: cand.currentJobTitle || '',
      totalExperience: cand.totalExperience || 3,
      relevantExperience: cand.relevantExperience || 3,
      expectedSalary: cand.expectedSalary || '12 LPA',
      noticePeriod: cand.noticePeriod || '30 Days',
      highestQualification: cand.highestQualification || 'B.Tech',
      university: cand.university || '',
      graduationYear: cand.graduationYear || 2021,
      cgpa: cand.cgpa || '',
      primarySkills: Array.isArray(cand.primarySkills) ? cand.primarySkills.join(', ') : cand.primarySkills || '',
      secondarySkills: Array.isArray(cand.secondarySkills) ? cand.secondarySkills.join(', ') : cand.secondarySkills || '',
      certifications: Array.isArray(cand.certifications) ? cand.certifications.join(', ') : cand.certifications || '',
      languages: Array.isArray(cand.languages) ? cand.languages.join(', ') : cand.languages || '',
      linkedin: cand.linkedin || '',
      github: cand.github || '',
      portfolio: cand.portfolio || '',
      source: cand.source || 'LinkedIn',
      status: cand.status || 'NEW'
    });
    setShowAddModal(true);
  };

  const executeDeleteCandidate = async (id) => {
    try {
      store.deleteCandidate(id);
      await api.delete(`/candidates/${id}`);
      toast.success('Candidate profile removed successfully.');
    } catch (err) {
      toast.error('Failed to remove candidate profile from backend.');
    }
    fetchCandidates();
  };

  const handleUpdateStatus = async (id, newStatus, candName) => {
    try {
      store.updateCandidate(id, { status: newStatus });
      await api.patch(`/candidates/${id}/status`, { status: newStatus });
      toast.success(`${candName || 'Candidate'} status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status.');
    }
    fetchCandidates();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                <span>Candidate Talent Directory</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Candidate Service :8082
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Enterprise talent pool, resume specifications, and candidate lifecycle management</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingCandidate(null);
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Candidate</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by candidate name, email, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="SCREENING">SCREENING</option>
            <option value="SHORTLISTED">SHORTLISTED</option>
            <option value="INTERVIEW">INTERVIEW</option>
            <option value="SELECTED">SELECTED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="ON_HOLD">ON_HOLD</option>
          </select>
        </div>

        <div>
          <select
            value={expFilter}
            onChange={(e) => setExpFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="">All Experience Levels</option>
            <option value="1">1+ Years Exp</option>
            <option value="3">3+ Years Exp</option>
            <option value="5">5+ Years Exp</option>
          </select>
        </div>
      </div>

      {/* Candidate Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Candidate Profile</th>
                <th className="py-3.5 px-4">Current Company & Title</th>
                <th className="py-3.5 px-4">Skills & Exp</th>
                <th className="py-3.5 px-4">Contact & Location</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading candidate directory...</span>
                    </div>
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">No candidates match current criteria.</td>
                </tr>
              ) : (
                candidates.map((cand) => {
                  const initials = (cand.fullName || 'Candidate')
                    .split(' ')
                    .map(p => p[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={cand.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600/30 to-blue-600/30 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-100">{cand.fullName}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{cand.candidateId || `CAND-${cand.id}`}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-cyan-400">{cand.currentJobTitle || 'Software Engineer'}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{cand.currentCompany || 'Tech Corp'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{cand.totalExperience} Yrs Experience</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5 font-mono">
                          {(Array.isArray(cand.primarySkills) ? cand.primarySkills.join(', ') : cand.primarySkills)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[11px]">
                        <div className="flex items-center space-x-1.5 text-slate-300">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{cand.email}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{cand.location}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                          cand.status === 'SELECTED' || cand.status === 'HIRED' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' :
                          cand.status === 'SHORTLISTED' ? 'bg-indigo-950/60 text-indigo-400 border-indigo-800' :
                          cand.status === 'INTERVIEW' ? 'bg-amber-950/60 text-amber-400 border-amber-800' :
                          cand.status === 'REJECTED' ? 'bg-rose-950/60 text-rose-400 border-rose-800' :
                          'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {cand.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {cand.status !== 'SHORTLISTED' && cand.status !== 'SELECTED' && (
                            <button
                              onClick={() => handleUpdateStatus(cand.id, 'SHORTLISTED', cand.fullName)}
                              className="px-2.5 py-1 bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 rounded-lg text-[10px] font-semibold border border-indigo-800 transition-colors"
                              title="Shortlist Candidate"
                            >
                              Shortlist
                            </button>
                          )}
                          <button
                            onClick={() => handleEditClick(cand)}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800"
                            title="Edit Profile"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmCand(cand)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-950/30"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            to={`/candidates/${cand.id}`}
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-slate-950 rounded-lg text-xs font-semibold transition-colors border border-cyan-500/30"
                          >
                            <span>Dossier</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Enterprise Add/Edit Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>{editingCandidate ? 'Edit Candidate Profile' : 'Add Candidate Profile'}</span>
            </h3>

            <form onSubmit={handleSaveCandidate} className="mt-4 space-y-5 text-xs">
              {/* SECTION 1: PERSONAL INFORMATION */}
              <div>
                <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-2">1. Personal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text" required name="fullName" value={formData.fullName} onChange={handleInputChange}
                      placeholder="Priya Sharma" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email" required name="email" value={formData.email} onChange={handleInputChange}
                      placeholder="priya.sharma@email.com" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Phone Number *</label>
                    <input
                      type="text" required name="phone" value={formData.phone} onChange={handleInputChange}
                      placeholder="9876543210" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Date of Birth</label>
                    <input
                      type="date" name="dob" value={formData.dob} onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Gender</label>
                    <select
                      name="gender" value={formData.gender} onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Current Location</label>
                    <input
                      type="text" name="location" value={formData.location} onChange={handleInputChange}
                      placeholder="Hyderabad" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Recruitment Source</label>
                    <select
                      name="source" value={formData.source} onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                    >
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Referral">Referral</option>
                      <option value="Job Portal">Job Portal</option>
                      <option value="Company Website">Company Website</option>
                      <option value="Campus">Campus</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PROFESSIONAL INFORMATION */}
              <div className="pt-3 border-t border-slate-800">
                <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-2">2. Professional Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Current Job Title</label>
                    <input
                      type="text" name="currentJobTitle" value={formData.currentJobTitle} onChange={handleInputChange}
                      placeholder="Software Engineer" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Current Company</label>
                    <input
                      type="text" name="currentCompany" value={formData.currentCompany} onChange={handleInputChange}
                      placeholder="Tech Solutions Pvt Ltd" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Total Experience (Years)</label>
                    <input
                      type="number" name="totalExperience" value={formData.totalExperience} onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Expected Salary</label>
                    <input
                      type="text" name="expectedSalary" value={formData.expectedSalary} onChange={handleInputChange}
                      placeholder="15 LPA" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Notice Period</label>
                    <input
                      type="text" name="noticePeriod" value={formData.noticePeriod} onChange={handleInputChange}
                      placeholder="30 Days" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Initial Status</label>
                    <select
                      name="status" value={formData.status} onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                    >
                      <option value="NEW">NEW</option>
                      <option value="SCREENING">SCREENING</option>
                      <option value="SHORTLISTED">SHORTLISTED</option>
                      <option value="INTERVIEW">INTERVIEW</option>
                      <option value="SELECTED">SELECTED</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="ON_HOLD">ON_HOLD</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: EDUCATION & SKILLS */}
              <div className="pt-3 border-t border-slate-800">
                <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-2">3. Education & Skills</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Highest Qualification</label>
                    <input
                      type="text" name="highestQualification" value={formData.highestQualification} onChange={handleInputChange}
                      placeholder="B.Tech Computer Science" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">University / College</label>
                    <input
                      type="text" name="university" value={formData.university} onChange={handleInputChange}
                      placeholder="JNTU Hyderabad" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Primary Skills (Comma-separated)</label>
                    <input
                      type="text" name="primarySkills" value={formData.primarySkills} onChange={handleInputChange}
                      placeholder="Java, Spring Boot, REST API, SQL" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER BUTTONS */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-slate-950 font-bold rounded-lg text-xs hover:from-cyan-500 hover:to-blue-500 shadow-md"
                >
                  {editingCandidate ? 'Save Profile Changes' : 'Save Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmCand)}
        onClose={() => setDeleteConfirmCand(null)}
        onConfirm={() => {
          if (deleteConfirmCand) executeDeleteCandidate(deleteConfirmCand.id);
        }}
        title="Delete Candidate Record"
        message={`Are you sure you want to permanently remove candidate "${deleteConfirmCand?.fullName}"? This action cannot be undone.`}
        confirmText="Delete Candidate"
        confirmVariant="danger"
      />
    </div>
  );
};

export default Candidates;
