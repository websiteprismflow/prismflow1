import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  ExternalLink, 
  X, 
  AlertTriangle, 
  Layers, 
  Upload, 
  Image as ImageIcon, 
  Film, 
  Loader2,
  RefreshCw,
  Check
} from 'lucide-react';
import { portfolioService, VALID_PORTFOLIO_CATEGORIES } from '../../services/portfolioService';
import { PortfolioProject, PortfolioCategory } from '../../types';

export const AdminPortfolioPage: React.FC = () => {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteProject, setDeleteProject] = useState<PortfolioProject | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PortfolioCategory>('Website');
  const [description, setDescription] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('https://');
  const [techInput, setTechInput] = useState('React, TypeScript, Supabase');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);

  // Upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    const data = await portfolioService.getAllAdmin();
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setTitle('');
    setCategory('Website');
    setDescription('');
    setPhotoUrls([]);
    setVideoUrl('');
    setWebsiteUrl('https://');
    setTechInput('React, TypeScript, Supabase');
    setFeatured(false);
    setPublished(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (proj: PortfolioProject) => {
    setEditingProject(proj);
    setTitle(proj.project_title || proj.title || '');
    setCategory((proj.category as PortfolioCategory) || 'Website');
    setDescription(proj.description || '');
    setPhotoUrls(proj.project_photo_urls || (proj.imageUrl ? [proj.imageUrl] : []));
    setVideoUrl(proj.preview_video_url || proj.videoUrl || '');
    setWebsiteUrl(proj.live_website_url || proj.websiteUrl || '');
    setTechInput((proj.technologies || []).join(', '));
    setFeatured(proj.featured_on_homepage || false);
    setPublished(proj.published_live !== undefined ? proj.published_live : true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setFormError('');

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await portfolioService.uploadImage(file);
        if (res.success && res.url) {
          newUrls.push(res.url);
        } else {
          setFormError(res.error || `Failed to upload image ${file.name}`);
        }
      }
      if (newUrls.length > 0) {
        setPhotoUrls((prev) => [...prev, ...newUrls]);
      }
    } catch (err) {
      setFormError('Failed to upload image to portfolio-images bucket.');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    setFormError('');

    try {
      const res = await portfolioService.uploadVideo(file);
      if (res.success && res.url) {
        setVideoUrl(res.url);
      } else {
        setFormError(res.error || 'Failed to upload video');
      }
    } catch (err) {
      setFormError('Failed to upload video to portfolio-videos bucket.');
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleTogglePublish = async (proj: PortfolioProject) => {
    const current = proj.published_live !== undefined ? proj.published_live : true;
    await portfolioService.togglePublish(proj.id, current);
    loadProjects();
  };

  const handleToggleFeatured = async (proj: PortfolioProject) => {
    await portfolioService.update(proj.id, {
      featured_on_homepage: !proj.featured_on_homepage
    });
    loadProjects();
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !description.trim()) {
      setFormError('Please provide a project title and description.');
      return;
    }

    // Convert comma-separated string to text[]
    const techArray = techInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setSaving(true);

    try {
      if (editingProject) {
        const res = await portfolioService.update(editingProject.id, {
          project_title: title.trim(),
          category,
          description: description.trim(),
          project_photo_urls: photoUrls,
          preview_video_url: videoUrl.trim() || null,
          live_website_url: websiteUrl.trim() || null,
          technologies: techArray,
          featured_on_homepage: featured,
          published_live: published
        });

        if (res.success) {
          setIsModalOpen(false);
          loadProjects();
        } else {
          setFormError(res.error || 'Failed to update project');
        }
      } else {
        const res = await portfolioService.create({
          project_title: title.trim(),
          category,
          description: description.trim(),
          project_photo_urls: photoUrls,
          preview_video_url: videoUrl.trim() || null,
          live_website_url: websiteUrl.trim() || null,
          technologies: techArray,
          featured_on_homepage: featured,
          published_live: published
        });

        if (res.success) {
          setIsModalOpen(false);
          loadProjects();
        } else {
          setFormError(res.error || 'Failed to create project');
        }
      }
    } catch (err) {
      setFormError('An unexpected error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteProject = async () => {
    if (!deleteProject) return;
    setDeleting(true);

    const mediaList: string[] = [];
    if (deleteProject.project_photo_urls) mediaList.push(...deleteProject.project_photo_urls);
    if (deleteProject.preview_video_url) mediaList.push(deleteProject.preview_video_url);

    await portfolioService.delete(deleteProject.id, mediaList);
    setDeleting(false);
    setDeleteProject(null);
    loadProjects();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Portfolio Management
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Curate showcased work, upload images to Supabase Storage, and manage live visibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadProjects}
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
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-24 rounded-2xl glass-panel border border-white/10 flex flex-col items-center justify-center gap-3 text-text-secondary">
          <Loader2 size={28} className="animate-spin text-cyan-secondary" />
          <span className="text-xs">Loading projects from Supabase...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="py-20 rounded-2xl glass-panel border border-white/10 text-center flex flex-col items-center justify-center p-6">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-text-muted mb-3">
            <FolderKanban size={22} />
          </div>
          <h3 className="text-base font-bold text-text-primary">No portfolio items</h3>
          <p className="text-xs text-text-secondary max-w-sm mt-1 mb-6">
            Add your first project to display it on the public showcase.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-cyan-primary/20 border border-cyan-secondary/40 text-cyan-highlight text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus size={14} /> Add Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const mainImage = (proj.project_photo_urls && proj.project_photo_urls[0]) || proj.imageUrl || '';
            const isPublished = proj.published_live !== undefined ? proj.published_live : true;

            return (
              <div
                key={proj.id}
                className={`rounded-2xl glass-panel border transition-all overflow-hidden flex flex-col justify-between group ${
                  isPublished ? 'border-white/10' : 'border-amber-500/30 opacity-75'
                }`}
              >
                <div>
                  {/* Media Preview Header */}
                  <div className="relative h-44 bg-bg-secondary overflow-hidden">
                    {mainImage ? (
                      <img src={mainImage} alt={proj.project_title || proj.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted bg-white/[0.02]">
                        <ImageIcon size={24} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-bg-elevated via-transparent to-transparent opacity-80" />

                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-bg-primary/80 backdrop-blur-md border border-white/15 text-cyan-highlight">
                        {proj.category}
                      </span>
                      {proj.featured_on_homepage && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 flex items-center gap-1">
                          <Star size={10} fill="currentColor" /> Featured
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePublish(proj)}
                        className={`p-1.5 rounded-lg backdrop-blur-md transition-colors cursor-pointer ${
                          isPublished
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                            : 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                        }`}
                        title={isPublished ? 'Published Live (Click to unpublish)' : 'Unpublished (Click to publish)'}
                      >
                        {isPublished ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                    </div>

                    {proj.project_photo_urls && proj.project_photo_urls.length > 1 && (
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-text-muted backdrop-blur-sm border border-white/10">
                        {proj.project_photo_urls.length} photos
                      </div>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-text-primary line-clamp-1">
                      {proj.project_title || proj.title}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {(proj.technologies || []).slice(0, 4).map((tech) => (
                        <span key={tech} className="px-2 py-0.5 rounded bg-white/[0.04] text-[10px] text-text-muted">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFeatured(proj)}
                      className={`text-[11px] flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        proj.featured_on_homepage
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                          : 'border-white/10 text-text-muted hover:text-text-primary'
                      }`}
                    >
                      <Star size={11} fill={proj.featured_on_homepage ? 'currentColor' : 'none'} />
                      <span>{proj.featured_on_homepage ? 'Featured' : 'Feature'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(proj)}
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary hover:text-cyan-highlight transition-colors cursor-pointer"
                      title="Edit Project"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteProject(proj)}
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-text-secondary hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-bg-elevated border border-white/15 p-6 sm:p-8 z-10 shadow-2xl space-y-5 animate-scale-up my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-xl font-bold text-text-primary">
                {editingProject ? 'Edit Project' : 'Create New Portfolio Project'}
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
              
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Nexus AI Automation Hub"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-xs text-text-primary focus:outline-none focus:border-cyan-secondary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PortfolioCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-xs text-text-primary focus:outline-none focus:border-cyan-secondary cursor-pointer"
                  >
                    {VALID_PORTFOLIO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Architectural overview and impact summary..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-xs text-text-primary focus:outline-none focus:border-cyan-secondary resize-none"
                />
              </div>

              {/* Photo Uploads (Storage bucket 'portfolio-images') */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                  Project Photos (Supabase Storage: portfolio-images)
                </label>
                
                {photoUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 mb-3">
                    {photoUrls.map((url, idx) => (
                      <div key={idx} className="relative w-20 h-16 rounded-xl overflow-hidden border border-white/15 group">
                        <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute inset-0 bg-black/60 text-red-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageFileChange}
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
                  multiple
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full py-3 rounded-xl border border-dashed border-white/20 hover:border-cyan-secondary/50 bg-white/[0.02] hover:bg-white/[0.04] text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-cyan-secondary" />
                      <span>Uploading to portfolio-images bucket...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="text-cyan-secondary" />
                      <span>Upload Photos to Storage (JPEG, PNG, WebP)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Video Upload (Storage bucket 'portfolio-videos') */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                  Preview Video (Supabase Storage: portfolio-videos)
                </label>
                
                {videoUrl && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs mb-2">
                    <span className="truncate text-cyan-highlight mr-2">{videoUrl}</span>
                    <button
                      type="button"
                      onClick={() => setVideoUrl('')}
                      className="p-1 text-text-muted hover:text-red-400 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoFileChange}
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploadingVideo}
                  className="w-full py-2.5 rounded-xl border border-dashed border-white/15 bg-white/[0.01] hover:bg-white/[0.03] text-xs text-text-secondary flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {uploadingVideo ? (
                    <>
                      <Loader2 size={15} className="animate-spin text-cyan-secondary" />
                      <span>Uploading video...</span>
                    </>
                  ) : (
                    <>
                      <Film size={15} className="text-mint-primary" />
                      <span>Upload Video Preview (MP4, WebM)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live URL & Technologies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                    Live Website URL
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://client-demo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-xs text-text-primary focus:outline-none focus:border-cyan-secondary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                    Technologies (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="Next.js, Python, Supabase"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-xs text-text-primary focus:outline-none focus:border-cyan-secondary"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs font-medium text-text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded border-white/20 text-cyan-primary focus:ring-0 cursor-pointer"
                  />
                  <span>Featured on Homepage</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="rounded border-white/20 text-cyan-primary focus:ring-0 cursor-pointer"
                  />
                  <span>Published Live</span>
                </label>
              </div>

              {/* Submit Buttons */}
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
                  disabled={saving || uploadingImage || uploadingVideo}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-primary to-cyan-secondary text-white font-bold text-xs shadow-cyan-glow hover:opacity-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <span>{editingProject ? 'Update Project' : 'Publish Project'}</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setDeleteProject(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-bg-elevated border border-red-500/30 p-6 z-10 shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Delete Project</h3>
              <p className="text-xs text-text-secondary mt-1">
                Are you sure you want to remove <span className="text-white font-semibold">{deleteProject.project_title || deleteProject.title}</span>? This will also clean up associated media files in storage.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteProject(null)}
                className="flex-1 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProject}
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
