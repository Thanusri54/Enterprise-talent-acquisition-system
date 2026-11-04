// Central Store for Enterprise Talent Acquisition Platform
// Synchronizes backend REST APIs (API Gateway http://localhost:8080/api) as the authoritative source of truth
// Provides safe, resilient data access and logging across all roles & pages

import api from './api';

const INITIAL_JOBS = [
  {
    id: 1,
    jobId: 'JOB-1001',
    title: 'Senior Java Microservices Engineer',
    department: 'Engineering',
    employmentType: 'Full Time',
    workMode: 'Hybrid',
    location: 'Hyderabad',
    minExperience: 4,
    maxExperience: 8,
    minSalary: '16,00,000',
    maxSalary: '24,00,000',
    requiredSkills: ['Java 17', 'Spring Boot', 'Spring Cloud', 'Kafka', 'PostgreSQL'],
    preferredSkills: ['Docker', 'Kubernetes', 'AWS'],
    openings: 3,
    description: 'Design and build high-throughput microservices for enterprise talent orchestration platform.',
    status: 'OPEN'
  },
  {
    id: 2,
    jobId: 'JOB-1002',
    title: 'Lead Cloud Infrastructure Architect',
    department: 'DevOps & SRE',
    employmentType: 'Full Time',
    workMode: 'Remote',
    location: 'Bangalore',
    minExperience: 8,
    maxExperience: 14,
    minSalary: '28,00,000',
    maxSalary: '40,00,000',
    requiredSkills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Prometheus'],
    preferredSkills: ['Spring Cloud Gateway', 'Eureka'],
    openings: 2,
    description: 'Lead multi-region cloud deployment architecture, automated pipelines, and Kubernetes service meshes.',
    status: 'OPEN'
  },
  {
    id: 3,
    jobId: 'JOB-1003',
    title: 'Full Stack React & Node Developer',
    department: 'Engineering',
    employmentType: 'Full Time',
    workMode: 'Hybrid',
    location: 'Hyderabad',
    minExperience: 3,
    maxExperience: 6,
    minSalary: '12,00,000',
    maxSalary: '18,00,000',
    requiredSkills: ['React 18', 'JavaScript', 'Tailwind CSS', 'REST APIs', 'Node.js'],
    preferredSkills: ['TypeScript', 'Vite'],
    openings: 4,
    description: 'Build enterprise recruitment dashboards, candidate Kanban pipeline, and interactive analytics views.',
    status: 'OPEN'
  },
  {
    id: 4,
    jobId: 'JOB-1004',
    title: 'Principal Data Engineer & AI Specialist',
    department: 'Data & AI',
    employmentType: 'Full Time',
    workMode: 'Remote',
    location: 'Pune',
    minExperience: 6,
    maxExperience: 10,
    minSalary: '22,00,000',
    maxSalary: '32,00,000',
    requiredSkills: ['Python', 'PySpark', 'Snowflake', 'Airflow', 'SQL'],
    preferredSkills: ['MLflow', 'FastAPI'],
    openings: 2,
    description: 'Architect candidate resume parsing pipelines and automated talent matching algorithms.',
    status: 'OPEN'
  }
];

