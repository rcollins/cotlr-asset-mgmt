import type { UserRole } from "@/lib/types";

const DELETE_ROLES: UserRole[] = ["admin", "cfo"];

export function canDeleteAsset(role: UserRole): boolean {
  return DELETE_ROLES.includes(role.toLowerCase() as UserRole);
}

export function canManageLocationsAndAssets(role: string): boolean {
  return role.toLowerCase() === "cfo";
}

export function canAccessAdmin(role: string): boolean {
  return role.toLowerCase() === "cfo";
}

export function formatRole(role: string): string {
  if (!role) return "";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}
