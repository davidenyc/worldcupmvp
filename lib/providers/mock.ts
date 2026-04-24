import { demoCountries, demoImportJobs, demoSubmissions, demoVenues } from "@/lib/data/demo";
import { CsvVenueProvider } from "@/lib/providers/csv";
import { VenueProvider, VenueSearchParams } from "@/lib/providers/types";
import { CountrySummary, ImportJobRecord, SubmissionRecord, Venue } from "@/lib/types";

const csvProvider = new CsvVenueProvider();

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
    const realVenues = (await csvProvider.listVenues()).map((venue) => ({
      ...venue,
      isRealVenue: true
    }));
    const demoGeneratedVenues = demoVenues.map((venue) => ({
      ...venue,
      isRealVenue: false
    }));

    let results = [...realVenues, ...demoGeneratedVenues];

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
        params.atmosphere!.some((tag) =>
          venue.atmosphereTags.includes(tag as Venue["atmosphereTags"][number])
        )
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

  async getVenueBySlug(slug: string): Promise<Venue | null> {
    return csvProvider.getVenueBySlug(slug);
  }

  async listSubmissions(): Promise<SubmissionRecord[]> {
    return demoSubmissions;
  }

  async listImportJobs(): Promise<ImportJobRecord[]> {
    return demoImportJobs;
  }
}
