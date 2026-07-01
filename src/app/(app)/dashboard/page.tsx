import { ProfileCard } from "@/components/profile-card";
import { StatsGrid } from "@/components/stats-grid";
import { getCurrentProfile, getDashboardStats } from "@/lib/data";

export default async function DashboardPage() {
  const [profile, stats] = await Promise.all([
    getCurrentProfile(),
    getDashboardStats(),
  ]);

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <ProfileCard profile={profile} />
      <StatsGrid
        assets={stats.assets}
        pendingApprovals={stats.pendingApprovals}
        requests={stats.requests}
      />
    </div>
  );
}
