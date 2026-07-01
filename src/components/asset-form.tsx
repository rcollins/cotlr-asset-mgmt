"use client";

import { useState } from "react";
import { formatLocationLabel } from "@/lib/locations";
import {
  formatAssetStatusLabel,
  normalizeAssetStatus,
  resolveStatusOptions,
} from "@/lib/asset-statuses";
import type {
  Asset,
  AssetFormData,
  AssetCategory,
  AssetStatus,
  Location,
} from "@/lib/types";

type AssetFormProps = {
  asset?: Asset;
  locations: Location[];
  categories: AssetCategory[];
  statuses: AssetStatus[];
  defaultLocationId?: string | null;
  fixedLocationId?: string;
  fixedLocationLabel?: string;
  onSubmit: (data: AssetFormData) => Promise<{ error?: string; success?: boolean }>;
  onCancel: () => void;
};

function toDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function getOptionalString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key) as string;
  return value || undefined;
}

function getOptionalNumber(formData: FormData, key: string): number | undefined {
  const value = formData.get(key) as string;
  if (!value) return undefined;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function AssetForm({
  asset,
  locations,
  categories,
  statuses,
  defaultLocationId,
  fixedLocationId,
  fixedLocationLabel,
  onSubmit,
  onCancel,
}: AssetFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const statusOptions = resolveStatusOptions(statuses);
  const selectedLocationId = asset?.location_id ?? defaultLocationId ?? "";
  const defaultStatus =
    normalizeAssetStatus(asset?.status ?? "") ??
    normalizeAssetStatus(statusOptions[0]?.name ?? "") ??
    "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const data: AssetFormData = {
      name: formData.get("name") as string,
      description: getOptionalString(formData, "description"),
      category: formData.get("category") as string,
      serial_number: getOptionalString(formData, "serial_number"),
      purchase_price: getOptionalNumber(formData, "purchase_price"),
      purchase_date: getOptionalString(formData, "purchase_date"),
      useful_life_date: getOptionalString(formData, "useful_life_date"),
      disposal_date: getOptionalString(formData, "disposal_date"),
      book_value: getOptionalNumber(formData, "book_value"),
      book_value_override: formData.get("book_value_override") === "on",
      depreciation_method: getOptionalString(formData, "depreciation_method"),
      status: formData.get("status") as string,
      location_id: fixedLocationId ?? (formData.get("location_id") as string),
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
            Category *
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={asset?.category ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
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
          <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700">
            Purchase Price
          </label>
          <input
            id="purchase_price"
            name="purchase_price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={asset?.purchase_price ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div>
          <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700">
            Purchase Date
          </label>
          <input
            id="purchase_date"
            name="purchase_date"
            type="date"
            defaultValue={toDateInputValue(asset?.purchase_date)}
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
            defaultValue={asset?.status ?? defaultStatus}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="">Select a status</option>
            {statusOptions.map((status) => {
              const value = normalizeAssetStatus(status.name) ?? status.name;
              return (
                <option key={status.id} value={value}>
                  {formatAssetStatusLabel(value)}
                </option>
              );
            })}
          </select>
        </div>

        {fixedLocationId ? (
          <div>
            <span className="block text-sm font-medium text-gray-700">Location</span>
            <p className="mt-1 text-sm text-gray-900">
              {fixedLocationLabel ?? fixedLocationId}
            </p>
            <input type="hidden" name="location_id" value={fixedLocationId} />
          </div>
        ) : (
          <div>
            <label htmlFor="location_id" className="block text-sm font-medium text-gray-700">
              Location *
            </label>
            <select
              id="location_id"
              name="location_id"
              required
              defaultValue={selectedLocationId}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <option value="">Select a location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {formatLocationLabel(location)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="sm:col-span-2 border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-900">Depreciation</h3>
        </div>

        <div>
          <label htmlFor="useful_life_date" className="block text-sm font-medium text-gray-700">
            Useful Life Date
          </label>
          <input
            id="useful_life_date"
            name="useful_life_date"
            type="date"
            defaultValue={toDateInputValue(asset?.useful_life_date)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div>
          <label htmlFor="disposal_date" className="block text-sm font-medium text-gray-700">
            Disposal Date
          </label>
          <input
            id="disposal_date"
            name="disposal_date"
            type="date"
            defaultValue={toDateInputValue(asset?.disposal_date)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div>
          <label htmlFor="book_value" className="block text-sm font-medium text-gray-700">
            Book Value
          </label>
          <input
            id="book_value"
            name="book_value"
            type="number"
            step="0.01"
            min="0"
            defaultValue={asset?.book_value ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div>
          <label htmlFor="depreciation_method" className="block text-sm font-medium text-gray-700">
            Depreciation Method
          </label>
          <input
            id="depreciation_method"
            name="depreciation_method"
            type="text"
            defaultValue={asset?.depreciation_method ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div className="flex items-end sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              id="book_value_override"
              name="book_value_override"
              type="checkbox"
              defaultChecked={asset?.book_value_override ?? false}
              className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
            />
            Override book value
          </label>
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
