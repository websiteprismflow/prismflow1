import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquareQuote, 
  Plus, 
  Edit3, 
  Trash2, 
  Star, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  X, 
  AlertTriangle,
  Upload,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { testimonialService } from '../../services/testimonialService';
import { Testimonial, TestimonialRating } from '../../types';

export const AdminTestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTestimonial, setDeleteTestimonial] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Form Fields
  const [clientName, setClientName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Founder & CEO');
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('https://');
  const [rating, setRating] = useState<TestimonialRating>(5);
  const [published, setPublished] = useState(true);

  // Upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadTestimonials = async () => {
    setLoading(true);
    const data = await testimonialService.getAllAdmin();
    setTestimonials(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const handleOpenAddModal = () => {
    setEditingTestimonial(null);
    setClientName('');
    setCompany('');
    setRole('Founder & CEO');
    setTitle('');
    setReview('');
    setAvatarUrl('');
    setWebsiteUrl('https://');
    setRating(5);
    setPublished(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: Testimonial) => {
    setEditingTestimonial(t);
    setClientName(t.client_name || t.clientName || '');
    setCompany(t.company || '');
    setRole(t.role || 'Founder & CEO');
    setTitle(t.title || '');
    setReview(t.client_review_quote || t.review || '');
    setAvatarUrl(t.avatar_image_url || t.profileImage || '');
    setWebsiteUrl(t.company_website_url || t.websiteUrl || '');
    const cleanRating = ([3, 4, 5].includes(t.rating) ? t.rating : 5) as TestimonialRating;
    setRating(cleanRating);
    setPublished(t.published_live !== undefined ? t.published_live : true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setFormError('');

    try {
      const res = await testimonialService.uploadAvatar(file);
      if (res.success && res.url) {
        setAvatarUrl(res.url);
      } else {
        setFormError(res.error || 'Failed to upload avatar');
      }
    } catch (err) {
      setFormError('Failed to upload avatar to testimonial-avatars bucket.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleTogglePublish = async (t: Testimonial) => {
    const current = t.published_live !== undefined ? t.published_live : true;
    await testimonialService.togglePublish(t.id, current);
    loadTestimonials();
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!clientName.trim() || !company.trim() || !review.trim()) {
      setFormError('Please fill out client name, company, and review quote.');
      return;
    }

    setSaving(true);

    try {
      if (editingTestimonial) {
        const res = await testimonialService.update(editingTestimonial.id, {
          client_name: clientName.trim(),
          company: company.trim(),
          role: role.trim(),
          title: title.trim() || null,
          rating,
          client_review_quote: review.trim(),
          avatar_image_url: avatarUrl.trim() || null,
          company_website_url: websiteUrl.trim() || null,
          published_live: published
        });

        if (res.success) {
          setIsModalOpen(false);
          loadTestimonials();
        } else {
          setFormError(res.error || 'Failed to update testimonial');
        }
      } else {
        const res = await testimonialService.create({
          client_name: clientName.trim(),
          company: company.trim(),
          role: role.trim(),
          title: title.trim() || null,
          rating,
          client_review_quote: review.trim(),
          avatar_image_url: avatarUrl.trim() || null,
          company_website_url: websiteUrl.trim() || null,
          published_live: published
        });

        if (res.success) {
          setIsModalOpen(false);
          loadTestimonials();
        } else {
          setFormError(res.error || 'Failed to create testimonial');
        }
      }
    } catch (err) {
      setFormError('An unexpected error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTestimonial) return;
    setDeleting(true);
    await testimonialService.delete(deleteTestimonial.id, deleteTestimonial.avatar_image_url);
    setDeleting(false);
    setDeleteTestimonial(null);
    loadTestimonials();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Client Testimonials
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Manage client endorsements, ratings (3-5 stars), and avatars in Supabase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadTestimonials}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-primary to-cyan-secondary text-white font-bold text-xs shadow-cyan-glow hover:opacity-95 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus size={16} />
            <span>Add Testimonial</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-24 rounded-2xl glass-panel border border-white/10 flex flex-col items-center justify-center gap-3 text-text-secondary">
          <Loader2 size={28} className="animate-spin text-cyan-secondary" />
          <span className="text-xs">Loading testimonials from Supabase...</span>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="py-20 rounded-2xl glass-panel border border-white/10 text-center flex flex-col items-center justify-center p-6">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-text-muted mb-3">
            <MessageSquareQuote size={22} />
          </div>
          <h3 className="text-base font-bold text-text-primary">No testimonials found</h3>
          <p className="text-xs text-text-secondary max-w-sm mt-1 mb-6">
            Add client feedback to showcase proof of work on the home page.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-cyan-primary/20 border border-cyan-secondary/40 text-cyan-highlight text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus size={14} /> Add Testimonial
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => {
            const isPublished = t.published_live !== undefined ? t.published_live : true;

            return (
              <div
                key={t.id}
                className={`p-6 rounded-2xl glass-panel border transition-all flex flex-col justify-between ${
                  isPublished ? 'border-white/10' : 'border-amber-500/30 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePublish(t)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isPublished
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                        title={isPublished ? 'Published Live' : 'Unpublished'}
                      >
                        {isPublished ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 mb-4 font-light">
                    "{t.client_review_quote || t.review}"
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {t.avatar_image_url || t.profileImage ? (
                      <img
                        src={t.avatar_image_url || t.profileImage}
                        alt={t.client_name || t.clientName}
                        className="w-9 h-9 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-cyan-primary/20 border border-cyan-secondary/40 text-cyan-highlight font-bold flex items-center justify-center text-xs">
                        {(t.client_name || t.clientName || 'C')[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">
                        {t.client_name || t.clientName}
                      </h4>
                      <p className="text-[11px] text-text-muted">
                        {t.role}, {t.company}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(t)}
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary hover:text-cyan-highlight transition-colors cursor-pointer"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteTestimonial(t)}
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-text-secondary hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <div className="relative w-full max-w-xl rounded-3xl bg-bg-elevated border border-white/15 p-6 sm:p-8 z-10 shadow-2xl space-y-4 animate-scale-up my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-xl font-bold text-text-primary">
                {editingTestimonial ? 'Edit Testimonial' : 'Create New Testimonial'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Jordan Hayes"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-xs text-text-primary focus:outline-none focus:border-cyan-secondary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Orbit AI"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-xs text-text-primary focus:outline-none focus:border-cyan-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                    Role / Position
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Chief Product Officer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-xs text-text-primary focus:outline-none focus:border-cyan-secondary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                    Star Rating (Exact: 3, 4, or 5) *
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value) as TestimonialRating)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-xs text-text-primary focus:outline-none focus:border-cyan-secondary cursor-pointer"
                  >
                    <option value={5}>★★★★★ (5 Stars)</option>
                    <option value={4}>★★★★☆ (4 Stars)</option>
                    <option value={3}>★★★☆☆ (3 Stars)</option>
                  </select>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Client Review Quote *
                </label>
                <textarea
                  rows={4}
                  required
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="What was the result or experience of working with Prism Flow?..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-xs text-text-primary focus:outline-none focus:border-cyan-secondary resize-none"
                />
              </div>

              {/* Avatar Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Avatar Photo (Supabase Storage: testimonial-avatars)
                </label>
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar Preview" className="w-12 h-12 rounded-full object-cover border border-white/15 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-text-muted shrink-0 text-xs">
                      Avatar
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileChange}
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="flex-1 py-2.5 rounded-xl border border-dashed border-white/20 hover:border-cyan-secondary/50 bg-white/[0.02] text-xs text-text-secondary hover:text-text-primary flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {uploadingAvatar ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-cyan-secondary" />
                        <span>Uploading avatar...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} className="text-cyan-secondary" />
                        <span>Upload Avatar Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Company Website */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Company Website URL
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-xs text-text-primary focus:outline-none focus:border-cyan-secondary"
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
                  disabled={saving || uploadingAvatar}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-primary to-cyan-secondary text-white font-bold text-xs shadow-cyan-glow hover:opacity-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingTestimonial ? 'Update Testimonial' : 'Save Testimonial'}</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setDeleteTestimonial(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-bg-elevated border border-red-500/30 p-6 z-10 shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Delete Testimonial</h3>
              <p className="text-xs text-text-secondary mt-1">
                Are you sure you want to remove the testimonial from <span className="text-white font-semibold">{deleteTestimonial.client_name || deleteTestimonial.clientName}</span>?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteTestimonial(null)}
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
