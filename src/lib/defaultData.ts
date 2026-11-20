import {
  ApplicationItem,
  FounderWorkStatus,
  MediaAsset,
  PrivacyPolicy,
  WebsiteSettings,
} from '../types/cms';

export function resolveAssetUrl(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  const base = import.meta.env.BASE_URL || '/';
  if (trimmed.startsWith('/')) {
    if (base !== '/' && trimmed.startsWith(base)) {
      return trimmed;
    }
    return `${base}${trimmed.replace(/^\/+/, '')}`;
  }
  return trimmed;
}

export const FOUNDER_PHOTO_PATH = resolveAssetUrl(
  '/src/assets/images/founder_dhanasekar_clean_1794988675788.jpg'
);

export const DEFAULT_FOUNDER_WORK_STATUS: FounderWorkStatus = {
  enabled: true,
  role: 'Founder & Software Developer',
  organization: 'RDS TECH FACT',
  availability: 'Actively Building Software & Open to Technical Collaborations',
  location: 'India · Remote / Hybrid',
  summary:
    'Designing practical software applications, Python developer utilities, and accessible AI & technology education resources.',
};

export function getFounderPhotoList(settings: Pick<WebsiteSettings, 'founder_photo_url' | 'founder_photos'>): string[] {
  const candidates: string[] = [];
  const rawList = Array.isArray(settings.founder_photos) ? settings.founder_photos : [];

  if (settings.founder_photo_url && settings.founder_photo_url.trim()) {
    candidates.push(resolveAssetUrl(settings.founder_photo_url));
  }

  for (const item of rawList) {
    if (typeof item === 'string' && item.trim()) {
      const resolved = resolveAssetUrl(item);
      if (!candidates.includes(resolved)) {
        candidates.push(resolved);
      }
    }
  }

  if (candidates.length === 0) {
    candidates.push(FOUNDER_PHOTO_PATH);
  }

  return candidates.slice(0, 3);
}

const nowIso = new Date().toISOString();
const todayDate = nowIso.split('T')[0];

export const DEFAULT_SETTINGS: WebsiteSettings = {
  id: 1,
  brand_name: 'RDS TECH FACT',
  tagline: 'Technology. Innovation. Solutions.',
  hero_heading: 'Focused Software Applications & Practical Digital Solutions',
  hero_description:
    'RDS TECH FACT builds reliable software applications, developer utilities, and technical education resources engineered with clarity, performance, and respect for user privacy.',
  founder_name: 'Dhanasekar R',
  founder_title: 'Founder – RDS TECH FACT',
  founder_intro:
    'Dhanasekar R founded RDS TECH FACT with a clear focus on creating dependable software applications, digital utilities, and technical learning resources that solve real-world problems without unnecessary complexity.',
  founder_photo_url: FOUNDER_PHOTO_PATH,
  founder_photos: [FOUNDER_PHOTO_PATH],
  founder_photo_interval: 10,
  founder_work_status: DEFAULT_FOUNDER_WORK_STATUS,
  founder_resume_url: '',
  founder_resume_title: 'Dhanasekar R – Resume (PDF)',
  founder_resume_updated_at: '',
  company_vision:
    'To build trustworthy, accessible software applications and technical education resources that help users and developers work more effectively every day.',
  company_mission:
    'To engineer clean, practical digital products with transparent privacy standards, thoughtful user experience, and continuous improvement.',
  why_choose_heading: 'Why Choose RDS TECH FACT',
  seo_title: 'RDS TECH FACT – Technology. Innovation. Solutions.',
  seo_description:
    'RDS TECH FACT, founded by Dhanasekar R, builds practical software applications, digital solutions, and technical education resources.',
  contact_email: 'rdsprojectsmyself@gmail.com',
  support_email: 'rdsprojectsmyself@gmail.com',
  privacy_email: 'rdsprojectsmyself@gmail.com',
  footer_copyright: '© 2026 RDS TECH FACT. All rights reserved.',
  social_github: '',
  social_linkedin: '',
  social_youtube: '',
  updated_at: nowIso,
};

export const DEFAULT_APPLICATIONS: ApplicationItem[] = [
  {
    id: 'app-rdspy-001',
    name: 'RDSPy',
    slug: 'rdspy',
    short_description: 'Python tools and utilities.',
    full_description:
      'RDSPy is a collection of Python tools and utilities developed by RDS TECH FACT. [Administrator note: Expand this description and add version, platform links, and screenshots before publishing.]',
    logo_url: '',
    features: ['Python utility modules', 'Clean command-line workflows'],
    version: '',
    platform: 'Cross-platform',
    google_play_url: '',
    website_url: '',
    download_url: '',
    support_email: 'rdsprojectsmyself@gmail.com',
    status: 'draft',
    screenshots: [],
    created_at: nowIso,
    updated_at: nowIso,
  },
];

export const DEFAULT_POLICIES: PrivacyPolicy[] = [
  {
    id: 'policy-rdspy-001',
    application_id: 'app-rdspy-001',
    application_name: 'RDSPy',
    slug: 'rdspy',
    effective_date: todayDate,
    information_collected:
      '[Administrator action required: Specify what information, if any, RDSPy collects before publishing.]',
    information_usage:
      '[Administrator action required: Explain how collected information is used.]',
    data_storage:
      '[Administrator action required: Describe where and how long data is stored.]',
    data_sharing:
      '[Administrator action required: Clarify whether any data is shared with third parties.]',
    data_security:
      '[Administrator action required: Outline the security measures protecting user data.]',
    user_rights:
      '[Administrator action required: Detail user rights regarding access, correction, or deletion of data.]',
    childrens_privacy:
      '[Administrator action required: State children’s privacy practices where applicable.]',
    policy_changes:
      'We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.',
    contact_information:
      'For privacy enquiries regarding RDSPy, please contact rdsprojectsmyself@gmail.com.',
    status: 'draft',
    created_at: nowIso,
    updated_at: nowIso,
  },
];

export const DEFAULT_MEDIA: MediaAsset[] = [
  {
    id: 'media-founder-001',
    name: 'founder-dhanasekar-r.jpg',
    url: FOUNDER_PHOTO_PATH,
    size: 184320,
    mime_type: 'image/jpeg',
    created_at: nowIso,
  },
];
