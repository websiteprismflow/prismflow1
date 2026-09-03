import React, { useState, useEffect, useCallback } from 'react';
import { 
  Inbox, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  CheckSquare, 
  Search, 
  Filter, 
  X, 
  Phone, 
  Mail, 
  Building, 
  Calendar, 
  AlertTriangle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { inquiryService, InquiryPaginationResult } from '../../services/inquiryService';
import { Inquiry, InquiryStatus } from '../../types';

export const AdminInquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(25);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // Modals state
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    const res: InquiryPaginationResult = await inquiryService.getPaginated({
      page: currentPage,
      pageSize,
      status: statusFilter,
      sortBy,
      searchTerm
    });
    setInquiries(res.data);
    setTotalCount(res.count);
    setTotalPages(Math.max(1, res.totalPages));
    setLoading(false);
  }, [currentPage, pageSize, statusFilter, sortBy, searchTerm]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
    setStatusUpdatingId(id);
    const res = await inquiryService.updateStatus(id, newStatus);
    setStatusUpdatingId(null);
    if (res.success) {
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
      loadInquiries();
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await inquiryService.delete(deleteId);
    setDeleting(false);
    if (res.success) {
      if (selectedInquiry && selectedInquiry.id === deleteId) {
        setSelectedInquiry(null);
      }
      setDeleteId(null);
      loadInquiries();
    }
  };

  const getStatusBadge = (status: InquiryStatus | string) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 size={12} /> Accepted
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-primary/20 text-cyan-highlight border border-cyan-secondary/40">
            <CheckSquare size={12} /> Completed
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
            <XCircle size={12} /> Rejected
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Inquiries & Project Briefs
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Review incoming project proposals and qualify client leads directly from Supabase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-cyan-primary/20 text-cyan-highlight border border-cyan-secondary/40">
            {totalCount} Total Inquiries
          </span>
          <button
            onClick={loadInquiries}
            disabled={loading}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/[0.08] transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          {[
            { label: 'All', value: 'all' },
            { label: 'Pending', value: 'Pending' },
            { label: 'Accepted', value: 'Accepted' },
            { label: 'Completed', value: 'Completed' },
            { label: 'Rejected', value: 'Rejected' },
          ].map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleStatusFilterChange(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-cyan-primary/25 border border-cyan-secondary/50 text-cyan-highlight shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search by client, email, service..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-bg-primary/90 border border-white/10 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan-secondary transition-all"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-text-muted" />
          </div>

          <button
            onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-medium text-text-secondary hover:text-text-primary transition-all cursor-pointer shrink-0"
            title="Toggle Sort Order"
          >
            <ArrowUpDown size={13} />
            <span className="hidden sm:inline">{sortBy === 'newest' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>

      </div>

      {/* Inquiries Table / List */}
      <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-text-secondary">
            <Loader2 size={28} className="animate-spin text-cyan-secondary" />
            <span className="text-xs">Loading inquiries from Supabase...</span>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-text-muted mb-3">
              <Inbox size={22} />
            </div>
            <h3 className="text-base font-bold text-text-primary">No inquiries found</h3>
            <p className="text-xs text-text-secondary max-w-sm mt-1">
              {searchTerm || statusFilter !== 'all'
                ? 'No inquiries match your current search criteria or filter.'
                : 'New inquiries submitted through the contact form will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  <th className="py-3.5 px-4 sm:px-6">Client / Prospect</th>
                  <th className="py-3.5 px-4">Business</th>
                  <th className="py-3.5 px-4">Requirement</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-xs">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-bold text-text-primary">{inq.name}</div>
                      <div className="text-[11px] text-text-muted flex items-center gap-2 mt-0.5">
                        <span>{inq.email}</span>
                        <span>•</span>
                        <span>{inq.contact_number}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-text-secondary">
                        {inq.business_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-cyan-highlight">
                        {inq.what_you_need}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {statusUpdatingId === inq.id ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                          <Loader2 size={12} className="animate-spin" /> Updating...
                        </span>
                      ) : (
                        <div className="relative inline-block">
                          <select
                            value={inq.status}
                            onChange={(e) => handleStatusChange(inq.id, e.target.value as InquiryStatus)}
                            className="text-[11px] font-semibold bg-bg-secondary border border-white/10 rounded-lg px-2 py-1 text-text-primary focus:outline-none focus:border-cyan-secondary cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Completed">Completed</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-text-muted font-mono text-[11px]">
                      {new Date(inq.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInquiry(inq)}
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary hover:text-cyan-highlight transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(inq.id)}
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-text-secondary hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-white/[0.01] flex items-center justify-between text-xs text-text-secondary">
          <div>
            Showing <span className="text-text-primary font-semibold">{inquiries.length}</span> of{' '}
            <span className="text-text-primary font-semibold">{totalCount}</span> records (Page {currentPage} of {totalPages})
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="p-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-mono text-xs">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="p-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            onClick={() => setSelectedInquiry(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <div className="relative w-full max-w-xl rounded-3xl bg-bg-elevated border border-white/15 p-6 sm:p-8 z-10 shadow-2xl space-y-6 animate-scale-up my-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-mint-primary uppercase tracking-widest block">
                  INQUIRY SPECIFICATION
                </span>
                <h3 className="text-xl font-bold text-text-primary mt-1">
                  {selectedInquiry.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.05]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-xs">
              <div>
                <span className="text-text-muted block text-[11px]">Email Address</span>
                <span className="font-semibold text-text-primary break-all">{selectedInquiry.email}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[11px]">Contact Number</span>
                <span className="font-semibold text-text-primary">{selectedInquiry.contact_number}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[11px]">Business Type</span>
                <span className="font-semibold text-text-primary">{selectedInquiry.business_type}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[11px]">Service Requested</span>
                <span className="font-semibold text-cyan-highlight">{selectedInquiry.what_you_need}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-text-secondary block mb-1">
                Additional Requirements / Notes
              </span>
              <div className="p-4 rounded-2xl bg-bg-primary/90 border border-white/10 text-xs text-text-primary whitespace-pre-wrap leading-relaxed min-h-[80px]">
                {selectedInquiry.additional_requirement || 'No additional requirements provided.'}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Status:</span>
                {getStatusBadge(selectedInquiry.status)}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value as InquiryStatus)}
                  className="text-xs bg-bg-secondary border border-white/15 rounded-xl px-3 py-1.5 text-text-primary focus:outline-none focus:border-cyan-secondary"
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-text-primary transition-all"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setDeleteId(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-bg-elevated border border-red-500/30 p-6 z-10 shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Delete Inquiry</h3>
              <p className="text-xs text-text-secondary mt-1">
                Are you sure you want to permanently remove this inquiry from Supabase? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-xs font-semibold text-red-300 hover:bg-red-500/30 flex items-center justify-center gap-1"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
