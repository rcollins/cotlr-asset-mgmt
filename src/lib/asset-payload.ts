import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeAssetStatus } from "@/lib/asset-statuses";
import type { AssetFormData } from "@/lib/types";

type AssetWritePayload = {
  name: string;
  description: string | null;
  serial_number: string | null;
  purchase_price: number | null;
  purchase_date: string | null;
  useful_life_date: string | null;
  disposal_date: string | null;
  book_value: number | null;
  book_value_override: boolean | null;
  depreciation_method: string | null;
  status: string;
  location_id: string;
  category: string;
  created_by?: string;
  updated_at?: string;
};

async function resolveLocationId(
  supabase: SupabaseClient,
  locationId: string | undefined,
): Promise<{ locationId?: string; error?: string }> {
  const trimmed = locationId?.trim();
  if (!trimmed) {
    return { error: "Location is required" };
  }

  const { data: location, error } = await supabase
    .from("locations")
    .select("id")
    .eq("id", trimmed)
    .maybeSingle();

  if (error || !location) {
    return { error: "Selected location is invalid or no longer exists" };
  }

  return { locationId: location.id };
}

export async function buildAssetWritePayload(
  supabase: SupabaseClient,
  data: AssetFormData,
  userId: string,
  mode: "create" | "update",
): Promise<{ payload?: AssetWritePayload; error?: string }> {
  if (!data.category) {
    return { error: "Category is required" };
  }

  const { data: category, error: categoryError } = await supabase
    .from("asset_categories")
    .select("name")
    .eq("name", data.category)
    .single();

  if (categoryError || !category) {
    return { error: "Selected category is invalid" };
  }

  if (!data.status) {
    return { error: "Status is required" };
  }

  const canonicalStatus = normalizeAssetStatus(data.status);
  if (!canonicalStatus) {
    return { error: "Selected status is invalid" };
  }

  const { locationId, error: locationError } = await resolveLocationId(
    supabase,
    data.location_id,
  );

  if (locationError || !locationId) {
    return { error: locationError ?? "Location is required" };
  }

  const payload: AssetWritePayload = {
    name: data.name,
    description: data.description ?? null,
    serial_number: data.serial_number ?? null,
    purchase_price: data.purchase_price ?? null,
    purchase_date: data.purchase_date ?? null,
    useful_life_date: data.useful_life_date ?? null,
    disposal_date: data.disposal_date ?? null,
    book_value: data.book_value ?? null,
    book_value_override: data.book_value_override ?? null,
    depreciation_method: data.depreciation_method ?? null,
    status: canonicalStatus,
    location_id: locationId,
    category: category.name,
  };

  if (mode === "create") {
    payload.created_by = userId;
  } else {
    payload.updated_at = new Date().toISOString();
  }

  return { payload };
}
