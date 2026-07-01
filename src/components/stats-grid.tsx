import { StatCard } from "@/components/stat-card";
import { SITE_FILTER_PARAM } from "@/lib/site-filter";

type StatsGridProps = {
  assets: number;
  pendingApprovals: number;
  requests: number;
  siteId?: string | null;
  siteName?: string | null;
};

export function StatsGrid({
  assets,
  pendingApprovals,
  requests,
  siteId,
  siteName,
}: StatsGridProps) {
  const scopeLabel = siteName ? `at ${siteName}` : "organization-wide";
  const assetsHref = siteId
    ? `/assets?${SITE_FILTER_PARAM}=${siteId}`
    : "/assets";

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Showing stats {scopeLabel}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Assets"
          value={assets}
          label="Total assets"
          href={assetsHref}
        />
        <StatCard
          title="Pending Approvals"
          value={pendingApprovals}
          label="Awaiting action"
        />
        <StatCard title="Requests" value={requests} label="In progress" />
      </div>
    </div>
  );
}
