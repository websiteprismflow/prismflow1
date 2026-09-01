import { Testimonial } from '../types';
import { INITIAL_TESTIMONIALS } from '../data/initialData';
import { getStoredItem, setStoredItem } from './storage';

const TESTIMONIALS_KEY = 'prism_testimonials_v3';

export const testimonialService = {
  getAll: (includeUnpublished = false): Testimonial[] => {
    const list = getStoredItem<Testimonial[]>(TESTIMONIALS_KEY, INITIAL_TESTIMONIALS);
    if (includeUnpublished) return list;
    return list.filter((t) => t.published);
  },

  getById: (id: string): Testimonial | undefined => {
    const list = testimonialService.getAll(true);
    return list.find((t) => t.id === id);
  },

  create: async (data: Omit<Testimonial, 'id'>): Promise<Testimonial> => {
    const list = testimonialService.getAll(true);
    const newTestimonial: Testimonial = {
      ...data,
      id: `test-${Date.now()}`
    };
    const updated = [newTestimonial, ...list];
    setStoredItem(TESTIMONIALS_KEY, updated);
    return newTestimonial;
  },

  update: async (id: string, data: Partial<Testimonial>): Promise<Testimonial | null> => {
    const list = testimonialService.getAll(true);
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return null;

    list[index] = { ...list[index], ...data };
    setStoredItem(TESTIMONIALS_KEY, [...list]);
    return list[index];
  },

  togglePublish: async (id: string): Promise<Testimonial | null> => {
    const list = testimonialService.getAll(true);
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return null;

    list[index].published = !list[index].published;
    setStoredItem(TESTIMONIALS_KEY, [...list]);
    return list[index];
  },

  delete: async (id: string): Promise<boolean> => {
    const list = testimonialService.getAll(true);
    const filtered = list.filter((t) => t.id !== id);
    setStoredItem(TESTIMONIALS_KEY, filtered);
    return true;
  }
};
