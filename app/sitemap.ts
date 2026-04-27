import type { MetadataRoute } from "next";

import { HOST_CITIES } from "@/lib/data/hostCities";

const BASE_URL = "https://gamedaymap.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${BASE_URL}/membership`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${BASE_URL}/account`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5
    },
    ...HOST_CITIES.flatMap((city) => [
      {
        url: `${BASE_URL}/${city.key}/map`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.9
      },
      {
        url: `${BASE_URL}/${city.key}/matches`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.8
      }
    ])
  ];
}
