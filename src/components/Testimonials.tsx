import React, { useState, useEffect } from 'react';
import { Star, ExternalLink, Quote, Sparkles } from 'lucide-react';
import { testimonialService } from '../services/testimonialService';
import { subscribeToStorage } from '../services/storage';
import { Testimonial } from '../types';

export const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const loadTestimonials = () => {
    setTestimonials(testimonialService.getAll());
  };

  useEffect(() => {
    loadTestimonials();
    const unsubscribe = subscribeToStorage((key) => {
      if (key === 'prism_testimonials') {
        loadTestimonials();
      }
    });
    return unsubscribe;
  }, []);

  return (
    <section id="testimonials" className="relative py-24 sm:py-32 bg-ambient-section overflow-hidden">
      
      {/* Background Lighting */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-mint-primary/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-mint-primary" />
            <span className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
              CLIENT STORIES
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-4 leading-tight">
            What our clients say.
          </h2>

          <p className="text-base sm:text-lg text-text-secondary">
            Engineered outcomes, trusted by technology leaders, founders, and forward-thinking enterprises.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="relative p-7 sm:p-9 rounded-3xl glass-panel-interactive flex flex-col justify-between group"
            >
              <div>
                {/* Top Rating & Quote Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1 text-mint-primary">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>

                  <Quote size={20} className="text-white/10 group-hover:text-cyan-secondary/30 transition-colors" />
                </div>

                {/* Review Text */}
                <p className="text-base sm:text-lg text-text-primary/90 leading-relaxed italic mb-8 font-light">
                  "{item.review}"
                </p>
              </div>

              {/* Author & Verified Links Footer */}
              <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <img
                    src={item.profileImage}
                    alt={item.clientName}
                    className="w-12 h-12 rounded-full object-cover border border-white/15 shadow-sm"
                    loading="lazy"
                  />
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-text-primary tracking-tight">
                      {item.clientName}
                    </h4>
                    <p className="text-xs text-text-secondary">
                      {item.role}, <span className="text-cyan-secondary">{item.company}</span>
                    </p>
                  </div>
                </div>

                {/* Clickable Verified Company Link */}
                {item.websiteUrl && (
                  <a
                    href={item.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-white/[0.03] border border-white/10 text-text-secondary hover:text-mint-primary hover:border-mint-primary/30 transition-all flex items-center gap-1 text-xs"
                    title={`Visit ${item.company}`}
                  >
                    <span className="hidden sm:inline text-[11px] font-medium">{item.company}</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
