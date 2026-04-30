import { MatchesPageClient } from "@/components/matches/MatchesPageClient";
import { buildMetadata } from "@/lib/seo/metadata";
import { HOST_CITIES } from "@/lib/data/hostCities";
import { worldCup2026Matches } from "@/lib/data/matches";
import { readPlacesCacheForCity } from "@/lib/cache/places";
import { getAllCountries } from "@/lib/data/repository";
import { toAbsoluteUrl } from "@/lib/seo/schema";

export const metadata = buildMetadata({
  title: "Matches",
  description:
    "Browse the World Cup 2026 match slate and jump into the right city map to find where fans are already gathering.",
  path: "/matches"
});

export default async function MatchesPage() {
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
  const eventSchemas = worldCup2026Matches.slice(0, 30).map((match) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${countryLookup.get(match.homeCountry)?.name ?? match.homeCountry} vs ${countryLookup.get(match.awayCountry)?.name ?? match.awayCountry}`,
    startDate: match.startsAt,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: match.city,
      address: match.city
    },
    organizer: {
      "@type": "Organization",
      name: "GameDay Map",
      url: toAbsoluteUrl("/matches")
    }
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchemas) }}
      />
      <MatchesPageClient
        cityKey="nyc"
        countries={countries}
        matches={worldCup2026Matches}
        venueCacheByCity={Object.fromEntries(venueCacheEntries)}
      />
    </>
  );
}
