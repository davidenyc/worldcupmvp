import {
  CountrySummary,
  ImportJobRecord,
  SubmissionRecord,
  Venue,
  VenueSourceRecord
} from "@/lib/types";

export interface VenueSearchParams {
  countrySlug?: string;
  priceLevel?: number;
  venueTypes?: string[];
  borough?: string;
  neighborhood?: string;
  showsSoccer?: boolean;
  openNow?: boolean;
  takesReservations?: boolean;
  capacityBucket?: string;
  atmosphere?: string[];
  query?: string;
}

export interface NormalizedVenueRecord {
  venue: Venue;
  sourceRecord: VenueSourceRecord;
}

export interface VenueProvider {
  id: string;
  label: string;
  listCountries(): Promise<CountrySummary[]>;
  getCountryBySlug(slug: string): Promise<CountrySummary | null>;
  listVenues(params?: VenueSearchParams): Promise<Venue[]>;
  getVenueBySlug(slug: string): Promise<Venue | null>;
  listSubmissions(): Promise<SubmissionRecord[]>;
  listImportJobs(): Promise<ImportJobRecord[]>;
}
