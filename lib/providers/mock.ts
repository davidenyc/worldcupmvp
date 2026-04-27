import { demoCountries, demoImportJobs, demoSubmissions, demoVenues } from "@/lib/data/demo";
import { CsvVenueProvider } from "@/lib/providers/csv";
import { dedupeVenues } from "@/lib/data/dedupe";
import { findPlacesVenueBySlug, readPlacesCache, readPlacesCacheForCity } from "@/lib/cache/places";
import { VenueProvider, VenueSearchParams } from "@/lib/providers/types";
import { CountrySummary, ImportJobRecord, SubmissionRecord, Venue } from "@/lib/types";

const csvProvider = new CsvVenueProvider();

function withRealVenueFlag(venues: Venue[], isRealVenue: boolean) {
  return venues.map((venue) => ({
    ...venue,
    isRealVenue
  }));
}

function applySearchFilters(venues: Venue[], params?: VenueSearchParams) {
  let results = [...venues];
  const normalizeCity = (value: string) => value.toLowerCase().trim().replace(/\s+/g, "-");

  if (params?.city) {
    const cityKey = normalizeCity(params.city);
    results = results.filter((venue) => normalizeCity(venue.city) === cityKey);
  }

  if (params?.countrySlug) {
    results = results.filter((venue) => venue.associatedCountries.includes(params.countrySlug!));
  }

  if (params?.venueTypes?.length) {
    results = results.filter((venue) =>
      params.venueTypes!.some((type) => venue.venueTypes.includes(type as Venue["venueTypes"][number]))
    );
  }

  if (params?.borough) {
    results = results.filter((venue) => venue.borough === params.borough);
  }

  if (params?.neighborhood) {
    results = results.filter((venue) => venue.neighborhood === params.neighborhood);
  }

  if (params?.showsSoccer) {
    results = results.filter((venue) => venue.showsSoccer);
  }

  if (params?.openNow) {
    results = results.filter((venue) => venue.openNow);
  }

  if (params?.takesReservations) {
    results = results.filter((venue) => venue.acceptsReservations);
  }

  if (params?.capacityBucket) {
    results = results.filter((venue) => venue.capacityBucket === params.capacityBucket);
  }

  if (typeof params?.priceLevel === "number") {
    results = results.filter((venue) => venue.priceLevel === params.priceLevel);
  }

  if (params?.atmosphere?.length) {
    results = results.filter((venue) =>
      params.atmosphere!.some((tag) => venue.atmosphereTags.includes(tag as Venue["atmosphereTags"][number]))
    );
  }

  if (params?.query) {
    const query = params.query.toLowerCase();
    results = results.filter(
      (venue) =>
        venue.name.toLowerCase().includes(query) ||
        venue.neighborhood.toLowerCase().includes(query) ||
        venue.cuisineTags.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  return results;
}

export class MockVenueProvider implements VenueProvider {
  id = "mock";
  label = "Curated Demo Data";

  async listCountries(): Promise<CountrySummary[]> {
    return demoCountries;
  }

  async getCountryBySlug(slug: string): Promise<CountrySummary | null> {
    return demoCountries.find((country) => country.slug === slug) ?? null;
  }

  async listVenues(params?: VenueSearchParams): Promise<Venue[]> {
    if (params?.city) {
      const cachedVenues = params.countrySlug
        ? (await readPlacesCache(params.city, params.countrySlug)) ?? []
        : await readPlacesCacheForCity(params.city);
      const curatedVenues = await csvProvider.listVenues(params);
      const merged = dedupeVenues([
        ...withRealVenueFlag(curatedVenues, true),
        ...withRealVenueFlag(cachedVenues, true)
      ]);

      if (merged.length > 0) {
        return applySearchFilters(merged, params);
      }

      return applySearchFilters(
        withRealVenueFlag(
          demoVenues.filter((venue) =>
            params.countrySlug ? venue.associatedCountries.includes(params.countrySlug) : true
          ),
          false
        ),
        params
      );
    }

    const realVenues = withRealVenueFlag(await csvProvider.listVenues(params), true);
    const demoGeneratedVenues = withRealVenueFlag(demoVenues, false);

    return applySearchFilters([...realVenues, ...demoGeneratedVenues], params);
  }

  async getVenueBySlug(slug: string): Promise<Venue | null> {
    const cachedVenue = await findPlacesVenueBySlug(slug);
    if (cachedVenue) return cachedVenue;
    return csvProvider.getVenueBySlug(slug);
  }

  async listSubmissions(): Promise<SubmissionRecord[]> {
    return demoSubmissions;
  }

  async listImportJobs(): Promise<ImportJobRecord[]> {
    return demoImportJobs;
  }
}
