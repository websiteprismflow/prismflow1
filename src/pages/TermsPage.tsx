import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, ShieldCheck } from 'lucide-react';
import { legalService } from '../services/legalService';
import { subscribeToStorage } from '../services/storage';
import { LegalDocument } from '../types';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const TermsPage: React.FC = () => {
  const navigate = useNavigate();
  const [doc, setDoc] = useState<LegalDocument>(legalService.getDocument('terms'));

  useEffect(() => {
    window.scrollTo(0, 0);
    const unsubscribe = subscribeToStorage((key) => {
      if (key === 'prism_legal') {
        setDoc(legalService.getDocument('terms'));
      }
    });
    return unsubscribe;
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 w-full">
        
        {/* Back Link */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-mint-primary transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Prism Flow Home</span>
        </button>

        {/* Document Header */}
        <div className="p-8 sm:p-10 rounded-3xl glass-panel-elevated mb-10 border border-white/10">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-primary/20 border border-cyan-secondary/40 text-cyan-highlight text-xs font-semibold w-fit mb-4">
            <FileText size={12} />
            <span>Master Service Terms</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary mb-3">
            {doc.title}
          </h1>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-text-muted">
            <Clock size={14} className="text-mint-primary" />
            <span>Last Updated: {doc.lastUpdated}</span>
          </div>
        </div>

        {/* Document Body Sections */}
        <div className="space-y-8 p-8 sm:p-10 rounded-3xl glass-panel border border-white/10">
          {doc.sections.map((section, idx) => (
            <section key={idx} className="space-y-3 pb-6 border-b border-white/[0.05] last:border-b-0 last:pb-0">
              <h2 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
                {section.heading}
              </h2>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-light">
                {section.body}
              </p>
            </section>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
};
