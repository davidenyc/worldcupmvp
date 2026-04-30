import type { MetadataRoute } from "next";

import { demoCountries, demoVenues } from "@/lib/data/demo";
import { HOST_CITIES } from "@/lib/data/hostCities";
import { getAllPromos } from "@/lib/data/promos";

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://gamedaymap.com").replace(/\/+$/, "");

function buildRoute(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]) {
  return {
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority
  } satisfies MetadataRoute.Sitemap[number];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    buildRoute("/", 1.0, "daily"),
    buildRoute("/app", 0.9, "daily"),
    buildRoute("/promos", 0.8, "daily"),
    buildRoute("/today", 0.7, "daily"),
    buildRoute("/matches", 0.7, "daily"),
    buildRoute("/membership", 0.6, "monthly"),
    buildRoute("/about", 0.4, "yearly"),
    buildRoute("/privacy", 0.4, "yearly"),
    buildRoute("/terms", 0.4, "yearly"),
    buildRoute("/contact", 0.4, "yearly")
  ];

  const cityRoutes = HOST_CITIES.flatMap((city) => [
    buildRoute(`/${city.key}`, 0.8, "daily"),
    buildRoute(`/${city.key}/map`, 0.9, "daily"),
    buildRoute(`/${city.key}/matches`, 0.7, "daily")
  ]);

  const countryRoutes = demoCountries.map((country) =>
    buildRoute(`/country/${country.slug}`, 0.6, "weekly")
  );

  const venueRoutes = demoVenues.map((venue) =>
    buildRoute(`/venue/${venue.slug}`, 0.5, "weekly")
  );

  const promoRoutes = getAllPromos().map((promo) =>
    buildRoute(`/promos/${promo.id}`, 0.5, "daily")
  );

  return [...staticRoutes, ...cityRoutes, ...countryRoutes, ...venueRoutes, ...promoRoutes];
}
