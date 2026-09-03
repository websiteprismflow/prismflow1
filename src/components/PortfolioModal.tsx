import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Play, Layers } from 'lucide-react';
import { PortfolioProject } from '../types';

interface PortfolioModalProps {
  project: PortfolioProject | null;
  onClose: () => void;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({ project, onClose }) => {
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);

  useEffect(() => {
    setActiveMediaIndex(0);
  }, [project]);

  if (!project) return null;

  const photos = project.project_photo_urls && project.project_photo_urls.length > 0
    ? project.project_photo_urls
    : project.imageUrl ? [project.imageUrl] : [];

  const video = project.preview_video_url || project.videoUrl;
  const website = project.live_website_url || project.websiteUrl;
  const title = project.project_title || project.title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-xl transition-opacity animate-fade-in"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl rounded-3xl bg-bg-elevated border border-white/15 shadow-2xl overflow-hidden z-10 my-8 animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 border border-white/15 text-text-secondary hover:text-text-primary hover:bg-black/80 transition-all backdrop-blur-md cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Media Preview Header */}
        <div className="relative w-full h-64 sm:h-80 bg-bg-secondary overflow-hidden group">
          {video && activeMediaIndex === -1 ? (
            <video 
              src={video} 
              autoPlay 
              controls
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover"
            />
          ) : photos[activeMediaIndex] ? (
            <img 
              src={photos[activeMediaIndex]} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted">
              <span>No preview media available</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-bg-elevated via-transparent to-black/40 pointer-events-none" />

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between pointer-events-none">
            <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-cyan-primary/40 border border-cyan-secondary/50 text-cyan-highlight backdrop-blur-md shadow-sm">
              {project.category}
            </span>
          </div>
        </div>

        {/* Thumbnails Gallery Strip if multiple media */}
        {(photos.length > 1 || (photos.length > 0 && video)) && (
          <div className="px-6 py-3 bg-bg-secondary/70 border-b border-white/[0.08] flex items-center gap-2 overflow-x-auto no-scrollbar">
            {video && (
              <button
                onClick={() => setActiveMediaIndex(-1)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                  activeMediaIndex === -1
                    ? 'bg-cyan-primary/30 border border-cyan-secondary text-cyan-highlight'
                    : 'bg-white/[0.04] border border-white/10 text-text-secondary hover:text-text-primary'
                }`}
              >
                <Play size={12} /> Video Preview
              </button>
            )}

            {photos.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setActiveMediaIndex(idx)}
                className={`relative w-14 h-10 rounded-lg overflow-hidden shrink-0 border transition-all cursor-pointer ${
                  activeMediaIndex === idx
                    ? 'border-cyan-secondary ring-2 ring-cyan-secondary/40 scale-105'
                    : 'border-white/15 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Modal Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-2">
              {title}
            </h3>
            <p className="text-base text-text-secondary leading-relaxed font-light">
              {project.description}
            </p>
          </div>

          {/* Technologies Used */}
          {project.technologies && project.technologies.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
                <Layers size={13} className="text-cyan-secondary" />
                Technology Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span 
                    key={tech}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/10 text-text-secondary"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            >
              Close Window
            </button>

            {website && website !== '#' && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-primary to-cyan-secondary text-white text-xs font-bold shadow-cyan-glow hover:opacity-95 transition-all"
              >
                <span>Visit Live Platform</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
