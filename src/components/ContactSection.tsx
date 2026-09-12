import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, Loader2, Sparkles, Clock } from 'lucide-react';
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
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(() => Math.max(0, Math.ceil(inquiryService.getCooldownRemainingMs() / 1000)));

  // Check initial cooldown on mount
  useEffect(() => {
    const remainingMs = inquiryService.getCooldownRemainingMs();
    const secs = Math.max(0, Math.ceil(remainingMs / 1000));
    setCooldownSeconds(secs);
    if (secs > 0) {
      setSubmitted(true);
    }
  }, []);

  // Background 1-minute timer ticker
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const interval = setInterval(() => {
      const remainingMs = inquiryService.getCooldownRemainingMs();
      const secs = Math.max(0, Math.ceil(remainingMs / 1000));
      setCooldownSeconds(secs);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownSeconds]);

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

    if (!agreePrivacy) {
      setErrorMessage('Please agree to the Privacy Policy to submit your enquiry.');
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
        setCooldownSeconds(60);
        // Reset form fields
        setName('');
        setEmail('');
        setContact('');
        setAdditionalNotes('');
        setAgreePrivacy(false);
        setMarketingConsent(false);
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

              <p className="text-base text-text-secondary max-w-md mb-6 leading-relaxed">
                Thank you for reaching out to Prism Flow. Our principal architect will review your project requirements promptly.
              </p>

              {/* Message to wait a few minutes with background 1-minute countdown timer */}
              <div className="mb-8 p-3.5 px-5 rounded-2xl bg-white/[0.03] border border-white/10 max-w-md w-full flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Clock size={16} className={cooldownSeconds > 0 ? "text-cyan-secondary shrink-0 animate-pulse" : "text-mint-primary shrink-0"} />
                  <span className="text-xs text-text-secondary leading-normal">
                    {cooldownSeconds > 0 
                      ? "To fill the form again, please wait a few minutes."
                      : "You can now fill and submit another inquiry."}
                  </span>
                </div>
                {cooldownSeconds > 0 && (
                  <span className="font-mono text-xs font-semibold text-cyan-highlight whitespace-nowrap px-2.5 py-1 rounded-lg bg-cyan-primary/20 border border-cyan-secondary/30 shrink-0">
                    {cooldownSeconds}s
                  </span>
                )}
              </div>

              {cooldownSeconds > 0 ? (
                <button
                  disabled
                  className="px-6 py-2.5 rounded-full bg-white/[0.03] border border-white/10 text-text-muted text-xs font-semibold cursor-not-allowed opacity-50 flex items-center gap-2"
                >
                  <Clock size={13} />
                  <span>Please wait ({cooldownSeconds}s)</span>
                </button>
              ) : (
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-full bg-white/[0.06] border border-white/15 text-text-primary hover:bg-white/[0.1] text-xs font-semibold transition-all cursor-pointer"
                >
                  Submit Another Request
                </button>
              )}
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

              {/* Consent & Marketing Checkboxes */}
              <div className="space-y-3 pt-1">
                {/* Privacy Policy Checkbox (Required) */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    id="privacy-consent"
                    required
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border border-white/20 bg-bg-primary/90 accent-cyan-secondary focus:ring-1 focus:ring-cyan-secondary/50 focus:outline-none cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors leading-relaxed">
                    I have read the{' '}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-cyan-secondary hover:text-cyan-highlight"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </a>{' '}
                    and agree that Prism Flow may use my information to respond to my enquiry. <span className="text-red-400">*</span>
                  </span>
                </label>

                {/* Marketing Updates Checkbox (Optional) */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    id="marketing-consent"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border border-white/20 bg-bg-primary/90 accent-cyan-secondary focus:ring-1 focus:ring-cyan-secondary/50 focus:outline-none cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors leading-relaxed">
                    I would like to receive updates, offers, and service information from Prism Flow through email, phone, or WhatsApp. I can opt out at any time.
                  </span>
                </label>
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
