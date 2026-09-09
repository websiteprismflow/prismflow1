import React from 'react';
import { Bot, Workflow, Layers, Globe, ShoppingBag, ShieldCheck } from 'lucide-react';

export const TechStrip: React.FC = () => {
  const techPillars = [
    { label: 'AI Agents', icon: Bot, highlight: 'Autonomous LLM' },
    { label: 'Agentic Workflows', icon: Workflow, highlight: 'Multi-Step Logic' },
    { label: 'SaaS Systems', icon: Layers, highlight: 'Cloud Native' },
    { label: 'Intelligent Web', icon: Globe, highlight: 'Sub-100ms Core' },
    { label: 'E-Commerce', icon: ShoppingBag, highlight: 'Automated Sales' },
    { label: 'Enterprise Security', icon: ShieldCheck, highlight: 'SOC2 Compliant' },
  ];

  return (
    <section className="relative py-6 border-y border-white/[0.06] bg-bg-secondary/40 backdrop-blur-md overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Subtle section descriptor */}
        <div className="text-center mb-4">
          <span className="text-[11px] font-semibold tracking-widest text-text-muted uppercase">
            Core Technology Architecture
          </span>
        </div>

        {/* Mobile: Responsive Pill Grid (< lg) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 items-center lg:hidden">
          {techPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.label}
                className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-cyan-secondary/30 hover:bg-white/[0.04] transition-all duration-300 shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-bg-elevated/80 flex items-center justify-center text-cyan-secondary group-hover:text-mint-primary group-hover:scale-105 transition-all mb-1.5 border border-white/5">
                  <Icon size={16} />
                </div>
                <span className="text-xs font-semibold text-text-primary group-hover:text-cyan-highlight transition-colors text-center">
                  {pillar.label}
                </span>
                <span className="text-[10px] text-text-muted font-mono tracking-tight mt-0.5">
                  {pillar.highlight}
                </span>
              </div>
            );
          })}
        </div>

        {/* PC: Infinite Side Scroll Marquee Animation (>= lg) */}
        <div className="hidden lg:block overflow-hidden relative w-full [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="animate-marquee-slow flex items-center gap-4 py-1">
            {[...techPillars, ...techPillars, ...techPillars, ...techPillars].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="group flex flex-col items-center justify-center p-3.5 w-48 shrink-0 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-cyan-secondary/30 hover:bg-white/[0.04] transition-all duration-300 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-bg-elevated/80 flex items-center justify-center text-cyan-secondary group-hover:text-mint-primary group-hover:scale-105 transition-all mb-1.5 border border-white/5">
                    <Icon size={16} />
                  </div>
                  <span className="text-xs font-semibold text-text-primary group-hover:text-cyan-highlight transition-colors text-center whitespace-nowrap">
                    {pillar.label}
                  </span>
                  <span className="text-[10px] text-text-muted font-mono tracking-tight mt-0.5 whitespace-nowrap">
                    {pillar.highlight}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
