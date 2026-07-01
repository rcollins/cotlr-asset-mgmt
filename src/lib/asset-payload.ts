import type { SupabaseClient } from "@supabase/supabase-js";
import type { AssetFormData } from "@/lib/types";

type AssetWritePayload = {
  name: string;
  description: string | null;
  serial_number: string | null;
  purchase_price: number | null;
  status: string;
  location_id: string | null;
  category_id?: string;
  category?: string;
  created_by?: string;
  updated_at?: string;
};

export async function buildAssetWritePayload(
  supabase: SupabaseClient,
  data: AssetFormData,
  userId: string,
  mode: "create" | "update",
): Promise<{ payload?: AssetWritePayload; error?: string }> {
  if (!data.category_id) {
    return { error: "Category is required" };
  }

  const { data: category, error: categoryError } = await supabase
    .from("asset_categories")
    .select("id, name")
    .eq("id", data.category_id)
    .single();

  if (categoryError || !category) {
    return { error: "Selected category is invalid" };
  }

  const payload: AssetWritePayload = {
    name: data.name,
    description: data.description ?? null,
    serial_number: data.serial_number ?? null,
    purchase_price: data.purchase_price ?? null,
    status: data.status,
    location_id: data.location_id ?? null,
    category_id: category.id,
    category: category.name,
  };

  if (mode === "create") {
    payload.created_by = userId;
  } else {
    payload.updated_at = new Date().toISOString();
  }

  return { payload };
}
