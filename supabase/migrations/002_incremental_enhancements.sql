-- ============================================================================
-- RDS TECH FACT — Incremental Safe Migration (002)
-- Adds application category/featured flags, contact message read status + RLS,
-- website logo/favicon URLs, and privacy policy unpublished status.
-- Safe & idempotent: does not drop tables or overwrite existing data.
-- ============================================================================

-- 1. Applications: add category and is_featured columns
alter table public.applications
  add column if not exists category text default 'Software',
  add column if not exists is_featured boolean not null default false;

-- 2. Contact Messages: add is_read column and admin UPDATE policy
alter table public.contact_messages
  add column if not exists is_read boolean not null default false;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'contact_messages'
      and policyname = 'Admin can update contact messages'
  ) then
    create policy "Admin can update contact messages"
      on public.contact_messages for update
      using (public.is_authorized_admin())
      with check (public.is_authorized_admin());
  end if;
end $$;

-- 3. Website Settings: add logo_url and favicon_url
alter table public.website_settings
  add column if not exists logo_url text default '',
  add column if not exists favicon_url text default '';

-- 4. Privacy Policies: allow 'unpublished' status alongside 'draft' and 'published'
alter table public.privacy_policies
  drop constraint if exists privacy_policies_status_check;

alter table public.privacy_policies
  add constraint privacy_policies_status_check
  check (status in ('draft', 'published', 'unpublished'));
