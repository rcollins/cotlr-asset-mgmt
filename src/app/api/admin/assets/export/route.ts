import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildAssetsCsv } from "@/lib/csv";
import { canAccessAdmin } from "@/lib/permissions";
import { parseSiteFilter } from "@/lib/site-filter";
import type { UserRole } from "@/lib/types";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as UserRole) ?? "viewer";

  if (!canAccessAdmin(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const siteId = parseSiteFilter(searchParams.get("site") ?? undefined);

  if (siteId) {
    const { data: site } = await supabase
      .from("sites")
      .select("id")
      .eq("id", siteId)
      .maybeSingle();

    if (!site) {
      return NextResponse.json({ error: "Invalid site filter" }, { status: 400 });
    }
  }

  const assetSelect = siteId
    ? "name, description, category, status, serial_number, purchase_price, purchase_date, useful_life_date, disposal_date, book_value, book_value_override, depreciation_method, created_at, location:locations!inner(name, site:sites!site_id(name))"
    : "name, description, category, status, serial_number, purchase_price, purchase_date, useful_life_date, disposal_date, book_value, book_value_override, depreciation_method, created_at, location:locations!location_id(name, site:sites!site_id(name))";

  let assetsQuery = supabase.from("assets").select(assetSelect).order("name");

  if (siteId) {
    assetsQuery = assetsQuery.eq("location.site_id", siteId);
  }

  const { data: assets, error } = await assetsQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (assets ?? []).map((asset) => {
    const location = Array.isArray(asset.location) ? asset.location[0] : asset.location;
    const site = location?.site
      ? Array.isArray(location.site)
        ? location.site[0]
        : location.site
      : null;

    return {
      name: asset.name,
      category: asset.category,
      status: asset.status,
      site: site?.name ?? "",
      location: location?.name ?? "",
      serial_number: asset.serial_number,
      purchase_price: asset.purchase_price,
      purchase_date: asset.purchase_date,
      useful_life_date: asset.useful_life_date,
      disposal_date: asset.disposal_date,
      book_value: asset.book_value,
      book_value_override: asset.book_value_override,
      depreciation_method: asset.depreciation_method,
      description: asset.description,
      created_at: asset.created_at,
    };
  });

  const csv = buildAssetsCsv(rows);
  const dateStamp = new Date().toISOString().slice(0, 10);
  const filename = siteId
    ? `assets-export-${dateStamp}-site.csv`
    : `assets-export-${dateStamp}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
