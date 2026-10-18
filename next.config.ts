import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/embed/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
        ],
      },
    ];
  },
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      {
        protocol: 'https',
        hostname: 'pub-0d201b6612bc47859f4719a27046564f.r2.dev',
      },
    ],
  },
};

export default nextConfig;
