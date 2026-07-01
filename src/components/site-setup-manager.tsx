"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createAsset, createLocation } from "@/app/actions";
import { AssetForm } from "@/components/asset-form";
import { Card } from "@/components/card";
import { LocationForm } from "@/components/location-form";
import { LAST_LOCATION_STORAGE_KEY } from "@/lib/asset-preferences";
import { formatLocationLabel } from "@/lib/locations";
import type {
  AssetCategory,
  AssetFormData,
  AssetStatus,
  Location,
  LocationFormData,
  Site,
} from "@/lib/types";

type SiteSetupManagerProps = {
  sites: Site[];
  locations: Location[];
  categories: AssetCategory[];
  statuses: AssetStatus[];
};

export function SiteSetupManager({
  sites,
  locations: initialLocations,
  categories,
  statuses,
}: SiteSetupManagerProps) {
  const router = useRouter();
  const [locations, setLocations] = useState(initialLocations);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [assetSuccess, setAssetSuccess] = useState<string | null>(null);

  const siteLocations = useMemo(
    () => locations.filter((location) => location.site_id === selectedSiteId),
    [locations, selectedSiteId],
  );

  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === selectedLocationId) ?? null,
    [locations, selectedLocationId],
  );

  const selectedSite = sites.find((site) => site.id === selectedSiteId) ?? null;

  function handleSiteChange(siteId: string) {
    setSelectedSiteId(siteId);
    setSelectedLocationId("");
    setShowLocationForm(false);
    setShowAssetForm(false);
    setAssetSuccess(null);
  }

  function handleLocationChange(locationId: string) {
    setSelectedLocationId(locationId);
    setShowAssetForm(false);
    setAssetSuccess(null);
  }

  async function handleCreateLocation(data: LocationFormData) {
    const result = await createLocation(data);

    if (result.success && result.location) {
      setLocations((current) => [...current, result.location!]);
      setSelectedLocationId(result.location.id);
      setShowLocationForm(false);
      router.refresh();
    }

    return result;
  }

  async function handleCreateAsset(data: AssetFormData) {
    const result = await createAsset(data);

    if (result.success) {
      if (data.location_id) {
        localStorage.setItem(LAST_LOCATION_STORAGE_KEY, data.location_id);
      }
      setShowAssetForm(false);
      setAssetSuccess(`Asset "${data.name}" added successfully.`);
      router.refresh();
    }

    return result;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Site Setup</h2>
        <p className="text-sm text-gray-500">
          Select a site, manage locations, and add assets to a location.
        </p>
      </div>

      <Card title="1. Select Site" subtitle="Choose the site you are working with">
        {sites.length === 0 ? (
          <p className="text-sm text-gray-500">No sites available.</p>
        ) : (
          <select
            value={selectedSiteId}
            onChange={(e) => handleSiteChange(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="">Select a site</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        )}
      </Card>

      {selectedSiteId && (
        <Card
          title="2. Locations"
          subtitle={`Locations at ${selectedSite?.name ?? "this site"}`}
        >
          {siteLocations.length === 0 ? (
            <p className="mb-4 text-sm text-gray-500">
              No locations yet for this site.
            </p>
          ) : (
            <ul className="mb-4 divide-y divide-gray-200 rounded-md border border-gray-200">
              {siteLocations.map((location) => (
                <li
                  key={location.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">{location.name}</p>
                    {location.description && (
                      <p className="text-gray-500">{location.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!showLocationForm ? (
            <button
              type="button"
              onClick={() => setShowLocationForm(true)}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Add Location
            </button>
          ) : (
            <LocationForm
              siteId={selectedSiteId}
              onSubmit={handleCreateLocation}
              onCancel={() => setShowLocationForm(false)}
            />
          )}
        </Card>
      )}

      {selectedSiteId && siteLocations.length > 0 && (
        <Card title="3. Select Location" subtitle="Choose where the asset belongs">
          <select
            value={selectedLocationId}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="">Select a location</option>
            {siteLocations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </Card>
      )}

      {selectedLocation && (
        <Card
          title="4. Add Asset"
          subtitle={`Adding to ${formatLocationLabel(selectedLocation)}`}
        >
          {assetSuccess && (
            <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
              {assetSuccess}
            </div>
          )}

          {!showAssetForm ? (
            <button
              type="button"
              onClick={() => {
                setAssetSuccess(null);
                setShowAssetForm(true);
              }}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Add Asset
            </button>
          ) : (
            <AssetForm
              key={selectedLocation.id}
              locations={locations}
              categories={categories}
              statuses={statuses}
              fixedLocationId={selectedLocation.id}
              fixedLocationLabel={formatLocationLabel(selectedLocation)}
              onSubmit={handleCreateAsset}
              onCancel={() => setShowAssetForm(false)}
            />
          )}
        </Card>
      )}
    </div>
  );
}
