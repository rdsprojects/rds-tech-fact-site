-- ============================================================================
-- RDS TECH FACT — Supabase PostgreSQL Schema & Row Level Security (RLS)
-- Single Authorized Administrator: rdsprojectsmyself@gmail.com
-- ============================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ADMIN USERS TABLE
-- ----------------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  full_name text not null,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed the sole authorized administrator
insert into public.admin_users (email, full_name, role)
values ('rdsprojectsmyself@gmail.com', 'Dhanasekar R', 'admin')
on conflict (email) do nothing;

-- Helper function: strictly verify authenticated single administrator
create or replace function public.is_authorized_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and lower(email) = 'rdsprojectsmyself@gmail.com'
  );
$$;

-- ----------------------------------------------------------------------------
-- 2. APPLICATIONS TABLE
-- ----------------------------------------------------------------------------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  short_description text not null,
  full_description text not null default '',
  logo_url text,
  features jsonb not null default '[]'::jsonb,
  version text,
  platform text,
  google_play_url text,
  website_url text,
  download_url text,
  support_email text,
  status text not null default 'draft' check (status in ('draft', 'published', 'unpublished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_applications_status on public.applications(status);
create index if not exists idx_applications_slug on public.applications(slug);

-- ----------------------------------------------------------------------------
-- 3. APPLICATION IMAGES TABLE
-- ----------------------------------------------------------------------------
create table if not exists public.application_images (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_application_images_app_id on public.application_images(application_id);

-- ----------------------------------------------------------------------------
-- 4. PRIVACY POLICIES TABLE
-- ----------------------------------------------------------------------------
create table if not exists public.privacy_policies (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete set null,
  application_name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  effective_date date not null default current_date,
  information_collected text not null default '',
  information_usage text not null default '',
  data_storage text not null default '',
  data_sharing text not null default '',
  data_security text not null default '',
  user_rights text not null default '',
  childrens_privacy text not null default '',
  policy_changes text not null default '',
  contact_information text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_privacy_policies_slug on public.privacy_policies(slug);
create index if not exists idx_privacy_policies_status on public.privacy_policies(status);

-- ----------------------------------------------------------------------------
-- 5. WEBSITE SETTINGS TABLE (Single-row configuration)
-- ----------------------------------------------------------------------------
create table if not exists public.website_settings (
  id integer primary key default 1 check (id = 1),
  brand_name text not null default 'RDS TECH FACT',
  tagline text not null default 'Technology. Innovation. Solutions.',
  hero_heading text not null default 'Practical Software & Digital Solutions Built for Real-World Impact',
  hero_description text not null default 'RDS TECH FACT develops focused software applications, developer utilities, and technical education resources with an emphasis on reliability, clarity, and user privacy.',
  founder_name text not null default 'Dhanasekar R',
  founder_title text not null default 'Founder – RDS TECH FACT',
  founder_intro text not null default 'Dhanasekar R founded RDS TECH FACT to build dependable software applications and practical digital tools that solve everyday technical challenges without unnecessary complexity.',
  founder_photo_url text not null default '/src/assets/images/founder_dhanasekar_clean_1794988675788.jpg',
  company_vision text not null default 'To create accessible, trustworthy software applications and technical resources that empower learners, developers, and everyday users.',
  company_mission text not null default 'To design and deliver clean, well-engineered digital products with transparent privacy practices and continuous improvement.',
  why_choose_heading text not null default 'Why Choose RDS TECH FACT',
  seo_title text not null default 'RDS TECH FACT – Technology. Innovation. Solutions.',
  seo_description text not null default 'RDS TECH FACT, founded by Dhanasekar R, builds practical software applications, digital solutions, and technical education resources.',
  contact_email text not null default 'rdsprojectsmyself@gmail.com',
  support_email text not null default 'rdsprojectsmyself@gmail.com',
  privacy_email text not null default 'rdsprojectsmyself@gmail.com',
  footer_copyright text not null default '© 2026 RDS TECH FACT. All rights reserved.',
  social_github text default '',
  social_linkedin text default '',
  social_youtube text default '',
  updated_at timestamptz not null default now()
);

insert into public.website_settings (id)
values (1)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 6. CONTACT MESSAGES TABLE
-- ----------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) >= 2),
  email text not null check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  category text not null default 'general' check (category in ('general', 'support', 'privacy')),
  subject text not null check (char_length(trim(subject)) >= 2),
  message text not null check (char_length(trim(message)) >= 10),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- AUTOMATIC updated_at TRIGGER
-- ----------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_applications_updated_at on public.applications;
create trigger set_applications_updated_at
  before update on public.applications
  for each row execute function public.handle_updated_at();

drop trigger if exists set_privacy_policies_updated_at on public.privacy_policies;
create trigger set_privacy_policies_updated_at
  before update on public.privacy_policies
  for each row execute function public.handle_updated_at();

drop trigger if exists set_website_settings_updated_at on public.website_settings;
create trigger set_website_settings_updated_at
  before update on public.website_settings
  for each row execute function public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
alter table public.admin_users enable row level security;
alter table public.applications enable row level security;
alter table public.application_images enable row level security;
alter table public.privacy_policies enable row level security;
alter table public.website_settings enable row level security;
alter table public.contact_messages enable row level security;

-- admin_users: only authorized admin can read their own record
create policy "Admin can read own admin record"
  on public.admin_users for select
  using (public.is_authorized_admin());

-- applications: public sees ONLY published; admin has full CRUD
create policy "Public can view published applications"
  on public.applications for select
  using (status = 'published' or public.is_authorized_admin());

create policy "Admin can insert applications"
  on public.applications for insert
  with check (public.is_authorized_admin());

create policy "Admin can update applications"
  on public.applications for update
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

create policy "Admin can delete applications"
  on public.applications for delete
  using (public.is_authorized_admin());

-- application_images: public sees images of published apps; admin has full CRUD
create policy "Public can view images of published applications"
  on public.application_images for select
  using (
    public.is_authorized_admin()
    or exists (
      select 1 from public.applications a
      where a.id = application_images.application_id
        and a.status = 'published'
    )
  );

create policy "Admin can manage application images"
  on public.application_images for all
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

-- privacy_policies: public sees ONLY published; admin has full CRUD
create policy "Public can view published privacy policies"
  on public.privacy_policies for select
  using (status = 'published' or public.is_authorized_admin());

create policy "Admin can insert privacy policies"
  on public.privacy_policies for insert
  with check (public.is_authorized_admin());

create policy "Admin can update privacy policies"
  on public.privacy_policies for update
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

create policy "Admin can delete privacy policies"
  on public.privacy_policies for delete
  using (public.is_authorized_admin());

-- website_settings: public can read; only admin can update
create policy "Public can view website settings"
  on public.website_settings for select
  using (true);

create policy "Admin can update website settings"
  on public.website_settings for update
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

-- contact_messages: public can insert; only admin can read or delete
create policy "Public can submit contact messages"
  on public.contact_messages for insert
  with check (true);

create policy "Admin can view contact messages"
  on public.contact_messages for select
  using (public.is_authorized_admin());

create policy "Admin can delete contact messages"
  on public.contact_messages for delete
  using (public.is_authorized_admin());

-- ----------------------------------------------------------------------------
-- INITIAL SEED DATA: RDSPy (Status: draft until admin publishes)
-- ----------------------------------------------------------------------------
insert into public.applications (
  name,
  slug,
  short_description,
  full_description,
  features,
  platform,
  support_email,
  status
)
values (
  'RDSPy',
  'rdspy',
  'Python tools and utilities.',
  'RDSPy is a collection of Python tools and utilities developed by RDS TECH FACT. Complete the full description, version, platform links, and screenshots in the Admin Dashboard before publishing.',
  '["Python utility modules", "Clean command-line workflows"]'::jsonb,
  'Cross-platform',
  'rdsprojectsmyself@gmail.com',
  'draft'
)
on conflict (slug) do nothing;

insert into public.privacy_policies (
  application_id,
  application_name,
  slug,
  effective_date,
  information_collected,
  information_usage,
  data_storage,
  data_sharing,
  data_security,
  user_rights,
  childrens_privacy,
  policy_changes,
  contact_information,
  status
)
select
  a.id,
  'RDSPy',
  'rdspy',
  current_date,
  '[Administrator action required: Describe what information, if any, RDSPy collects.]',
  '[Administrator action required: Describe how collected information is used.]',
  '[Administrator action required: Describe where and how long data is stored.]',
  '[Administrator action required: Describe whether data is shared with third parties.]',
  '[Administrator action required: Describe security measures protecting user data.]',
  '[Administrator action required: Describe user rights regarding their data.]',
  '[Administrator action required: State children''s privacy practices if applicable.]',
  'We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.',
  'For privacy enquiries regarding RDSPy, please contact rdsprojectsmyself@gmail.com.',
  'draft'
from public.applications a
where a.slug = 'rdspy'
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- SUPABASE STORAGE BUCKET & POLICIES (rds-media)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'rds-media',
  'rds-media',
  true,
  5242880, -- 5 MB limit per file
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do nothing;

create policy "Public can view rds-media"
  on storage.objects for select
  using (bucket_id = 'rds-media');

create policy "Admin can upload to rds-media"
  on storage.objects for insert
  with check (bucket_id = 'rds-media' and public.is_authorized_admin());

create policy "Admin can update rds-media"
  on storage.objects for update
  using (bucket_id = 'rds-media' and public.is_authorized_admin());

create policy "Admin can delete from rds-media"
  on storage.objects for delete
  using (bucket_id = 'rds-media' and public.is_authorized_admin());
