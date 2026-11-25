import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is only needed for self-hosted production runs.
  // Vercel uses its native build output, so skip standalone there.
  output: process.env.VERCEL ? undefined : "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Ship the bundled iptv-org snapshot with serverless functions
  outputFileTracingIncludes: {
    "/api/**": ["./src/data/telipally-snapshot.json"],
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600" }],
      },
    ];
  },
};

export default nextConfig;
