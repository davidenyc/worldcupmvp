import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/admin/", "/me/", "/account/"]
    },
    sitemap: "https://gamedaymap.com/sitemap.xml"
  };
}
