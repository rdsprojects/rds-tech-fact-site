# RDS TECH FACT — Setup, Security & Deployment Guide

## 1. Supabase Backend Setup (Free Tier)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in your Supabase Dashboard and execute the entire contents of:
   - `supabase/migrations/001_initial_schema.sql`
   This creates all 6 tables (`admin_users`, `applications`, `application_images`, `privacy_policies`, `website_settings`, `contact_messages`), Row Level Security (RLS) policies, the `rds-media` storage bucket, and the initial `RDSPy` draft entry.
3. Open **Authentication → Users** in Supabase:
   - Click **Add User** and create the single administrator account for `rdsprojectsmyself@gmail.com`.
   - Under **Authentication → Providers → Email**, disable **Enable Email Signup** so no public user can register.
   - Under **Authentication → URL Configuration**, add your production domain (e.g., `https://rdstechfact.com/admin/dashboard`) to **Redirect URLs**.
4. Copy your **Project URL** and **Anon Public Key** from **Project Settings → API**.
   - **Never** put the `service_role` key in frontend code or `.env` files with `VITE_` prefix.

## 2. Environment Variables

Create a `.env` file locally (never commit `.env` to GitHub) and add the same variables in Cloudflare Pages:

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
VITE_ADMIN_EMAIL="rdsprojectsmyself@gmail.com"
VITE_SITE_URL="https://rdstechfact.com"
```

## 3. GitHub & Cloudflare Pages Deployment (Free Tier)

1. Push this repository to a GitHub repository.
2. Log in to **Cloudflare Pages** → **Create a project** → **Connect to Git**.
3. Select your repository and configure:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Add the environment variables from Section 2 under **Settings → Environment variables**.
5. Deploy. Cloudflare Pages automatically handles SPA routing and HTTPS.

## 4. Free-Tier Limitations

- **Supabase Free Tier**: 500 MB PostgreSQL database, 1 GB file storage, 50,000 monthly active users, projects pause after 7 days of zero activity (can be restored in 1 click).
- **Cloudflare Pages Free Tier**: Unlimited bandwidth, 500 builds/month, 100 custom domains.

## 5. Security & Authorization Testing Checklist

Before relying on the admin portal in production:
- [ ] Verify public `/applications` does **not** return `RDSPy` while its status is `draft`.
- [ ] Attempt to sign in at `/admin/login` with a non-authorized email and confirm rejection.
- [ ] Sign in with `rdsprojectsmyself@gmail.com` via passwordless magic link.
- [ ] Confirm `RDSPy` can be edited, previewed, and published from `/admin/dashboard`.
- [ ] Confirm `RDSPy` appears automatically on `/applications` and `/applications/rdspy` after publishing.
- [ ] Confirm unauthenticated `INSERT`/`UPDATE`/`DELETE` calls to `applications` and `website_settings` are blocked by PostgreSQL RLS.