const INITIAL_CANDIDATES = [
  {
    id: 1,
    candidateId: 'CAND-5001',
    fullName: 'Arjun Rao',
    email: 'arjun.rao@techmail.com',
    phone: '+91 98765 43210',
    location: 'Hyderabad',
    currentCompany: 'Enterprise Systems Ltd',
    currentJobTitle: 'Senior Software Engineer',
    totalExperience: 6,
    relevantExperience: 5,
    expectedSalary: '20 LPA',
    noticePeriod: '30 Days',
    highestQualification: 'M.Tech Computer Science',
    university: 'IIT Hyderabad',
    graduationYear: 2019,
    primarySkills: ['Java', 'Spring Boot', 'Microservices', 'Kubernetes', 'PostgreSQL'],
    secondarySkills: ['Docker', 'Kafka'],
    status: 'SHORTLISTED'
  },
  {
    id: 2,
    candidateId: 'CAND-5002',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@cloudnet.io',
    phone: '+91 91234 56789',
    location: 'Bangalore',
    currentCompany: 'CloudScale Technologies',
    currentJobTitle: 'DevOps & SRE Specialist',
    totalExperience: 7,
    relevantExperience: 6,
    expectedSalary: '26 LPA',
    noticePeriod: '15 Days',
    highestQualification: 'B.Tech Information Technology',
    university: 'NIT Trichy',
    graduationYear: 2018,
    primarySkills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'Jenkins'],
    secondarySkills: ['Python', 'Prometheus'],
    status: 'INTERVIEW'
  },
  {
    id: 3,
    candidateId: 'CAND-5003',
    fullName: 'Rahul Kumar',
    email: 'rahul.k@webdevs.org',
    phone: '+91 99887 76655',
    location: 'Hyderabad',
    currentCompany: 'Digital Solutions Inc',
    currentJobTitle: 'Frontend Engineer',
    totalExperience: 4,
    relevantExperience: 4,
    expectedSalary: '15 LPA',
    noticePeriod: 'Immediate',
    highestQualification: 'B.Tech Computer Science',
    university: 'JNTU Hyderabad',
    graduationYear: 2021,
    primarySkills: ['React', 'JavaScript', 'Tailwind CSS', 'Redux', 'REST APIs'],
    secondarySkills: ['TypeScript', 'Git'],
    status: 'SCREENING'
  },
  {
    id: 4,
    candidateId: 'CAND-5004',
    fullName: 'Kiran Patel',
    email: 'kiran.patel@analytics.co',
    phone: '+91 97766 55443',
    location: 'Pune',
    currentCompany: 'DataTech Labs',
    currentJobTitle: 'Data Engineer',
    totalExperience: 5,
    relevantExperience: 5,
    expectedSalary: '22 LPA',
    noticePeriod: '45 Days',
    highestQualification: 'B.E. Computer Engineering',
    university: 'Pune University',
    graduationYear: 2020,
    primarySkills: ['Python', 'PySpark', 'SQL', 'Airflow', 'AWS S3'],
    secondarySkills: ['Snowflake', 'Docker'],
    status: 'APPLIED'
  }
];

const INITIAL_APPLICATIONS = [
  {
    id: 1,
    applicationId: 'APP-9001',
    candidateId: 1,
    candidateName: 'Arjun Rao',
    candidateEmail: 'arjun.rao@techmail.com',
    jobId: 1,
    jobTitle: 'Senior Java Microservices Engineer',
    department: 'Engineering',
    appliedDate: '2026-09-10',
    status: 'SHORTLISTED',
    recruiterId: 3,
    recruiterName: 'Lead Recruiter',
    coverLetter: 'Applying for Senior Java Engineer position. 6 years experience in microservices.',
    matchScore: 92
  },
  {
    id: 2,
    applicationId: 'APP-9002',
    candidateId: 2,
    candidateName: 'Priya Sharma',
    candidateEmail: 'priya.sharma@cloudnet.io',
    jobId: 2,
    jobTitle: 'Lead Cloud Infrastructure Architect',
    department: 'DevOps & SRE',
    appliedDate: '2026-09-12',
    status: 'INTERVIEW',
    recruiterId: 3,
    recruiterName: 'Lead Recruiter',
    coverLetter: 'Cloud architect with 7 years hands-on AWS & Kubernetes experience.',
    matchScore: 95
  },
  {
    id: 3,
    applicationId: 'APP-9003',
    candidateId: 3,
    candidateName: 'Rahul Kumar',
    candidateEmail: 'rahul.k@webdevs.org',
    jobId: 3,
    jobTitle: 'Full Stack React & Node Developer',
    department: 'Engineering',
    appliedDate: '2026-09-14',
    status: 'SCREENING',
    recruiterId: 3,
    recruiterName: 'Lead Recruiter',
    coverLetter: 'Passionate React developer with proven modern frontend achievements.',
    matchScore: 88
  },
  {
    id: 4,
    applicationId: 'APP-9004',
    candidateId: 4,
    candidateName: 'Kiran Patel',
    candidateEmail: 'kiran.patel@analytics.co',
    jobId: 4,
    jobTitle: 'Principal Data Engineer & AI Specialist',
    department: 'Data & AI',
    appliedDate: '2026-09-15',
    status: 'APPLIED',
    recruiterId: 3,
    recruiterName: 'Lead Recruiter',
    coverLetter: 'Data engineer specializing in PySpark data pipelines.',
    matchScore: 85
  }
];

