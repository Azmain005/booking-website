import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Disable static export for Stripe webhook raw body parsing
  // No special config needed — API routes handle raw body via Next.js built-in
};

export default nextConfig;

