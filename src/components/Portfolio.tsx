import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, ArrowRight, Play, Sparkles, Filter } from 'lucide-react';
import { portfolioService } from '../services/portfolioService';
import { subscribeToStorage } from '../services/storage';
import { PortfolioProject, ProjectCategory } from '../types';
import { PortfolioModal } from './PortfolioModal';

const categories: ProjectCategory[] = [
  'Websites',
  'AI Agents',
  'SaaS',
  'Automation',
  'E-Commerce'
];

export const Portfolio: React.FC = () => {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>('Websites');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);

  // Sync projects with storage changes in real-time
  const loadProjects = () => {
    setProjects(portfolioService.getAll());
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

  const filteredProjects = projects.filter(
    (p) =>
      p.category === selectedCategory ||
      (selectedCategory === 'Automation' &&
        (p.category === 'Automation' || (p.category as any) === 'Agentic Systems'))
  );

  return (
    <section id="work" className="relative py-24 sm:py-32 bg-bg-primary overflow-hidden">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-cyan-primary/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-mint-primary" />
              <span className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
                OUR PORTFOLIO
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary leading-tight">
              Things We’ve Brought to Life.
            </h2>
          </div>

          <p className="text-sm sm:text-base text-text-secondary max-w-md">
            Take a look at our real projects, working demos, and digital experiences.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-b from-white/15 to-white/5 border border-mint-primary/40 text-text-primary shadow-sm shadow-mint-primary/10'
                    : 'bg-white/[0.02] border border-white/[0.06] text-text-secondary hover:text-text-primary hover:bg-white/[0.05]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Portfolio Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((project) => {
            const isHovered = hoveredProjectId === project.id;

            return (
              <div
                key={project.id}
                onMouseEnter={() => setHoveredProjectId(project.id)}
                onMouseLeave={() => setHoveredProjectId(null)}
                className="group relative rounded-3xl glass-panel overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-cyan-secondary/40 hover:shadow-glass-card"
              >
                {/* Media Preview Container */}
                <div 
                  onClick={() => setSelectedProject(project)}
                  className="relative w-full h-56 sm:h-64 overflow-hidden cursor-pointer bg-bg-secondary"
                >
                  {project.videoUrl && isHovered ? (
                    <video
                      src={project.videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover transition-transform duration-700 scale-105"
                    />
                  ) : (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-elevated via-bg-primary/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Category Pill */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider bg-bg-elevated/80 border border-white/10 text-cyan-highlight backdrop-blur-md">
                      {project.category}
                    </span>
                  </div>

                  {/* Hover Quick Action Indicator */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 backdrop-blur-[2px]">
                    <span className="px-4 py-2 rounded-full bg-bg-elevated/90 border border-mint-primary/40 text-text-primary text-xs font-semibold flex items-center gap-1.5 shadow-mint-glow transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      View Project <ArrowRight size={13} className="text-mint-primary" />
                    </span>
                  </div>
                </div>

                {/* Card Content Details */}
                <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 
                        onClick={() => setSelectedProject(project)}
                        className="text-xl font-bold text-text-primary tracking-tight group-hover:text-cyan-highlight transition-colors cursor-pointer"
                      >
                        {project.title}
                      </h3>
                      
                      {/* Direct External Link */}
                      <a
                        href={project.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-text-secondary hover:text-mint-primary hover:border-mint-primary/30 transition-all shrink-0"
                        title="Open external live website"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>

                    <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed mb-4">
                      {project.description}
                    </p>
                  </div>

                  {/* Tech Tags */}
                  <div className="pt-4 border-t border-white/[0.05] flex flex-wrap gap-1.5 items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.03] border border-white/5 text-text-muted"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-text-muted">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedProject(project)}
                      className="text-xs font-semibold text-cyan-secondary group-hover:text-mint-primary transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Details
                      <ArrowRight size={12} />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Project Details Modal */}
      <PortfolioModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />

    </section>
  );
};
