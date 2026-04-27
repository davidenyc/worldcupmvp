/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "flagcdn.com" },
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "images.ctfassets.net"
      },
      {
        protocol: "https",
        hostname: "maps.googleapis.com"
      },
      {
        protocol: "https",
        hostname: "cartocdn.com"
      }
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "X-Frame-Options", value: "ALLOWALL" }]
      }
    ];
  }
};

export default nextConfig;