const INITIAL_PIPELINE = [
  {
    id: 1,
    applicationId: 1,
    candidateId: 1,
    candidateName: 'Arjun Rao',
    candidateEmail: 'arjun.rao@techmail.com',
    jobId: 1,
    jobTitle: 'Senior Java Microservices Engineer',
    currentStage: 'SHORTLISTED',
    stage: 'SHORTLISTED',
    skills: 'Java, Spring Boot, Microservices, Kubernetes',
    experienceYears: 6,
    assignedRecruiterName: 'Lead Recruiter'
  },
  {
    id: 2,
    applicationId: 2,
    candidateId: 2,
    candidateName: 'Priya Sharma',
    candidateEmail: 'priya.sharma@cloudnet.io',
    jobId: 2,
    jobTitle: 'Lead Cloud Infrastructure Architect',
    currentStage: 'INTERVIEW',
    stage: 'INTERVIEW',
    skills: 'AWS, Kubernetes, Terraform, Docker',
    experienceYears: 7,
    assignedRecruiterName: 'Lead Recruiter'
  },
  {
    id: 3,
    applicationId: 3,
    candidateId: 3,
    candidateName: 'Rahul Kumar',
    candidateEmail: 'rahul.k@webdevs.org',
    jobId: 3,
    jobTitle: 'Full Stack React & Node Developer',
    currentStage: 'SCREENING',
    stage: 'SCREENING',
    skills: 'React, JavaScript, Tailwind CSS, Redux',
    experienceYears: 4,
    assignedRecruiterName: 'Lead Recruiter'
  },
  {
    id: 4,
    applicationId: 4,
    candidateId: 4,
    candidateName: 'Kiran Patel',
    candidateEmail: 'kiran.patel@analytics.co',
    jobId: 4,
    jobTitle: 'Principal Data Engineer & AI Specialist',
    currentStage: 'APPLIED',
    stage: 'APPLIED',
    skills: 'Python, PySpark, SQL, Airflow',
    experienceYears: 5,
    assignedRecruiterName: 'Lead Recruiter'
  }
];

const INITIAL_INTERVIEWS = [
  {
    id: 1,
    applicationId: 2,
    candidateId: 2,
    candidateName: 'Priya Sharma',
    jobId: 2,
    jobTitle: 'Lead Cloud Infrastructure Architect',
    interviewerId: 4,
    interviewerName: 'Dr. Sarah Jenkins',
    round: 'Technical Architecture Round',
    date: '2026-09-22',
    time: '02:00 PM',
    scheduledTime: '2026-09-22T14:00:00',
    durationMinutes: 60,
    interviewType: 'Technical Architecture',
    meetingLink: 'https://meet.company.com/tech-panel-room',
    status: 'SCHEDULED'
  }
];

const INITIAL_USERS = [
  { id: 1, name: 'System Administrator', email: 'admin@company.com', role: 'ADMIN', department: 'Executive Governance', status: 'ACTIVE' },
  { id: 2, name: 'HR Manager', email: 'hr@company.com', role: 'HR', department: 'Human Resources', status: 'ACTIVE' },
  { id: 3, name: 'Lead Recruiter', email: 'recruiter@company.com', role: 'RECRUITER', department: 'Talent Acquisition', status: 'ACTIVE' },
  { id: 4, name: 'Dr. Sarah Jenkins', email: 'interviewer@company.com', role: 'INTERVIEWER', department: 'Engineering Architecture', status: 'ACTIVE' }
];

