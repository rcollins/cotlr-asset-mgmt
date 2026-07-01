import type { SupabaseClient } from "@supabase/supabase-js";
import { buildAssetWritePayload } from "@/lib/asset-payload";
import { parseCsv } from "@/lib/csv";
import type { AssetFormData, Location } from "@/lib/types";

export const MAX_IMPORT_ROWS = 500;

export type AssetImportRowError = {
  row: number;
  message: string;
};

export type AssetImportResult = {
  imported: number;
  failed: number;
  errors: AssetImportRowError[];
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function buildLocationLookup(locations: Location[]): Map<string, string> {
  const lookup = new Map<string, string>();

  for (const location of locations) {
    const siteName = location.site?.name;
    if (!siteName) continue;

    const key = `${normalizeKey(siteName)}::${normalizeKey(location.name)}`;
    lookup.set(key, location.id);
  }

  return lookup;
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseOptionalBoolean(value: string | undefined): boolean | undefined {
  if (!value?.trim()) return undefined;
  const normalized = value.trim().toLowerCase();
  if (["true", "yes", "1"].includes(normalized)) return true;
  if (["false", "no", "0"].includes(normalized)) return false;
  return undefined;
}

function resolveLocationId(
  row: Record<string, string>,
  lookup: Map<string, string>,
): { locationId?: string; error?: string } {
  const locationId = row.location_id?.trim();
  if (locationId) {
    const exists = [...lookup.values()].includes(locationId);
    if (exists) return { locationId };
    return { error: "location_id is invalid" };
  }

  const site = row.site?.trim();
  const location = row.location?.trim();

  if (!site || !location) {
    return { error: "site and location are required" };
  }

  const key = `${normalizeKey(site)}::${normalizeKey(location)}`;
  const resolved = lookup.get(key);

  if (!resolved) {
    return { error: `location "${location}" was not found at site "${site}"` };
  }

  return { locationId: resolved };
}

function mapRowToAssetFormData(
  row: Record<string, string>,
  locationId: string,
): AssetFormData | { error: string } {
  const name = row.name?.trim();
  const category = row.category?.trim();
  const status = row.status?.trim();

  if (!name) return { error: "name is required" };
  if (!category) return { error: "category is required" };
  if (!status) return { error: "status is required" };

  return {
    name,
    category,
    status,
    location_id: locationId,
    description: row.description?.trim() || undefined,
    serial_number: row.serial_number?.trim() || undefined,
    purchase_price: parseOptionalNumber(row.purchase_price),
    purchase_date: row.purchase_date?.trim() || undefined,
    useful_life_date: row.useful_life_date?.trim() || undefined,
    disposal_date: row.disposal_date?.trim() || undefined,
    book_value: parseOptionalNumber(row.book_value),
    book_value_override: parseOptionalBoolean(row.book_value_override),
    depreciation_method: row.depreciation_method?.trim() || undefined,
  };
}

export async function importAssetsFromCsv(
  supabase: SupabaseClient,
  csvText: string,
  userId: string,
  locations: Location[],
): Promise<AssetImportResult> {
  const rows = parseCsv(csvText);
  const lookup = buildLocationLookup(locations);
  const errors: AssetImportRowError[] = [];
  let imported = 0;

  if (rows.length === 0) {
    return {
      imported: 0,
      failed: 0,
      errors: [{ row: 1, message: "CSV must include a header row and at least one asset row" }],
    };
  }

  if (rows.length > MAX_IMPORT_ROWS) {
    return {
      imported: 0,
      failed: rows.length,
      errors: [
        {
          row: 2,
          message: `Import is limited to ${MAX_IMPORT_ROWS} assets per file`,
        },
      ],
    };
  }

  for (let index = 0; index < rows.length; index++) {
    const rowNumber = index + 2;
    const row = rows[index];

    const { locationId, error: locationError } = resolveLocationId(row, lookup);
    if (locationError || !locationId) {
      errors.push({ row: rowNumber, message: locationError ?? "location is required" });
      continue;
    }

    const mapped = mapRowToAssetFormData(row, locationId);
    if ("error" in mapped) {
      errors.push({ row: rowNumber, message: mapped.error });
      continue;
    }

    const { payload, error: payloadError } = await buildAssetWritePayload(
      supabase,
      mapped,
      userId,
      "create",
    );

    if (payloadError || !payload) {
      errors.push({ row: rowNumber, message: payloadError ?? "Invalid asset data" });
      continue;
    }

    const { error: insertError } = await supabase.from("assets").insert(payload);

    if (insertError) {
      errors.push({ row: rowNumber, message: insertError.message });
      continue;
    }

    imported++;
  }

  return {
    imported,
    failed: errors.length,
    errors,
  };
}
