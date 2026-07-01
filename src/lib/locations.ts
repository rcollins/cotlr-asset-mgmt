import type { Location } from "@/lib/types";

export function formatLocationLabel(location: Location | null | undefined): string {
  if (!location) return "—";
  if (location.site?.name) {
    return `${location.site.name} — ${location.name}`;
  }
  return location.name;
}
