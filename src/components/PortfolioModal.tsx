import React from 'react';
import { X, ExternalLink, Sparkles, CheckCircle, Play, Layers } from 'lucide-react';
import { PortfolioProject } from '../types';

interface PortfolioModalProps {
  project: PortfolioProject | null;
  onClose: () => void;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({ project, onClose }) => {
  if (!project) return null;

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
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 border border-white/15 text-text-secondary hover:text-text-primary hover:bg-black/80 transition-all backdrop-blur-md"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Media Preview Header */}
        <div className="relative w-full h-64 sm:h-80 bg-bg-secondary overflow-hidden group">
          {project.videoUrl ? (
            <video 
              src={project.videoUrl} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src={project.imageUrl} 
              alt={project.title} 
              className="w-full h-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-bg-elevated via-transparent to-black/40" />

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-cyan-primary/40 border border-cyan-secondary/50 text-cyan-highlight backdrop-blur-md shadow-sm">
              {project.category}
            </span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-2">
              {project.title}
            </h3>
            <p className="text-base text-text-secondary leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Stats Bar */}
          {project.stats && project.stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              {project.stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                    {stat.label}
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-mint-primary mt-0.5">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Technologies Used */}
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

          {/* Action Links */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-primary to-cyan-secondary text-white font-semibold text-sm shadow-cyan-glow hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <span>Visit Live Website</span>
              <ExternalLink size={15} />
            </a>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-text-secondary hover:text-text-primary text-sm transition-colors"
            >
              Close Preview
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
