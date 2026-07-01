import { StatCard } from "@/components/stat-card";

type StatsGridProps = {
  assets: number;
  pendingApprovals: number;
  requests: number;
};

export function StatsGrid({
  assets,
  pendingApprovals,
  requests,
}: StatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard title="Assets" value={assets} label="Total assets" />
      <StatCard
        title="Pending Approvals"
        value={pendingApprovals}
        label="Awaiting action"
      />
      <StatCard title="Requests" value={requests} label="In progress" />
    </div>
  );
}
