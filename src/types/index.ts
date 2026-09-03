export type InquiryStatus = 'Pending' | 'Accepted' | 'Completed' | 'Rejected';

export type BusinessType = 'SaaS' | 'E-commerce' | 'Agency' | 'Real Estate' | 'Restaurant' | 'Others';

export type WhatYouNeed = 'Website' | 'AI Agent' | 'AI Automation' | 'SaaS App' | 'E-commerce' | 'Custom System';

export interface Inquiry {
  id: string;
  name: string;
  business_type: string;
  email: string;
  contact_number: string;
  what_you_need: string;
  additional_requirement?: string | null;
  status: InquiryStatus;
  created_at: string;
  // Legacy aliases for backward compatibility if needed
  businessType?: string;
  contact?: string;
  requirement?: string;
  additionalNotes?: string;
  createdAt?: string;
  adminNotes?: string;
}

export type PortfolioCategory = 'Website' | 'Agents' | 'SaaS' | 'Automation' | 'E-commerce';

export interface PortfolioProject {
  id: string;
  project_title: string;
  category: PortfolioCategory | string;
  description: string;
  project_photo_urls: string[];
  preview_video_url?: string | null;
  live_website_url?: string | null;
  technologies: string[];
  featured_on_homepage: boolean;
  published_live: boolean;
  created_at?: string;
  updated_at?: string;
  // UI helper getters
  title?: string;
  imageUrl?: string;
  videoUrl?: string;
  websiteUrl?: string;
  featured?: boolean;
  published?: boolean;
  stats?: { label: string; value: string }[];
}

export type TestimonialRating = 3 | 4 | 5;

export interface Testimonial {
  id: string;
  client_name: string;
  company: string;
  role: string;
  title?: string | null;
  rating: number;
  client_review_quote: string;
  avatar_image_url?: string | null;
  company_website_url?: string | null;
  published_live: boolean;
  created_at?: string;
  updated_at?: string;
  // UI helper getters
  clientName?: string;
  review?: string;
  profileImage?: string;
  websiteUrl?: string;
  published?: boolean;
}

export type PolicyType = 'Privacy Policy' | 'Terms & Conditions';

export interface LegalClause {
  id: string;
  policy_type: PolicyType;
  clause_heading: string;
  clause_content: string;
  clause_order: number;
  published_live: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LegalDocument {
  id: 'privacy' | 'terms';
  title: string;
  lastUpdated: string;
  sections: {
    id?: string;
    heading: string;
    body: string;
    order?: number;
    published?: boolean;
  }[];
}

export interface AdminUser {
  id: string;
  email: string;
  full_name?: string | null;
  name?: string;
  role?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  details: string[];
  iconName: string;
  badge: string;
}
