import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import Login from './pages/Login';
import Register from './pages/Register';
import History from './pages/History';
import RecruiterDashboard from './pages/RecruiterDashboard';
import { Briefcase, LogOut } from 'lucide-react';

function Header() {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="relative z-10 border-b border-white/10 glass-panel sticky top-0">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to={(profile?.role || 'candidate') === 'recruiter' ? "/batch-studio" : "/dashboard"} className="flex items-center gap-2">
          <div className="bg-primary-500/20 p-2 rounded-lg">
            <Briefcase className="w-6 h-6 text-primary-500" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gradient">MatchAI PRO</h1>
        </Link>
        <div className="text-sm text-textMuted flex items-center gap-6">
          {user ? (
            <>
              {profile?.role === 'candidate' && (
                <>
                  <Link to="/dashboard" className="hover:text-primary-500 transition-colors">Analyzer</Link>
                </>
              )}
              {profile?.role === 'developer' && (
                <>
                  <Link to="/dashboard" className="hover:text-primary-500 transition-colors">Analyzer</Link>
                </>
              )}
              {profile?.role === 'recruiter' && (
                <>
                  <Link to="/batch-studio" className="text-accent hover:text-accent/80 font-medium transition-colors">Batch Studio</Link>
                </>
              )}
              <Link to="/history" className="hover:text-primary-500 transition-colors">History</Link>
              <div className="w-px h-4 bg-white/20 mx-2" />
              <button onClick={signOut} className="flex items-center gap-2 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all font-medium text-text">Sign In</Link>
          )}
        </div>
      </div>
    </header>
  );
}

function MainLayout() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <Header />

      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes for Candidate & Developer */}
          <Route element={<ProtectedRoute allowedRoles={['candidate', 'developer']} />}>
            <Route path="/dashboard" element={
              <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="text-center mb-12 animate-slide-up">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">
                    AI-Powered Resume <span className="text-gradient">Screening</span>
                  </h2>
                  <p className="text-textMuted max-w-2xl mx-auto text-lg">
                    Upload your resume and paste a Job Description to get analyzed.
                  </p>
                </div>
                <ResumeAnalyzer />
              </div>
            } />
          </Route>

          {/* Protected Routes for Recruiter */}
          <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
            <Route path="/batch-studio" element={<RecruiterDashboard />} />
          </Route>

          {/* Shared Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/history" element={<History />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
