import { Suspense } from "react";
import { ProfileCard } from "@/components/profile-card";
import { SiteFilter } from "@/components/site-filter";
import { SiteFilterSkeleton } from "@/components/site-filter-skeleton";
import { StatsGrid } from "@/components/stats-grid";
import { getCurrentProfile, getDashboardStats, getSites } from "@/lib/data";
import { parseSiteFilter } from "@/lib/site-filter";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string | string[] }>;
}) {
  const { site } = await searchParams;
  const rawSiteId = parseSiteFilter(site);

  const [profile, sites] = await Promise.all([
    getCurrentProfile(),
    getSites(),
  ]);

  if (!profile) return null;

  const siteId =
    rawSiteId && sites.some((site) => site.id === rawSiteId) ? rawSiteId : null;
  const stats = await getDashboardStats(siteId);
  const selectedSite = sites.find((site) => site.id === siteId) ?? null;

  return (
    <div className="space-y-6">
      <Suspense fallback={<SiteFilterSkeleton />}>
        <SiteFilter sites={sites} selectedSiteId={siteId} />
      </Suspense>
      <ProfileCard profile={profile} />
      <StatsGrid
        assets={stats.assets}
        pendingApprovals={stats.pendingApprovals}
        requests={stats.requests}
        siteId={siteId}
        siteName={selectedSite?.name ?? null}
      />
    </div>
  );
}
