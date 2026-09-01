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
  Sparkles,
  Upload,
  Image as ImageIcon,
  Film,
  Link as LinkIcon,
  CheckCircle2
} from 'lucide-react';
import { portfolioService } from '../../services/portfolioService';
import { subscribeToStorage } from '../../services/storage';
import { PortfolioProject, ProjectCategory } from '../../types';

export const AdminPortfolioPage: React.FC = () => {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Websites');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [techInput, setTechInput] = useState('');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);

  // Upload mode states
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [videoMode, setVideoMode] = useState<'upload' | 'url'>('upload');
  const [imageFileName, setImageFileName] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const [uploadError, setUploadError] = useState('');

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const loadProjects = () => {
    setProjects(portfolioService.getAll(true));
  };

  useEffect(() => {
    loadProjects();
    const unsubscribe = subscribeToStorage((key) => {
      if (key === 'prism_portfolio') {
        loadProjects();
      }
    });
    return unsubscribe;
  }, []);

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setTitle('');
    setCategory('Websites');
    setDescription('');
    setImageUrl('');
    setImageFileName('');
    setVideoUrl('');
    setVideoFileName('');
    setWebsiteUrl('https://');
    setTechInput('React, TypeScript, AI');
    setFeatured(false);
    setPublished(true);
    setImageMode('upload');
    setVideoMode('upload');
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (proj: PortfolioProject) => {
    setEditingProject(proj);
    setTitle(proj.title);
    setCategory(proj.category);
    setDescription(proj.description);
    setImageUrl(proj.imageUrl);
    setImageFileName(proj.imageUrl.startsWith('data:') ? 'Custom uploaded image' : '');
    setVideoUrl(proj.videoUrl || '');
    setVideoFileName(proj.videoUrl?.startsWith('data:') ? 'Custom uploaded video' : '');
    setWebsiteUrl(proj.websiteUrl);
    setTechInput(proj.technologies.join(', '));
    setFeatured(proj.featured);
    setPublished(proj.published);
    setImageMode(proj.imageUrl.startsWith('data:') ? 'upload' : 'upload');
    setVideoMode(proj.videoUrl?.startsWith('data:') ? 'upload' : 'upload');
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleImageFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP, SVG)');
      return;
    }
    setUploadError('');
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileUpload = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a valid video file (MP4, WebM, MOV)');
      return;
    }
    setUploadError('');
    setVideoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setVideoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setUploadError('Please select or upload a project cover photo.');
      return;
    }

    const techArray = techInput.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingProject) {
      await portfolioService.update(editingProject.id, {
        title,
        category,
        description,
        imageUrl,
        videoUrl: videoUrl.trim() || undefined,
        websiteUrl,
        technologies: techArray,
        featured,
        published
      });
    } else {
      await portfolioService.create({
        title,
        category,
        description,
        imageUrl,
        videoUrl: videoUrl.trim() || undefined,
        websiteUrl,
        technologies: techArray,
        featured,
        published
      });
    }

    setIsModalOpen(false);
    loadProjects();
  };

  const handleTogglePublish = async (id: string) => {
    await portfolioService.togglePublish(id);
    loadProjects();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await portfolioService.delete(deleteId);
    setDeleteId(null);
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
            Publish, edit, and organize selected works displayed on the public website.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-primary to-cyan-secondary text-white text-xs font-bold shadow-cyan-glow flex items-center gap-1.5 hover:opacity-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className={`p-5 rounded-3xl glass-panel border flex flex-col justify-between transition-all ${
              proj.published ? 'border-white/10' : 'border-dashed border-white/20 opacity-70'
            }`}
          >
            <div>
              {/* Preview Image */}
              <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-bg-secondary mb-4 border border-white/5">
                <img
                  src={proj.imageUrl}
                  alt={proj.title}
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-bg-elevated/90 border border-white/10 text-cyan-highlight">
                    {proj.category}
                  </span>
                  {proj.featured && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-mint-primary/20 text-mint-primary border border-mint-primary/40 flex items-center gap-1">
                      <Star size={9} fill="currentColor" /> Featured
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleTogglePublish(proj.id)}
                  className={`absolute top-2.5 right-2.5 p-1.5 rounded-full text-xs backdrop-blur-md transition-colors ${
                    proj.published ? 'bg-mint-primary/20 text-mint-primary border border-mint-primary/40' : 'bg-black/60 text-text-muted'
                  }`}
                  title={proj.published ? 'Published (Click to Unpublish)' : 'Unpublished (Click to Publish)'}
                >
                  {proj.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>

              {/* Title & Description */}
              <h3 className="font-bold text-base text-text-primary mb-1.5">
                {proj.title}
              </h3>
              <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed">
                {proj.description}
              </p>

              {/* Tech Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {proj.technologies.slice(0, 3).map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-white/[0.03] text-text-muted">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between">
              <a
                href={proj.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-cyan-secondary hover:text-mint-primary flex items-center gap-1"
              >
                <span>Live Link</span>
                <ExternalLink size={11} />
              </a>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEditModal(proj)}
                  className="p-1.5 rounded-lg bg-white/[0.04] text-text-secondary hover:text-cyan-highlight hover:bg-white/[0.08] transition-colors"
                  title="Edit Project"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => setDeleteId(proj.id)}
                  className="p-1.5 rounded-lg bg-white/[0.04] text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl animate-fade-in"
          />

          <div className="relative w-full max-w-2xl rounded-3xl bg-bg-elevated border border-white/15 shadow-2xl p-6 sm:p-8 z-10 animate-scale-up space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-text-primary">
                {editingProject ? 'Edit Project' : 'Add New Portfolio Project'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-text-muted hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-text-secondary mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Nexus Core"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-text-primary text-xs focus:outline-none focus:border-cyan-secondary"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-text-secondary mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-text-primary text-xs focus:outline-none focus:border-cyan-secondary cursor-pointer"
                  >
                    <option value="Websites">Websites</option>
                    <option value="AI Agents">AI Agents</option>
                    <option value="SaaS">SaaS</option>
                    <option value="Automation">Automation</option>
                    <option value="E-Commerce">E-Commerce</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-text-secondary mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the problem, intelligent architecture, and business outcomes..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-text-primary text-xs focus:outline-none focus:border-cyan-secondary resize-none"
                />
              </div>

              {/* Error Notice */}
              {uploadError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Photo & Video Desktop Uploaders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Project Photo Upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block uppercase tracking-wider font-semibold text-text-secondary text-[11px]">
                      Project Photo *
                    </label>
                    <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/10">
                      <button
                        type="button"
                        onClick={() => setImageMode('upload')}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                          imageMode === 'upload' ? 'bg-cyan-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        Desktop
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode('url')}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                          imageMode === 'url' ? 'bg-cyan-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        URL
                      </button>
                    </div>
                  </div>

                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageFileUpload(file);
                    }}
                  />

                  {imageMode === 'upload' ? (
                    imageUrl ? (
                      <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-bg-primary p-2 flex items-center gap-3">
                        <img 
                          src={imageUrl} 
                          alt="Cover Preview" 
                          className="w-16 h-14 object-cover rounded-xl border border-white/10 shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-text-primary truncate">
                            {imageFileName || 'Selected Cover Photo'}
                          </p>
                          <span className="text-[10px] text-mint-primary flex items-center gap-1 mt-0.5">
                            <CheckCircle2 size={11} /> Photo Loaded
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-text-primary text-[10px] font-medium"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrl('');
                              setImageFileName('');
                              if (imageInputRef.current) imageInputRef.current.value = '';
                            }}
                            className="p-1 rounded-lg hover:bg-red-500/20 text-text-muted hover:text-red-400"
                            title="Remove Photo"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => imageInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleImageFileUpload(file);
                        }}
                        className="border-2 border-dashed border-white/20 hover:border-cyan-secondary/70 hover:bg-cyan-primary/5 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 min-h-[96px]"
                      >
                        <div className="w-8 h-8 rounded-full bg-cyan-primary/10 text-cyan-secondary flex items-center justify-center">
                          <Upload size={16} />
                        </div>
                        <p className="text-[11px] font-semibold text-text-primary">
                          Click or drag image from desktop
                        </p>
                        <p className="text-[10px] text-text-muted">
                          PNG, JPG, WebP, SVG supported
                        </p>
                      </div>
                    )
                  ) : (
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImageFileName('');
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-text-primary text-xs focus:outline-none focus:border-cyan-secondary"
                    />
                  )}
                </div>

                {/* 2. Project Video Upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block uppercase tracking-wider font-semibold text-text-secondary text-[11px]">
                      Preview Video <span className="text-text-muted font-normal lowercase">(optional)</span>
                    </label>
                    <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/10">
                      <button
                        type="button"
                        onClick={() => setVideoMode('upload')}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                          videoMode === 'upload' ? 'bg-mint-primary text-black font-bold shadow-sm' : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        Desktop
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoMode('url')}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                          videoMode === 'url' ? 'bg-mint-primary text-black font-bold shadow-sm' : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        URL
                      </button>
                    </div>
                  </div>

                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleVideoFileUpload(file);
                    }}
                  />

                  {videoMode === 'upload' ? (
                    videoUrl ? (
                      <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-bg-primary p-2 flex items-center gap-3">
                        <div className="w-16 h-14 bg-black rounded-xl overflow-hidden border border-white/10 shrink-0 flex items-center justify-center">
                          <video 
                            src={videoUrl} 
                            className="w-full h-full object-cover" 
                            muted 
                            playsInline 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-text-primary truncate">
                            {videoFileName || 'Selected Video File'}
                          </p>
                          <span className="text-[10px] text-mint-primary flex items-center gap-1 mt-0.5">
                            <CheckCircle2 size={11} /> Video Loaded
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => videoInputRef.current?.click()}
                            className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-text-primary text-[10px] font-medium"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setVideoUrl('');
                              setVideoFileName('');
                              if (videoInputRef.current) videoInputRef.current.value = '';
                            }}
                            className="p-1 rounded-lg hover:bg-red-500/20 text-text-muted hover:text-red-400"
                            title="Remove Video"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => videoInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleVideoFileUpload(file);
                        }}
                        className="border-2 border-dashed border-white/20 hover:border-mint-primary/70 hover:bg-mint-primary/5 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 min-h-[96px]"
                      >
                        <div className="w-8 h-8 rounded-full bg-mint-primary/10 text-mint-primary flex items-center justify-center">
                          <Film size={16} />
                        </div>
                        <p className="text-[11px] font-semibold text-text-primary">
                          Click or drag video from desktop
                        </p>
                        <p className="text-[10px] text-text-muted">
                          MP4, WebM, MOV supported
                        </p>
                      </div>
                    )
                  ) : (
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => {
                        setVideoUrl(e.target.value);
                        setVideoFileName('');
                      }}
                      placeholder="https://assets.mixkit.co/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-text-primary text-xs focus:outline-none focus:border-cyan-secondary"
                    />
                  )}
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-text-secondary mb-1">
                    Website Live URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-text-primary text-xs focus:outline-none focus:border-cyan-secondary"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-text-secondary mb-1">
                    Technologies (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="React, TypeScript, LangGraph, Python"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-white/10 text-text-primary text-xs focus:outline-none focus:border-cyan-secondary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded bg-bg-primary border-white/20 text-cyan-secondary focus:ring-0"
                  />
                  <span className="text-text-secondary font-medium">Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="rounded bg-bg-primary border-white/20 text-cyan-secondary focus:ring-0"
                  />
                  <span className="text-text-secondary font-medium">Published Live</span>
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-primary to-cyan-secondary text-white font-bold shadow-cyan-glow hover:opacity-95"
                >
                  {editingProject ? 'Save Changes' : 'Publish Project'}
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

            <h3 className="text-lg font-bold text-text-primary">
              Delete Project
            </h3>
            <p className="text-xs text-text-secondary">
              Are you sure you want to permanently remove this portfolio project?
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
