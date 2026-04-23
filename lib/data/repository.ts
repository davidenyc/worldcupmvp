import "server-only";

import { demoBoroughs, demoNeighborhoods, demoMatches } from "@/lib/data/demo";
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

    const matches = demoMatches.filter(
      (match) =>
        match.homeCountry === country?.name ||
        match.awayCountry === country?.name ||
        venue.associatedCountries.some(
          (item) =>
            match.homeCountry.toLowerCase() === item || match.awayCountry.toLowerCase() === item
        )
    ).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

    return { venue, country, related, matches };
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
