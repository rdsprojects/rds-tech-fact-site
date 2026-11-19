# RDS TECH FACT — Official Website & Admin CMS

**Tagline:** Technology. Innovation. Solutions.  
**Founder:** Dhanasekar R

Public-facing technology brand website and secure single-administrator Content Management System (CMS) built with React, TypeScript, Vite, Tailwind CSS, and Supabase, deployed via GitHub Actions to **GitHub Pages**.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Motion (`motion/react`), Lucide Icons
- **Routing:** React Router v7 (`BrowserRouter` with `BASE_URL` basename + `404.html` SPA fallback)
- **Backend & Storage:** Supabase (PostgreSQL, Row Level Security, Supabase Auth, Supabase Storage `rds-media`)
- **Hosting:** GitHub Pages (`/rds-tech-fact-site/`) via `.github/workflows/deploy.yml`

---

## Project Structure

```text
├── .github/workflows/deploy.yml  # GitHub Actions CI/CD workflow for GitHub Pages
├── public/                       # Static assets, 404.html SPA fallback, .nojekyll, robots.txt, sitemap.xml
├── src/
│   ├── assets/                   # Local founder & brand image assets
│   ├── components/               # Layout, branding, and Admin CMS tab components
│   ├── context/                  # CmsContext (Supabase Auth, public reads, admin CRUD)
│   ├── lib/                      # Supabase client, asset URL resolver, default fallback data
│   ├── pages/                    # Public pages & Admin Login / Dashboard routes
│   └── types/                    # TypeScript interfaces for CMS records
├── supabase/migrations/          # Incremental PostgreSQL schema, RLS & privilege migrations
├── .env.example                  # Environment variable template (no real secrets)
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts                # Configured with base: '/rds-tech-fact-site/' for production builds
```

---

## Environment Variables & GitHub Actions Secrets

Copy `.env.example` to `.env` for local development (never commit `.env`), and add the following **Repository Secrets** in GitHub under **Settings → Secrets and variables → Actions**:

| Secret Name | Required | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Supabase Project URL (`https://<project-ref>.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase public Publishable (`sb_publishable_...`) or `anon` key |
| `VITE_ADMIN_EMAIL` | Yes | Authorized single administrator email (`rdsprojectsmyself@gmail.com`) |

> **Security Note:** Never store `service_role` or `sb_secret_` keys in `VITE_*` variables, `.env` files, or GitHub Actions secrets for client-side builds.

---

## Local Development & Build Validation

```bash
npm ci
npm run dev
```

Validate TypeScript and production build locally:

```bash
npx tsc --noEmit
npm run build
```

---

## GitHub Pages Setup

1. Go to **Repository Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Push to `main` (or run **Actions → Deploy RDS TECH FACT to GitHub Pages → Run workflow**).
4. In **Supabase Dashboard → Authentication → URL Configuration**, add your GitHub Pages URL (`https://rdsprojects.github.io/rds-tech-fact-site/`) and `https://rdsprojects.github.io/rds-tech-fact-site/admin/dashboard` to **Redirect URLs**.
