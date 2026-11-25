import type { NextConfig } from "next";

// Static export: the demo is served as plain assets by a Cloudflare Worker (see wrangler.jsonc).
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  transpilePackages: ["@shiftbloom-studio/symphony-state"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
