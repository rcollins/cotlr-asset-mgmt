import type { AssetStatus } from "@/lib/types";

export const ASSET_STATUS_VALUES = [
  "active",
  "inactive",
  "maintenance",
  "retired",
] as const;

export type AssetStatusValue = (typeof ASSET_STATUS_VALUES)[number];

export function normalizeAssetStatus(value: string): AssetStatusValue | null {
  const normalized = value.trim().toLowerCase();
  return (ASSET_STATUS_VALUES as readonly string[]).includes(normalized)
    ? (normalized as AssetStatusValue)
    : null;
}

export function formatAssetStatusLabel(value: string): string {
  const normalized = normalizeAssetStatus(value);
  if (!normalized) return value;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function resolveStatusOptions(statuses: AssetStatus[]): AssetStatus[] {
  const fromDb: AssetStatus[] = [];

  for (const status of statuses) {
    const canonical = normalizeAssetStatus(status.name);
    if (canonical) {
      fromDb.push({ id: status.id, name: canonical });
    }
  }

  if (fromDb.length > 0) return fromDb;

  return ASSET_STATUS_VALUES.map((name) => ({ id: name, name }));
}
