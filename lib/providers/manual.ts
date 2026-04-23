import { demoCountries, demoImportJobs, demoSubmissions } from "@/lib/data/demo";
import { CsvVenueProvider } from "@/lib/providers/csv";
import { VenueProvider } from "@/lib/providers/types";
import { CountrySummary, ImportJobRecord, SubmissionRecord, Venue } from "@/lib/types";

const csvProvider = new CsvVenueProvider();

export class ManualVenueProvider implements VenueProvider {
  id = "manual";
  label = "Manual curation";

  async listCountries(): Promise<CountrySummary[]> {
    return demoCountries;
  }

  async getCountryBySlug(slug: string): Promise<CountrySummary | null> {
    return demoCountries.find((country) => country.slug === slug) ?? null;
  }

  async listVenues(): Promise<Venue[]> {
    return csvProvider.listVenues();
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
