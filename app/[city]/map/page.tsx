import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MapPageClient } from "@/components/map/MapPageClient";
import { getMapPageData } from "@/lib/data/repository";
import { getHostCity } from "@/lib/data/hostCities";

export async function generateMetadata({
  params
}: {
  params: { city: string };
}): Promise<Metadata> {
  const city = getHostCity(params.city);
  if (!city) {
    return {
      title: "GameDay Map",
      description: "Find World Cup 2026 watch parties near you."
    };
  }

  const data = await getMapPageData(city.key);
  const neighborhoods = Array.from(new Set(data.venues.map((venue) => venue.neighborhood))).slice(0, 3);
  const description = `Find the best ${city.label} bars and restaurants to watch World Cup 2026 matches with fans from your country. ${data.venues.length} curated venues across ${neighborhoods.join(", ")}.`;
  const title = `Best Bars to Watch World Cup 2026 in ${city.label} | GameDay Map`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      url: `https://gamedaymap.com/${city.key}/map`,
      title,
      description,
      siteName: "GameDay Map"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export default async function MapPage({
  params
}: {
  params: { city: string };
}) {
  const city = getHostCity(params.city);
  if (!city) notFound();

  const data = await getMapPageData(city.key);
  const topVenue = data.venues[0];

  const localBusinessSchema = topVenue
    ? {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: topVenue.name,
        address: topVenue.address,
        description: topVenue.description,
        url: `https://gamedaymap.com/venue/${topVenue.slug}`,
        areaServed: city.label
      }
    : null;

  return (
    <>
      {localBusinessSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      ) : null}
      <MapPageClient data={data} city={city.key} />
    </>
  );
}
