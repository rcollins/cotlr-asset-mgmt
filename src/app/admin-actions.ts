"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getRoleForUser, syncUserRole } from "@/lib/user-roles";
import { canAccessAdmin } from "@/lib/permissions";
import type {
  CategoryFormData,
  LocationUpdateData,
  SiteFormData,
  UserFormData,
  UserRole,
  UserUpdateData,
} from "@/lib/types";

const ADMIN_PATHS = ["/admin", "/assets", "/dashboard", "/sites/manage"];

function revalidateAdminPaths() {
  for (const path of ADMIN_PATHS) {
    revalidatePath(path);
  }
}

async function requireCfo() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" as const };
  }

  const role = await getRoleForUser(supabase, user.id);

  if (!canAccessAdmin(role)) {
    return { error: "Only CFO users can access admin" as const };
  }

  return { supabase, user, role };
}

export async function createCategory(data: CategoryFormData) {
  const auth = await requireCfo();
  if ("error" in auth) return auth;

  const name = data.name.trim();
  if (!name) return { error: "Category name is required" };

  const { error } = await auth.supabase.from("asset_categories").insert({
    name,
    description: data.description?.trim() || null,
  });

  if (error) return { error: error.message };

  revalidateAdminPaths();
  return { success: true };
}

export async function updateCategory(
  id: string,
  data: CategoryFormData,
  previousName: string,
) {
  const auth = await requireCfo();
  if ("error" in auth) return auth;

  const name = data.name.trim();
  if (!name) return { error: "Category name is required" };

  const { error: categoryError } = await auth.supabase
    .from("asset_categories")
    .update({
      name,
      description: data.description?.trim() || null,
    })
    .eq("id", id);

  if (categoryError) return { error: categoryError.message };

  if (name !== previousName) {
    const { error: assetsError } = await auth.supabase
      .from("assets")
      .update({ category: name })
      .eq("category", previousName);

    if (assetsError) return { error: assetsError.message };
  }

  revalidateAdminPaths();
  return { success: true };
}

export async function deleteCategory(id: string, name: string) {
  const auth = await requireCfo();
  if ("error" in auth) return auth;

  const { count } = await auth.supabase
    .from("assets")
    .select("id", { count: "exact", head: true })
    .eq("category", name);

  if ((count ?? 0) > 0) {
    return { error: "Cannot delete a category that is used by assets" };
  }

  const { error } = await auth.supabase
    .from("asset_categories")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateAdminPaths();
  return { success: true };
}

export async function createSite(data: SiteFormData) {
  const auth = await requireCfo();
  if ("error" in auth) return auth;

  const name = data.name.trim();
  if (!name) return { error: "Site name is required" };

  const { error } = await auth.supabase.from("sites").insert({
    name,
    address: data.address?.trim() || null,
    created_by: auth.user.id,
  });

  if (error) return { error: error.message };

  revalidateAdminPaths();
  return { success: true };
}

export async function updateSite(id: string, data: SiteFormData) {
  const auth = await requireCfo();
  if ("error" in auth) return auth;

  const name = data.name.trim();
  if (!name) return { error: "Site name is required" };

  const { error } = await auth.supabase
    .from("sites")
    .update({
      name,
      address: data.address?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateAdminPaths();
  return { success: true };
}

export async function deleteSite(id: string) {
  const auth = await requireCfo();
  if ("error" in auth) return auth;

  const { count } = await auth.supabase
    .from("locations")
    .select("id", { count: "exact", head: true })
    .eq("site_id", id);

  if ((count ?? 0) > 0) {
    return { error: "Cannot delete a site that has locations" };
  }

  const { error } = await auth.supabase.from("sites").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidateAdminPaths();
  return { success: true };
}

export async function updateLocation(id: string, data: LocationUpdateData) {
  const auth = await requireCfo();
  if ("error" in auth) return auth;

  if (!data.site_id?.trim() || !data.name?.trim()) {
    return { error: "Site and location name are required" };
  }

  const { error } = await auth.supabase
    .from("locations")
    .update({
      site_id: data.site_id,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateAdminPaths();
  return { success: true };
}

export async function deleteLocation(id: string) {
  const auth = await requireCfo();
  if ("error" in auth) return auth;

  const { count } = await auth.supabase
    .from("assets")
    .select("id", { count: "exact", head: true })
    .eq("location_id", id);

  if ((count ?? 0) > 0) {
    return { error: "Cannot delete a location that has assets" };
  }

  const { error } = await auth.supabase.from("locations").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidateAdminPaths();
  return { success: true };
}

export async function createUser(data: UserFormData) {
  const auth = await requireCfo();
  if ("error" in auth) return auth;

  const email = data.email.trim().toLowerCase();
  if (!email) return { error: "Email is required" };

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name?.trim() || null,
      role: data.role,
    },
  });

  if (createError || !created.user) {
    return { error: createError?.message ?? "Failed to create user" };
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: created.user.id,
    email,
    full_name: data.full_name?.trim() || null,
    role: data.role,
    updated_at: new Date().toISOString(),
  });

  if (profileError) return { error: profileError.message };

  const roleSync = await syncUserRole(admin, created.user.id, data.role);
  if (roleSync.error) return { error: roleSync.error };

  revalidateAdminPaths();
  return { success: true };
}

export async function updateUser(id: string, data: UserUpdateData) {
  const auth = await requireCfo();
  if ("error" in auth) return auth;

  const admin = createAdminClient();

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: data.full_name?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (profileError) return { error: profileError.message };

  const roleSync = await syncUserRole(admin, id, data.role);
  if (roleSync.error) return { error: roleSync.error };

  const { error: authError } = await admin.auth.admin.updateUserById(id, {
    user_metadata: {
      full_name: data.full_name?.trim() || null,
      role: data.role,
    },
  });

  if (authError) return { error: authError.message };

  revalidateAdminPaths();
  return { success: true };
}

export async function deleteUser(id: string) {
  const auth = await requireCfo();
  if ("error" in auth) return auth;

  if (id === auth.user.id) {
    return { error: "You cannot delete your own account" };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);

  if (error) return { error: error.message };

  revalidateAdminPaths();
  return { success: true };
}
