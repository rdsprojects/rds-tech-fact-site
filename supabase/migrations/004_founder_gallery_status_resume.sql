-- ============================================================================
-- RDS TECH FACT — Incremental Safe Migration (004)
-- Adds Founder multi-photo gallery (up to 3 images + transition interval),
-- Founder current working status, and Resume attachment metadata to
-- public.website_settings, and enables PDF/DOCX uploads in rds-media storage.
--
-- Safe & idempotent:
--   - Does NOT drop tables or overwrite existing data
--   - Does NOT alter auth.users, public.admin_users, or existing RLS security
-- ============================================================================

-- 1. Extend public.website_settings with Founder Gallery, Working Status & Resume
alter table public.website_settings
  add column if not exists founder_photos jsonb not null default '[]'::jsonb,
  add column if not exists founder_photo_interval integer not null default 10,
  add column if not exists founder_work_status jsonb not null default '{}'::jsonb,
  add column if not exists founder_resume_url text default '',
  add column if not exists founder_resume_title text default '',
  add column if not exists founder_resume_updated_at text default '';

-- Keep interval within sensible bounds (3s to 120s)
alter table public.website_settings
  drop constraint if exists website_settings_founder_photo_interval_check;

alter table public.website_settings
  add constraint website_settings_founder_photo_interval_check
  check (founder_photo_interval >= 3 and founder_photo_interval <= 120);

-- 2. Extend rds-media storage bucket to allow Resume documents (PDF, DOC, DOCX) up to 10 MB
update storage.buckets
set
  file_size_limit = 10485760,
  allowed_mime_types = array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
where id = 'rds-media';

-- 3. Ensure read/update privileges remain intact on public.website_settings
grant select on table public.website_settings to anon, authenticated;
grant update on table public.website_settings to authenticated;
