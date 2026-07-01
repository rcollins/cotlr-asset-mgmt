-- Reference schema (matches production Supabase database).

-- profiles
-- user_roles, org_settings, audit_log also exist in production.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null,
  created_at timestamptz,
  updated_at timestamptz
);

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id),
  name text not null,
  description text,
  created_at timestamptz,
  updated_at timestamptz
);

create table if not exists public.asset_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz,
  updated_at timestamptz
);

create table if not exists public.asset_statuses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz,
  updated_at timestamptz
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id),
  name text not null,
  description text,
  status text not null references public.asset_statuses(name),
  serial_number text,
  purchase_date date,
  purchase_price numeric,
  created_by uuid references public.profiles(id),
  created_at timestamptz,
  updated_at timestamptz,
  useful_life_date date,
  disposal_date date,
  book_value numeric,
  book_value_override bool,
  depreciation_method text,
  category text references public.asset_categories(name)
);

create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  requested_by uuid not null,
  reviewed_by uuid,
  status text not null,
  request_type text not null,
  notes text,
  review_notes text,
  created_at timestamptz,
  reviewed_at timestamptz
);
