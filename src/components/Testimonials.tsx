import React, { useState, useEffect } from 'react';
import { Star, Quote, Sparkles, Loader2 } from 'lucide-react';
import { testimonialService } from '../services/testimonialService';
import { Testimonial } from '../types';

export const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTestimonials = async () => {
    setLoading(true);
    const data = await testimonialService.getPublished();
    setTestimonials(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  return (
    <section id="testimonials" className="relative py-24 sm:py-32 bg-ambient-section overflow-hidden">
      
      {/* Background Lighting */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-mint-primary/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-cyan-highlight text-xs font-semibold uppercase tracking-wider mb-5">
            <Sparkles size={13} className="text-cyan-secondary" />
            <span>Social Proof</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight leading-tight mb-5">
            Loved by Founders & <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-prism-gradient">
              Engineering Leaders
            </span>
          </h2>

          <p className="text-base sm:text-lg text-text-secondary">
            Hear directly from the teams who scaled their operations and elevated their design with Prism Flow.
          </p>
        </div>

        {/* Testimonials Content */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-text-secondary">
            <Loader2 size={32} className="animate-spin text-cyan-secondary" />
            <span className="text-xs">Loading client reviews...</span>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="py-20 text-center rounded-3xl glass-panel border border-white/10 p-12 max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-text-primary mb-2">No testimonials published yet</h3>
            <p className="text-xs text-text-secondary">
              Verified client testimonials will appear here as partnerships conclude.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="relative p-7 sm:p-9 rounded-3xl glass-panel-interactive flex flex-col justify-between group"
              >
                <div>
                  {/* Top Rating & Quote Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Star key={i} size={15} fill="currentColor" />
                      ))}
                    </div>

                    <Quote size={20} className="text-white/10 group-hover:text-cyan-secondary/30 transition-colors" />
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-text-secondary/90 leading-relaxed mb-6 font-light">
                    "{item.client_review_quote || item.review}"
                  </p>
                </div>

                {/* Author Footer */}
                <div className="pt-6 border-t border-white/[0.06] flex items-center">
                  <div className="flex items-center gap-3.5">
                    {item.avatar_image_url || item.profileImage ? (
                      <img
                        src={item.avatar_image_url || item.profileImage}
                        alt={item.client_name || item.clientName}
                        className="w-12 h-12 rounded-full object-cover border border-white/15 shadow-sm"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-cyan-primary/20 border border-cyan-secondary/40 text-cyan-highlight font-bold flex items-center justify-center text-sm">
                        {(item.client_name || item.clientName || 'C')[0]}
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-text-primary tracking-tight">
                        {item.client_name || item.clientName}
                      </h4>
                      <p className="text-xs text-text-secondary">
                        {item.role}, <span className="text-cyan-secondary">{item.company}</span>
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </section>
  );
};
