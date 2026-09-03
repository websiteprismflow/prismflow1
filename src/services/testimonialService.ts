import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Testimonial, TestimonialRating } from '../types';

export const testimonialService = {
  /**
   * Public website query: retrieve only published testimonials.
   * Filtered at the database level.
   */
  getPublished: async (): Promise<Testimonial[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('published_live', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('PrismFlow testimonialService.getPublished error:', error.message);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        client_name: row.client_name,
        company: row.company,
        role: row.role,
        title: row.title,
        rating: row.rating,
        client_review_quote: row.client_review_quote,
        avatar_image_url: row.avatar_image_url,
        company_website_url: row.company_website_url,
        published_live: row.published_live,
        created_at: row.created_at,
        updated_at: row.updated_at,
        // UI helper properties
        clientName: row.client_name,
        review: row.client_review_quote,
        profileImage: row.avatar_image_url || '',
        websiteUrl: row.company_website_url || '#',
        published: row.published_live,
      }));
    } catch (err) {
      console.error('PrismFlow testimonialService.getPublished exception:', err);
      return [];
    }
  },

  /**
   * Admin query: retrieve all testimonials.
   */
  getAllAdmin: async (): Promise<Testimonial[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('PrismFlow testimonialService.getAllAdmin error:', error.message);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        client_name: row.client_name,
        company: row.company,
        role: row.role,
        title: row.title,
        rating: row.rating,
        client_review_quote: row.client_review_quote,
        avatar_image_url: row.avatar_image_url,
        company_website_url: row.company_website_url,
        published_live: row.published_live,
        created_at: row.created_at,
        updated_at: row.updated_at,
        clientName: row.client_name,
        review: row.client_review_quote,
        profileImage: row.avatar_image_url || '',
        websiteUrl: row.company_website_url || '#',
        published: row.published_live,
      }));
    } catch (err) {
      console.error('PrismFlow testimonialService.getAllAdmin exception:', err);
      return [];
    }
  },

  /**
   * Create testimonial in Supabase.
   */
  create: async (data: {
    client_name: string;
    company: string;
    role: string;
    title?: string | null;
    rating: TestimonialRating;
    client_review_quote: string;
    avatar_image_url?: string | null;
    company_website_url?: string | null;
    published_live: boolean;
  }): Promise<{ success: boolean; data?: Testimonial; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database is not configured' };
    }

    // Enforce rating is 3, 4, or 5
    const cleanRating = [3, 4, 5].includes(data.rating) ? data.rating : 5;

    try {
      const { data: inserted, error } = await supabase
        .from('testimonials')
        .insert({
          client_name: data.client_name.trim(),
          company: data.company.trim(),
          role: data.role.trim(),
          title: data.title?.trim() || null,
          rating: cleanRating,
          client_review_quote: data.client_review_quote.trim(),
          avatar_image_url: data.avatar_image_url?.trim() || null,
          company_website_url: data.company_website_url?.trim() || null,
          published_live: data.published_live,
        })
        .select()
        .single();

      if (error || !inserted) {
        console.error('PrismFlow testimonialService.create error:', error?.message);
        return { success: false, error: error?.message || 'Failed to create testimonial' };
      }

      return {
        success: true,
        data: {
          id: inserted.id,
          client_name: inserted.client_name,
          company: inserted.company,
          role: inserted.role,
          title: inserted.title,
          rating: inserted.rating,
          client_review_quote: inserted.client_review_quote,
          avatar_image_url: inserted.avatar_image_url,
          company_website_url: inserted.company_website_url,
          published_live: inserted.published_live,
          created_at: inserted.created_at,
          updated_at: inserted.updated_at,
          clientName: inserted.client_name,
          review: inserted.client_review_quote,
          profileImage: inserted.avatar_image_url || '',
          websiteUrl: inserted.company_website_url || '#',
          published: inserted.published_live,
        }
      };
    } catch (err) {
      console.error('PrismFlow testimonialService.create exception:', err);
      return { success: false, error: 'An unexpected error occurred while saving.' };
    }
  },

  /**
   * Update testimonial in Supabase.
   */
  update: async (id: string, data: Partial<{
    client_name: string;
    company: string;
    role: string;
    title?: string | null;
    rating: TestimonialRating;
    client_review_quote: string;
    avatar_image_url?: string | null;
    company_website_url?: string | null;
    published_live: boolean;
  }>): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database is not configured' };
    }

    try {
      const payload: any = { ...data, updated_at: new Date().toISOString() };
      if (payload.rating && ![3, 4, 5].includes(payload.rating)) {
        payload.rating = 5;
      }

      const { error } = await supabase
        .from('testimonials')
        .update(payload)
        .eq('id', id);

      if (error) {
        console.error('PrismFlow testimonialService.update error:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('PrismFlow testimonialService.update exception:', err);
      return { success: false, error: 'Failed to update testimonial' };
    }
  },

  /**
   * Toggle published_live
   */
  togglePublish: async (id: string, currentStatus: boolean): Promise<{ success: boolean; error?: string }> => {
    return testimonialService.update(id, { published_live: !currentStatus });
  },

  /**
   * Delete testimonial from Supabase.
   */
  delete: async (id: string, avatarUrl?: string | null): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database is not configured' };
    }

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('PrismFlow testimonialService.delete error:', error.message);
        return { success: false, error: error.message };
      }

      // Cleanup avatar from storage if in testimonial-avatars bucket
      if (avatarUrl && avatarUrl.includes('testimonial-avatars')) {
        try {
          const path = avatarUrl.split('/testimonial-avatars/')[1];
          if (path) await supabase.storage.from('testimonial-avatars').remove([decodeURIComponent(path)]);
        } catch (storageErr) {
          console.warn('PrismFlow avatar cleanup warning:', storageErr);
        }
      }

      return { success: true };
    } catch (err) {
      console.error('PrismFlow testimonialService.delete exception:', err);
      return { success: false, error: 'Failed to delete testimonial' };
    }
  },

  /**
   * Upload avatar to Supabase Storage bucket 'testimonial-avatars'
   * Validates MIME type and size (<= 3MB)
   */
  uploadAvatar: async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase storage is not configured' };
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: 'Invalid image format. Supported formats: JPEG, PNG, WEBP, AVIF.' };
    }

    const maxSize = 3 * 1024 * 1024; // 3MB
    if (file.size > maxSize) {
      return { success: false, error: 'Avatar file size exceeds 3MB limit.' };
    }

    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('testimonial-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('PrismFlow testimonial-avatars upload error:', uploadError.message);
        return { success: false, error: uploadError.message };
      }

      const { data: publicUrlData } = supabase.storage
        .from('testimonial-avatars')
        .getPublicUrl(filePath);

      return { success: true, url: publicUrlData.publicUrl };
    } catch (err) {
      console.error('PrismFlow uploadAvatar exception:', err);
      return { success: false, error: 'Failed to upload avatar' };
    }
  }
};
