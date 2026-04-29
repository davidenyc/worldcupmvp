import type { Metadata } from "next";

import { PromosPageClient } from "@/components/promos/PromosPageClient";
import { HOST_CITIES, getHostCity } from "@/lib/data/hostCities";
import { getPromosByCity } from "@/lib/data/promos";
import { getMapPageData } from "@/lib/data/repository";

export async function generateMetadata({
  searchParams
}: {
  searchParams?: { city?: string };
}): Promise<Metadata> {
  const city = getHostCity(searchParams?.city ?? "")?.key ?? null;
  const cityLabel = city ? (getHostCity(city)?.label ?? "your city") : "17 host cities";

  return {
    title: city ? `${cityLabel} World Cup promos | GameDay Map` : "World Cup promos | GameDay Map",
    description: city
      ? `Save at watch parties, fan bars, and match-night venues in ${cityLabel}.`
      : "Save at watch parties, fan bars, and supporter rooms across all 17 host cities.",
    openGraph: {
      images: [`/api/og?type=promos${city ? `&city=${city}` : ""}`]
    },
    twitter: {
      card: "summary_large_image",
      images: [`/api/og?type=promos${city ? `&city=${city}` : ""}`]
    }
  };
}

export default async function PromosPage({
  searchParams
}: {
  searchParams?: { city?: string; country?: string; matchId?: string };
}) {
  const requestedCity = getHostCity(searchParams?.city)?.key ?? "nyc";
  const cityOrder = requestedCity
    ? [requestedCity, ...HOST_CITIES.map((city) => city.key).filter((key) => key !== requestedCity)]
    : HOST_CITIES.map((city) => city.key);

  const cityPayloads = await Promise.all(
    cityOrder.map(async (cityKey) => {
      const city = HOST_CITIES.find((entry) => entry.key === cityKey);
      if (!city) return null;

      const mapData = await getMapPageData(city.key);
      const promos = getPromosByCity(city.key, mapData.venues);

      return {
        cityKey: city.key,
        cityLabel: city.label,
        promos,
        venues: mapData.venues.map((venue) => ({
          slug: venue.slug,
          name: venue.name,
          reservationUrl: venue.reservationUrl,
          neighborhood: venue.neighborhood
        }))
      };
    })
  );

  const populatedPayloads = cityPayloads.filter(
    (section): section is NonNullable<typeof section> => Boolean(section && section.promos.length)
  );

  return <PromosPageClient initialCity={requestedCity} cityPayloads={populatedPayloads} />;
}
