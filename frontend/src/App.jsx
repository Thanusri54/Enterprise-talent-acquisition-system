import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import CandidateDetails from './pages/CandidateDetails';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Applications from './pages/Applications';
import Interviews from './pages/Interviews';
import Pipeline from './pages/Pipeline';
import Users from './pages/Users';
import Analytics from './pages/Analytics';
import Audit from './pages/Audit';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

import CandidateLayout from './pages/candidate/CandidateLayout';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateJobs from './pages/candidate/CandidateJobs';
import CandidateApplications from './pages/candidate/CandidateApplications';
import CandidateInterviews from './pages/candidate/CandidateInterviews';
import CandidateProfile from './pages/candidate/CandidateProfile';

const ProtectedLayout = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role === 'CANDIDATE') {
    return <Navigate to="/candidate/dashboard" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
};

const CandidateProtectedLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <CandidateLayout>
      {children}
    </CandidateLayout>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Candidate Portal Isolated Routes */}
      <Route path="/candidate" element={<Navigate to="/candidate/dashboard" replace />} />
      <Route path="/candidate/dashboard" element={<CandidateProtectedLayout><CandidateDashboard /></CandidateProtectedLayout>} />
      <Route path="/candidate/jobs" element={<CandidateProtectedLayout><CandidateJobs /></CandidateProtectedLayout>} />
      <Route path="/candidate/applications" element={<CandidateProtectedLayout><CandidateApplications /></CandidateProtectedLayout>} />
      <Route path="/candidate/interviews" element={<CandidateProtectedLayout><CandidateInterviews /></CandidateProtectedLayout>} />
      <Route path="/candidate/profile" element={<CandidateProtectedLayout><CandidateProfile /></CandidateProtectedLayout>} />

      {/* Internal Staff Routes */}
      <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/candidates" element={<ProtectedLayout><Candidates /></ProtectedLayout>} />
      <Route path="/candidates/:id" element={<ProtectedLayout><CandidateDetails /></ProtectedLayout>} />
      <Route path="/jobs" element={<ProtectedLayout><Jobs /></ProtectedLayout>} />
      <Route path="/jobs/:id" element={<ProtectedLayout><JobDetails /></ProtectedLayout>} />
      <Route path="/applications" element={<ProtectedLayout><Applications /></ProtectedLayout>} />
      <Route path="/interviews" element={<ProtectedLayout><Interviews /></ProtectedLayout>} />
      <Route path="/pipeline" element={<ProtectedLayout><Pipeline /></ProtectedLayout>} />
      <Route path="/users" element={<ProtectedLayout><Users /></ProtectedLayout>} />
      <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
      <Route path="/audit" element={<ProtectedLayout><Audit /></ProtectedLayout>} />
      <Route path="/notifications" element={<ProtectedLayout><Notifications /></ProtectedLayout>} />
      <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
