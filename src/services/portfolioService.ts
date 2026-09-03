import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PortfolioProject, PortfolioCategory } from '../types';

export const VALID_PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
  'Website',
  'Agents',
  'SaaS',
  'Automation',
  'E-commerce'
];

export const portfolioService = {
  /**
   * Public website query: retrieve only published portfolio records.
   * Filters at the database level so private records are never downloaded to client.
   */
  getPublished: async (category?: string): Promise<PortfolioProject[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      let query = supabase
        .from('portfolios')
        .select('*')
        .eq('published_live', true)
        .order('created_at', { ascending: false });

      if (category && category !== 'All') {
        // Map category if needed
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('PrismFlow portfolioService.getPublished error:', error.message);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        project_title: row.project_title,
        category: row.category,
        description: row.description,
        project_photo_urls: row.project_photo_urls || [],
        preview_video_url: row.preview_video_url,
        live_website_url: row.live_website_url,
        technologies: row.technologies || [],
        featured_on_homepage: row.featured_on_homepage,
        published_live: row.published_live,
        created_at: row.created_at,
        updated_at: row.updated_at,
        // UI helper properties
        title: row.project_title,
        imageUrl: (row.project_photo_urls && row.project_photo_urls[0]) || '',
        videoUrl: row.preview_video_url || undefined,
        websiteUrl: row.live_website_url || '#',
        featured: row.featured_on_homepage,
        published: row.published_live,
      }));
    } catch (err) {
      console.error('PrismFlow portfolioService.getPublished exception:', err);
      return [];
    }
  },

  /**
   * Public website query: retrieve featured projects for homepage.
   * Strictly filters both published_live = true AND featured_on_homepage = true at the database level.
   */
  getFeatured: async (): Promise<PortfolioProject[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('published_live', true)
        .eq('featured_on_homepage', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('PrismFlow portfolioService.getFeatured error:', error.message);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        project_title: row.project_title,
        category: row.category,
        description: row.description,
        project_photo_urls: row.project_photo_urls || [],
        preview_video_url: row.preview_video_url,
        live_website_url: row.live_website_url,
        technologies: row.technologies || [],
        featured_on_homepage: row.featured_on_homepage,
        published_live: row.published_live,
        title: row.project_title,
        imageUrl: (row.project_photo_urls && row.project_photo_urls[0]) || '',
        videoUrl: row.preview_video_url || undefined,
        websiteUrl: row.live_website_url || '#',
        featured: row.featured_on_homepage,
        published: row.published_live,
      }));
    } catch (err) {
      console.error('PrismFlow portfolioService.getFeatured exception:', err);
      return [];
    }
  },

  /**
   * Admin query: retrieve all portfolios (published and unpublished).
   */
  getAllAdmin: async (): Promise<PortfolioProject[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('PrismFlow portfolioService.getAllAdmin error:', error.message);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        project_title: row.project_title,
        category: row.category,
        description: row.description,
        project_photo_urls: row.project_photo_urls || [],
        preview_video_url: row.preview_video_url,
        live_website_url: row.live_website_url,
        technologies: row.technologies || [],
        featured_on_homepage: row.featured_on_homepage,
        published_live: row.published_live,
        created_at: row.created_at,
        updated_at: row.updated_at,
        title: row.project_title,
        imageUrl: (row.project_photo_urls && row.project_photo_urls[0]) || '',
        videoUrl: row.preview_video_url || undefined,
        websiteUrl: row.live_website_url || '#',
        featured: row.featured_on_homepage,
        published: row.published_live,
      }));
    } catch (err) {
      console.error('PrismFlow portfolioService.getAllAdmin exception:', err);
      return [];
    }
  },

  /**
   * Create a new portfolio project in Supabase.
   */
  create: async (data: {
    project_title: string;
    category: string;
    description: string;
    project_photo_urls: string[];
    preview_video_url?: string | null;
    live_website_url?: string | null;
    technologies: string[];
    featured_on_homepage: boolean;
    published_live: boolean;
  }): Promise<{ success: boolean; data?: PortfolioProject; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database is not configured' };
    }

    try {
      const { data: inserted, error } = await supabase
        .from('portfolios')
        .insert({
          project_title: data.project_title.trim(),
          category: data.category,
          description: data.description.trim(),
          project_photo_urls: data.project_photo_urls,
          preview_video_url: data.preview_video_url?.trim() || null,
          live_website_url: data.live_website_url?.trim() || null,
          technologies: data.technologies,
          featured_on_homepage: data.featured_on_homepage,
          published_live: data.published_live,
        })
        .select()
        .single();

      if (error || !inserted) {
        console.error('PrismFlow portfolioService.create error:', error?.message);
        return { success: false, error: error?.message || 'Failed to create project' };
      }

      return {
        success: true,
        data: {
          id: inserted.id,
          project_title: inserted.project_title,
          category: inserted.category,
          description: inserted.description,
          project_photo_urls: inserted.project_photo_urls,
          preview_video_url: inserted.preview_video_url,
          live_website_url: inserted.live_website_url,
          technologies: inserted.technologies,
          featured_on_homepage: inserted.featured_on_homepage,
          published_live: inserted.published_live,
          created_at: inserted.created_at,
          updated_at: inserted.updated_at,
          title: inserted.project_title,
          imageUrl: (inserted.project_photo_urls && inserted.project_photo_urls[0]) || '',
          videoUrl: inserted.preview_video_url || undefined,
          websiteUrl: inserted.live_website_url || '#',
          featured: inserted.featured_on_homepage,
          published: inserted.published_live,
        }
      };
    } catch (err) {
      console.error('PrismFlow portfolioService.create exception:', err);
      return { success: false, error: 'An unexpected error occurred while saving.' };
    }
  },

  /**
   * Update an existing portfolio project in Supabase.
   */
  update: async (id: string, data: Partial<{
    project_title: string;
    category: string;
    description: string;
    project_photo_urls: string[];
    preview_video_url?: string | null;
    live_website_url?: string | null;
    technologies: string[];
    featured_on_homepage: boolean;
    published_live: boolean;
  }>): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database is not configured' };
    }

    try {
      const payload: any = { ...data, updated_at: new Date().toISOString() };
      const { error } = await supabase
        .from('portfolios')
        .update(payload)
        .eq('id', id);

      if (error) {
        console.error('PrismFlow portfolioService.update error:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('PrismFlow portfolioService.update exception:', err);
      return { success: false, error: 'Failed to update project' };
    }
  },

  /**
   * Toggle published_live status
   */
  togglePublish: async (id: string, currentStatus: boolean): Promise<{ success: boolean; error?: string }> => {
    return portfolioService.update(id, { published_live: !currentStatus });
  },

  /**
   * Delete portfolio project from Supabase
   */
  delete: async (id: string, mediaUrls?: string[]): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database is not configured' };
    }

    try {
      // 1. Delete database record
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('PrismFlow portfolioService.delete error:', error.message);
        return { success: false, error: error.message };
      }

      // 2. Cleanup storage media files if any
      if (mediaUrls && mediaUrls.length > 0) {
        for (const url of mediaUrls) {
          try {
            if (url.includes('portfolio-images')) {
              const path = url.split('/portfolio-images/')[1];
              if (path) await supabase.storage.from('portfolio-images').remove([decodeURIComponent(path)]);
            } else if (url.includes('portfolio-videos')) {
              const path = url.split('/portfolio-videos/')[1];
              if (path) await supabase.storage.from('portfolio-videos').remove([decodeURIComponent(path)]);
            }
          } catch (storageErr) {
            console.warn('PrismFlow media cleanup warning:', storageErr);
          }
        }
      }

      return { success: true };
    } catch (err) {
      console.error('PrismFlow portfolioService.delete exception:', err);
      return { success: false, error: 'Failed to delete portfolio item' };
    }
  },

  /**
   * Upload image to Supabase Storage bucket 'portfolio-images'
   * Validates MIME type and size (<= 10MB)
   */
  uploadImage: async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase storage is not configured' };
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: 'Invalid image format. Supported formats: JPEG, PNG, WEBP, AVIF, SVG, GIF.' };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { success: false, error: 'Image file size exceeds 10MB limit.' };
    }

    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('PrismFlow portfolio-images upload error:', uploadError.message);
        return { success: false, error: uploadError.message };
      }

      const { data: publicUrlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(filePath);

      return { success: true, url: publicUrlData.publicUrl };
    } catch (err) {
      console.error('PrismFlow uploadImage exception:', err);
      return { success: false, error: 'Failed to upload image' };
    }
  },

  /**
   * Upload video to Supabase Storage bucket 'portfolio-videos'
   * Validates MIME type and size (<= 50MB)
   */
  uploadVideo: async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase storage is not configured' };
    }

    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: 'Invalid video format. Supported formats: MP4, WebM, MOV.' };
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return { success: false, error: 'Video file size exceeds 50MB limit.' };
    }

    try {
      const fileExt = file.name.split('.').pop() || 'mp4';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `previews/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('PrismFlow portfolio-videos upload error:', uploadError.message);
        return { success: false, error: uploadError.message };
      }

      const { data: publicUrlData } = supabase.storage
        .from('portfolio-videos')
        .getPublicUrl(filePath);

      return { success: true, url: publicUrlData.publicUrl };
    } catch (err) {
      console.error('PrismFlow uploadVideo exception:', err);
      return { success: false, error: 'Failed to upload video' };
    }
  }
};
