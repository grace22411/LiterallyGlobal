import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/api/resources/*/access": ["./content/resources/*.pdf"],
    "/api/admin/setup": ["./supabase/migrations/*.sql"],
  },
};

export default nextConfig;
