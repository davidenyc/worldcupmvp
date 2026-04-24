import "server-only";

import { demoBoroughs, demoNeighborhoods, demoMatches } from "@/lib/data/demo";
import { worldCup2026Matches } from "@/lib/data/matches";
import { dedupeVenues } from "@/lib/data/dedupe";
import { getCachedProviderResult, getActiveVenueProvider } from "@/lib/providers";
import { rankVenues } from "@/lib/ranking/venues";
import { CountryFilters, CountrySortKey, RankedVenue } from "@/lib/types";
import { slugify } from "@/lib/utils";

function venueCountrySlugMatches(countrySlug: string, countryName: string) {
  return slugify(countryName) === countrySlug;
}

export async function getFeaturedCountries() {
  const provider = getActiveVenueProvider();
  return getCachedProviderResult("featured-countries", async () => {
    const countries = await provider.listCountries();
    return countries.filter((country) => country.featured).slice(0, 12);
  });
}

export async function getAllCountries() {
  const provider = getActiveVenueProvider();
  return getCachedProviderResult("all-countries", () => provider.listCountries());
}

export async function getMapPageData() {
  const provider = getActiveVenueProvider();
  return getCachedProviderResult("map-page", async () => {
    const [countries, venues] = await Promise.all([
      provider.listCountries(),
      provider.listVenues()
    ]);

    const deduped = dedupeVenues(venues);
    const ranked = deduped
      .map((venue) => rankVenues([venue], { countrySlug: venue.associatedCountries[0] })[0])
      .sort((a, b) => b.rankScore - a.rankScore);

    return {
      countries,
      venues: ranked,
      neighborhoods: Array.from(new Set(ranked.map((venue) => venue.neighborhood))).sort()
    };
  });
}

export async function getBoroughs() {
  return demoBoroughs;
}

export async function getNeighborhoods() {
  return demoNeighborhoods;
}

export async function getCountryPageData(countrySlug: string) {
  const provider = getActiveVenueProvider();

  return getCachedProviderResult(`country:${countrySlug}`, async () => {
    const country = await provider.getCountryBySlug(countrySlug);
    if (!country) return null;

    const venues = dedupeVenues(await provider.listVenues({ countrySlug }));
    const ranked = rankVenues(venues, { countrySlug });
    const matches = demoMatches.filter(
      (match) =>
        match.homeCountry === country.name ||
        match.awayCountry === country.name ||
        venueCountrySlugMatches(countrySlug, match.homeCountry) ||
        venueCountrySlugMatches(countrySlug, match.awayCountry)
    );

    return {
      country,
      venues: ranked,
      featuredVenues: ranked.filter((venue) => venue.isFeatured || venue.isOfficialFanHub).slice(0, 6),
      largeGroupVenues: ranked
        .filter((venue) => (venue.approximateCapacity ?? 0) >= 100 || venue.goodForGroups)
        .slice(0, 6),
      reservableVenues: ranked.filter((venue) => venue.acceptsReservations).slice(0, 6),
      authenticVibeVenues: ranked
        .filter((venue) => venue.cuisineTags.some((tag) => tag.toLowerCase().includes(country.name.toLowerCase())))
        .slice(0, 6),
      matches: matches.sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    };
  });
}

export async function getVenueDetails(slug: string) {
  const provider = getActiveVenueProvider();
  return getCachedProviderResult(`venue:${slug}`, async () => {
    const venue = await provider.getVenueBySlug(slug);
    if (!venue) return null;

    const country = await provider.getCountryBySlug(venue.associatedCountries[0]);
    const related = rankVenues(
      dedupeVenues(await provider.listVenues({ countrySlug: venue.associatedCountries[0] })),
      { countrySlug: venue.associatedCountries[0] }
    )
      .filter((item) => item.slug !== slug)
      .slice(0, 4);

    const supporterCountrySlug = venue.likelySupporterCountry ?? venue.associatedCountries[0];
    const upcomingMatches = worldCup2026Matches
      .filter(
        (match) =>
          match.homeCountry === supporterCountrySlug ||
          match.awayCountry === supporterCountrySlug ||
          venue.associatedCountries.includes(match.homeCountry) ||
          venue.associatedCountries.includes(match.awayCountry)
      )
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
      .slice(0, 3);

    const nearby = rankVenues(await provider.listVenues(), {
      countrySlug: supporterCountrySlug
    })
      .filter((item) => item.slug !== slug)
      .sort((a, b) => {
        const distA = Math.hypot(a.lat - venue.lat, a.lng - venue.lng);
        const distB = Math.hypot(b.lat - venue.lat, b.lng - venue.lng);
        return distA - distB;
      })
      .slice(0, 3);

    return { venue, country, related, matches: upcomingMatches, nearby };
  });
}

export async function getAdminQueue() {
  const provider = getActiveVenueProvider();
  return getCachedProviderResult("admin-queue", async () => {
    const [submissions, countries, venues, importJobs] = await Promise.all([
      provider.listSubmissions(),
      provider.listCountries(),
      provider.listVenues(),
      provider.listImportJobs()
    ]);

    return {
      submissions,
      countries,
      venues: dedupeVenues(venues),
      importJobs
    };
  });
}
