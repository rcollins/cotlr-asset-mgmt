"use client";

import { useState } from "react";
import type { LocationFormData } from "@/lib/types";

type LocationFormProps = {
  siteId: string;
  onSubmit: (
    data: LocationFormData,
  ) => Promise<{ error?: string; success?: boolean }>;
  onCancel: () => void;
};

export function LocationForm({ siteId, onSubmit, onCancel }: LocationFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await onSubmit({
      site_id: siteId,
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label htmlFor="location-name" className="block text-sm font-medium text-gray-700">
          Location Name *
        </label>
        <input
          id="location-name"
          name="name"
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>

      <div>
        <label
          htmlFor="location-description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="location-description"
          name="description"
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add Location"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
