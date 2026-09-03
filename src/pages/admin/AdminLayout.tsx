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
  ShieldAlert,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import { authService } from '../../services/authService';
import { AdminUser } from '../../types';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  // Auth & authorization state
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    const verifyAccess = async () => {
      setLoading(true);
      const authStatus = await authService.checkIsAdmin();

      if (!isMounted) return;

      if (!authStatus.isAuthenticated) {
        navigate('/admin/login', { replace: true });
        return;
      }

      if (!authStatus.isAdmin) {
        setIsAuthorized(false);
        setCurrentUser(authStatus.user);
        setLoading(false);
        return;
      }

      setIsAuthorized(true);
      setCurrentUser(authStatus.user);
      setLoading(false);
    };

    verifyAccess();

    // Listen for real-time auth changes (e.g. session expired, signed out from another tab)
    const sub = authService.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/admin/login', { replace: true });
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        verifyAccess();
      }
    });

    return () => {
      isMounted = false;
      sub.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/admin/login', { replace: true });
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

  // 1. Loading State (Prevents flash of admin content)
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-bg-elevated border border-white/10 flex items-center justify-center p-2 shadow-sm animate-pulse">
            <Shield size={24} className="text-cyan-secondary" />
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <Loader2 size={16} className="animate-spin text-mint-primary" />
            <span>Verifying administrator privileges...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthorized State (Authenticated user is not an administrator)
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl glass-panel-elevated border border-red-500/30 text-center space-y-5 animate-scale-up">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Access Restricted</h2>
            <p className="text-sm text-text-secondary mt-2">
              Your account (<span className="text-white font-mono">{currentUser?.email}</span>) does not have administrator privileges in this Supabase organization.
            </p>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-text-secondary hover:text-text-primary transition-all"
            >
              Return Home
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-300 hover:bg-red-500/30 transition-all flex items-center justify-center gap-1.5"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Admin Dashboard View
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
                    <stop offset="0%" stopColor="#0077B6" />
                    <stop offset="50%" stopColor="#18B8C4" />
                    <stop offset="100%" stopColor="#0F8F9C" />
                  </linearGradient>
                </defs>
                <polygon points="20,4 36,34 4,34" fill="none" stroke="url(#adminSideGrad)" strokeWidth="4" strokeLinejoin="round" />
                <circle cx="20" cy="22" r="3.5" fill="#0077B6" />
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
                {currentUser?.name || currentUser?.full_name || 'Admin'}
              </span>
              <span className="text-[10px] text-text-muted truncate block font-mono">
                {currentUser?.email || 'admin@prismflow.tech'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
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
              <circle cx="20" cy="22" r="3.5" fill="#0077B6" />
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
