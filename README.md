# Asset Management System

Next.js app for managing organizational assets with Supabase OTP authentication.

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project with the app schema applied (see `supabase/schema.sql` and `supabase/migrations/`)

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill in `.env.local` with your Supabase project URL and anon key from **Supabase → Project Settings → API**.

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

### 1. Import the repository

Connect this repo in [Vercel](https://vercel.com/new). Vercel auto-detects Next.js — no custom build command is required.

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Build Command | `npm run build` (default) |
| Output Directory | `.next` (default) |
| Install Command | `npm install` (default) |

### 2. Set environment variables

In **Vercel → Project → Settings → Environment Variables**, add:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, required for Admin user management) |

Apply to **Production**, **Preview**, and **Development** environments.

The build fails on Vercel if these variables are missing.

### 3. Configure Supabase Auth

In **Supabase → Authentication → URL Configuration**, set:

| Setting | Value |
|---------|-------|
| Site URL | `https://your-app.vercel.app` |
| Redirect URLs | `https://your-app.vercel.app/**` |

For preview deployments, also add:

```
https://*.vercel.app/**
```

For local development, keep:

```
http://localhost:3000/**
```

### 4. Deploy

Push to your connected branch or run:

```bash
vercel
```

After the first production deploy, update the Supabase Site URL to match your final Vercel domain.

## Auth flow

- Users sign in with email OTP (`/login` → `/verify`)
- Protected routes: `/dashboard`, `/assets`, `/sites/*`, `/admin`
- Only CFO users can add locations/assets (`/sites/manage`) and access admin (`/admin`)

## Database migrations

Run SQL in `supabase/migrations/` via the Supabase SQL Editor if your production database is not yet aligned with `supabase/schema.sql`.
