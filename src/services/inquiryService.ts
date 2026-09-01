import { Inquiry, InquiryStatus } from '../types';
import { INITIAL_INQUIRIES } from '../data/initialData';
import { getStoredItem, setStoredItem } from './storage';

const INQUIRIES_KEY = 'prism_inquiries_v2';

export const inquiryService = {
  getAll: (): Inquiry[] => {
    return getStoredItem<Inquiry[]>(INQUIRIES_KEY, INITIAL_INQUIRIES);
  },

  getById: (id: string): Inquiry | undefined => {
    const inquiries = inquiryService.getAll();
    return inquiries.find((i) => i.id === id);
  },

  create: async (data: Omit<Inquiry, 'id' | 'createdAt' | 'status'>): Promise<Inquiry> => {
    const list = inquiryService.getAll();
    const newInquiry: Inquiry = {
      ...data,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    const updated = [newInquiry, ...list];
    setStoredItem(INQUIRIES_KEY, updated);
    return newInquiry;
  },

  updateStatus: async (id: string, status: InquiryStatus, adminNotes?: string): Promise<Inquiry | null> => {
    const list = inquiryService.getAll();
    const index = list.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const updatedItem: Inquiry = {
      ...list[index],
      status,
      adminNotes: adminNotes !== undefined ? adminNotes : list[index].adminNotes
    };
    list[index] = updatedItem;
    setStoredItem(INQUIRIES_KEY, [...list]);
    return updatedItem;
  },

  updateNotes: async (id: string, adminNotes: string): Promise<Inquiry | null> => {
    const list = inquiryService.getAll();
    const index = list.findIndex((i) => i.id === id);
    if (index === -1) return null;

    list[index] = { ...list[index], adminNotes };
    setStoredItem(INQUIRIES_KEY, [...list]);
    return list[index];
  },

  delete: async (id: string): Promise<boolean> => {
    const list = inquiryService.getAll();
    const filtered = list.filter((i) => i.id !== id);
    setStoredItem(INQUIRIES_KEY, filtered);
    return true;
  }
};
