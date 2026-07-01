import type { NextConfig } from "next";
import { hasSupabaseEnv } from "./src/lib/env";

const nextConfig: NextConfig = {
  poweredByHeader: false,
};

if (process.env.VERCEL === "1" && !hasSupabaseEnv()) {
  throw new Error(
    "Missing Supabase environment variables. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel project settings.",
  );
}

export default nextConfig;
