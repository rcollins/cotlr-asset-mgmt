import type { UserRole } from "@/lib/types";
import { formatRole, normalizeUserRole } from "@/lib/user-roles";

export { formatRole };

const DELETE_ROLES: UserRole[] = ["cfo"];

export function canDeleteAsset(role: UserRole): boolean {
  return DELETE_ROLES.includes(role);
}

export function canManageLocationsAndAssets(role: string): boolean {
  return normalizeUserRole(role) === "cfo";
}

export function canAccessAdmin(role: string): boolean {
  return normalizeUserRole(role) === "cfo";
}
