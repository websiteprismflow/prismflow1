import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Inbox, 
  FolderKanban, 
  MessageSquareQuote, 
  FileText, 
  LogOut, 
  ExternalLink,
  Shield,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { authService } from '../../services/authService';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    // Protected route check
    if (!authService.isAuthenticated()) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Inquiries', path: '/admin/inquiries', icon: Inbox },
    { label: 'Portfolio', path: '/admin/portfolio', icon: FolderKanban },
    { label: 'Testimonials', path: '/admin/testimonials', icon: MessageSquareQuote },
    { label: 'Legal Policies', path: '/admin/legal', icon: FileText },
  ];

  const isCurrentActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col md:flex-row">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-bg-secondary/80 border-r border-white/[0.08] backdrop-blur-xl p-6 justify-between shrink-0 fixed top-0 bottom-0 left-0 z-30">
        
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-white/10 flex items-center justify-center p-1.5 shadow-sm">
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <defs>
                  <linearGradient id="adminSideGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#7CFF6A" />
                    <stop offset="50%" stopColor="#18B8C4" />
                    <stop offset="100%" stopColor="#0F8F9C" />
                  </linearGradient>
                </defs>
                <polygon points="20,4 36,34 4,34" fill="none" stroke="url(#adminSideGrad)" strokeWidth="4" strokeLinejoin="round" />
                <circle cx="20" cy="22" r="3.5" fill="#7CFF6A" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-text-primary block">
                PRISM<span className="text-cyan-secondary">FLOW</span>
              </span>
              <span className="text-[10px] text-mint-primary font-mono flex items-center gap-1">
                <Shield size={10} /> Control Center
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isCurrentActive(item);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-cyan-primary/20 border border-cyan-secondary/40 text-cyan-highlight shadow-sm shadow-cyan-primary/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon size={16} className={active ? 'text-mint-primary' : 'text-text-muted'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User & Actions */}
        <div className="pt-6 border-t border-white/[0.06] space-y-3">
          
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={13} className="text-cyan-secondary" />
              View Live Website
            </span>
            <span className="text-[10px] text-text-muted">↗</span>
          </button>

          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="truncate mr-2">
              <span className="text-xs font-bold text-text-primary block truncate">
                {currentUser?.name || 'Admin'}
              </span>
              <span className="text-[10px] text-text-muted truncate block font-mono">
                {currentUser?.email || 'admin@prismflow.tech'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>

        </div>

      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-bg-secondary border-b border-white/10 sticky top-0 z-40 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-bg-elevated border border-white/10 flex items-center justify-center p-1">
            <svg viewBox="0 0 40 40" className="w-full h-full">
              <polygon points="20,4 36,34 4,34" fill="none" stroke="#18B8C4" strokeWidth="4" />
              <circle cx="20" cy="22" r="3.5" fill="#7CFF6A" />
            </svg>
          </div>
          <span className="font-bold text-sm text-text-primary">Admin Center</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg bg-white/[0.04] text-xs text-text-secondary"
            title="View Live Website"
          >
            <ExternalLink size={16} />
          </button>

          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-2 rounded-lg bg-white/[0.04] text-text-secondary"
          >
            {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-bg-elevated border-b border-white/10 p-4 z-40 shadow-2xl space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item);
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileNavOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                  active
                    ? 'bg-cyan-primary/20 text-cyan-highlight'
                    : 'text-text-secondary hover:bg-white/[0.05]'
                }`}
              >
                <Icon size={18} className={active ? 'text-mint-primary' : 'text-text-muted'} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-white/10 mt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 lg:ml-72 p-4 sm:p-6 lg:p-10 max-w-7xl w-full">
        <Outlet />
      </main>

    </div>
  );
};
