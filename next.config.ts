import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Don't let ESLint errors fail the production build on Vercel
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
