import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  AssetCategory,
  AssetStatus,
  DashboardStats,
  Location,
  Profile,
  Site,
} from "@/lib/types";

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

export async function getDashboardStats(siteId?: string | null): Promise<DashboardStats> {
  const supabase = await createClient();

  let locationIds: string[] | null = null;

  if (siteId) {
    const { data: locations } = await supabase
      .from("locations")
      .select("id")
      .eq("site_id", siteId);

    locationIds = (locations ?? []).map((location) => location.id);

    if (locationIds.length === 0) {
      return {
        assets: 0,
        pendingApprovals: 0,
        requests: 0,
      };
    }
  }

  let assetsQuery = supabase.from("assets").select("id", { count: "exact", head: true });
  let approvalsQuery = supabase
    .from("approval_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (locationIds) {
    assetsQuery = assetsQuery.in("location_id", locationIds);

    const { data: siteAssets } = await supabase
      .from("assets")
      .select("id")
      .in("location_id", locationIds);

    const assetIds = (siteAssets ?? []).map((asset) => asset.id);

    if (assetIds.length === 0) {
      return {
        assets: 0,
        pendingApprovals: 0,
        requests: 0,
      };
    }

    approvalsQuery = approvalsQuery.in("asset_id", assetIds);
  }

  const [assetsResult, approvalsResult] = await Promise.all([
    assetsQuery,
    approvalsQuery,
  ]);

  return {
    assets: assetsResult.count ?? 0,
    pendingApprovals: approvalsResult.count ?? 0,
    requests: approvalsResult.count ?? 0,
  };
}

export async function getSites(): Promise<Site[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sites")
    .select("id, name, address")
    .order("name");

  return (data as Site[]) ?? [];
}

export async function getLocations(): Promise<Location[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("locations")
    .select("id, site_id, name, description, site:sites!site_id(id, name)")
    .order("name");

  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    site_id: row.site_id,
    name: row.name,
    description: row.description,
    site: Array.isArray(row.site) ? row.site[0] ?? null : row.site,
  })) as Location[];
}

export async function getLastUsedLocationId(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("assets")
    .select("location_id")
    .eq("created_by", userId)
    .not("location_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.location_id ?? null;
}

export async function getProfilesForAdmin(): Promise<Profile[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, email, full_name, role")
    .order("email");

  if (error) {
    throw new Error(error.message);
  }

  return (data as Profile[]) ?? [];
}

export async function getProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .order("email");

  return (data as Profile[]) ?? [];
}

export async function getAssetCategories(): Promise<AssetCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("asset_categories")
    .select("id, name, description")
    .order("name");

  return (data as AssetCategory[]) ?? [];
}

export async function getAssetStatuses(): Promise<AssetStatus[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("asset_statuses")
    .select("id, name")
    .order("name");

  return (data as AssetStatus[]) ?? [];
}
