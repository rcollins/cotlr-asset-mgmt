import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/types";

export const USER_ROLE_VALUES = ["cfo", "team_manager", "viewer"] as const;

const ROLE_ALIASES: Record<string, UserRole> = {
  cfo: "cfo",
  team_manager: "team_manager",
  viewer: "viewer",
  manager: "team_manager",
  admin: "cfo",
};

export function toDatabaseRole(role: string | undefined | null): UserRole | null {
  if (!role) return null;

  const normalized = role.trim().toLowerCase();
  const aliased = ROLE_ALIASES[normalized];
  if (aliased) return aliased;

  if ((USER_ROLE_VALUES as readonly string[]).includes(normalized)) {
    return normalized as UserRole;
  }

  return null;
}

export function normalizeUserRole(role: string | undefined | null): UserRole {
  return toDatabaseRole(role) ?? "viewer";
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
  role: string,
  siteId: string | null = null,
): Promise<{ error?: string }> {
  const dbRole = toDatabaseRole(role);
  if (!dbRole) {
    return {
      error: `Invalid role. Allowed roles: ${USER_ROLE_VALUES.join(", ")}`,
    };
  }

  const now = new Date().toISOString();

  const { error: userRoleError } = await admin.from("user_roles").upsert(
    {
      user_id: userId,
      role: dbRole,
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
    .update({ role: dbRole, updated_at: now })
    .eq("id", userId);

  if (profileError) {
    return { error: profileError.message };
  }

  return {};
}

export function formatRole(role: string): string {
  const dbRole = toDatabaseRole(role);
  if (!dbRole) return role;

  const labels: Record<UserRole, string> = {
    cfo: "CFO",
    team_manager: "Team Manager",
    viewer: "Viewer",
  };

  return labels[dbRole];
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
