import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CtaSectionProps {
  onStartProject: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onStartProject }) => {
  return (
    <section className="relative py-24 sm:py-32 bg-bg-primary overflow-hidden border-t border-white/[0.06]">
      
      {/* Signature Atmospheric Gradient Glow behind CTA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[350px] bg-gradient-to-b from-mint-primary/10 via-cyan-secondary/15 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 mb-6 shadow-sm">
          <Sparkles size={13} className="text-mint-primary" />
          <span className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
            Let's Collaborate
          </span>
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-text-primary mb-6 leading-tight">
          Have an idea worth building?
        </h2>

        <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-10">
          Let's turn it into an intelligent digital system.
        </p>

        <div className="flex items-center justify-center max-w-md mx-auto">
          <button
            onClick={onStartProject}
            className="w-full sm:w-auto px-9 py-4 rounded-full bg-gradient-to-b from-white/15 to-white/5 border border-white/25 text-text-primary font-semibold text-sm hover:border-mint-primary/60 hover:shadow-mint-glow transition-all flex items-center justify-center gap-2 group neu-button cursor-pointer"
          >
            <span>Start a Project with Us</span>
            <ArrowRight size={16} className="text-mint-primary group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};
