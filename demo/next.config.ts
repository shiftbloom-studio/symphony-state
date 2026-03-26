import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@shiftbloom-studio/symphony-state"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
