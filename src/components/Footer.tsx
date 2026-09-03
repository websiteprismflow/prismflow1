import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Sparkles, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const [lastLogoClick, setLastLogoClick] = useState<number>(0);
  const [adminHint, setAdminHint] = useState(false);

  // Secret admin double-click trigger
  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastLogoClick < 400) {
      setAdminHint(true);
      setTimeout(() => {
        setAdminHint(false);
        navigate('/admin/login');
      }, 300);
    } else {
      setLastLogoClick(now);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToSection = (id: string) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-bg-primary border-t border-white/[0.08] pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-white/[0.06]">
          
          {/* Brand Column */}
          <div className="md:col-span-5 flex flex-col items-start">
            
            {/* Logo */}
            <div 
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 cursor-pointer select-none group relative mb-4"
              title="Prism Flow (Double-click for Admin Access)"
            >
              <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-white/10 flex items-center justify-center p-1.5 shadow-sm group-hover:border-cyan-secondary/50 transition-all">
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  <defs>
                    <linearGradient id="footerLogoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0077B6" />
                      <stop offset="50%" stopColor="#18B8C4" />
                      <stop offset="100%" stopColor="#0F8F9C" />
                    </linearGradient>
                  </defs>
                  <polygon points="20,4 36,34 4,34" fill="none" stroke="url(#footerLogoGrad)" strokeWidth="4" strokeLinejoin="round" />
                  <circle cx="20" cy="22" r="3.5" fill="#0077B6" />
                </svg>
              </div>

              <span className="font-bold tracking-tight text-text-primary text-lg">
                PRISM<span className="text-cyan-secondary font-semibold">FLOW</span>
              </span>

              {adminHint && (
                <div className="absolute -top-7 left-0 px-2 py-0.5 rounded bg-bg-elevated border border-mint-primary/40 text-[10px] text-mint-primary flex items-center gap-1 whitespace-nowrap shadow-mint-glow">
                  <Shield size={10} />
                  <span>Admin Portal Accessing...</span>
                </div>
              )}
            </div>

            <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">
              Building intelligent systems for a smarter tomorrow. Modern web development, autonomous AI agents, and enterprise SaaS architectures.
            </p>

            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="w-2 h-2 rounded-full bg-mint-primary" />
              <span>Available for select enterprise engagements</span>
            </div>

          </div>

          {/* Links Column: Company */}
          <div className="md:col-span-2 sm:col-span-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button 
                  onClick={() => scrollToSection('hero')} 
                  className="text-xs sm:text-sm text-text-secondary hover:text-cyan-highlight transition-colors"
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('work')} 
                  className="text-xs sm:text-sm text-text-secondary hover:text-cyan-highlight transition-colors"
                >
                  Work
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('contact')} 
                  className="text-xs sm:text-sm text-text-secondary hover:text-cyan-highlight transition-colors"
                >
                  Contact
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('testimonials')} 
                  className="text-xs sm:text-sm text-text-secondary hover:text-cyan-highlight transition-colors"
                >
                  Client Stories
                </button>
              </li>
            </ul>
          </div>

          {/* Links Column: Services */}
          <div className="md:col-span-3 sm:col-span-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-4">
              Services
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button 
                  onClick={() => scrollToSection('services')} 
                  className="text-xs sm:text-sm text-text-secondary hover:text-cyan-highlight transition-colors"
                >
                  Intelligent Websites
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('services')} 
                  className="text-xs sm:text-sm text-text-secondary hover:text-cyan-highlight transition-colors"
                >
                  AI Agents & Bots
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('services')} 
                  className="text-xs sm:text-sm text-text-secondary hover:text-cyan-highlight transition-colors"
                >
                  SaaS Applications
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('services')} 
                  className="text-xs sm:text-sm text-text-secondary hover:text-cyan-highlight transition-colors"
                >
                  E-Commerce & Automation
                </button>
              </li>
            </ul>
          </div>

          {/* Links Column: Legal */}
          <div className="md:col-span-2 sm:col-span-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link 
                  to="/privacy" 
                  className="text-xs sm:text-sm text-text-secondary hover:text-cyan-highlight transition-colors inline-flex items-center gap-1"
                >
                  Privacy Policy
                  <ArrowUpRight size={12} className="opacity-50" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-xs sm:text-sm text-text-secondary hover:text-cyan-highlight transition-colors inline-flex items-center gap-1"
                >
                  Terms & Conditions
                  <ArrowUpRight size={12} className="opacity-50" />
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© 2026 Prism Flow. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
              <Sparkles size={11} className="text-mint-primary" />
              Engineered with Precision
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