const INITIAL_ACTIVITIES = [
  { id: 1, action: 'Technical interview scheduled for Priya Sharma with Dr. Sarah Jenkins', user: 'Lead Recruiter', date: '2026-09-20 14:30' },
  { id: 2, action: 'Arjun Rao moved from Screening to Shortlisted for Senior Java Engineer', user: 'Lead Recruiter', date: '2026-09-19 11:15' },
  { id: 3, action: 'Rahul Kumar moved from Applied to Screening', user: 'Lead Recruiter', date: '2026-09-18 16:40' },
  { id: 4, action: 'New job requisition published: Lead Cloud Infrastructure Architect', user: 'HR Manager', date: '2026-09-12 10:00' }
];

const INITIAL_AUDITS = [
  { id: 1, user: 'HR Manager', role: 'HR', action: 'CREATE', entity: 'JOB', entityId: 'JOB-1002', details: 'Published Lead Cloud Architecture job requisition', timestamp: '2026-09-12 10:00' },
  { id: 2, user: 'Lead Recruiter', role: 'RECRUITER', action: 'CREATE', entity: 'APPLICATION', entityId: 'APP-9002', details: 'Created job application for Priya Sharma', timestamp: '2026-09-12 11:30' },
  { id: 3, user: 'Lead Recruiter', role: 'RECRUITER', action: 'CREATE', entity: 'INTERVIEW', entityId: 'INT-1', details: 'Scheduled Technical Interview for Priya Sharma', timestamp: '2026-09-20 14:30' }
];

