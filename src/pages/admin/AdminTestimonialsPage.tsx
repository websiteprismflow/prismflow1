import React, { useState, useEffect } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { testimonialService } from '../../services/testimonialService';
import { subscribeToStorage } from '../../services/storage';
import { Testimonial } from '../../types';

export const AdminTestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Form Fields
  const [clientName, setClientName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [review, setReview] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [rating, setRating] = useState(5);
  const [published, setPublished] = useState(true);

  const loadTestimonials = () => {
    setTestimonials(testimonialService.getAll(true));
  };

  useEffect(() => {
    loadTestimonials();
    const unsubscribe = subscribeToStorage((key) => {
      if (key === 'prism_testimonials') {
        loadTestimonials();
      }
    });
    return unsubscribe;
  }, []);

  const handleOpenAddModal = () => {
    setEditingTestimonial(null);
    setClientName('');
    setCompany('');
    setRole('Founder & CEO');
    setReview('');
    setProfileImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
    setWebsiteUrl('https://example.com');
    setRating(5);
    setPublished(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: Testimonial) => {
    setEditingTestimonial(t);
    setClientName(t.clientName);
    setCompany(t.company);
    setRole(t.role);
    setReview(t.review);
    setProfileImage(t.profileImage);
    setWebsiteUrl(t.websiteUrl);
    setRating(t.rating || 5);
    setPublished(t.published);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTestimonial) {
      await testimonialService.update(editingTestimonial.id, {
        clientName,
        company,
        role,
        review,
        profileImage,
        websiteUrl,
        rating,
        published
      });
    } else {
      await testimonialService.create({
        clientName,
        company,
        role,
        review,
        profileImage,
        websiteUrl,
        rating,
        published
      });
    }

    setIsModalOpen(false);
    loadTestimonials();
  };

  const handleTogglePublish = async (id: string) => {
    await testimonialService.togglePublish(id);
    loadTestimonials();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await testimonialService.delete(deleteId);
    setDeleteId(null);
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
            Manage authentic client reviews, company links, and publication statuses.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-primary to-cyan-secondary text-white text-xs font-bold shadow-cyan-glow flex items-center gap-1.5 hover:opacity-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Testimonials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((item) => (
          <div
            key={item.id}
            className={`p-6 rounded-3xl glass-panel border flex flex-col justify-between ${
              item.published ? 'border-white/10' : 'border-dashed border-white/20 opacity-70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-mint-primary">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>

                <button
                  onClick={() => handleTogglePublish(item.id)}
                  className={`p-1.5 rounded-full text-xs transition-colors ${
                    item.published ? 'bg-mint-primary/20 text-mint-primary border border-mint-primary/40' : 'bg-black/60 text-text-muted'
                  }`}
                  title={item.published ? 'Published (Click to unpublish)' : 'Unpublished (Click to publish)'}
                >
                  {item.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>

              <p className="text-sm text-text-primary italic mb-6 leading-relaxed">
                "{item.review}"
              </p>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={item.profileImage}
                  alt={item.clientName}
                  className="w-10 h-10 rounded-full object-cover border border-white/15"
                />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-text-primary">{item.clientName}</h4>
                  <p className="text-[11px] text-text-secondary">
                    {item.role}, <span className="text-cyan-secondary">{item.company}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="p-1.5 rounded-lg bg-white/[0.04] text-text-secondary hover:text-cyan-highlight"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="p-1.5 rounded-lg bg-white/[0.04] text-text-muted hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl animate-fade-in"
          />

          <div className="relative w-full max-w-lg rounded-3xl bg-bg-elevated border border-white/15 shadow-2xl p-6 sm:p-8 z-10 animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-text-primary">
                {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-text-muted hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase font-semibold text-text-secondary mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full p-2.5 rounded-xl bg-bg-primary border border-white/10 text-text-primary"
                  />
                </div>

                <div>
                  <label className="block uppercase font-semibold text-text-secondary mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Synthetix Bio"
                    className="w-full p-2.5 rounded-xl bg-bg-primary border border-white/10 text-text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase font-semibold text-text-secondary mb-1">
                    Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Head of Product"
                    className="w-full p-2.5 rounded-xl bg-bg-primary border border-white/10 text-text-primary"
                  />
                </div>

                <div>
                  <label className="block uppercase font-semibold text-text-secondary mb-1">
                    Rating (1 to 5)
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-bg-primary border border-white/10 text-text-primary cursor-pointer"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase font-semibold text-text-secondary mb-1">
                  Client Review Quote *
                </label>
                <textarea
                  rows={4}
                  required
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="What was their experience working with Prism Flow..."
                  className="w-full p-2.5 rounded-xl bg-bg-primary border border-white/10 text-text-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase font-semibold text-text-secondary mb-1">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    required
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-bg-primary border border-white/10 text-text-primary font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block uppercase font-semibold text-text-secondary mb-1">
                    Company Website URL
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl bg-bg-primary border border-white/10 text-text-primary font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pubCheck"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded bg-bg-primary border-white/20 text-cyan-secondary"
                />
                <label htmlFor="pubCheck" className="text-text-secondary cursor-pointer">
                  Publish to Live Testimonials Section
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-primary to-cyan-secondary text-white font-bold shadow-cyan-glow"
                >
                  Save Testimonial
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation */}
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

            <h3 className="text-base font-bold text-text-primary">
              Delete Testimonial
            </h3>
            <p className="text-xs text-text-secondary">
              Are you sure you want to delete this testimonial?
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] text-xs text-text-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-xs font-bold text-white shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
