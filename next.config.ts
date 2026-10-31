import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
