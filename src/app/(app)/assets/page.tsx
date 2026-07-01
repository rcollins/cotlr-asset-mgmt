import { AssetManager } from "@/components/asset-manager";
import { getCurrentProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { Asset } from "@/lib/types";

export default async function AssetsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AssetManager
      assets={(assets as Asset[]) ?? []}
      userRole={profile.role}
    />
  );
}
