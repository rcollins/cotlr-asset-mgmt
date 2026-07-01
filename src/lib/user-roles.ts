import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/types";

export function normalizeUserRole(role: string | undefined | null): UserRole {
  if (!role) return "viewer";
  return role.toLowerCase() as UserRole;
}

export function roleFromUserRolesMap(
  userId: string,
  roleByUserId: Map<string, string>,
  fallbackRole?: string | null,
): UserRole {
  return normalizeUserRole(roleByUserId.get(userId) ?? fallbackRole);
}

export async function getRoleForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserRole> {
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (userRole?.role) {
    return normalizeUserRole(userRole.role);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return normalizeUserRole(profile?.role);
}

export async function syncUserRole(
  admin: SupabaseClient,
  userId: string,
  role: UserRole,
  siteId: string | null = null,
): Promise<{ error?: string }> {
  const now = new Date().toISOString();

  const { error: userRoleError } = await admin.from("user_roles").upsert(
    {
      user_id: userId,
      role,
      site_id: siteId,
      updated_at: now,
    },
    { onConflict: "user_id" },
  );

  if (userRoleError) {
    return { error: userRoleError.message };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ role, updated_at: now })
    .eq("id", userId);

  if (profileError) {
    return { error: profileError.message };
  }

  return {};
}

export async function fetchUserRoleMap(
  supabase: SupabaseClient,
): Promise<Map<string, string>> {
  const { data, error } = await supabase.from("user_roles").select("user_id, role");

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((row) => [row.user_id, row.role]));
}
