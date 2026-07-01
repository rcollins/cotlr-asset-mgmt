import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminManager } from "@/components/admin-manager";
import { SiteFilter } from "@/components/site-filter";
import { SiteFilterSkeleton } from "@/components/site-filter-skeleton";
import {
  getAssetCategories,
  getCurrentProfile,
  getLocations,
  getProfilesForAdmin,
  getSites,
} from "@/lib/data";
import { canAccessAdmin } from "@/lib/permissions";
import { parseSiteFilter } from "@/lib/site-filter";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string | string[] }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!canAccessAdmin(profile.role)) redirect("/dashboard");

  const { site } = await searchParams;
  const rawSiteId = parseSiteFilter(site);

  const [sites, categories, locations, users] = await Promise.all([
    getSites(),
    getAssetCategories(),
    getLocations(),
    getProfilesForAdmin(),
  ]);

  const siteId =
    rawSiteId && sites.some((site) => site.id === rawSiteId) ? rawSiteId : null;
  const selectedSite = sites.find((site) => site.id === siteId) ?? null;

  return (
    <div className="space-y-6">
      <Suspense fallback={<SiteFilterSkeleton />}>
        <SiteFilter sites={sites} selectedSiteId={siteId} />
      </Suspense>
      <AdminManager
        categories={categories}
        sites={sites}
        locations={locations}
        users={users}
        siteFilterId={siteId}
        siteFilterName={selectedSite?.name ?? null}
      />
    </div>
  );
}
