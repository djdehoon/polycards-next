import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow phone/LAN access to /_next/* during `next dev` (Host: 192.168.x.x).
  allowedDevOrigins: ["192.168.178.192"],
  async headers() {
    return [
      {
        source: "/og-image.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
      {
        source: "/og-image-social.jpg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
