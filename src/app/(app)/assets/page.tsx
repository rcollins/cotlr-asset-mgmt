import { Suspense } from "react";
import { AssetManager } from "@/components/asset-manager";
import { SiteFilter } from "@/components/site-filter";
import { SiteFilterSkeleton } from "@/components/site-filter-skeleton";
import {
  getAssetCategories,
  getAssetStatuses,
  getCurrentProfile,
  getLastUsedLocationId,
  getLocations,
  getSites,
} from "@/lib/data";
import { filterLocationsBySite, parseSiteFilter } from "@/lib/site-filter";
import { createClient } from "@/lib/supabase/server";
import type { Asset } from "@/lib/types";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string | string[] }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const { site } = await searchParams;
  const rawSiteId = parseSiteFilter(site);

  const [sites, locations, categories, statuses, lastUsedLocationId] =
    await Promise.all([
      getSites(),
      getLocations(),
      getAssetCategories(),
      getAssetStatuses(),
      getLastUsedLocationId(profile.id),
    ]);

  const siteId =
    rawSiteId && sites.some((site) => site.id === rawSiteId) ? rawSiteId : null;

  const supabase = await createClient();

  const assetSelect = siteId
    ? "*, location:locations!inner(id, site_id, name, site:sites!site_id(id, name)), asset_category:asset_categories!category(name)"
    : "*, location:locations!location_id(id, site_id, name, site:sites!site_id(id, name)), asset_category:asset_categories!category(name)";

  let assetsQuery = supabase
    .from("assets")
    .select(assetSelect)
    .order("created_at", { ascending: false });

  if (siteId) {
    assetsQuery = assetsQuery.eq("location.site_id", siteId);
  }

  const assetsResult = await assetsQuery;
  const selectedSite = sites.find((site) => site.id === siteId) ?? null;

  return (
    <div className="space-y-6">
      <Suspense fallback={<SiteFilterSkeleton />}>
        <SiteFilter sites={sites} selectedSiteId={siteId} />
      </Suspense>
      <AssetManager
        assets={(assetsResult.data as Asset[]) ?? []}
        locations={filterLocationsBySite(locations, siteId)}
        categories={categories}
        statuses={statuses}
        lastUsedLocationId={lastUsedLocationId}
        userRole={profile.role}
        siteName={selectedSite?.name ?? null}
      />
    </div>
  );
}
