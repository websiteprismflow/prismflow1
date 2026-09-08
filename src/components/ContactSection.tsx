import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { inquiryService, VALID_BUSINESS_TYPES, VALID_WHAT_YOU_NEED } from '../services/inquiryService';

interface ContactSectionProps {
  initialRequirement?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ initialRequirement }) => {
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState('SaaS');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [whatYouNeed, setWhatYouNeed] = useState('AI Agent');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialRequirement) {
      if (initialRequirement.includes('Website')) setWhatYouNeed('Website');
      else if (initialRequirement.includes('Agent')) setWhatYouNeed('AI Agent');
      else if (initialRequirement.includes('Agentic')) setWhatYouNeed('Custom System');
      else if (initialRequirement.includes('SaaS')) setWhatYouNeed('SaaS App');
      else if (initialRequirement.includes('Commerce')) setWhatYouNeed('E-commerce');
      else if (initialRequirement.includes('Automation')) setWhatYouNeed('AI Automation');
    }
  }, [initialRequirement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // Prevent double submit
    setErrorMessage('');

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanContact = contact.trim();

    if (!cleanName || !cleanEmail || !cleanContact) {
      setErrorMessage('Please fill in your name, email, and contact number.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (cleanContact.length < 6) {
      setErrorMessage('Please enter a valid contact number.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await inquiryService.create({
        name: cleanName,
        business_type: businessType,
        email: cleanEmail,
        contact_number: cleanContact,
        what_you_need: whatYouNeed,
        additional_requirement: additionalNotes.trim(),
      });

      setSubmitting(false);

      if (res.success) {
        setSubmitted(true);
        // Reset form fields
        setName('');
        setEmail('');
        setContact('');
        setAdditionalNotes('');
      } else {
        setErrorMessage(res.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setSubmitting(false);
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32 bg-bg-secondary/60 border-t border-white/[0.06] overflow-hidden">
      
      {/* Background Lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-primary/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[350px] bg-gradient-to-b from-mint-primary/10 via-cyan-secondary/15 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Robot Target on Desktop (Right Side) */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 mb-14">
          
          {/* Header Text Content on Left */}
          <div className="text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 mb-5 shadow-sm">
              <Sparkles size={13} className="text-mint-primary" />
              <span className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
                Let's Collaborate
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary mb-4 leading-tight">
              Have an idea worth building?
            </h2>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
              Let's turn it into an intelligent digital system. Share your vision and our engineering team will review your specifications within 24 hours.
            </p>
          </div>

          {/* Reserved Target Anchor for 3D AI Robot Companion on Desktop (Right Side) */}
          <div
            id="contact-robot-target"
            className="hidden lg:flex w-[290px] lg:w-[320px] xl:w-[350px] h-[320px] shrink-0 pointer-events-none items-center justify-center"
          />

        </div>

        {/* Form Container */}
        <div className="relative rounded-3xl glass-panel-elevated p-7 sm:p-10 border border-white/15 shadow-2xl max-w-4xl mx-auto">
          
          {submitted ? (
            <div className="py-12 text-center flex flex-col items-center justify-center animate-scale-up">
              <div className="w-16 h-16 rounded-full bg-mint-primary/20 border border-mint-primary/40 flex items-center justify-center text-mint-primary mb-6 shadow-mint-glow">
                <CheckCircle size={32} />
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
                Request received. We'll be in touch.
              </h3>

              <p className="text-base text-text-secondary max-w-md mb-8">
                Thank you for reaching out to Prism Flow. Our principal architect will review your project requirements promptly.
              </p>

              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 rounded-full bg-white/[0.06] border border-white/15 text-text-primary hover:bg-white/[0.1] text-xs font-semibold transition-all cursor-pointer"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-4 py-3.5 rounded-xl bg-bg-primary/90 border border-white/10 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-cyan-secondary focus:ring-1 focus:ring-cyan-secondary/50 transition-all"
                  />
                </div>

                {/* Business Type */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    Business Type *
                  </label>
                  <div className="relative">
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-bg-primary/90 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-cyan-secondary focus:ring-1 focus:ring-cyan-secondary/50 transition-all appearance-none cursor-pointer"
                    >
                      {VALID_BUSINESS_TYPES.map((bt) => (
                        <option key={bt} value={bt} className="bg-bg-elevated text-text-primary">
                          {bt}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-muted">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    Email / Gmail *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full px-4 py-3.5 rounded-xl bg-bg-primary/90 border border-white/10 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-cyan-secondary focus:ring-1 focus:ring-cyan-secondary/50 transition-all"
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3.5 rounded-xl bg-bg-primary/90 border border-white/10 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-cyan-secondary focus:ring-1 focus:ring-cyan-secondary/50 transition-all"
                  />
                </div>

              </div>

              {/* Requirement Dropdown */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                  What do you need? *
                </label>
                <div className="relative">
                  <select
                    value={whatYouNeed}
                    onChange={(e) => setWhatYouNeed(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-bg-primary/90 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-cyan-secondary focus:ring-1 focus:ring-cyan-secondary/50 transition-all appearance-none cursor-pointer"
                  >
                    {VALID_WHAT_YOU_NEED.map((wyn) => (
                      <option key={wyn} value={wyn} className="bg-bg-elevated text-text-primary">
                        {wyn}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-muted">
                    ▼
                  </div>
                </div>
              </div>

              {/* Additional Requirements */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                  Additional Requirements <span className="text-text-muted font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Tell us about your project goals, timelines, or specific technical integrations..."
                  className="w-full px-4 py-3.5 rounded-xl bg-bg-primary/90 border border-white/10 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-cyan-secondary focus:ring-1 focus:ring-cyan-secondary/50 transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-primary via-cyan-secondary to-cyan-highlight text-white font-bold text-sm tracking-wide shadow-cyan-glow hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting Inquiry...</span>
                    </span>
                  ) : (
                    <>
                      <span>Start a Project with Us</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-[11px] text-text-muted">
                  🔒 Enterprise-grade confidentiality. We never share your project specifications.
                </span>
              </div>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};
