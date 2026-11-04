import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: jwtToken, user: userData } = response.data;
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', userData);
      const { token: jwtToken, user: newUser } = response.data;
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(jwtToken);
      setUser(newUser);

      // Create corresponding Candidate Service record for CANDIDATE role
      if (newUser && (newUser.role === 'CANDIDATE' || userData.role === 'CANDIDATE')) {
        try {
          await api.post('/candidates', {
            fullName: newUser.name,
            email: newUser.email,
            title: 'Candidate Applicant',
            skills: 'Java, Spring Boot, React, SQL',
            experienceYears: 3,
            location: 'Hyderabad',
            status: 'ACTIVE'
          });
        } catch (candErr) {
          console.warn('Candidate record initialization notice:', candErr);
        }
      }

      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const getOrCreateCandidateProfile = async (currentUser = user) => {
    if (!currentUser || !currentUser.email) return null;
    try {
      const res = await api.get(`/candidates/email/${currentUser.email}`);
      return res.data;
    } catch (err) {
      try {
        const createRes = await api.post('/candidates', {
          fullName: currentUser.name,
          email: currentUser.email,
          title: 'Candidate Applicant',
          skills: 'Java, Spring Boot, React, SQL',
          experienceYears: 3,
          location: 'Hyderabad',
          status: 'ACTIVE'
        });
        return createRes.data;
      } catch (createErr) {
        console.error('Failed to resolve/create candidate profile:', createErr);
        return null;
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const hasRole = (...roles) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      getOrCreateCandidateProfile,
      logout,
      isAuthenticated: !!token,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
