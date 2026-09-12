import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Inquiry, InquiryStatus, BusinessType, WhatYouNeed } from '../types';

export const VALID_BUSINESS_TYPES: BusinessType[] = [
  'SaaS',
  'E-commerce',
  'Agency',
  'Real Estate',
  'Restaurant',
  'Others'
];

export const VALID_WHAT_YOU_NEED: WhatYouNeed[] = [
  'Website',
  'AI Agent',
  'AI Automation',
  'SaaS App',
  'E-commerce',
  'Custom System'
];

export const VALID_STATUSES: InquiryStatus[] = [
  'Pending',
  'Accepted',
  'Completed',
  'Rejected'
];

export interface InquiryPaginationParams {
  page?: number;
  pageSize?: number;
  status?: string;
  sortBy?: 'newest' | 'oldest';
  searchTerm?: string;
}

export interface InquiryPaginationResult {
  data: Inquiry[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const INQUIRY_COOLDOWN_KEY = 'prism_inquiry_cooldown';
const INQUIRY_COOLDOWN_MS = 60 * 1000; // 1 minute

export const inquiryService = {
  /**
   * Get remaining milliseconds for 1-minute inquiry submission cooldown
   */
  getCooldownRemainingMs: (): number => {
    try {
      const raw = localStorage.getItem(INQUIRY_COOLDOWN_KEY);
      if (!raw) return 0;
      const until = parseInt(raw, 10);
      const remaining = until - Date.now();
      if (remaining <= 0) {
        localStorage.removeItem(INQUIRY_COOLDOWN_KEY);
        return 0;
      }
      return remaining;
    } catch {
      return 0;
    }
  },

  /**
   * Set 1-minute inquiry submission cooldown
   */
  setCooldown: (): void => {
    try {
      localStorage.setItem(INQUIRY_COOLDOWN_KEY, (Date.now() + INQUIRY_COOLDOWN_MS).toString());
    } catch {}
  },

  /**
   * Submit a new public inquiry.
   * Enforces status = 'Pending' and validates input fields.
   */
  create: async (data: {
    name: string;
    business_type: string;
    email: string;
    contact_number: string;
    what_you_need: string;
    additional_requirement?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    // Check 1-minute cooldown
    const cooldownMs = inquiryService.getCooldownRemainingMs();
    if (cooldownMs > 0) {
      const seconds = Math.ceil(cooldownMs / 1000);
      return {
        success: false,
        error: `Please wait ${seconds} second(s) before submitting another inquiry.`
      };
    }

    // 1. Validation
    const name = data.name?.trim();
    const email = data.email?.trim().toLowerCase();
    const contact = data.contact_number?.trim();
    const businessType = data.business_type?.trim();
    const whatYouNeed = data.what_you_need?.trim();
    const additional = data.additional_requirement?.trim() || null;

    if (!name || !email || !contact || !businessType || !whatYouNeed) {
      return { success: false, error: 'Please fill out all required fields.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Please provide a valid email address.' };
    }

    if (contact.length < 6) {
      return { success: false, error: 'Please provide a valid contact number.' };
    }

    if (!isSupabaseConfigured()) {
      console.warn('PrismFlow inquiryService: Supabase is not configured yet in .env');
      return { success: false, error: 'Database service is currently unreachable. Please try again shortly.' };
    }

    try {
      // Respect RLS: insert into public.inquiries with status explicitly forced to Pending
      const { error } = await supabase
        .from('inquiries')
        .insert({
          name,
          business_type: businessType,
          email,
          contact_number: contact,
          what_you_need: whatYouNeed,
          additional_requirement: additional,
          status: 'Pending'
        });

      if (error) {
        console.error('PrismFlow inquiryService insert error:', error.message);
        return { success: false, error: 'Unable to submit your inquiry at this moment. Please try again.' };
      }

      // Set 1-minute cooldown timer in background
      inquiryService.setCooldown();
      return { success: true };
    } catch (err) {
      console.error('PrismFlow inquiryService exception:', err);
      return { success: false, error: 'Something went wrong. Please try again.' };
    }
  },

  /**
   * Get paginated inquiries for Admin Dashboard.
   * Loads ~25 records per page, filtered and sorted server-side.
   */
  getPaginated: async (params: InquiryPaginationParams = {}): Promise<InquiryPaginationResult> => {
    const page = Math.max(1, params.page || 1);
    const pageSize = params.pageSize || 25;
    const status = params.status || 'all';
    const sortBy = params.sortBy || 'newest';
    const searchTerm = params.searchTerm?.trim().toLowerCase() || '';

    if (!isSupabaseConfigured()) {
      return { data: [], count: 0, page: 1, pageSize, totalPages: 0 };
    }

    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('inquiries')
        .select('*', { count: 'exact' });

      // Status filter
      if (status !== 'all') {
        query = query.eq('status', status as any);
      }

      // Search filter if provided
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,what_you_need.ilike.%${searchTerm}%,business_type.ilike.%${searchTerm}%`);
      }

      // Sorting
      query = query.order('created_at', { ascending: sortBy === 'oldest' });

      // Range for pagination
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) {
        console.error('PrismFlow inquiryService getPaginated error:', error.message);
        return { data: [], count: 0, page, pageSize, totalPages: 0 };
      }

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      const mapped: Inquiry[] = (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        business_type: row.business_type,
        email: row.email,
        contact_number: row.contact_number,
        what_you_need: row.what_you_need,
        additional_requirement: row.additional_requirement,
        status: row.status,
        created_at: row.created_at,
        // UI helper properties
        businessType: row.business_type,
        contact: row.contact_number,
        requirement: row.what_you_need,
        additionalNotes: row.additional_requirement || '',
        createdAt: row.created_at
      }));

      return {
        data: mapped,
        count: totalCount,
        page,
        pageSize,
        totalPages
      };
    } catch (err) {
      console.error('PrismFlow inquiryService getPaginated exception:', err);
      return { data: [], count: 0, page, pageSize, totalPages: 0 };
    }
  },

  /**
   * Update inquiry status in Supabase
   */
  updateStatus: async (id: string, status: InquiryStatus): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database is not configured' };
    }

    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('PrismFlow inquiryService updateStatus error:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('PrismFlow inquiryService updateStatus exception:', err);
      return { success: false, error: 'Failed to update status' };
    }
  },

  /**
   * Delete inquiry from Supabase
   */
  delete: async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database is not configured' };
    }

    try {
      const { error } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('PrismFlow inquiryService delete error:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('PrismFlow inquiryService delete exception:', err);
      return { success: false, error: 'Failed to delete inquiry' };
    }
  },

  /**
   * Get counts for overview metrics
   */
  getMetrics: async (): Promise<{ total: number; pending: number; accepted: number; completed: number; rejected: number }> => {
    if (!isSupabaseConfigured()) {
      return { total: 0, pending: 0, accepted: 0, completed: 0, rejected: 0 };
    }

    try {
      const [totalRes, pendingRes, acceptedRes, completedRes, rejectedRes] = await Promise.all([
        supabase.from('inquiries').select('*', { count: 'exact', head: true }),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'Accepted'),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'Completed'),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'Rejected'),
      ]);

      return {
        total: totalRes.count || 0,
        pending: pendingRes.count || 0,
        accepted: acceptedRes.count || 0,
        completed: completedRes.count || 0,
        rejected: rejectedRes.count || 0,
      };
    } catch (err) {
      console.error('PrismFlow inquiryService getMetrics exception:', err);
      return { total: 0, pending: 0, accepted: 0, completed: 0, rejected: 0 };
    }
  }
};
