"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SITE_FILTER_PARAM } from "@/lib/site-filter";
import type { Site } from "@/lib/types";

type SiteFilterProps = {
  sites: Site[];
  selectedSiteId: string | null;
};

export function SiteFilter({ sites, selectedSiteId }: SiteFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(siteId: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (siteId) {
      params.set(SITE_FILTER_PARAM, siteId);
    } else {
      params.delete(SITE_FILTER_PARAM);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  if (sites.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor="site-filter" className="text-sm font-medium text-gray-700">
        Site
      </label>
      <select
        id="site-filter"
        value={selectedSiteId ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        className="min-w-[12rem] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
      >
        <option value="">All sites</option>
        {sites.map((site) => (
          <option key={site.id} value={site.id}>
            {site.name}
          </option>
        ))}
      </select>
    </div>
  );
}
