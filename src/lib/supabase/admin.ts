import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv, getSupabaseServiceRoleKey } from "@/lib/env";

export function createAdminClient() {
  const { supabaseUrl } = getSupabaseEnv();

  return createClient(supabaseUrl, getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
