import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['**/backend/**', '**/node_modules/**'],
    };
    return config;
  },
  turbopack: {},
  images: {
    remotePatterns: [],
    unoptimized: false,
  },
};

export default nextConfig;
