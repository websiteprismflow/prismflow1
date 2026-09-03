import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Loader2, 
  RefreshCw, 
  Check, 
  AlertTriangle,
  X
} from 'lucide-react';
import { legalService } from '../../services/legalService';
import { LegalClause, PolicyType } from '../../types';

export const AdminLegalEditorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PolicyType>('Privacy Policy');
  const [clauses, setClauses] = useState<LegalClause[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClause, setEditingClause] = useState<LegalClause | null>(null);
  const [heading, setHeading] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [deleteClause, setDeleteClause] = useState<LegalClause | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadClauses = async (policy: PolicyType) => {
    setLoading(true);
    const data = await legalService.getAllClausesAdmin(policy);
    setClauses(data);
    setLoading(false);
  };

  useEffect(() => {
    loadClauses(activeTab);
  }, [activeTab]);

  const handleTabChange = (tab: PolicyType) => {
    setActiveTab(tab);
  };

  const handleOpenAdd = () => {
    setEditingClause(null);
    setHeading(`${clauses.length + 1}. New Clause Heading`);
    setContent('');
    setPublished(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (clause: LegalClause) => {
    setEditingClause(clause);
    setHeading(clause.clause_heading);
    setContent(clause.clause_content);
    setPublished(clause.published_live);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleTogglePublish = async (clause: LegalClause) => {
    await legalService.togglePublish(clause.id, clause.published_live);
    loadClauses(activeTab);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= clauses.length) return;

    const newClauses = [...clauses];
    const temp = newClauses[index];
    newClauses[index] = newClauses[targetIndex];
    newClauses[targetIndex] = temp;

    // Reassign orders
    const updates = newClauses.map((c, idx) => ({
      id: c.id,
      clause_order: idx + 1
    }));

    setClauses(newClauses.map((c, idx) => ({ ...c, clause_order: idx + 1 })));
    await legalService.reorderClauses(updates);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!heading.trim() || !content.trim()) {
      setFormError('Please enter both a clause heading and the clause content.');
      return;
    }

    setSaving(true);

    try {
      if (editingClause) {
        const res = await legalService.updateClause(editingClause.id, {
          clause_heading: heading.trim(),
          clause_content: content.trim(),
          published_live: published
        });
        if (res.success) {
          setIsModalOpen(false);
          loadClauses(activeTab);
        } else {
          setFormError(res.error || 'Failed to update clause');
        }
      } else {
        const res = await legalService.createClause({
          policy_type: activeTab,
          clause_heading: heading.trim(),
          clause_content: content.trim(),
          published_live: published
        });
        if (res.success) {
          setIsModalOpen(false);
          loadClauses(activeTab);
        } else {
          setFormError(res.error || 'Failed to create clause');
        }
      }
    } catch (err) {
      setFormError('An unexpected error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteClause) return;
    setDeleting(true);
    await legalService.deleteClause(deleteClause.id);
    setDeleting(false);
    setDeleteClause(null);
    loadClauses(activeTab);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Legal & Policy Editor
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Manage Privacy Policy and Terms &amp; Conditions clauses in Supabase (public.legal_clauses).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadClauses(activeTab)}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-primary to-cyan-secondary text-white font-bold text-xs shadow-cyan-glow hover:opacity-95 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus size={16} />
            <span>Add Clause</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-panel border border-white/10 w-fit">
        {(['Privacy Policy', 'Terms & Conditions'] as PolicyType[]).map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? 'bg-cyan-primary/25 border border-cyan-secondary/50 text-cyan-highlight shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Clauses List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-24 rounded-2xl glass-panel border border-white/10 flex flex-col items-center justify-center gap-3 text-text-secondary">
            <Loader2 size={28} className="animate-spin text-cyan-secondary" />
            <span className="text-xs">Loading clauses from Supabase...</span>
          </div>
        ) : clauses.length === 0 ? (
          <div className="py-20 rounded-2xl glass-panel border border-white/10 text-center flex flex-col items-center justify-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-text-muted mb-3">
              <FileText size={22} />
            </div>
            <h3 className="text-base font-bold text-text-primary">No clauses found</h3>
            <p className="text-xs text-text-secondary max-w-sm mt-1 mb-6">
              Add your first clause for {activeTab}.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-cyan-primary/20 border border-cyan-secondary/40 text-cyan-highlight text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Clause
            </button>
          </div>
        ) : (
          clauses.map((clause, index) => (
            <div
              key={clause.id}
              className={`p-5 rounded-2xl glass-panel border transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                clause.published_live ? 'border-white/10' : 'border-amber-500/30 opacity-75'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white/[0.05] text-text-muted">
                    #{clause.clause_order}
                  </span>
                  <h3 className="text-base font-bold text-text-primary">
                    {clause.clause_heading}
                  </h3>
                  {!clause.published_live && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                      Unpublished
                    </span>
                  )}
                </div>

                <div className="text-xs text-text-secondary leading-relaxed whitespace-pre-line font-light">
                  {clause.clause_content}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-end md:self-start pt-2 md:pt-0">
                {/* Reorder Buttons */}
                <button
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary hover:text-text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === clauses.length - 1}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary hover:text-text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown size={14} />
                </button>

                {/* Publish Toggle */}
                <button
                  onClick={() => handleTogglePublish(clause)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    clause.published_live
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                  title={clause.published_live ? 'Published Live' : 'Unpublished'}
                >
                  {clause.published_live ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>

                {/* Edit */}
                <button
                  onClick={() => handleOpenEdit(clause)}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary hover:text-cyan-highlight transition-colors cursor-pointer"
                  title="Edit Clause"
                >
                  <Edit3 size={14} />
                </button>

                {/* Delete */}
                <button
                  onClick={() => setDeleteClause(clause)}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-text-secondary hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete Clause"
                >
                  <Trash2 size={14} />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <div className="relative w-full max-w-xl rounded-3xl bg-bg-elevated border border-white/15 p-6 sm:p-8 z-10 shadow-2xl space-y-4 animate-scale-up my-8">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-xl font-bold text-text-primary">
                {editingClause ? 'Edit Clause' : `Add Clause to ${activeTab}`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.05]"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Clause Heading *
                </label>
                <input
                  type="text"
                  required
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="e.g. 1. Data Encryption and Privacy"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-xs text-text-primary focus:outline-none focus:border-cyan-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Clause Content *
                </label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Full legal text and provisions..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-xs text-text-primary focus:outline-none focus:border-cyan-secondary resize-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="rounded border-white/20 text-cyan-primary focus:ring-0 cursor-pointer"
                  />
                  <span>Published Live on Public Site</span>
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] text-xs font-semibold text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-primary to-cyan-secondary text-white font-bold text-xs shadow-cyan-glow hover:opacity-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingClause ? 'Update Clause' : 'Save Clause'}</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteClause && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setDeleteClause(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-bg-elevated border border-red-500/30 p-6 z-10 shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Delete Clause</h3>
              <p className="text-xs text-text-secondary mt-1">
                Are you sure you want to remove <span className="text-white font-semibold">{deleteClause.clause_heading}</span> from {activeTab}?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteClause(null)}
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
