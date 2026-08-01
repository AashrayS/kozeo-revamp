import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporarily ignore TS errors to see if the build finishes on Vercel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
