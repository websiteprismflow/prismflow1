import React, { useState, useEffect } from 'react';
import { ExternalLink, Play, Sparkles, Loader2 } from 'lucide-react';
import { portfolioService } from '../services/portfolioService';
import { PortfolioProject } from '../types';
import { PortfolioModal } from './PortfolioModal';

const categories = [
  { label: 'All Work', value: 'All' },
  { label: 'Websites', value: 'Website' },
  { label: 'AI Agents', value: 'Agents' },
  { label: 'SaaS', value: 'SaaS' },
  { label: 'Automation', value: 'Automation' },
  { label: 'E-Commerce', value: 'E-commerce' }
];

export const Portfolio: React.FC = () => {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProjects = async () => {
    setLoading(true);
    const data = await portfolioService.getPublished();
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = projects.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  return (
    <section id="work" className="relative py-24 sm:py-32 bg-bg-primary overflow-hidden">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-cyan-primary/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Robot Right Target */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-mint-primary" />
              <span className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
                OUR PORTFOLIO
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary leading-tight mb-4">
              Things We’ve Brought to Life.
            </h2>

            <p className="text-sm sm:text-base text-text-secondary max-w-xl leading-relaxed">
              Take a look at our real projects, working demos, and digital experiences.
            </p>
          </div>

          {/* Reserved Target Anchor for 3D Robot Companion on the Right Side of Portfolio */}
          <div
            id="portfolio-robot-target"
            className="hidden lg:flex w-[290px] lg:w-[320px] xl:w-[350px] h-[280px] shrink-0 pointer-events-none items-center justify-center"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-b from-white/15 to-white/5 border border-mint-primary/40 text-text-primary shadow-sm shadow-mint-primary/10'
                    : 'bg-white/[0.02] border border-white/[0.06] text-text-secondary hover:text-text-primary hover:bg-white/[0.05]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Portfolio Projects Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-text-secondary">
            <Loader2 size={32} className="animate-spin text-cyan-secondary" />
            <span className="text-xs">Loading portfolio projects...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 text-center rounded-3xl glass-panel border border-white/10 p-12 max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-text-primary mb-2">No published projects yet</h3>
            <p className="text-xs text-text-secondary">
              Check back soon as our team updates our showcase with new systems and deployments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProjects.map((project) => {
              const isHovered = hoveredProjectId === project.id;
              const displayImage = (project.project_photo_urls && project.project_photo_urls[0]) || project.imageUrl || '';

              return (
                <div
                  key={project.id}
                  onMouseEnter={() => setHoveredProjectId(project.id)}
                  onMouseLeave={() => setHoveredProjectId(null)}
                  onClick={() => setSelectedProject(project)}
                  className="group relative rounded-3xl glass-panel-interactive border border-white/10 overflow-hidden cursor-pointer flex flex-col transition-all duration-300 hover:border-cyan-secondary/50 hover:shadow-cyan-glow"
                >
                  {/* Media Thumbnail Container */}
                  <div className="relative w-full h-52 sm:h-60 overflow-hidden bg-bg-secondary">
                    {project.preview_video_url && isHovered ? (
                      <video
                        src={project.preview_video_url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-500 scale-105"
                      />
                    ) : displayImage ? (
                      <img
                        src={displayImage}
                        alt={project.project_title || project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted bg-white/[0.02]">
                        <span className="text-xs">Prism Flow Project</span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-bg-primary/80 backdrop-blur-md border border-white/15 text-cyan-highlight">
                        {project.category}
                      </span>
                    </div>

                    {/* Video Play Indicator */}
                    {project.preview_video_url && (
                      <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80">
                        <Play size={11} fill="currentColor" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight group-hover:text-cyan-highlight transition-colors mb-2">
                        {project.project_title || project.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 leading-relaxed mb-4 font-light">
                        {project.description}
                      </p>
                    </div>

                    {/* Technologies Pills */}
                    <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-6">
                        {(project.technologies || []).slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.04] text-text-muted border border-white/[0.06]"
                          >
                            {tech}
                          </span>
                        ))}
                        {(project.technologies || []).length > 3 && (
                          <span className="text-[10px] text-text-muted">
                            +{(project.technologies || []).length - 3}
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-semibold text-cyan-secondary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                        View <ExternalLink size={11} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Portfolio Detail Modal */}
      <PortfolioModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

    </section>
  );
};
