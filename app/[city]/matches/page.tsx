import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MatchesPageClient } from "@/components/matches/MatchesPageClient";
import { HOST_CITIES, getHostCity } from "@/lib/data/hostCities";
import { worldCup2026Matches } from "@/lib/data/matches";
import { readPlacesCacheForCity } from "@/lib/cache/places";
import { getAllCountries } from "@/lib/data/repository";
import { buildBreadcrumbList, toAbsoluteUrl } from "@/lib/seo/schema";

export async function generateMetadata({
  params
}: {
  params: { city: string };
}): Promise<Metadata> {
  const city = getHostCity(params.city);
  return {
    title: `${city?.label ?? params.city} Matches · GameDay Map`,
    description: `Browse the full World Cup 2026 schedule, then find watch spots in ${city?.label ?? "your city"}.`
  };
}

export default async function CityMatchesPage({
  params
}: {
  params: { city: string };
}) {
  const city = getHostCity(params.city);
  if (!city) notFound();

  const countries = await getAllCountries();
  const venueCacheEntries = await Promise.all(
    HOST_CITIES.map(async (item) => {
      try {
        const venues = await readPlacesCacheForCity(item.key);
        return [item.key, venues ?? []] as const;
      } catch {
        return [item.key, []] as const;
      }
    })
  );
  const countryLookup = new Map(countries.map((country) => [country.slug, country] as const));
  const eventSchemas = worldCup2026Matches
    .filter((match) => getHostCity(match.city)?.key === city.key)
    .slice(0, 30)
    .map((match) => ({
      "@context": "https://schema.org",
      "@type": "Event",
      name: `${countryLookup.get(match.homeCountry)?.name ?? match.homeCountry} vs ${countryLookup.get(match.awayCountry)?.name ?? match.awayCountry}`,
      startDate: match.startsAt,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: {
        "@type": "Place",
        name: match.city || city.label,
        address: city.label
      },
      organizer: {
        "@type": "Organization",
        name: "GameDay Map",
        url: toAbsoluteUrl(`/${city.key}/matches`)
      }
    }));
  const breadcrumbSchema = buildBreadcrumbList([
    { name: "Home", path: "/" },
    { name: city.label, path: `/${city.key}` },
    { name: "Matches", path: `/${city.key}/matches` }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchemas) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <MatchesPageClient
        cityKey={city.key}
        countries={countries}
        matches={worldCup2026Matches}
        venueCacheByCity={Object.fromEntries(venueCacheEntries)}
      />
    </>
  );
}
