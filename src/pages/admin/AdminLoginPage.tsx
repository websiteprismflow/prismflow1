import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, ArrowLeft, Loader2, ShieldAlert, Clock } from 'lucide-react';
import { authService, RateLimitStatus } from '../../services/authService';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimitStatus>(() => authService.getRateLimitStatus());

  // 1-hour lockout countdown ticker
  useEffect(() => {
    if (!rateLimit.isLocked) return;

    const interval = setInterval(() => {
      const current = authService.getRateLimitStatus();
      setRateLimit(current);
      if (!current.isLocked) {
        clearInterval(interval);
        setError('');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [rateLimit.isLocked]);

  const formatTime = (ms: number): string => {
    if (ms <= 0) return '0s';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins > 0) {
      return `${mins}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${secs}s`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // If rate limit is locked, block immediately
    if (rateLimit.isLocked) {
      setError(`Form is locked for ${formatTime(rateLimit.remainingTimeMs)} due to 3 failed attempts.`);
      return;
    }

    if (!email.trim() || !password) {
      setError('Please enter your administrator email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.login(email, password);
      setLoading(false);
      const updatedStatus = authService.getRateLimitStatus();
      setRateLimit(updatedStatus);

      if (res.success) {
        navigate('/admin', { replace: true });
      } else {
        setError(res.error || 'Authentication failed. Please verify your credentials.');
        if (updatedStatus.isLocked) {
          setPassword('');
        }
      }
    } catch (err) {
      setLoading(false);
      setRateLimit(authService.getRateLimitStatus());
      setError('An unexpected error occurred during login. Please try again.');
    }
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
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-bg-elevated border border-white/10 flex items-center justify-center shadow-sm mx-auto mb-4">
            <img src="/logo.png" alt="Prism Flow" className="w-full h-full object-cover" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Admin Console
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Sign in with your authorized administrator credentials.
          </p>
        </div>

        {/* Security Lockout or Error Banner */}
        {rateLimit.isLocked ? (
          <div className="p-4 mb-6 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs flex items-start gap-3 animate-pulse">
            <ShieldAlert size={20} className="text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-left">
              <p className="font-bold text-red-300 text-sm">Security Lockout Active</p>
              <p className="text-[11px] text-red-200/90 leading-relaxed">
                You have reached 3 failed attempts (incorrect email or password). Form inputs are locked for 1 hour to prevent brute-force attacks.
              </p>
              <div className="pt-1.5 flex items-center gap-1.5 font-mono text-xs text-mint-secondary font-semibold">
                <Clock size={13} className="text-mint-secondary" />
                <span>Time remaining: {formatTime(rateLimit.remainingTimeMs)}</span>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="p-3.5 mb-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
            <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-left">
              <span>{error}</span>
              {rateLimit.attempts > 0 && (
                <p className="text-[11px] text-amber-300 font-medium">
                  Failed attempts: {rateLimit.attempts} / {rateLimit.maxAttempts} (Lockout: 1 hour)
                </p>
              )}
            </div>
          </div>
        ) : rateLimit.attempts > 0 ? (
          <div className="p-3 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
            <ShieldAlert size={14} className="text-amber-400 shrink-0" />
            <span>
              {rateLimit.remainingAttempts} attempt{rateLimit.remainingAttempts === 1 ? '' : 's'} remaining before a 1-hour security lockout.
            </span>
          </div>
        ) : null}

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
                disabled={loading || rateLimit.isLocked}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={rateLimit.isLocked ? "Form locked for 1 hour" : "admin@prismflow.tech"}
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-bg-primary/90 border text-text-primary text-sm transition-all ${
                  rateLimit.isLocked 
                    ? 'border-red-500/30 opacity-50 cursor-not-allowed bg-red-950/10' 
                    : 'border-white/10 focus:outline-none focus:border-cyan-secondary'
                }`}
              />
              <Mail size={16} className={`absolute left-3.5 top-3.5 ${rateLimit.isLocked ? 'text-red-400/50' : 'text-text-muted'}`} />
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
                disabled={loading || rateLimit.isLocked}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={rateLimit.isLocked ? "Form locked for 1 hour" : "••••••••••••"}
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-bg-primary/90 border text-text-primary text-sm transition-all ${
                  rateLimit.isLocked 
                    ? 'border-red-500/30 opacity-50 cursor-not-allowed bg-red-950/10' 
                    : 'border-white/10 focus:outline-none focus:border-cyan-secondary'
                }`}
              />
              <Lock size={16} className={`absolute left-3.5 top-3.5 ${rateLimit.isLocked ? 'text-red-400/50' : 'text-text-muted'}`} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || rateLimit.isLocked}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2 ${
              rateLimit.isLocked
                ? 'bg-red-500/20 border border-red-500/30 text-red-300 cursor-not-allowed opacity-60 shadow-none'
                : 'bg-gradient-to-r from-cyan-primary to-cyan-secondary text-white shadow-cyan-glow hover:opacity-95 cursor-pointer disabled:opacity-50'
            }`}
          >
            {rateLimit.isLocked ? (
              <span className="inline-flex items-center gap-2">
                <Clock size={16} />
                <span>Locked ({formatTime(rateLimit.remainingTimeMs)})</span>
              </span>
            ) : loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-text-muted">
            🔒 Rate-limited to 3 attempts • 1-hour security lockout
          </p>
        </div>

      </div>

    </div>
  );
};
