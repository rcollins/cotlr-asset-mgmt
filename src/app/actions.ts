"use server";

import { revalidatePath } from "next/cache";
import { buildAssetWritePayload } from "@/lib/asset-payload";
import { createClient } from "@/lib/supabase/server";
import { canDeleteAsset, canManageLocationsAndAssets } from "@/lib/permissions";
import type { AssetFormData, Location, LocationFormData, UserRole } from "@/lib/types";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

async function getUserRole(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<UserRole> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return (profile?.role as UserRole) ?? "viewer";
}

export async function createAsset(data: AssetFormData) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { error: "Not authenticated" };

  const role = await getUserRole(supabase, user.id);
  if (!canManageLocationsAndAssets(role)) {
    return { error: "Only CFO users can add assets" };
  }

  const { payload, error: payloadError } = await buildAssetWritePayload(
    supabase,
    data,
    user.id,
    "create",
  );

  if (payloadError || !payload) return { error: payloadError ?? "Invalid asset data" };

  const { error } = await supabase.from("assets").insert(payload);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/assets");
  return { success: true };
}

export async function updateAsset(id: string, data: AssetFormData) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { error: "Not authenticated" };

  const { payload, error: payloadError } = await buildAssetWritePayload(
    supabase,
    data,
    user.id,
    "update",
  );

  if (payloadError || !payload) return { error: payloadError ?? "Invalid asset data" };

  const { error } = await supabase.from("assets").update(payload).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/assets");
  return { success: true };
}

export async function deleteAsset(id: string) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { error: "Not authenticated" };

  const role = await getUserRole(supabase, user.id);
  if (!canDeleteAsset(role)) {
    return { error: "You do not have permission to delete assets" };
  }

  const { error } = await supabase.from("assets").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/assets");
  return { success: true };
}

export async function createLocation(data: LocationFormData) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { error: "Not authenticated" };

  const role = await getUserRole(supabase, user.id);
  if (!canManageLocationsAndAssets(role)) {
    return { error: "Only CFO users can add locations" };
  }

  if (!data.site_id?.trim() || !data.name?.trim()) {
    return { error: "Site and location name are required" };
  }

  const { data: location, error } = await supabase
    .from("locations")
    .insert({
      site_id: data.site_id,
      name: data.name.trim(),
      description: data.description?.trim() || null,
    })
    .select("id, site_id, name, description, site:sites!site_id(id, name)")
    .single();

  if (error) return { error: error.message };

  const mapped: Location = {
    id: location.id,
    site_id: location.site_id,
    name: location.name,
    description: location.description,
    site: Array.isArray(location.site) ? location.site[0] ?? null : location.site,
  };

  revalidatePath("/sites/manage");
  revalidatePath("/assets");
  return { success: true, location: mapped };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
