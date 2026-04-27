import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MatchesPageClient } from "@/components/matches/MatchesPageClient";
import { HOST_CITIES, getHostCity } from "@/lib/data/hostCities";
import { worldCup2026Matches } from "@/lib/data/matches";
import { readPlacesCacheForCity } from "@/lib/cache/places";
import { getAllCountries } from "@/lib/data/repository";

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

  return (
    <MatchesPageClient
      cityKey={city.key}
      countries={countries}
      matches={worldCup2026Matches}
      venueCacheByCity={Object.fromEntries(venueCacheEntries)}
    />
  );
}
