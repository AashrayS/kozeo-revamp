import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // eslint: {
  //   // Don't let ESLint errors fail the production build on Vercel
  //   ignoreDuringBuilds: true,
  // },
  typescript: {
    // Temporarily ignore TS errors to see if the build finishes on Vercel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
