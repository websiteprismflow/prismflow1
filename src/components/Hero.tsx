import React from 'react';
import { ArrowRight, Compass, Sparkles, Cpu, Layers } from 'lucide-react';

interface HeroProps {
  onExploreWork: () => void;
  onContactClick: () => void;
}

const CAPABILITIES = [
  {
    title: 'Autonomous',
    subtitle: 'Lead Qualification',
    icon: Sparkles,
    iconColor: 'text-mint-primary',
  },
  {
    title: 'Agentic',
    subtitle: 'Multi-Step Workflows',
    icon: Cpu,
    iconColor: 'text-cyan-secondary',
  },
  {
    title: 'High Speed',
    subtitle: 'Sub-100ms UX',
    icon: Layers,
    iconColor: 'text-cyan-highlight',
  },
];

export const Hero: React.FC<HeroProps> = ({ onExploreWork, onContactClick }) => {
  return (
    <section id="hero" className="relative min-h-[auto] sm:min-h-screen pt-28 pb-8 sm:pt-36 sm:pb-24 flex items-center justify-center overflow-hidden bg-ambient-hero">

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
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 xl:gap-12 w-full">

          {/* Typography & CTAs Column on Left Side */}
          <div className="w-full lg:flex-1 min-w-0 max-w-xl xl:max-w-2xl 2xl:max-w-3xl flex flex-col items-center lg:items-start text-center lg:text-left z-10">

            {/* Main Headline */}
            <h1 className="inline-flex flex-col items-center text-center text-[2.1rem] sm:text-4xl md:text-4xl lg:text-[2.65rem] xl:text-[3.15rem] 2xl:text-[3.5rem] lg:font-apple font-extrabold tracking-tight lg:tracking-[-0.03em] text-text-primary leading-[1.12] lg:leading-[1.12] mb-5 lg:mb-6">
              <span className="block">
                WE <span className="text-prism-gradient font-black">BUILD</span> THINGS
              </span>
              <span className="block my-1.5 text-[1.4rem] sm:text-2xl md:text-2xl lg:text-[1.85rem] xl:text-[2.2rem] 2xl:text-[2.45rem] font-extrabold tracking-tight text-text-primary">
                THAT MOVE YOUR
              </span>
              <span className="block text-text-primary">
                <span className="text-prism-gradient font-black">BUSINESS</span> FORWARD.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl lg:font-apple text-text-secondary max-w-sm sm:max-w-md lg:max-w-2xl leading-relaxed lg:leading-relaxed mb-6 lg:mb-8 font-normal lg:tracking-[-0.01em]">
              <span className="lg:hidden">
                From modern websites to AI agents and automation, we build solutions that move your business forward.
              </span>
              <span className="hidden lg:inline">
                From high-quality websites to AI agents and smart automation, we create digital solutions that make your business better, simpler, and ready for what’s next.
              </span>
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 lg:gap-4 w-full sm:w-auto lg:font-apple">
              <button
                onClick={onContactClick}
                className="w-full sm:w-auto px-7 py-3.5 lg:px-7 lg:py-3.5 rounded-full bg-gradient-to-b from-white/15 to-white/5 border border-white/20 text-text-primary font-semibold text-sm lg:text-sm hover:border-mint-primary/50 hover:shadow-mint-glow transition-all flex items-center justify-center gap-2 group neu-button cursor-pointer"
              >
                <span>Let's Build</span>
                <ArrowRight size={16} className="text-mint-primary group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreWork}
                className="w-full sm:w-auto px-6 py-3.5 lg:px-6 lg:py-3.5 rounded-full bg-white/[0.03] border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/[0.06] hover:border-white/20 font-medium text-sm lg:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass size={16} className="text-cyan-secondary" />
                <span>Explore Our Work</span>
              </button>
            </div>

            {/* Capability Micro-Pills: Infinite Side Scroll Marquee on Mobile Only */}
            <div className="lg:hidden w-full max-w-sm sm:max-w-md mt-5 pt-3.5 border-t border-white/[0.06] overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <div className="animate-marquee flex items-center gap-2.5 py-0.5">
                {[...CAPABILITIES, ...CAPABILITIES, ...CAPABILITIES, ...CAPABILITIES].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.035] border border-white/[0.08] shrink-0 backdrop-blur-sm shadow-sm"
                    >
                      <Icon size={13} className={`${item.iconColor} shrink-0`} />
                      <div className="flex flex-col text-left">
                        <span className="text-[11px] font-semibold text-text-primary leading-tight whitespace-nowrap">
                          {item.title}
                        </span>
                        <span className="text-[9px] text-text-muted leading-tight whitespace-nowrap">
                          {item.subtitle}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subtle Capability Micro-Pills: Static Grid on Desktop Only */}
            <div className="hidden lg:grid grid-cols-3 gap-4 lg:gap-6 w-full max-w-md lg:max-w-xl lg:font-apple mt-8 lg:mt-10 pt-6 lg:pt-6 border-t border-white/[0.06]">
              {CAPABILITIES.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex flex-col items-start">
                    <span className="text-xs lg:text-xs xl:text-sm font-semibold text-text-primary flex items-center gap-1.5">
                      <Icon size={13} className={`${item.iconColor} shrink-0`} /> {item.title}
                    </span>
                    <span className="text-[11px] lg:text-[11px] xl:text-xs text-text-muted mt-0.5">{item.subtitle}</span>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Target Anchor for 3D AI Robot Companion on Desktop */}
          <div
            id="hero-robot-target"
            className="hidden lg:flex items-center justify-center shrink-0 lg:w-[320px] xl:w-[380px] 2xl:w-[420px] h-[380px] xl:h-[420px] z-10 pointer-events-none"
          />

        </div>
      </div>

    </section>
  );
};
