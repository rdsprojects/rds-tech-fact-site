export type ApplicationStatus = 'draft' | 'published' | 'unpublished';
export type PolicyStatus = 'draft' | 'published' | 'unpublished';

export interface ApplicationImage {
  id: string;
  application_id: string;
  image_url: string;
  caption?: string;
  sort_order: number;
  created_at: string;
}

export interface ApplicationItem {
  id: string;
  name: string;
  slug: string;
  category?: string;
  is_featured?: boolean;
  short_description: string;
  full_description: string;
  logo_url?: string;
  features: string[];
  version?: string;
  platform?: string;
  google_play_url?: string;
  website_url?: string;
  download_url?: string;
  support_email?: string;
  status: ApplicationStatus;
  screenshots?: ApplicationImage[];
  created_at: string;
  updated_at: string;
}

export interface PrivacyPolicy {
  id: string;
  application_id?: string | null;
  application_name: string;
  slug: string;
  effective_date: string;
  information_collected: string;
  information_usage: string;
  data_storage: string;
  data_sharing: string;
  data_security: string;
  user_rights: string;
  childrens_privacy: string;
  policy_changes: string;
  contact_information: string;
  status: PolicyStatus;
  created_at: string;
  updated_at: string;
}

export interface WebsiteSettings {
  id: number;
  brand_name: string;
  tagline: string;
  hero_heading: string;
  hero_description: string;
  founder_name: string;
  founder_title: string;
  founder_intro: string;
  founder_photo_url: string;
  logo_url?: string;
  favicon_url?: string;
  company_vision: string;
  company_mission: string;
  why_choose_heading: string;
  seo_title: string;
  seo_description: string;
  contact_email: string;
  support_email: string;
  privacy_email: string;
  footer_copyright: string;
  social_github?: string;
  social_linkedin?: string;
  social_youtube?: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  category: 'general' | 'support' | 'privacy';
  subject: string;
  message: string;
  is_read?: boolean;
  created_at: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  size: number;
  mime_type: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  target: string;
  timestamp: string;
}
