export type InquiryStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface Inquiry {
  id: string;
  name: string;
  businessType: string;
  email: string;
  contact: string;
  requirement: string;
  additionalNotes?: string;
  createdAt: string;
  status: InquiryStatus;
  adminNotes?: string;
}

export type ProjectCategory = 'Websites' | 'AI Agents' | 'Agentic Systems' | 'SaaS' | 'Automation' | 'E-Commerce';

export interface PortfolioProject {
  id: string;
  title: string;
  category: ProjectCategory;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  websiteUrl: string;
  technologies: string[];
  featured: boolean;
  published: boolean;
  stats?: { label: string; value: string }[];
}

export interface Testimonial {
  id: string;
  clientName: string;
  company: string;
  role: string;
  review: string;
  profileImage: string;
  websiteUrl: string;
  projectUrl?: string;
  published: boolean;
  rating: number;
}

export interface LegalDocument {
  id: 'privacy' | 'terms';
  title: string;
  lastUpdated: string;
  sections: {
    heading: string;
    body: string;
  }[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin';
}

export interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  details: string[];
  iconName: string;
  badge: string;
}
