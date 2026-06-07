import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No basePath, assetPrefix, or redirects — homepage must be served at /
  reactStrictMode: true,
  serverExternalPackages: ["pdfkit"],
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [256, 384, 480, 640, 750],
  },
};

export default nextConfig;
