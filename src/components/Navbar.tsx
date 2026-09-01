import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, Sparkles, Shield } from 'lucide-react';

interface NavbarProps {
  onNavigateToSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateToSection }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastLogoClick, setLastLogoClick] = useState<number>(0);
  const [adminHint, setAdminHint] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Double-click / Double-tap detection on logo for secret admin access
  const handleLogoClick = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastLogoClick < 400) {
      // Double click triggered!
      setAdminHint(true);
      setTimeout(() => {
        setAdminHint(false);
        navigate('/admin/login');
      }, 300);
    } else {
      setLastLogoClick(now);
      if (location.pathname !== '/') {
        navigate('/');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const navLinks = [
    { label: 'Home', target: 'hero' },
    { label: 'Services', target: 'services' },
    { label: 'Work', target: 'work' },
    { label: 'Testimonials', target: 'testimonials' },
    { label: 'About', target: 'about' },
  ];

  const handleLinkClick = (target: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      if (onNavigateToSection) {
        onNavigateToSection(target);
      } else {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'py-3 bg-bg-primary/80 backdrop-blur-xl border-b border-white/[0.08] shadow-glass-subtle' 
            : 'py-5 bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo with secret double-click admin access */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 cursor-pointer select-none group relative"
            title="Prism Flow (Double-click for Admin Access)"
          >
            {/* Geometric Prism Icon */}
            <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-white/10 flex items-center justify-center p-1.5 shadow-sm group-hover:border-cyan-secondary/50 transition-all duration-300">
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <defs>
                  <linearGradient id="logoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#7CFF6A" />
                    <stop offset="50%" stopColor="#18B8C4" />
                    <stop offset="100%" stopColor="#0F8F9C" />
                  </linearGradient>
                </defs>
                <polygon points="20,4 36,34 4,34" fill="none" stroke="url(#logoGrad)" strokeWidth="4" strokeLinejoin="round" />
                <circle cx="20" cy="22" r="3.5" fill="#7CFF6A" />
              </svg>
            </div>

            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-text-primary text-base sm:text-lg flex items-center gap-1.5">
                PRISM<span className="text-cyan-secondary font-semibold">FLOW</span>
              </span>
            </div>

            {/* Secret Admin Access Notification Feedback */}
            {adminHint && (
              <div className="absolute -bottom-8 left-0 px-2 py-0.5 rounded bg-bg-elevated border border-mint-primary/40 text-[10px] text-mint-primary flex items-center gap-1 whitespace-nowrap animate-fade-in shadow-mint-glow">
                <Shield size={10} />
                <span>Admin Portal Accessing...</span>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
            {navLinks.map((link) => (
              <button
                key={link.target}
                onClick={() => handleLinkClick(link.target)}
                className="px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.06] transition-all"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right CTA Button & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleLinkClick('contact')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide text-text-primary neu-button group cursor-pointer"
            >
              <span>Let's Build</span>
              <ArrowRight size={14} className="text-cyan-secondary group-hover:translate-x-0.5 group-hover:text-mint-primary transition-all" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-bg-elevated/70 border border-white/10 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer / Glass Menu */}
      <div 
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        />

        {/* Drawer Content */}
        <div 
          className={`absolute top-20 left-4 right-4 p-6 rounded-3xl bg-bg-elevated/95 border border-white/10 shadow-2xl backdrop-blur-2xl transition-all duration-300 transform ${
            mobileMenuOpen ? 'translate-y-0 scale-100' : '-translate-y-4 scale-95'
          }`}
        >
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.target}
                onClick={() => handleLinkClick(link.target)}
                className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors flex items-center justify-between"
              >
                <span>{link.label}</span>
                <span className="text-white/20 text-xs font-mono">0{navLinks.indexOf(link) + 1}</span>
              </button>
            ))}

            <div className="pt-4 mt-2 border-t border-white/10 flex flex-col gap-3">
              <button
                onClick={() => handleLinkClick('contact')}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-primary to-cyan-secondary text-white font-semibold text-sm shadow-cyan-glow"
              >
                <span>Let's Build Together</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-text-muted">
                <span className="flex items-center gap-1">
                  <Sparkles size={12} className="text-mint-primary" />
                  Prism Flow Studio
                </span>
                <span>v1.0 • 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
