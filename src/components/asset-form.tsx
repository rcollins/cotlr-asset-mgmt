"use client";

import { useState } from "react";
import type { Asset, AssetFormData, AssetCategory, Site } from "@/lib/types";

type AssetFormProps = {
  asset?: Asset;
  sites: Site[];
  categories: AssetCategory[];
  defaultSiteId?: string | null;
  onSubmit: (data: AssetFormData) => Promise<{ error?: string; success?: boolean }>;
  onCancel: () => void;
};

const STATUS_OPTIONS = ["active", "inactive", "maintenance", "retired"];

export function AssetForm({
  asset,
  sites,
  categories,
  defaultSiteId,
  onSubmit,
  onCancel,
}: AssetFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedSiteId = asset?.location_id ?? defaultSiteId ?? "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const purchaseValue = formData.get("purchase_value") as string;
    const locationId = formData.get("location_id") as string;

    const data: AssetFormData = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      category: (formData.get("category") as string) || undefined,
      serial_number: (formData.get("serial_number") as string) || undefined,
      purchase_value: purchaseValue ? parseFloat(purchaseValue) : undefined,
      status: formData.get("status") as string,
      location_id: locationId || undefined,
    };

    const result = await onSubmit(data);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={asset?.name ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={asset?.category ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700">
            Serial Number
          </label>
          <input
            id="serial_number"
            name="serial_number"
            type="text"
            defaultValue={asset?.serial_number ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div>
          <label htmlFor="purchase_value" className="block text-sm font-medium text-gray-700">
            Purchase Value
          </label>
          <input
            id="purchase_value"
            name="purchase_value"
            type="number"
            step="0.01"
            min="0"
            defaultValue={asset?.purchase_value ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status *
          </label>
          <select
            id="status"
            name="status"
            required
            defaultValue={asset?.status ?? "active"}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location_id" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <select
            id="location_id"
            name="location_id"
            defaultValue={selectedSiteId}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="">Select a site</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={asset?.description ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Saving..." : asset ? "Update Asset" : "Add Asset"}
        </button>
      </div>
    </form>
  );
}
