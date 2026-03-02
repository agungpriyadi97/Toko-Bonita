import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use standalone for non-Netlify builds
  ...(process.env.NETLIFY !== 'true' && { output: "standalone" }),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