const getStored = (key, initial) => {
  try {
    const saved = localStorage.getItem(`talent_engine_${key}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return initial;
};

const setStored = (key, data) => {
  try {
    localStorage.setItem(`talent_engine_${key}`, JSON.stringify(data));
  } catch (e) {}
};

class Store {
  constructor() {
    this.jobs = getStored('jobs', INITIAL_JOBS);
    this.candidates = getStored('candidates', INITIAL_CANDIDATES);
    this.applications = getStored('applications', INITIAL_APPLICATIONS);
    this.pipeline = getStored('pipeline', INITIAL_PIPELINE);
    this.interviews = getStored('interviews', INITIAL_INTERVIEWS);
    this.users = getStored('users', INITIAL_USERS);
    this.activities = getStored('activities', INITIAL_ACTIVITIES);
    this.audits = getStored('audits', INITIAL_AUDITS);
  }

  // --- JOBS ---
  getJobs() {
    return this.jobs || [];
  }
  getJobById(id) {
    return (this.jobs || []).find(j => String(j.id) === String(id));
  }
  addJob(data) {
    const newJob = {
      id: Date.now(),
      jobId: `JOB-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'OPEN',
      ...data
    };
    this.jobs.unshift(newJob);
    setStored('jobs', this.jobs);
    return newJob;
  }
  updateJob(id, updates) {
    this.jobs = (this.jobs || []).map(j => String(j.id) === String(id) ? { ...j, ...updates } : j);
    setStored('jobs', this.jobs);
  }
  deleteJob(id) {
    this.jobs = (this.jobs || []).filter(j => String(j.id) !== String(id));
    setStored('jobs', this.jobs);
  }

  // --- CANDIDATES ---
  getCandidates() {
    return this.candidates || [];
  }
  getCandidateById(id) {
    return (this.candidates || []).find(c => String(c.id) === String(id));
  }
  addCandidate(data) {
    const newCand = {
      id: Date.now(),
      candidateId: `CAND-${Math.floor(5000 + Math.random() * 9000)}`,
      status: 'NEW',
      ...data
    };
    this.candidates.unshift(newCand);
    setStored('candidates', this.candidates);
    return newCand;
  }
  updateCandidate(id, updates) {
    this.candidates = (this.candidates || []).map(c => String(c.id) === String(id) ? { ...c, ...updates } : c);
    setStored('candidates', this.candidates);
  }
  deleteCandidate(id) {
    this.candidates = (this.candidates || []).filter(c => String(c.id) !== String(id));
    setStored('candidates', this.candidates);
  }

  // --- APPLICATIONS ---
  getApplications() {
    return this.applications || [];
  }
  getApplicationById(id) {
    return (this.applications || []).find(a => String(a.id) === String(id));
  }
  addApplication(data) {
    const newApp = {
      id: Date.now(),
      applicationId: `APP-${Math.floor(9000 + Math.random() * 9000)}`,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'APPLIED',
      ...data
    };
    this.applications.unshift(newApp);
    setStored('applications', this.applications);
    return newApp;
  }
  updateApplicationStatus(id, status) {
    this.applications = (this.applications || []).map(a => String(a.id) === String(id) ? { ...a, status } : a);
    setStored('applications', this.applications);
  }

  // --- PIPELINE ---
  getPipeline() {
    return this.pipeline || [];
  }
  movePipelineStage(id, targetStage, notes) {
    this.pipeline = (this.pipeline || []).map(p => {
      if (String(p.id) === String(id)) {
        return { ...p, currentStage: targetStage, stage: targetStage };
      }
      return p;
    });
    setStored('pipeline', this.pipeline);
  }

  // --- INTERVIEWS ---
  getInterviews() {
    return this.interviews || [];
  }
  getInterviewById(id) {
    return (this.interviews || []).find(i => String(i.id) === String(id));
  }
  addInterview(data) {
    const newIntv = {
      id: Date.now(),
      status: 'SCHEDULED',
      ...data
    };
    this.interviews.unshift(newIntv);
    setStored('interviews', this.interviews);
    return newIntv;
  }
  updateInterviewFeedback(id, feedbackData) {
    this.interviews = (this.interviews || []).map(i => {
      if (String(i.id) === String(id)) {
        return { ...i, status: 'COMPLETED', feedback: feedbackData.feedback, rating: feedbackData.rating };
      }
      return i;
    });
    setStored('interviews', this.interviews);
  }

  // --- USERS ---
  getUsers() {
    return this.users || [];
  }
  addUser(data) {
    const newUser = {
      id: Date.now(),
      status: 'ACTIVE',
      ...data
    };
    this.users.push(newUser);
    setStored('users', this.users);
    return newUser;
  }
  updateUser(id, updates) {
    this.users = (this.users || []).map(u => String(u.id) === String(id) ? { ...u, ...updates } : u);
    setStored('users', this.users);
  }
  deleteUser(id) {
    this.users = (this.users || []).filter(u => String(u.id) !== String(id));
    setStored('users', this.users);
  }

  // --- METRICS ---
  getMetrics() {
    const apps = this.getApplications();
    const cands = this.getCandidates();
    const jbs = this.getJobs();
    const intvs = this.getInterviews();
    const pipes = this.getPipeline();
    const usrs = this.getUsers();

    return {
      totalUsers: usrs.length,
      hrCount: usrs.filter(u => u.role === 'HR' || u.role === 'HR_MANAGER').length,
      recruiterCount: usrs.filter(u => u.role === 'RECRUITER').length,
      interviewerCount: usrs.filter(u => u.role === 'INTERVIEWER').length,
      openJobs: jbs.filter(j => j.status === 'OPEN').length,
      totalCandidates: cands.length,
      totalApplications: apps.length,
      scheduledInterviews: intvs.filter(i => i.status === 'SCHEDULED').length,
      shortlisted: pipes.filter(p => (p.currentStage || p.stage) === 'SHORTLISTED').length,
      selected: pipes.filter(p => (p.currentStage || p.stage) === 'SELECTED' || (p.currentStage || p.stage) === 'HIRED').length,
      rejected: pipes.filter(p => (p.currentStage || p.stage) === 'REJECTED').length
    };
  }

  // --- ACTIVITY LOGS ---
  getActivityLog() {
    return this.activities || [];
  }
  logActivity(action, user = 'System') {
    const act = {
      id: Date.now(),
      action,
      user,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    this.activities = this.activities || [];
    this.activities.unshift(act);
    if (this.activities.length > 50) this.activities.pop();
    setStored('activities', this.activities);
  }

  // --- AUDIT LOGS ---
  getAuditLog() {
    return this.audits || [];
  }
  logAudit(user, role, action, entity, entityId, details) {
    const log = {
      id: Date.now(),
      user,
      role,
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    this.audits = this.audits || [];
    this.audits.unshift(log);
    if (this.audits.length > 100) this.audits.pop();
    setStored('audits', this.audits);
  }
}

export const store = new Store();
export default store;
