-- Reference schema for the Asset Management System.
-- Align column/table names with your existing Supabase database as needed.
--
-- Email OTP: set length to 8 in Supabase Dashboard
-- (Authentication → Providers → Email → OTP length), or for local dev in config.toml:
--   [auth.email]
--   otp_length = 8

-- User profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'viewer' check (role in ('admin', 'cfo', 'manager', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Sites (locations for assets)
create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Asset categories
create table if not exists public.asset_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Assets
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category_id uuid references public.asset_categories(id),
  category text, -- denormalized name; must match asset_categories.name (assets_category_check)
  serial_number text,
  purchase_price numeric(12, 2),
  status text not null default 'active',
  location_id uuid references public.sites(id),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional: pending approval requests (dashboard stat)
create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references public.assets(id) on delete cascade,
  requested_by uuid references public.profiles(id),
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Optional: in-progress asset requests (dashboard stat)
create table if not exists public.asset_requests (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references public.assets(id) on delete cascade,
  requested_by uuid references public.profiles(id),
  type text not null,
  status text not null default 'in_progress',
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup (if using new users)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.sites enable row level security;
alter table public.asset_categories enable row level security;
alter table public.assets enable row level security;
alter table public.approval_requests enable row level security;
alter table public.asset_requests enable row level security;

-- Profiles: users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Sites: authenticated users can read all sites
create policy "Authenticated users can view sites"
  on public.sites for select
  to authenticated
  using (true);

-- Asset categories: authenticated users can read all categories
create policy "Authenticated users can view asset categories"
  on public.asset_categories for select
  to authenticated
  using (true);

-- Assets: authenticated users can read all assets
create policy "Authenticated users can view assets"
  on public.assets for select
  to authenticated
  using (true);

-- Assets: authenticated users can insert
create policy "Authenticated users can create assets"
  on public.assets for insert
  to authenticated
  with check (auth.uid() = created_by);

-- Assets: authenticated users can update
create policy "Authenticated users can update assets"
  on public.assets for update
  to authenticated
  using (true);

-- Assets: only admin/cfo can delete (enforced at DB level too)
create policy "Admin and CFO can delete assets"
  on public.assets for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'cfo')
    )
  );

-- Approval requests: authenticated read
create policy "Authenticated users can view approvals"
  on public.approval_requests for select
  to authenticated
  using (true);

-- Asset requests: authenticated read
create policy "Authenticated users can view asset requests"
  on public.asset_requests for select
  to authenticated
  using (true);
