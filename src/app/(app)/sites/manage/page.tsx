import { redirect } from "next/navigation";
import { SiteSetupManager } from "@/components/site-setup-manager";
import {
  getAssetCategories,
  getAssetStatuses,
  getCurrentProfile,
  getLocations,
  getSites,
} from "@/lib/data";
import { canManageLocationsAndAssets } from "@/lib/permissions";

export default async function SiteManagePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!canManageLocationsAndAssets(profile.role)) redirect("/dashboard");

  const [sites, locations, categories, statuses] = await Promise.all([
    getSites(),
    getLocations(),
    getAssetCategories(),
    getAssetStatuses(),
  ]);

  return (
    <SiteSetupManager
      sites={sites}
      locations={locations}
      categories={categories}
      statuses={statuses}
    />
  );
}
