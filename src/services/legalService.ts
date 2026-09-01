import { LegalDocument } from '../types';
import { INITIAL_LEGAL_DOCS } from '../data/initialData';
import { getStoredItem, setStoredItem } from './storage';

const LEGAL_KEY = 'prism_legal';

export const legalService = {
  getAll: (): Record<'privacy' | 'terms', LegalDocument> => {
    return getStoredItem<Record<'privacy' | 'terms', LegalDocument>>(LEGAL_KEY, INITIAL_LEGAL_DOCS);
  },

  getDocument: (id: 'privacy' | 'terms'): LegalDocument => {
    const all = legalService.getAll();
    return all[id] || INITIAL_LEGAL_DOCS[id];
  },

  updateDocument: async (id: 'privacy' | 'terms', document: LegalDocument): Promise<LegalDocument> => {
    const all = legalService.getAll();
    all[id] = {
      ...document,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
    setStoredItem(LEGAL_KEY, all);
    return all[id];
  }
};
