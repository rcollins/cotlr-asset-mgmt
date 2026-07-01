import { createClient } from "@/lib/supabase/server";
import type { DashboardStats, Profile } from "@/lib/types";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();

  if (profile) return profile as Profile;

  return {
    id: user.id,
    email: user.email ?? "",
    full_name: user.user_metadata?.full_name ?? null,
    role: (user.user_metadata?.role as Profile["role"]) ?? "viewer",
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [assetsResult, approvalsResult, requestsResult] = await Promise.all([
    supabase.from("assets").select("id", { count: "exact", head: true }),
    supabase
      .from("approval_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("asset_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "in_progress"),
  ]);

  return {
    assets: assetsResult.count ?? 0,
    pendingApprovals: approvalsResult.count ?? 0,
    requests: requestsResult.count ?? 0,
  };
}
