import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force no-cache on HTML pages so browser always fetches the latest bundle
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "Cache-Control", value: "no-store, must-revalidate" },
        { key: "Pragma", value: "no-cache" },
      ],
    },
  ],
  // Disable image optimization for local images (avoids 404 on missing assets)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
