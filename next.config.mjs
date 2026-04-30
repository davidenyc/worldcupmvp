if (process.env.NODE_ENV === "production") {
  const secret = process.env.ELITE_ACCESS_SECRET;

  if (!secret) {
    throw new Error("ELITE_ACCESS_SECRET is required in production");
  }

  if (secret.length < 32) {
    throw new Error("ELITE_ACCESS_SECRET must be at least 32 characters");
  }
}

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
