import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, Sparkles, Send, Building2, Mail, Phone, HelpCircle } from 'lucide-react';
import { inquiryService } from '../services/inquiryService';

interface ContactSectionProps {
  initialRequirement?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ initialRequirement }) => {
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState('SaaS');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [requirement, setRequirement] = useState('AI Agent');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialRequirement) {
      if (initialRequirement.includes('Website')) setRequirement('Website');
      else if (initialRequirement.includes('Agent')) setRequirement('AI Agent');
      else if (initialRequirement.includes('Agentic')) setRequirement('Custom System');
      else if (initialRequirement.includes('SaaS')) setRequirement('SaaS App');
      else if (initialRequirement.includes('Commerce') || initialRequirement.includes('Automation')) setRequirement('AI Automation');
    }
  }, [initialRequirement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !contact.trim()) {
      setErrorMessage('Please fill in your name, email, and contact number.');
      return;
    }

    setSubmitting(true);

    try {
      await inquiryService.create({
        name: name.trim(),
        businessType,
        email: email.trim(),
        contact: contact.trim(),
        requirement,
        additionalNotes: additionalNotes.trim(),
      });

      setSubmitting(false);
      setSubmitted(true);
      
      // Reset form fields
      setName('');
      setEmail('');
      setContact('');
      setAdditionalNotes('');
    } catch (err) {
      setSubmitting(false);
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32 bg-bg-secondary/60 border-t border-white/[0.06] overflow-hidden">
      
      {/* Background Lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-primary/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-4 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-mint-primary animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
              PROJECT INQUIRY
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-4">
            Tell us what you want to build.
          </h2>

          <p className="text-base text-text-secondary">
            Share your vision. Our engineering team will review your specifications and get back to you within 24 hours.
          </p>
        </div>

        {/* Form Container */}
        <div className="relative rounded-3xl glass-panel-elevated p-7 sm:p-10 border border-white/15 shadow-2xl">
          
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
                className="px-6 py-2.5 rounded-full bg-white/[0.06] border border-white/15 text-text-primary hover:bg-white/[0.1] text-xs font-semibold transition-all"
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
                      <option value="SaaS" className="bg-bg-elevated text-text-primary">SaaS</option>
                      <option value="E-Commerce" className="bg-bg-elevated text-text-primary">E-Commerce</option>
                      <option value="Agency" className="bg-bg-elevated text-text-primary">Agency</option>
                      <option value="Real Estate" className="bg-bg-elevated text-text-primary">Real Estate</option>
                      <option value="Restaurant" className="bg-bg-elevated text-text-primary">Restaurant</option>
                      <option value="Other" className="bg-bg-elevated text-text-primary">Other</option>
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
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-bg-primary/90 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-cyan-secondary focus:ring-1 focus:ring-cyan-secondary/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Website" className="bg-bg-elevated text-text-primary">Website</option>
                    <option value="AI Agent" className="bg-bg-elevated text-text-primary">AI Agent</option>
                    <option value="AI Automation" className="bg-bg-elevated text-text-primary">AI Automation</option>
                    <option value="SaaS App" className="bg-bg-elevated text-text-primary">SaaS App</option>
                    <option value="E-Commerce" className="bg-bg-elevated text-text-primary">E-Commerce</option>
                    <option value="Custom System" className="bg-bg-elevated text-text-primary">Custom System</option>
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
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending Request...
                    </span>
                  ) : (
                    <>
                      <span>Send Request</span>
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
