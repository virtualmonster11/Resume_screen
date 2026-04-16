import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Loader2, AlertCircle } from 'lucide-react';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate'); // candidate | recruiter
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signUp(email, password, role);
      navigate(role === 'recruiter' ? '/batch-studio' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="glass-panel p-8 rounded-3xl w-full max-w-md z-10 animate-fade-in border border-white/10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary-500/20 p-3 rounded-2xl mb-4">
            <Briefcase className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-text">Create an account</h2>
          <p className="text-textMuted text-sm mt-1">Join MatchAI PRO</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Account Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`py-2 rounded-xl text-sm font-medium border transition-all ${role === 'candidate' ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-surface border-white/10 text-textMuted'}`}
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={`py-2 rounded-xl text-sm font-medium border transition-all ${role === 'recruiter' ? 'bg-accent/20 border-accent text-accent' : 'bg-surface border-white/10 text-textMuted'}`}
              >
                Recruiter
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2 mt-2">Email</label>
            <input 
              type="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-text placeholder-textMuted focus:outline-none focus:border-primary-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Password</label>
            <input 
              type="password" required minLength="6"
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-text placeholder-textMuted focus:outline-none focus:border-primary-500"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] flex justify-center mt-4 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-textMuted mt-8 text-sm">
          Already have an account? <Link to="/login" className="text-primary-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
