-- Run in Supabase SQL Editor.
-- Makes assets.category a text FK to asset_categories.name.
-- Handles category column that was renamed from category_id (uuid).

BEGIN;

ALTER TABLE public.assets
  DROP CONSTRAINT IF EXISTS assets_category_check;

ALTER TABLE public.assets
  DROP CONSTRAINT IF EXISTS assets_category_fkey;

ALTER TABLE public.assets
  DROP CONSTRAINT IF EXISTS assets_category_id_fkey;

ALTER TABLE public.asset_categories
  DROP CONSTRAINT IF EXISTS asset_categories_name_key;

ALTER TABLE public.asset_categories
  ADD CONSTRAINT asset_categories_name_key UNIQUE (name);

ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS category_new text;

-- category is uuid (e.g. renamed from category_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'assets'
      AND column_name = 'category'
      AND udt_name = 'uuid'
  ) THEN
    UPDATE public.assets AS a
    SET category_new = ac.name
    FROM public.asset_categories AS ac
    WHERE a.category = ac.id;
  END IF;
END $$;

-- category_id still exists separately
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'assets'
      AND column_name = 'category_id'
  ) THEN
    UPDATE public.assets AS a
    SET category_new = ac.name
    FROM public.asset_categories AS ac
    WHERE a.category_id = ac.id;
  END IF;
END $$;

-- category is already text (category name)
UPDATE public.assets AS a
SET category_new = a.category
WHERE category_new IS NULL
  AND a.category IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.asset_categories AS ac
    WHERE ac.name = a.category
  );

ALTER TABLE public.assets
  DROP COLUMN IF EXISTS category_id;

ALTER TABLE public.assets
  DROP COLUMN IF EXISTS category;

ALTER TABLE public.assets
  RENAME COLUMN category_new TO category;

ALTER TABLE public.assets
  ADD CONSTRAINT assets_category_fkey
  FOREIGN KEY (category) REFERENCES public.asset_categories(name);

COMMIT;
