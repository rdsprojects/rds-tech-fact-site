-- ============================================================================
-- RDS TECH FACT — Incremental Safe Migration (003)
-- Fixes "permission denied for table applications" (SQLSTATE 42501) by
-- granting explicit PostgreSQL schema/table/function privileges to `anon` and
-- `authenticated` roles while preserving strict Row Level Security (RLS)
-- restricted to public.is_authorized_admin() ('rdsprojectsmyself@gmail.com').
--
-- Safe & idempotent:
--   - Does NOT drop tables or overwrite existing data
--   - Does NOT delete or alter public.admin_users or auth.users
--   - Does NOT disable RLS or add permissive write policies
-- ============================================================================

-- 1. Ensure schema & helper function execution privileges
grant usage on schema public to anon, authenticated;

grant execute on function public.is_authorized_admin() to anon, authenticated;

grant usage, select on all sequences in schema public to anon, authenticated;

-- 2. Ensure incremental application columns exist (safe if 002 already ran)
alter table public.applications
  add column if not exists category text default 'Software',
  add column if not exists is_featured boolean not null default false;

-- 3. Grant explicit table-level privileges required alongside RLS
--    PostgreSQL checks table GRANTs BEFORE evaluating RLS policies.

-- admin_users: authenticated admin can verify their own row (gated by RLS)
grant select on table public.admin_users to authenticated;

-- applications: public can read published; authenticated admin can CRUD (gated by RLS)
grant select on table public.applications to anon, authenticated;
grant insert, update, delete on table public.applications to authenticated;

-- application_images: public can read images of published apps; admin can CRUD (gated by RLS)
grant select on table public.application_images to anon, authenticated;
grant insert, update, delete on table public.application_images to authenticated;

-- privacy_policies: public can read published; authenticated admin can CRUD (gated by RLS)
grant select on table public.privacy_policies to anon, authenticated;
grant insert, update, delete on table public.privacy_policies to authenticated;

-- website_settings: public can read; authenticated admin can update (gated by RLS)
grant select on table public.website_settings to anon, authenticated;
grant update on table public.website_settings to authenticated;

-- contact_messages: public/auth can submit; authenticated admin can read/update/delete (gated by RLS)
grant insert on table public.contact_messages to anon, authenticated;
grant select, update, delete on table public.contact_messages to authenticated;

-- 4. Ensure RLS remains strictly enabled on applications & application_images
alter table public.applications enable row level security;
alter table public.application_images enable row level security;

-- 5. Idempotently ensure RLS policies on public.applications & public.application_images
--    are aligned with public.is_authorized_admin() and role targets.
drop policy if exists "Public can view published applications" on public.applications;
create policy "Public can view published applications"
  on public.applications for select
  to anon, authenticated
  using (status = 'published' or public.is_authorized_admin());

drop policy if exists "Admin can insert applications" on public.applications;
create policy "Admin can insert applications"
  on public.applications for insert
  to authenticated
  with check (public.is_authorized_admin());

drop policy if exists "Admin can update applications" on public.applications;
create policy "Admin can update applications"
  on public.applications for update
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

drop policy if exists "Admin can delete applications" on public.applications;
create policy "Admin can delete applications"
  on public.applications for delete
  to authenticated
  using (public.is_authorized_admin());

drop policy if exists "Public can view images of published applications" on public.application_images;
create policy "Public can view images of published applications"
  on public.application_images for select
  to anon, authenticated
  using (
    public.is_authorized_admin()
    or exists (
      select 1 from public.applications a
      where a.id = application_images.application_id
        and a.status = 'published'
    )
  );

drop policy if exists "Admin can manage application images" on public.application_images;
create policy "Admin can manage application images"
  on public.application_images for all
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());
