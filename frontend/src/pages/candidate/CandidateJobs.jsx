import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import store from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Send, 
  CheckCircle2, 
  Building, 
  FileText, 
  Filter, 
  AlertCircle, 
  Layers, 
  X, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

const CandidateJobs = () => {
  const { user, getOrCreateCandidateProfile } = useAuth();
  const toast = useToast();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');

  // Modals
  const [viewingJob, setViewingJob] = useState(null);
  const [applyingJob, setApplyingJob] = useState(null);
  const [candidateCoverNote, setCandidateCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const fetchJobsData = async () => {
    setLoading(true);
    try {
      const profile = await getOrCreateCandidateProfile(user);
      const [jobsRes, appsRes] = await Promise.all([
        api.get('/jobs'),
        profile && profile.id ? api.get(`/applications/candidate/${profile.id}`).catch(() => api.get('/applications')) : api.get('/applications')
      ]);

      setJobs(jobsRes.data || []);
      setApplications(appsRes.data || []);
    } catch (err) {
      console.error('Failed to load candidate jobs:', err);
      setJobs(store.getJobs());
      setApplications(store.getApplications());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsData();
  }, [user]);

  const getApplicationForJob = (jobId) => {
    if (!user) return null;
    return applications.find(a => 
      String(a.jobId) === String(jobId) && 
      (a.candidateEmail === user.email || a.candidateName === user.name)
    );
  };

  const handleOpenApplyModal = (job) => {
    const existing = getApplicationForJob(job.id);
    if (existing) {
      setDuplicateWarning(`Already Applied — You have already submitted an application for "${job.title}" (Status: ${existing.status}).`);
      toast.warning(`You have already applied for ${job.title}. Current stage: ${existing.status}`);
      return;
    }
    setDuplicateWarning(null);
    setApplyingJob(job);
    setCandidateCoverNote('');
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyingJob || !user) return;

    setSubmitting(true);
    setDuplicateWarning(null);

    try {
      // 1. Resolve real Candidate Service Candidate Record
      const candProfile = await getOrCreateCandidateProfile(user);
      const realCandidateId = candProfile && candProfile.id ? candProfile.id : 1;

      // 2. Prepare Application payload
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
          skills: candProfile?.skills || 'Java, React, SQL',
          experienceYears: candProfile?.experienceYears || 4,
          jobId: Number(applyingJob.id),
          jobTitle: applyingJob.title,
          currentStage: 'APPLIED',
          assignedRecruiterName: 'Lead Recruiter'
        });
      } catch (pipeErr) {}

      store.addApplication(returnedApp);
      store.logActivity(`Candidate ${user.name} applied for ${applyingJob.title} (Status: APPLIED)`, user.name);

      toast.success(`Application submitted! Application ID: APP-${returnedApp.id}`);
      setApplyingJob(null);
      fetchJobsData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit application.';
      if (err.response?.status === 409 || msg.toLowerCase().includes('already applied')) {
        setDuplicateWarning('Already Applied — You have already submitted an application for this position.');
        toast.warning('Already Applied — You have already submitted an application for this position.');
      } else {
        toast.error(`Application submission error: ${msg}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = job.title?.toLowerCase().includes(q);
      const matchSkills = job.requiredSkills?.toLowerCase().includes(q);
      const matchDesc = job.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchSkills && !matchDesc) return false;
    }
    if (department && job.department !== department) return false;
    if (employmentType && job.employmentType !== employmentType) return false;
    if (workModeFilter && job.location && !job.location.toLowerCase().includes(workModeFilter.toLowerCase())) return false;
    if (experienceLevel && job.experienceLevel !== experienceLevel) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <Briefcase className="w-5 h-5 text-cyan-400" />
          <span>Career Opportunities Marketplace</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore real-time open positions, review requisition specifications, and submit applications directly to recruiters.
        </p>
      </div>

      {/* Duplicate Warning Banner */}
      {duplicateWarning && (
        <div className="p-4 bg-amber-950/40 border border-amber-800 text-amber-300 text-xs rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{duplicateWarning}</span>
          </div>
          <button onClick={() => setDuplicateWarning(null)} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Marketplace Layout: Filters Sidebar + Job Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Filter Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-100 flex items-center space-x-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span>Search Filters</span>
            </span>
            {(search || department || employmentType || workModeFilter || experienceLevel) && (
              <button
                onClick={() => {
                  setSearch('');
                  setDepartment('');
                  setEmploymentType('');
                  setWorkModeFilter('');
                  setExperienceLevel('');
                }}
                className="text-[10px] text-cyan-400 hover:underline font-semibold"
              >
                Reset
              </button>
            )}
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Keywords</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Title, skills, keyword..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Cloud Engineering">Cloud Engineering</option>
              <option value="Data Science">Data Science</option>
              <option value="DevOps">DevOps</option>
            </select>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Employment Type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Types</option>
              <option value="Full Time">Full Time</option>
              <option value="FULL_TIME">Full Time (Permanent)</option>
              <option value="Contract">Contract</option>
              <option value="Part Time">Part Time</option>
            </select>
          </div>

          {/* Work Mode */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Work Mode</label>
            <select
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="">Any Work Mode</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          {/* Total Matching Results Counter */}
          <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400 font-mono">
            Matching Positions: <strong className="text-cyan-400">{filteredJobs.length}</strong>
          </div>
        </div>

        {/* Right Job Cards Grid */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="text-center py-16 text-slate-500 text-xs">Loading open requisitions...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs space-y-2">
              <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-slate-300">No requisitions found</div>
              <p>Try adjusting your search criteria or clear active filters.</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const existingApp = getApplicationForJob(job.id);
              const isApplied = !!existingApp;

              return (
                <div
                  key={job.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase">
                          {job.department || 'Engineering'}
                        </span>
                        {isApplied && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Applied (Stage: {existingApp.status})</span>
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-bold text-slate-100 mt-1.5">{job.title}</h2>
                      <div className="text-xs text-slate-400 font-medium">TalentFlow Enterprise Systems</div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {job.salaryRange || '$120,000 - $150,000'}
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Posted: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Active'}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {job.description || 'Enterprise role responsible for high-performance service orchestration and distributed platform components.'}
                  </p>

                  {/* Badges / Skills */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{job.location || 'Remote'}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
                      {job.employmentType || 'Full Time'}
                    </span>
                    {job.requiredSkills && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-[11px]">
                        Skills: {job.requiredSkills}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => setViewingJob(job)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      View Full Details &rarr;
                    </button>

                    <div>
                      {isApplied ? (
                        <button
                          disabled
                          className="px-4 py-2 bg-slate-800 text-emerald-400 font-semibold rounded-xl text-xs cursor-default border border-emerald-800/40 flex items-center space-x-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Submitted</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenApplyModal(job)}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-600/20 flex items-center space-x-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Apply Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: View Job Details */}
      {viewingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase">
                  {viewingJob.department}
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-1">{viewingJob.title}</h3>
                <div className="text-xs text-slate-400 mt-1">
                  Location: {viewingJob.location} • Type: {viewingJob.employmentType} • Compensation: {viewingJob.salaryRange}
                </div>
              </div>
              <button
                onClick={() => setViewingJob(null)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-1">Description</h4>
                <p className="text-slate-300 leading-relaxed">{viewingJob.description || 'No detailed description provided.'}</p>
              </div>

              {viewingJob.requirements && (
                <div>
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-1">Key Requirements</h4>
                  <p className="text-slate-300 leading-relaxed">{viewingJob.requirements}</p>
                </div>
              )}

              {viewingJob.requiredSkills && (
                <div>
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-1">Required Skills</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {viewingJob.requiredSkills.split(',').map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950 text-cyan-300 border border-slate-800 font-mono text-[11px]">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end space-x-2">
              <button
                onClick={() => setViewingJob(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
              >
                Close
              </button>
              {!getApplicationForJob(viewingJob.id) && (
                <button
                  onClick={() => {
                    const j = viewingJob;
                    setViewingJob(null);
                    handleOpenApplyModal(j);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Apply for this position
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Apply Now */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100">Submit Application</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Requisition: <strong className="text-cyan-400">{applyingJob.title}</strong>
                </p>
              </div>
              <button
                onClick={() => setApplyingJob(null)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Candidate Profile</label>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 space-y-1">
                  <div className="font-bold text-slate-100">{user?.name}</div>
                  <div className="text-[11px] text-slate-400">{user?.email}</div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Cover Note / Pitch for Recruiter
                </label>
                <textarea
                  rows="4"
                  value={candidateCoverNote}
                  onChange={(e) => setCandidateCoverNote(e.target.value)}
                  placeholder="Summarize your relevant project experience, core tech stack, and motivation..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-600/20 flex items-center space-x-1.5"
                >
                  <span>{submitting ? 'Submitting Application...' : 'Confirm Application'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateJobs;
