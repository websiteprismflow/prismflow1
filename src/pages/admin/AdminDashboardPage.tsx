import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  FolderKanban, 
  MessageSquareQuote, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  Sparkles, 
  ExternalLink,
  Loader2,
  RefreshCw,
  FileText
} from 'lucide-react';
import { inquiryService } from '../../services/inquiryService';
import { portfolioService } from '../../services/portfolioService';
import { testimonialService } from '../../services/testimonialService';
import { legalService } from '../../services/legalService';
import { Inquiry } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [inquiryMetrics, setInquiryMetrics] = useState({ total: 0, pending: 0, accepted: 0, completed: 0, rejected: 0 });
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [portfolioCount, setPortfolioCount] = useState<number>(0);
  const [testimonialCount, setTestimonialCount] = useState<number>(0);
  const [legalClausesCount, setLegalClausesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [metrics, recentRes, portfolios, testimonials, privacyClauses, termsClauses] = await Promise.all([
        inquiryService.getMetrics(),
        inquiryService.getPaginated({ page: 1, pageSize: 5, sortBy: 'newest' }),
        portfolioService.getAllAdmin(),
        testimonialService.getAllAdmin(),
        legalService.getAllClausesAdmin('Privacy Policy'),
        legalService.getAllClausesAdmin('Terms & Conditions')
      ]);

      setInquiryMetrics(metrics);
      setRecentInquiries(recentRes.data);
      setPortfolioCount(portfolios.length);
      setTestimonialCount(testimonials.length);
      setLegalClausesCount(privacyClauses.length + termsClauses.length);
    } catch (err) {
      console.error('PrismFlow AdminDashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Executive Overview
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Real-time telemetry and management controls connected to Supabase production database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => navigate('/admin/inquiries')}
            className="px-4 py-2 rounded-xl bg-cyan-primary/20 border border-cyan-secondary/40 text-cyan-highlight hover:bg-cyan-primary/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Inbox size={14} />
            <span>Manage Inquiries</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Inquiries */}
        <div className="p-5 sm:p-6 rounded-3xl glass-panel border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-4">
            <span className="text-xs font-medium uppercase tracking-wider">Total Inquiries</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-primary/20 text-cyan-highlight flex items-center justify-center">
              <Inbox size={16} />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-4xl font-extrabold text-text-primary block">
              {loading ? '...' : inquiryMetrics.total}
            </span>
            <span className="text-[11px] text-mint-primary mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> Active pipeline
            </span>
          </div>
        </div>

        {/* Pending Inquiries */}
        <div className="p-5 sm:p-6 rounded-3xl glass-panel border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-4">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Action</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-4xl font-extrabold text-text-primary block">
              {loading ? '...' : inquiryMetrics.pending}
            </span>
            <span className="text-[11px] text-amber-400/80 mt-1 block">
              Needs architect qualification
            </span>
          </div>
        </div>

        {/* Portfolio Projects */}
        <div className="p-5 sm:p-6 rounded-3xl glass-panel border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-4">
            <span className="text-xs font-medium uppercase tracking-wider">Portfolios</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FolderKanban size={16} />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-4xl font-extrabold text-text-primary block">
              {loading ? '...' : portfolioCount}
            </span>
            <span className="text-[11px] text-text-muted mt-1 block">
              Live in Supabase storage
            </span>
          </div>
        </div>

        {/* Testimonials */}
        <div className="p-5 sm:p-6 rounded-3xl glass-panel border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-4">
            <span className="text-xs font-medium uppercase tracking-wider">Testimonials</span>
            <div className="w-8 h-8 rounded-xl bg-mint-primary/20 text-mint-primary flex items-center justify-center">
              <MessageSquareQuote size={16} />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-4xl font-extrabold text-text-primary block">
              {loading ? '...' : testimonialCount}
            </span>
            <span className="text-[11px] text-mint-primary mt-1 block">
              Verified client stories
            </span>
          </div>
        </div>

      </div>

      {/* Recent Inquiries List */}
      <div className="rounded-3xl glass-panel border border-white/10 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
              Recent Inquiries
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Latest incoming project proposals from prospective enterprise clients.
            </p>
          </div>

          <button
            onClick={() => navigate('/admin/inquiries')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-secondary hover:text-cyan-highlight transition-colors cursor-pointer"
          >
            <span>View All ({inquiryMetrics.total})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-xs text-text-secondary">
            <Loader2 size={18} className="animate-spin text-cyan-secondary" />
            <span>Loading telemetry...</span>
          </div>
        ) : recentInquiries.length === 0 ? (
          <div className="py-10 text-center text-xs text-text-secondary">
            No inquiries recorded in Supabase yet.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {recentInquiries.map((inq) => (
              <div key={inq.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary">{inq.name}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/[0.05] text-text-muted">
                      {inq.business_type}
                    </span>
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    {inq.what_you_need} • {inq.email}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    inq.status === 'Accepted'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : inq.status === 'Completed'
                      ? 'bg-cyan-primary/20 text-cyan-highlight'
                      : inq.status === 'Rejected'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {inq.status}
                  </span>

                  <button
                    onClick={() => navigate('/admin/inquiries')}
                    className="p-1 rounded text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div
          onClick={() => navigate('/admin/portfolio')}
          className="p-5 rounded-2xl glass-panel-interactive border border-white/10 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-text-muted">Showcase Portfolio</span>
            <FolderKanban size={16} className="text-cyan-secondary group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xs text-text-secondary">
            Upload imagery and videos to Supabase Storage and manage published deployments.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/testimonials')}
          className="p-5 rounded-2xl glass-panel-interactive border border-white/10 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-text-muted">Client Endorsements</span>
            <MessageSquareQuote size={16} className="text-mint-primary group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xs text-text-secondary">
            Curate 3-5 star client reviews and executive testimonials.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/legal')}
          className="p-5 rounded-2xl glass-panel-interactive border border-white/10 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-text-muted">Legal &amp; Policy Terms</span>
            <FileText size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xs text-text-secondary">
            Configure {legalClausesCount} clauses across Privacy Policy and Terms of Service.
          </p>
        </div>

      </div>

    </div>
  );
};
