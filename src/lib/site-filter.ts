import type { Location } from "@/lib/types";

export const SITE_FILTER_PARAM = "site";

export function parseSiteFilter(
  value: string | string[] | undefined,
): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed || null;
}

export function filterLocationsBySite(
  locations: Location[],
  siteId: string | null,
): Location[] {
  if (!siteId) return locations;
  return locations.filter((location) => location.site_id === siteId);
}
