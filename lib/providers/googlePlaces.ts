import { VenueProvider } from "@/lib/providers/types";
import { CountrySummary, ImportJobRecord, SubmissionRecord, Venue } from "@/lib/types";
import { rateLimit } from "@/lib/providers/rateLimit";

// TODO: Use Google Places official APIs only. Respect attribution, caching, field masks, and map restrictions.
export class GooglePlacesProvider implements VenueProvider {
  id = "google-places";
  label = "Google Places API";

  async listCountries(): Promise<CountrySummary[]> {
    await rateLimit(this.id);
    return [];
  }

  async getCountryBySlug(): Promise<CountrySummary | null> {
    await rateLimit(this.id);
    return null;
  }

  async listVenues(): Promise<Venue[]> {
    await rateLimit(this.id);
    return [];
  }

  async getVenueBySlug(): Promise<Venue | null> {
    await rateLimit(this.id);
    return null;
  }

  async listSubmissions(): Promise<SubmissionRecord[]> {
    await rateLimit(this.id);
    return [];
  }

  async listImportJobs(): Promise<ImportJobRecord[]> {
    await rateLimit(this.id);
    return [];
  }
}
