import React, { useState, useEffect } from 'react';
import api from '../services/api';
import store from '../services/store';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { Link } from 'react-router-dom';
import { Briefcase, Search, Plus, MapPin, DollarSign, Building, ExternalLink, Trash2, Edit3, CheckCircle2, Clock, Send, CheckCircle, Users } from 'lucide-react';

const Jobs = () => {
  const { user, getOrCreateCandidateProfile } = useAuth();
  const toast = useToast();
  const role = user?.role || 'ADMIN';
  const [jobs, setJobs] = useState(store.getJobs());
  const [applications, setApplications] = useState(store.getApplications());
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deleteConfirmJob, setDeleteConfirmJob] = useState(null);

  // Candidate Apply Modal State
  const [applyingJob, setApplyingJob] = useState(null);
  const [candidateCoverNote, setCandidateCoverNote] = useState('');
  const [candidateSkills, setCandidateSkills] = useState('Java 17, Spring Boot, Microservices, React');
  const [applyingLoading, setApplyingLoading] = useState(false);

  const hasCandidateApplied = (jobId) => {
    if (!user) return false;
    return applications.some(a => 
      String(a.jobId) === String(jobId) && 
      (a.candidateEmail === user.email || a.candidateName === user.name)
    );
  };

  const handleCandidateApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyingJob || !user) return;

    if (hasCandidateApplied(applyingJob.id)) {
      toast.warning('You have already applied for this job requisition.');
      setApplyingJob(null);
      return;
    }

    setApplyingLoading(true);

    try {
      // 1. Resolve real Candidate Service Record
      const candProfile = await getOrCreateCandidateProfile(user);
      const realCandidateId = candProfile && candProfile.id ? candProfile.id : 1;

      // 2. Prepare Application payload for Backend Application Service
      const appPayload = {
        candidateId: realCandidateId,
        candidateName: candProfile?.fullName || user.name,
        candidateEmail: user.email,
        jobId: Number(applyingJob.id),
        jobTitle: applyingJob.title,
        department: applyingJob.department,
        status: 'APPLIED',
        coverLetter: candidateCoverNote || 'Submitted job application via Candidate Portal.',
        recruiterId: 3,
        recruiterName: 'Lead Recruiter'
      };

      // 3. Send POST /api/applications via API Gateway
      const response = await api.post('/applications', appPayload);
      const returnedApp = response.data;

      // 4. Initialize Pipeline Service at stage APPLIED
      try {
        await api.post('/pipeline', {
          applicationId: returnedApp.id,
          candidateId: realCandidateId,
          candidateName: returnedApp.candidateName || user.name,
          candidateEmail: user.email,
          skills: candidateSkills || candProfile?.skills || 'Java, React, SQL',
          experienceYears: candProfile?.experienceYears || 4,
          jobId: Number(applyingJob.id),
          jobTitle: applyingJob.title,
          currentStage: 'APPLIED',
          assignedRecruiterName: 'Lead Recruiter'
        });
      } catch (pipeErr) {
        console.warn('Pipeline service initialization notice:', pipeErr);
      }

      // 5. Update local store with actual backend application
      store.addApplication(returnedApp);
      store.logActivity(`Candidate ${user.name} applied for ${applyingJob.title} (Status: APPLIED)`, user.name);
      store.logAudit(user.name, 'CANDIDATE', 'CREATE', 'APPLICATION', `APP-${returnedApp.id}`, `Candidate applied for ${applyingJob.title}`);

      toast.success(`Application submitted successfully! Application ID: APP-${returnedApp.id} (Stage: APPLIED)`);
      setApplyingJob(null);
      setApplications(prev => [...prev.filter(a => String(a.id) !== String(returnedApp.id)), returnedApp]);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit application.';
      if (err.response?.status === 409 || msg.toLowerCase().includes('already applied')) {
        toast.warning(msg || 'Candidate has already applied for this job');
      } else {
        toast.error(`Application submission failed: ${msg}`);
      }
    } finally {
      setApplyingLoading(false);
    }
  };

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    jobId: '',
    department: 'Engineering',
    employmentType: 'Full Time',
    workMode: 'Hybrid',
    location: 'Hyderabad',
    minExperience: 3,
    maxExperience: 6,
    minSalary: '12,00,000',
    maxSalary: '18,00,000',
    requiredSkills: 'Java, Spring Boot, Microservices, SQL',
    preferredSkills: 'Docker, Kubernetes, AWS',
    education: 'B.Tech / M.Tech Computer Science',
    openings: 2,
    description: 'Lead technical design and development of core enterprise microservices.',
    responsibilities: 'Architect high-throughput REST APIs, write unit tests, mentor team members.',
    qualifications: '3+ years experience with Java 17, Spring Boot, REST APIs, and SQL.',
    preferredQualifications: 'Cloud deployment experience on AWS/Azure, Docker & Kubernetes.',
    applicationDeadline: '2026-10-30',
    status: 'OPEN'
  });

  const [rawJobs, setRawJobs] = useState([]);

  const fetchJobs = async () => {
    setLoading(true);
    let list = [];
    try {
      const res = await api.get('/jobs');
      if (res.data && res.data.length > 0) {
        list = res.data;
      } else {
        list = store.getJobs();
      }
    } catch (e) {
      list = store.getJobs();
    }
    try {
      const appRes = await api.get('/applications');
      if (appRes.data) setApplications(appRes.data);
    } catch (e) {}
    setRawJobs(list);
    applyJobFilters(list, search, department, statusFilter, workModeFilter);
    setLoading(false);
  };

  const applyJobFilters = (list, q, dept, st, wm) => {
    let filtered = [...list];
    if (q) {
      const term = q.toLowerCase();
      filtered = filtered.filter(j => 
        (j.title && j.title.toLowerCase().includes(term)) || 
        (Array.isArray(j.requiredSkills) ? j.requiredSkills.some(s => s.toLowerCase().includes(term)) : String(j.requiredSkills).toLowerCase().includes(term))
      );
    }
    if (dept) {
      filtered = filtered.filter(j => j.department === dept);
    }
    if (st) {
      filtered = filtered.filter(j => j.status === st);
    }
    if (wm) {
      filtered = filtered.filter(j => j.workMode === wm);
    }
    setJobs(filtered);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyJobFilters(rawJobs, search, department, statusFilter, workModeFilter);
  }, [search, department, statusFilter, workModeFilter, rawJobs]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    try {
      if (editingJob) {
        store.updateJob(editingJob.id, formData);
        await api.put(`/jobs/${editingJob.id}`, formData);
        toast.success(`Job requisition "${formData.title}" updated successfully.`);
      } else {
        store.addJob(formData);
        await api.post('/jobs', formData);
        toast.success(`Job requisition "${formData.title}" created successfully.`);
      }
    } catch (err) {
      toast.error('Failed to persist job requisition to Job Service.');
    }
    setShowAddModal(false);
    setEditingJob(null);
    fetchJobs();
  };

  const handleEditClick = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      jobId: job.jobId || '',
      department: job.department || 'Engineering',
      employmentType: job.employmentType || 'Full Time',
      workMode: job.workMode || 'Hybrid',
      location: job.location || 'Hyderabad',
      minExperience: job.minExperience || 3,
      maxExperience: job.maxExperience || 6,
      minSalary: job.minSalary || '12,00,000',
      maxSalary: job.maxSalary || '18,00,000',
      requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : job.requiredSkills || '',
      preferredSkills: Array.isArray(job.preferredSkills) ? job.preferredSkills.join(', ') : job.preferredSkills || '',
      education: job.education || 'B.Tech Computer Science',
      openings: job.openings || 1,
      description: job.description || '',
      responsibilities: job.responsibilities || '',
      qualifications: job.qualifications || '',
      preferredQualifications: job.preferredQualifications || '',
      applicationDeadline: job.applicationDeadline || '2026-10-30',
      status: job.status || 'OPEN'
    });
    setShowAddModal(true);
  };

  const executeDeleteJob = async (id) => {
    try {
      store.deleteJob(id);
      await api.delete(`/jobs/${id}`);
      toast.success('Job requisition removed successfully.');
    } catch (err) {
      toast.error('Failed to delete job from backend service.');
    }
    fetchJobs();
  };

  const handleCloseJob = async (id) => {
    try {
      store.updateJob(id, { status: 'CLOSED' });
      await api.patch(`/jobs/${id}/status`, { status: 'CLOSED' });
      toast.success('Job requisition marked as CLOSED.');
    } catch (err) {
      toast.error('Failed to close job.');
    }
    fetchJobs();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                <span>Job Requisitions & Openings</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Job Service :8083
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Enterprise talent acquisition requisitions, headcounts, and candidate pipelines</p>
            </div>
          </div>
        </div>
        {role !== 'CANDIDATE' && (
          <button
            onClick={() => {
              setEditingJob(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center space-x-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job Requisition</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search job title, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Data & AI">Data & AI</option>
            <option value="DevOps & SRE">DevOps & SRE</option>
            <option value="Analytics">Analytics</option>
            <option value="Product">Product</option>
          </select>
        </div>

        <div>
          <select
            value={workModeFilter}
            onChange={(e) => setWorkModeFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="">All Work Modes</option>
            <option value="On-site">On-site</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
          </select>
        </div>
      </div>

      {/* Job Grid */}
      {jobs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
          No job requisitions found matching criteria. Click "Post New Job Requisition" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((job) => {
            const jobApps = applications.filter(a => String(a.jobId) === String(job.id));

            return (
              <div key={job.id} className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group hover:shadow-cyan-950/20">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase font-mono">
                        {job.department}
                      </span>
                      <h3 className="text-sm font-bold text-slate-100 mt-2 group-hover:text-cyan-400 transition-colors">
                        {job.title}
                      </h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      job.status === 'OPEN' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800' :
                      job.status === 'DRAFT' ? 'bg-amber-950/50 text-amber-400 border-amber-800' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{job.location} ({job.workMode || 'Hybrid'})</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                      <span>₹{job.minSalary || '10L'} - ₹{job.maxSalary || '18L'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{job.minExperience}-{job.maxExperience} Yrs Exp</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {job.requiredSkills && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {(Array.isArray(job.requiredSkills) ? job.requiredSkills : job.requiredSkills.split(',')).map((sk, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60 font-mono">
                          {sk.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-[11px]">
                    <span className="text-slate-400">Openings: <strong className="text-cyan-400">{job.openings}</strong></span>
                    <span className="text-slate-500">&bull;</span>
                    <span className="text-slate-400 flex items-center space-x-1">
                      <Users className="w-3 h-3 text-slate-500" />
                      <span>Applicants: <strong className="text-indigo-400">{jobApps.length}</strong></span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {role === 'CANDIDATE' ? (
                      hasCandidateApplied(job.id) ? (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center space-x-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Applied</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => setApplyingJob(job)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center space-x-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Apply</span>
                        </button>
                      )
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(job)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800"
                          title="Edit Job"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {job.status === 'OPEN' && (
                          <button
                            onClick={() => handleCloseJob(job.id)}
                            className="text-[10px] font-semibold text-amber-400 hover:underline px-1"
                          >
                            Close
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirmJob(job)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-950/30"
                          title="Delete Job"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <Link
                      to={`/jobs/${job.id}`}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline pl-2 border-l border-slate-800"
                    >
                      <span>Specs</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Apply Modal */}
      {applyingJob && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Send className="w-4 h-4 text-cyan-400" />
              <span>Apply for {applyingJob.title}</span>
            </h3>

            <form onSubmit={handleCandidateApplySubmit} className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 space-y-1">
                <div className="font-bold text-slate-100">{applyingJob.title}</div>
                <div className="text-cyan-400 font-semibold">{applyingJob.department} &bull; {applyingJob.location} ({applyingJob.workMode})</div>
                <div className="text-[10px] text-slate-400">Openings: {applyingJob.openings} &bull; Min Exp: {applyingJob.minExperience} Yrs</div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Applicant Name</label>
                <input type="text" disabled value={user?.name || ''} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-400 font-semibold cursor-not-allowed" />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Applicant Email</label>
                <input type="email" disabled value={user?.email || ''} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-400 font-semibold cursor-not-allowed" />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Key Technical Skills</label>
                <input
                  type="text"
                  required
                  value={candidateSkills}
                  onChange={(e) => setCandidateSkills(e.target.value)}
                  placeholder="Java, Spring Boot, React, SQL..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Cover Note / Introduction</label>
                <textarea
                  rows="3"
                  value={candidateCoverNote}
                  onChange={(e) => setCandidateCoverNote(e.target.value)}
                  placeholder="Briefly state your experience and why you are a great fit..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyingLoading}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-slate-950 font-bold rounded-lg text-xs hover:from-cyan-500 hover:to-blue-500 shadow-md flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{applyingLoading ? 'Submitting...' : 'Submit Application (Stage: APPLIED)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Enterprise Add/Edit Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>{editingJob ? 'Edit Job Requisition' : 'Create Enterprise Job Requisition'}</span>
            </h3>

            <form onSubmit={handleSaveJob} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-300 mb-1">Job Title *</label>
                  <input
                    type="text" required name="title" value={formData.title} onChange={handleInputChange}
                    placeholder="Senior Java Developer" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Department</label>
                  <select
                    name="department" value={formData.department} onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Data & AI">Data & AI</option>
                    <option value="DevOps & SRE">DevOps & SRE</option>
                    <option value="Analytics">Analytics</option>
                    <option value="Product">Product</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Employment Type</label>
                  <select
                    name="employmentType" value={formData.employmentType} onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Work Mode</label>
                  <select
                    name="workMode" value={formData.workMode} onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Location</label>
                  <input
                    type="text" name="location" value={formData.location} onChange={handleInputChange}
                    placeholder="Hyderabad" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Status</label>
                  <select
                    name="status" value={formData.status} onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Min Experience (Yrs)</label>
                  <input
                    type="number" name="minExperience" value={formData.minExperience} onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Max Experience (Yrs)</label>
                  <input
                    type="number" name="maxExperience" value={formData.maxExperience} onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Min Salary (INR)</label>
                  <input
                    type="text" name="minSalary" value={formData.minSalary} onChange={handleInputChange}
                    placeholder="12,00,000" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Max Salary (INR)</label>
                  <input
                    type="text" name="maxSalary" value={formData.maxSalary} onChange={handleInputChange}
                    placeholder="18,00,000" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-300 mb-1">Required Skills (Comma-separated) *</label>
                  <input
                    type="text" required name="requiredSkills" value={formData.requiredSkills} onChange={handleInputChange}
                    placeholder="Java, Spring Boot, REST API, SQL" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Number of Openings</label>
                  <input
                    type="number" min="1" name="openings" value={formData.openings} onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Education Requirements</label>
                <input
                  type="text" name="education" value={formData.education} onChange={handleInputChange}
                  placeholder="B.Tech / M.Tech Computer Science" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Job Description</label>
                <textarea
                  rows="2" name="description" value={formData.description} onChange={handleInputChange}
                  placeholder="Overview of the requisition..." className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Responsibilities</label>
                  <textarea
                    rows="2" name="responsibilities" value={formData.responsibilities} onChange={handleInputChange}
                    placeholder="Key daily responsibilities..." className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  ></textarea>
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Qualifications & Requirements</label>
                  <textarea
                    rows="2" name="qualifications" value={formData.qualifications} onChange={handleInputChange}
                    placeholder="Mandatory qualifications..." className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  ></textarea>
                </div>
              </div>

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
                  {editingJob ? 'Save Changes' : 'Publish Requisition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmJob)}
        onClose={() => setDeleteConfirmJob(null)}
        onConfirm={() => {
          if (deleteConfirmJob) executeDeleteJob(deleteConfirmJob.id);
        }}
        title="Delete Job Requisition"
        message={`Are you sure you want to permanently delete the job requisition "${deleteConfirmJob?.title}"? This action cannot be undone.`}
        confirmText="Delete Requisition"
        confirmVariant="danger"
      />
    </div>
  );
};

export default Jobs;
