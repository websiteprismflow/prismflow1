import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Shield, Sparkles, ArrowLeft, Key } from 'lucide-react';
import { authService } from '../../services/authService';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@prismflow.tech');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await authService.login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@prismflow.tech');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col justify-center items-center px-4 sm:px-6 relative overflow-hidden bg-ambient-hero">
      
      {/* Background Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-mint-primary/10 via-cyan-secondary/10 to-transparent blur-[140px] pointer-events-none" />

      {/* Back to Public Site */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-mint-primary transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span>Return to Prism Flow</span>
      </button>

      {/* Login Card */}
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl glass-panel-elevated border border-white/15 shadow-2xl relative z-10 animate-scale-up">
        
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-bg-elevated border border-white/10 flex items-center justify-center p-2 shadow-sm mx-auto mb-4">
            <svg viewBox="0 0 40 40" className="w-full h-full">
              <defs>
                <linearGradient id="adminLoginGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7CFF6A" />
                  <stop offset="50%" stopColor="#18B8C4" />
                  <stop offset="100%" stopColor="#0F8F9C" />
                </linearGradient>
              </defs>
              <polygon points="20,4 36,34 4,34" fill="none" stroke="url(#adminLoginGrad)" strokeWidth="4" strokeLinejoin="round" />
              <circle cx="20" cy="22" r="3.5" fill="#7CFF6A" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Admin Console
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Sign in to manage inquiries, portfolio, testimonials, and legal policies.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@prismflow.tech"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-primary/90 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-cyan-secondary transition-all"
              />
              <Mail size={16} className="absolute left-3.5 top-3.5 text-text-muted" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-primary/90 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-cyan-secondary transition-all"
              />
              <Lock size={16} className="absolute left-3.5 top-3.5 text-text-muted" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-primary to-cyan-secondary text-white font-bold text-sm shadow-cyan-glow hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo Shortcut Helper */}
        <div className="mt-6 pt-6 border-t border-white/[0.08] text-center">
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-[11px] text-cyan-secondary hover:text-mint-primary inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Key size={11} />
            <span>Use default demo credentials (admin@prismflow.tech / admin123)</span>
          </button>
        </div>

      </div>

    </div>
  );
};
