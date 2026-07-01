-- Run in Supabase SQL Editor.
-- Aligns assets.status with asset_statuses.name (like assets.category).

BEGIN;

INSERT INTO public.asset_statuses (name)
VALUES
  ('active'),
  ('inactive'),
  ('maintenance'),
  ('retired')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE public.assets
  DROP CONSTRAINT IF EXISTS assets_status_check;

ALTER TABLE public.asset_statuses
  DROP CONSTRAINT IF EXISTS asset_statuses_name_key;

ALTER TABLE public.asset_statuses
  ADD CONSTRAINT asset_statuses_name_key UNIQUE (name);

ALTER TABLE public.assets
  DROP CONSTRAINT IF EXISTS assets_status_fkey;

ALTER TABLE public.assets
  ADD CONSTRAINT assets_status_fkey
  FOREIGN KEY (status) REFERENCES public.asset_statuses(name);

COMMIT;
