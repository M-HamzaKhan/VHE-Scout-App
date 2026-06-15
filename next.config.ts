import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    optimizePackageImports: ['@supabase/ssr', '@supabase/supabase-js'],
  },
};

export default nextConfig;
