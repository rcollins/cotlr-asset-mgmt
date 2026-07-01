import { StatCard } from "@/components/stat-card";

type StatsGridProps = {
  assets: number;
  pendingApprovals: number;
  requests: number;
  siteName?: string | null;
};

export function StatsGrid({
  assets,
  pendingApprovals,
  requests,
  siteName,
}: StatsGridProps) {
  const scopeLabel = siteName ? `at ${siteName}` : "organization-wide";

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Showing stats {scopeLabel}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Assets" value={assets} label="Total assets" />
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
