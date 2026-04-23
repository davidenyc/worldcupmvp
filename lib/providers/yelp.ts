import { rateLimit } from "@/lib/providers/rateLimit";
import { VenueProvider } from "@/lib/providers/types";
import { CountrySummary, ImportJobRecord, SubmissionRecord, Venue } from "@/lib/types";

// TODO: Use Yelp Fusion API only, with credentialed access and display-rule compliance.
export class YelpProvider implements VenueProvider {
  id = "yelp";
  label = "Yelp Fusion API";

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
