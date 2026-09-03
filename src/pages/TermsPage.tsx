import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, Loader2 } from 'lucide-react';
import { legalService } from '../services/legalService';
import { LegalClause } from '../types';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const TermsPage: React.FC = () => {
  const navigate = useNavigate();
  const [clauses, setClauses] = useState<LegalClause[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadClauses = async () => {
      setLoading(true);
      const data = await legalService.getPublishedClauses('Terms & Conditions');
      setClauses(data);
      setLoading(false);
    };
    loadClauses();
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
            Terms &amp; Conditions
          </h1>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-text-muted">
            <Clock size={14} className="text-mint-primary" />
            <span>Enterprise Engagement &amp; Delivery Framework</span>
          </div>
        </div>

        {/* Document Body Sections */}
        {loading ? (
          <div className="py-24 rounded-3xl glass-panel border border-white/10 flex flex-col items-center justify-center gap-3 text-text-secondary">
            <Loader2 size={28} className="animate-spin text-cyan-secondary" />
            <span className="text-xs">Loading terms and conditions...</span>
          </div>
        ) : clauses.length === 0 ? (
          <div className="p-10 rounded-3xl glass-panel border border-white/10 text-center">
            <p className="text-sm text-text-secondary">No terms &amp; conditions currently published.</p>
          </div>
        ) : (
          <div className="space-y-8 p-8 sm:p-10 rounded-3xl glass-panel border border-white/10">
            {clauses.map((clause) => (
              <section key={clause.id} className="space-y-3 pb-6 border-b border-white/[0.05] last:border-b-0 last:pb-0">
                <h2 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
                  {clause.clause_heading}
                </h2>
                <div className="text-sm sm:text-base text-text-secondary leading-relaxed font-light whitespace-pre-line">
                  {clause.clause_content}
                </div>
              </section>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};
