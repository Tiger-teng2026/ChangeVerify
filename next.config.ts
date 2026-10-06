import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "changeverify.vercel.app",
          },
        ],
        destination: "https://changeverify.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
