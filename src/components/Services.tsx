import React, { useState } from 'react';
import { Globe, Bot, Cpu, Layers, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { INITIAL_SERVICES } from '../data/initialData';
import { ServiceItem } from '../types';

const iconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Globe: (props) => <Globe {...props} />,
  Bot: (props) => <Bot {...props} />,
  Cpu: (props) => <Cpu {...props} />,
  Layers: (props) => <Layers {...props} />,
  Sparkles: (props) => <Sparkles {...props} />,
};

interface ServicesProps {
  onServiceSelect?: (service: ServiceItem) => void;
  onContactWithRequirement?: (requirement: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ onContactWithRequirement }) => {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const handleCardClick = (serviceTitle: string) => {
    if (onContactWithRequirement) {
      onContactWithRequirement(serviceTitle);
    }
  };

  return (
    <section id="services" className="relative py-24 sm:py-32 bg-ambient-section overflow-hidden">
      
      {/* Subtle background ambient light */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-cyan-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-mint-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-mint-primary" />
            <span className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
              WHAT WE BUILD
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-5 leading-tight">
            Intelligent systems built for modern businesses.
          </h2>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            We bridge deep software engineering and modern artificial intelligence to construct resilient, conversion-focused digital infrastructure.
          </p>
        </div>

        {/* 4 Service Cards Grid (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INITIAL_SERVICES.map((service) => {
            const IconComponent = iconMap[service.iconName] || Globe;

            return (
              <div
                key={service.id}
                onMouseEnter={() => setActiveCard(service.id)}
                onMouseLeave={() => setActiveCard(null)}
                onClick={() => handleCardClick(service.title)}
                className="group relative p-7 sm:p-8 rounded-3xl glass-panel-interactive flex flex-col justify-between cursor-pointer"
              >
                {/* Top Card Bar */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    {/* Icon with Subtle Cyan Accent */}
                    <div className="w-12 h-12 rounded-2xl bg-bg-elevated/90 border border-white/10 flex items-center justify-center text-cyan-secondary group-hover:text-mint-primary group-hover:border-mint-primary/30 transition-all duration-300 shadow-sm">
                      <IconComponent size={24} />
                    </div>

                    {/* Badge */}
                    <span className="text-[11px] font-medium tracking-wide text-text-muted px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/5 group-hover:border-cyan-secondary/30 group-hover:text-text-secondary transition-colors">
                      {service.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight mb-3 group-hover:text-cyan-highlight transition-colors">
                    {service.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-6">
                    {service.shortDesc}
                  </p>

                  {/* Capabilities List */}
                  <ul className="space-y-2 mb-6 pt-4 border-t border-white/[0.06]">
                    {service.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-text-muted group-hover:text-text-secondary transition-colors">
                        <CheckCircle2 size={13} className="text-cyan-secondary shrink-0 opacity-70 group-hover:text-mint-primary group-hover:opacity-100 transition-all" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 border-t border-white/[0.05] flex items-center justify-between mt-auto">
                  <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                    Build This Solution
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-cyan-secondary group-hover:text-mint-primary group-hover:bg-cyan-primary/20 group-hover:translate-x-1 transition-all duration-300">
                    <ArrowRight size={14} />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
