"use server";

import { revalidatePath } from "next/cache";
import { buildAssetWritePayload } from "@/lib/asset-payload";
import { createClient } from "@/lib/supabase/server";
import { canDeleteAsset } from "@/lib/permissions";
import type { AssetFormData, UserRole } from "@/lib/types";

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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
