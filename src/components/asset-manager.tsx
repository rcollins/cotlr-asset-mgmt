"use client";

import { useEffect, useState } from "react";
import { createAsset, deleteAsset, updateAsset } from "@/app/actions";
import { AssetForm } from "@/components/asset-form";
import { Card } from "@/components/card";
import { LAST_LOCATION_STORAGE_KEY } from "@/lib/asset-preferences";
import { formatLocationLabel } from "@/lib/locations";
import { canDeleteAsset, canManageLocationsAndAssets } from "@/lib/permissions";
import type {
  Asset,
  AssetFormData,
  AssetCategory,
  AssetStatus,
  Location,
  UserRole,
} from "@/lib/types";

type AssetManagerProps = {
  assets: Asset[];
  locations: Location[];
  categories: AssetCategory[];
  statuses: AssetStatus[];
  lastUsedLocationId: string | null;
  userRole: UserRole;
  siteName?: string | null;
};

function resolveDefaultLocationId(
  locations: Location[],
  serverLastUsedLocationId: string | null,
): string | null {
  if (typeof window !== "undefined") {
    const stored =
      localStorage.getItem(LAST_LOCATION_STORAGE_KEY) ??
      localStorage.getItem("cotlr:lastSiteId");
    if (stored && locations.some((location) => location.id === stored)) {
      return stored;
    }
  }

  if (
    serverLastUsedLocationId &&
    locations.some((location) => location.id === serverLastUsedLocationId)
  ) {
    return serverLastUsedLocationId;
  }

  return null;
}

export function AssetManager({
  assets,
  locations,
  categories,
  statuses,
  lastUsedLocationId: serverLastUsedLocationId,
  userRole,
  siteName,
}: AssetManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [defaultLocationId, setDefaultLocationId] = useState<string | null>(null);

  const allowDelete = canDeleteAsset(userRole);
  const allowCreate = canManageLocationsAndAssets(userRole);

  useEffect(() => {
    const resolved = resolveDefaultLocationId(locations, serverLastUsedLocationId);
    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem(LAST_LOCATION_STORAGE_KEY) ??
        localStorage.getItem("cotlr:lastSiteId");
      if (stored && !resolved) {
        localStorage.removeItem(LAST_LOCATION_STORAGE_KEY);
        localStorage.removeItem("cotlr:lastSiteId");
      }
    }
    setDefaultLocationId(resolved);
  }, [locations, serverLastUsedLocationId]);

  function rememberLocationId(locationId: string | undefined) {
    if (!locationId) return;
    if (!locations.some((location) => location.id === locationId)) return;
    localStorage.setItem(LAST_LOCATION_STORAGE_KEY, locationId);
    localStorage.removeItem("cotlr:lastSiteId");
    setDefaultLocationId(locationId);
  }

  function handleAddClick() {
    setEditingAsset(null);
    setShowForm(true);
  }

  function handleEditClick(asset: Asset) {
    setEditingAsset(asset);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingAsset(null);
  }

  async function handleSubmit(data: AssetFormData) {
    const result = editingAsset
      ? await updateAsset(editingAsset.id, data)
      : await createAsset(data);

    if (result.success) {
      rememberLocationId(data.location_id);
      setShowForm(false);
      setEditingAsset(null);
    } else if (
      result.error?.toLowerCase().includes("location") &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem(LAST_LOCATION_STORAGE_KEY);
      localStorage.removeItem("cotlr:lastSiteId");
      setDefaultLocationId(
        resolveDefaultLocationId(locations, serverLastUsedLocationId),
      );
    }

    return result;
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this asset?")) return;

    setDeleteError(null);
    const result = await deleteAsset(id);

    if (result.error) {
      setDeleteError(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Assets</h2>
          <p className="text-sm text-gray-500">Manage your organization&apos;s assets</p>
        </div>
        {!showForm && allowCreate && (
          <button
            type="button"
            onClick={handleAddClick}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Add Asset
          </button>
        )}
      </div>

      {deleteError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {deleteError}
        </div>
      )}

      {showForm && (
        <Card
          title={editingAsset ? "Edit Asset" : "Add Asset"}
          subtitle={
            editingAsset
              ? "Update asset details"
              : "Enter details for a new asset"
          }
        >
          <AssetForm
            key={editingAsset?.id ?? "new"}
            asset={editingAsset ?? undefined}
            locations={locations}
            categories={categories}
            statuses={statuses}
            defaultLocationId={
              editingAsset ? editingAsset.location_id : defaultLocationId
            }
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </Card>
      )}

      <Card
        title="Asset List"
        subtitle={
          siteName
            ? `${assets.length} assets at ${siteName}`
            : `${assets.length} total assets`
        }
      >
        {assets.length === 0 ? (
          <p className="text-sm text-gray-500">
            {siteName
              ? `No assets at ${siteName}.`
              : allowCreate
                ? "No assets yet. Add your first asset above."
                : "No assets yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Category
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Location
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Value
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                      {asset.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {asset.asset_category?.name ?? asset.category ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                        {asset.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatLocationLabel(asset.location)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {asset.purchase_price != null
                        ? `$${asset.purchase_price.toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right text-sm">
                      <button
                        type="button"
                        onClick={() => handleEditClick(asset)}
                        className="font-medium text-gray-700 hover:text-gray-900"
                      >
                        Edit
                      </button>
                      {allowDelete && (
                        <>
                          <span className="mx-2 text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(asset.id)}
                            className="font-medium text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
