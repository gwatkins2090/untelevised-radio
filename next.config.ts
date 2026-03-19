import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: false,
    remotePatterns: [],
  },
  // Ensure proper build for Vercel
  experimental: {
    // Remove any experimental features that might cause issues
  },
};

export default nextConfig;
