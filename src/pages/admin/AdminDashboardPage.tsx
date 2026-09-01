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
  ExternalLink
} from 'lucide-react';
import { inquiryService } from '../../services/inquiryService';
import { portfolioService } from '../../services/portfolioService';
import { testimonialService } from '../../services/testimonialService';
import { subscribeToStorage } from '../../services/storage';
import { Inquiry, PortfolioProject, Testimonial } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const loadData = () => {
    setInquiries(inquiryService.getAll());
    setProjects(portfolioService.getAll(true));
    setTestimonials(testimonialService.getAll(true));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorage(() => {
      loadData();
    });
    return unsubscribe;
  }, []);

  const pendingInquiries = inquiries.filter((i) => i.status === 'pending');
  const completedInquiries = inquiries.filter((i) => i.status === 'completed');

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Executive Overview
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Real-time telemetry and management controls for Prism Flow systems.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/inquiries')}
            className="px-4 py-2 rounded-xl bg-cyan-primary/20 border border-cyan-secondary/40 text-cyan-highlight hover:bg-cyan-primary/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
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
              {inquiries.length}
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
              {pendingInquiries.length}
            </span>
            <span className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
              Awaiting review
            </span>
          </div>
        </div>

        {/* Portfolio Projects */}
        <div className="p-5 sm:p-6 rounded-3xl glass-panel border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-4">
            <span className="text-xs font-medium uppercase tracking-wider">Portfolio Items</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-primary/20 text-cyan-secondary flex items-center justify-center">
              <FolderKanban size={16} />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-4xl font-extrabold text-text-primary block">
              {projects.length}
            </span>
            <span className="text-[11px] text-text-secondary mt-1 flex items-center gap-1">
              {projects.filter(p => p.published).length} Published Live
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
              {testimonials.length}
            </span>
            <span className="text-[11px] text-mint-primary mt-1 flex items-center gap-1">
              100% 5-Star Reviews
            </span>
          </div>
        </div>

      </div>

      {/* Recent Inquiries List */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              Recent Inquiries
            </h2>
            <p className="text-xs text-text-secondary">
              Latest business inquiries received through the public requirement form.
            </p>
          </div>

          <button
            onClick={() => navigate('/admin/inquiries')}
            className="text-xs font-semibold text-cyan-secondary hover:text-mint-primary flex items-center gap-1 transition-colors"
          >
            View All ({inquiries.length})
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {inquiries.slice(0, 4).map((inq) => (
            <div key={inq.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="font-bold text-sm text-text-primary">{inq.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-text-secondary">
                    {inq.businessType}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                    inq.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                    inq.status === 'accepted' ? 'bg-cyan-primary/20 text-cyan-highlight' :
                    inq.status === 'completed' ? 'bg-mint-primary/20 text-mint-primary' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {inq.status}
                  </span>
                </div>

                <div className="text-xs text-text-secondary flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>Need: <strong className="text-text-primary">{inq.requirement}</strong></span>
                  <span>Email: <span className="font-mono">{inq.email}</span></span>
                  <span>Date: {new Date(inq.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/admin/inquiries')}
                className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-text-secondary transition-colors"
              >
                Inspect
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
