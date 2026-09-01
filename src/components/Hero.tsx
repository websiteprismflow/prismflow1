import React from 'react';
import { ArrowRight, Compass, Sparkles, Cpu, Layers } from 'lucide-react';

interface HeroProps {
  onExploreWork: () => void;
  onContactClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreWork, onContactClick }) => {
  return (
    <section id="hero" className="relative min-h-screen pt-28 pb-16 sm:pt-36 sm:pb-24 flex items-center justify-center overflow-hidden bg-ambient-hero">
      
      {/* Background Lighting Gradients (Top Green, Bottom Cyan) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] sm:w-[900px] h-[350px] bg-gradient-to-b from-mint-primary/10 via-cyan-secondary/5 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[350px] bg-gradient-to-t from-cyan-primary/15 via-cyan-secondary/5 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Subtle Grid Ambient Lines */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10"
        style={{
          backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center lg:items-end w-full">
          
          {/* Typography & CTAs Column on Right Side */}
          <div className="w-full max-w-2xl flex flex-col items-center lg:items-start text-center lg:text-left z-10">
            
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.08] mb-5">
              <span className="block">WE BUILD THINGS</span>
              {/* Signature Vertical Gradient Lighting */}
              <span className="block my-1 text-prism-gradient tracking-tight font-black">
                THAT MOVE YOUR
              </span>
              <span className="block text-text-primary">BUSINESS FORWARD.</span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-xl leading-relaxed mb-6 font-normal">
              From high-quality websites to AI agents and smart automation, we create digital solutions that make your business better, simpler, and ready for what’s next.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
              <button
                onClick={onContactClick}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-b from-white/15 to-white/5 border border-white/20 text-text-primary font-semibold text-sm hover:border-mint-primary/50 hover:shadow-mint-glow transition-all flex items-center justify-center gap-2 group neu-button cursor-pointer"
              >
                <span>Let's Build</span>
                <ArrowRight size={16} className="text-mint-primary group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreWork}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/[0.03] border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/[0.06] hover:border-white/20 font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass size={16} className="text-cyan-secondary" />
                <span>Explore Our Work</span>
              </button>
            </div>

            {/* Subtle Capability Micro-Pills */}
            <div className="mt-8 pt-6 border-t border-white/[0.06] grid grid-cols-3 gap-4 w-full max-w-md">
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-xs font-semibold text-text-primary flex items-center gap-1">
                  <Sparkles size={12} className="text-mint-primary" /> Autonomous
                </span>
                <span className="text-[11px] text-text-muted">Lead Qualification</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-xs font-semibold text-text-primary flex items-center gap-1">
                  <Cpu size={12} className="text-cyan-secondary" /> Agentic
                </span>
                <span className="text-[11px] text-text-muted">Multi-Step Workflows</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-xs font-semibold text-text-primary flex items-center gap-1">
                  <Layers size={12} className="text-cyan-highlight" /> High Speed
                </span>
                <span className="text-[11px] text-text-muted">Sub-100ms UX</span>
              </div>
            </div>

          </div>

        </div>
      </div>

    </section>
  );
};
