import { AssetManager } from "@/components/asset-manager";
import {
  getAssetCategories,
  getCurrentProfile,
  getLastUsedSiteId,
  getSites,
} from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { Asset } from "@/lib/types";

export default async function AssetsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const [assetsResult, sites, categories, lastUsedSiteId] = await Promise.all([
    supabase
      .from("assets")
      .select("*, site:sites!location_id(id, name), asset_category:asset_categories!category_id(id, name)")
      .order("created_at", { ascending: false }),
    getSites(),
    getAssetCategories(),
    getLastUsedSiteId(profile.id),
  ]);

  return (
    <AssetManager
      assets={(assetsResult.data as Asset[]) ?? []}
      sites={sites}
      categories={categories}
      lastUsedSiteId={lastUsedSiteId}
      userRole={profile.role}
    />
  );
}
