import React, { useState, useEffect } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { inquiryService } from '../../services/inquiryService';
import { subscribeToStorage } from '../../services/storage';
import { Inquiry, InquiryStatus } from '../../types';

export const AdminInquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modals state
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  const loadInquiries = () => {
    setInquiries(inquiryService.getAll());
  };

  useEffect(() => {
    loadInquiries();
    const unsubscribe = subscribeToStorage((key) => {
      if (key === 'prism_inquiries') {
        loadInquiries();
      }
    });
    return unsubscribe;
  }, []);

  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
    await inquiryService.updateStatus(id, newStatus);
    loadInquiries();
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry({ ...selectedInquiry, status: newStatus });
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    await inquiryService.updateNotes(selectedInquiry.id, editNotes);
    setSelectedInquiry({ ...selectedInquiry, adminNotes: editNotes });
    loadInquiries();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await inquiryService.delete(deleteId);
    setDeleteId(null);
    if (selectedInquiry && selectedInquiry.id === deleteId) {
      setSelectedInquiry(null);
    }
    loadInquiries();
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch = 
      inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.requirement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.businessType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Inquiries & Project Briefs
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Review incoming project proposals and qualify client leads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-cyan-primary/20 text-cyan-highlight border border-cyan-secondary/40">
            {inquiries.length} Total Leads
          </span>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, business, or requirement..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-white/10 text-text-primary text-xs sm:text-sm focus:outline-none focus:border-cyan-secondary transition-all"
          />
          <Search size={15} className="absolute left-3 top-3 text-text-muted" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-white/10 text-xs sm:text-sm text-text-primary focus:outline-none focus:border-cyan-secondary cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Responsive Inquiries List: Desktop Table + Mobile Cards */}
      
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-hidden rounded-3xl glass-panel border border-white/10">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/[0.03] border-b border-white/10 text-text-muted uppercase font-semibold">
            <tr>
              <th className="py-3.5 px-4">Client</th>
              <th className="py-3.5 px-4">Business</th>
              <th className="py-3.5 px-4">Requirement</th>
              <th className="py-3.5 px-4">Contact Details</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {filteredInquiries.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-text-muted">
                  No inquiries found matching your filters.
                </td>
              </tr>
            ) : (
              filteredInquiries.map((inq) => (
                <tr key={inq.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-text-primary">
                    {inq.name}
                  </td>
                  <td className="py-3.5 px-4 text-text-secondary">
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">
                      {inq.businessType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-cyan-highlight">
                    {inq.requirement}
                  </td>
                  <td className="py-3.5 px-4 text-text-muted space-y-0.5">
                    <div className="font-mono text-text-secondary">{inq.email}</div>
                    <div className="text-[11px]">{inq.contact}</div>
                  </td>
                  <td className="py-3.5 px-4 text-text-muted whitespace-nowrap">
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={inq.status}
                      onChange={(e) => handleStatusChange(inq.id, e.target.value as InquiryStatus)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer border focus:outline-none ${
                        inq.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        inq.status === 'accepted' ? 'bg-cyan-primary/20 text-cyan-highlight border-cyan-secondary/40' :
                        inq.status === 'completed' ? 'bg-mint-primary/20 text-mint-primary border-mint-primary/40' :
                        'bg-red-500/20 text-red-300 border-red-500/40'
                      }`}
                    >
                      <option value="pending" className="bg-bg-elevated text-text-primary">Pending</option>
                      <option value="accepted" className="bg-bg-elevated text-text-primary">Accepted</option>
                      <option value="completed" className="bg-bg-elevated text-text-primary">Completed</option>
                      <option value="rejected" className="bg-bg-elevated text-text-primary">Rejected</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedInquiry(inq);
                          setEditNotes(inq.adminNotes || '');
                        }}
                        className="p-1.5 rounded-lg bg-white/[0.04] text-text-secondary hover:text-cyan-highlight hover:bg-white/[0.08] transition-colors"
                        title="View Full Inquiry Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(inq.id)}
                        className="p-1.5 rounded-lg bg-white/[0.04] text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Inquiry"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile & Tablet Card List */}
      <div className="lg:hidden space-y-4">
        {filteredInquiries.length === 0 ? (
          <div className="p-8 rounded-3xl glass-panel text-center text-text-muted text-xs">
            No inquiries found matching your filters.
          </div>
        ) : (
          filteredInquiries.map((inq) => (
            <div key={inq.id} className="p-5 rounded-3xl glass-panel border border-white/10 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-text-primary">{inq.name}</h3>
                  <span className="text-xs text-text-secondary">{inq.businessType}</span>
                </div>

                <select
                  value={inq.status}
                  onChange={(e) => handleStatusChange(inq.id, e.target.value as InquiryStatus)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    inq.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                    inq.status === 'accepted' ? 'bg-cyan-primary/20 text-cyan-highlight border-cyan-secondary/40' :
                    inq.status === 'completed' ? 'bg-mint-primary/20 text-mint-primary border-mint-primary/40' :
                    'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}
                >
                  <option value="pending" className="bg-bg-elevated text-text-primary">Pending</option>
                  <option value="accepted" className="bg-bg-elevated text-text-primary">Accepted</option>
                  <option value="completed" className="bg-bg-elevated text-text-primary">Completed</option>
                  <option value="rejected" className="bg-bg-elevated text-text-primary">Rejected</option>
                </select>
              </div>

              <div className="text-xs space-y-1 pt-2 border-t border-white/[0.05]">
                <div><span className="text-text-muted">Need:</span> <strong className="text-cyan-highlight">{inq.requirement}</strong></div>
                <div><span className="text-text-muted">Email:</span> <span className="font-mono text-text-secondary">{inq.email}</span></div>
                <div><span className="text-text-muted">Phone:</span> <span className="text-text-secondary">{inq.contact}</span></div>
                <div><span className="text-text-muted">Date:</span> <span className="text-text-secondary">{new Date(inq.createdAt).toLocaleDateString()}</span></div>
              </div>

              <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedInquiry(inq);
                    setEditNotes(inq.adminNotes || '');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-primary/20 text-cyan-highlight text-xs font-semibold flex items-center gap-1"
                >
                  <Eye size={13} /> Full Details
                </button>

                <button
                  onClick={() => setDeleteId(inq.id)}
                  className="p-2 rounded-lg text-text-muted hover:text-red-400"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Inquiry Detail View Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setSelectedInquiry(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl animate-fade-in"
          />

          <div className="relative w-full max-w-2xl rounded-3xl bg-bg-elevated border border-white/15 shadow-2xl p-6 sm:p-8 z-10 animate-scale-up space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-text-primary">
                  Inquiry: {selectedInquiry.name}
                </h3>
                <span className="text-xs text-text-secondary">
                  Received on {new Date(selectedInquiry.createdAt).toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-full bg-white/[0.04] text-text-muted hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-text-muted block mb-1">Business Type</span>
                <span className="font-bold text-text-primary text-sm">{selectedInquiry.businessType}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-text-muted block mb-1">System Requirement</span>
                <span className="font-bold text-cyan-highlight text-sm">{selectedInquiry.requirement}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-text-muted block mb-1">Email Address</span>
                <a href={`mailto:${selectedInquiry.email}`} className="font-mono text-cyan-secondary hover:underline">
                  {selectedInquiry.email}
                </a>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-text-muted block mb-1">Contact Phone</span>
                <a href={`tel:${selectedInquiry.contact}`} className="font-mono text-cyan-secondary hover:underline">
                  {selectedInquiry.contact}
                </a>
              </div>
            </div>

            {selectedInquiry.additionalNotes && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <span className="text-xs font-semibold text-text-muted block mb-2 uppercase tracking-wider">
                  Client Project Specifications
                </span>
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap font-light">
                  {selectedInquiry.additionalNotes}
                </p>
              </div>
            )}

            {/* Admin Internal Notes Section */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Internal Admin Notes / Action Log
              </label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Log notes, meeting schedules, or estimated budget here..."
                className="w-full p-3 rounded-xl bg-bg-primary border border-white/10 text-xs text-text-primary focus:outline-none focus:border-cyan-secondary"
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-4 py-2 rounded-xl bg-cyan-primary/20 text-cyan-highlight border border-cyan-secondary/30 text-xs font-semibold hover:bg-cyan-primary/30 transition-all"
              >
                Save Internal Notes
              </button>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Status:</span>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value as InquiryStatus)}
                  className="px-3 py-1.5 rounded-xl bg-bg-primary border border-white/10 text-xs text-text-primary"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] text-xs font-medium text-text-secondary hover:text-text-primary"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setDeleteId(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
          />

          <div className="relative w-full max-w-sm rounded-3xl bg-bg-elevated border border-red-500/30 p-6 z-10 animate-scale-up space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-lg font-bold text-text-primary">
              Confirm Inquiries Deletion
            </h3>
            <p className="text-xs text-text-secondary">
              Are you sure you want to delete this inquiry? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] text-xs text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-xs font-bold text-white shadow-lg transition-all"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
