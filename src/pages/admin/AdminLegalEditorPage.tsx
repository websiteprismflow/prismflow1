import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle, 
  ExternalLink,
  Eye,
  Lock,
  Layers
} from 'lucide-react';
import { legalService } from '../../services/legalService';
import { subscribeToStorage } from '../../services/storage';
import { LegalDocument } from '../../types';

export const AdminLegalEditorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');
  const [privacyDoc, setPrivacyDoc] = useState<LegalDocument>(legalService.getDocument('privacy'));
  const [termsDoc, setTermsDoc] = useState<LegalDocument>(legalService.getDocument('terms'));
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);

  const loadDocs = () => {
    setPrivacyDoc(legalService.getDocument('privacy'));
    setTermsDoc(legalService.getDocument('terms'));
  };

  useEffect(() => {
    loadDocs();
    const unsubscribe = subscribeToStorage((key) => {
      if (key === 'prism_legal') {
        loadDocs();
      }
    });
    return unsubscribe;
  }, []);

  const currentDoc = activeTab === 'privacy' ? privacyDoc : termsDoc;

  const handleSectionHeadingChange = (index: number, val: string) => {
    const updatedSections = [...currentDoc.sections];
    updatedSections[index].heading = val;
    if (activeTab === 'privacy') {
      setPrivacyDoc({ ...privacyDoc, sections: updatedSections });
    } else {
      setTermsDoc({ ...termsDoc, sections: updatedSections });
    }
  };

  const handleSectionBodyChange = (index: number, val: string) => {
    const updatedSections = [...currentDoc.sections];
    updatedSections[index].body = val;
    if (activeTab === 'privacy') {
      setPrivacyDoc({ ...privacyDoc, sections: updatedSections });
    } else {
      setTermsDoc({ ...termsDoc, sections: updatedSections });
    }
  };

  const handleAddSection = () => {
    const newSection = {
      heading: `${currentDoc.sections.length + 1}. New Clause Title`,
      body: 'Enter legal terms, compliance standards, or policies here...'
    };
    if (activeTab === 'privacy') {
      setPrivacyDoc({ ...privacyDoc, sections: [...privacyDoc.sections, newSection] });
    } else {
      setTermsDoc({ ...termsDoc, sections: [...termsDoc.sections, newSection] });
    }
  };

  const handleDeleteSection = (index: number) => {
    const updatedSections = currentDoc.sections.filter((_, i) => i !== index);
    if (activeTab === 'privacy') {
      setPrivacyDoc({ ...privacyDoc, sections: updatedSections });
    } else {
      setTermsDoc({ ...termsDoc, sections: updatedSections });
    }
  };

  const handleSave = async () => {
    if (activeTab === 'privacy') {
      await legalService.updateDocument('privacy', privacyDoc);
    } else {
      await legalService.updateDocument('terms', termsDoc);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Legal & Policy Editor
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Update Privacy Policy and Terms & Conditions. Changes reflect instantly on public pages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-all"
          >
            <Eye size={14} />
            <span>{showLivePreview ? 'Hide Preview' : 'Side-by-Side Preview'}</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-primary to-cyan-secondary text-white text-xs font-bold shadow-cyan-glow flex items-center gap-1.5 hover:opacity-95 transition-all cursor-pointer"
          >
            <Save size={15} />
            <span>Save & Publish</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-mint-primary/10 border border-mint-primary/40 text-mint-primary text-xs flex items-center gap-2 animate-scale-up">
          <CheckCircle size={15} />
          <span>Legal document updated and published to /{activeTab === 'privacy' ? 'privacy' : 'terms'}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'privacy'
              ? 'bg-cyan-primary/20 text-cyan-highlight border border-cyan-secondary/40'
              : 'text-text-secondary hover:bg-white/[0.04]'
          }`}
        >
          <Lock size={14} />
          <span>Privacy Policy</span>
        </button>

        <button
          onClick={() => setActiveTab('terms')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'terms'
              ? 'bg-cyan-primary/20 text-cyan-highlight border border-cyan-secondary/40'
              : 'text-text-secondary hover:bg-white/[0.04]'
          }`}
        >
          <FileText size={14} />
          <span>Terms & Conditions</span>
        </button>

        <a
          href={`/${activeTab === 'privacy' ? 'privacy' : 'terms'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-xs text-text-muted hover:text-mint-primary flex items-center gap-1"
        >
          <span>View Live Public Page</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Main Editor Grid (with optional side-by-side preview) */}
      <div className={`grid gap-6 ${showLivePreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* Editor Panel */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl glass-panel border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-text-primary block">{currentDoc.title}</span>
              <span className="text-[11px] text-text-muted">Last Updated: {currentDoc.lastUpdated}</span>
            </div>

            <button
              onClick={handleAddSection}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-cyan-secondary hover:text-mint-primary text-xs font-semibold flex items-center gap-1 border border-white/10"
            >
              <Plus size={13} /> Add Clause
            </button>
          </div>

          <div className="space-y-4">
            {currentDoc.sections.map((sec, idx) => (
              <div key={idx} className="p-5 rounded-3xl glass-panel border border-white/10 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-cyan-secondary">Clause #{idx + 1}</span>
                  
                  {currentDoc.sections.length > 1 && (
                    <button
                      onClick={() => handleDeleteSection(idx)}
                      className="p-1 text-text-muted hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity"
                      title="Delete Clause"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-semibold text-text-muted mb-1">
                    Clause Heading
                  </label>
                  <input
                    type="text"
                    value={sec.heading}
                    onChange={(e) => handleSectionHeadingChange(idx, e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-bg-primary border border-white/10 text-xs font-bold text-text-primary focus:outline-none focus:border-cyan-secondary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-semibold text-text-muted mb-1">
                    Clause Content
                  </label>
                  <textarea
                    rows={4}
                    value={sec.body}
                    onChange={(e) => handleSectionBodyChange(idx, e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-bg-primary border border-white/10 text-xs text-text-secondary leading-relaxed focus:outline-none focus:border-cyan-secondary resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-primary to-cyan-secondary text-white text-xs font-bold shadow-cyan-glow"
            >
              Save All Clauses
            </button>
          </div>
        </div>

        {/* Live Side-by-Side Preview Panel */}
        {showLivePreview && (
          <div className="p-6 sm:p-8 rounded-3xl glass-panel-elevated border border-white/15 h-fit sticky top-6 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="pb-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-highlight">
                Live Public Preview: {currentDoc.title}
              </span>
              <span className="text-[10px] text-text-muted">{currentDoc.lastUpdated}</span>
            </div>

            <div className="space-y-6">
              {currentDoc.sections.map((sec, i) => (
                <div key={i} className="space-y-2">
                  <h4 className="text-sm font-bold text-text-primary">{sec.heading}</h4>
                  <p className="text-xs text-text-secondary leading-relaxed font-light">{sec.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
