import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { demoCountries, demoImportJobs, demoSubmissions } from "@/lib/data/demo";
import { VenueProvider } from "@/lib/providers/types";
import { LegacyVenueIntentKey, normalizeVenueIntent } from "@/lib/venueIntents";
import {
  BoroughKey,
  CapacityBucket,
  CountrySummary,
  ImportJobRecord,
  ReservationType,
  SubmissionRecord,
  Venue,
  VenueTypeKey
} from "@/lib/types";
import { VenueSearchParams } from "./types";
import { rateLimit } from "@/lib/providers/rateLimit";
import { slugify } from "@/lib/utils";

type CsvVenueOverride = {
  slug: string;
  name: string;
  address: string;
  borough: BoroughKey;
  neighborhood: string;
  lat: number;
  lng: number;
  likelySupporterCountry: string | null;
  venueTypes: VenueTypeKey[];
  venueIntent: LegacyVenueIntentKey;
  showsSoccer: boolean;
  rating?: number;
  gameDayScore?: number;
  website?: string;
  notes?: string;
  approximateCapacity?: number;
  reservationType?: ReservationType;
  reservationUrl?: string;
  reservationPhone?: string;
};

const defaultCsvPath = join(process.cwd(), "lib/data/realVenues.csv");
const csvOverrideCache = new Map<string, Promise<CsvVenueOverride[]>>();

const countryNameBySlug = new Map(demoCountries.map((country) => [country.slug, country.name] as const));

function parsePostalCode(address: string) {
  const match = address.match(/\b\d{5}(?:-\d{4})?\b/);
  return match?.[0] ?? "";
}

function capacityBucketFromValue(value?: number): CapacityBucket {
  if (!value || value < 30) return "under_30";
  if (value <= 60) return "30_60";
  if (value <= 100) return "60_100";
  if (value <= 200) return "100_200";
  return "200_plus";
}

function atmosphereForOverride(row: CsvVenueOverride) {
  const tags = new Set<string>();
  const normalizedIntent = normalizeVenueIntent(row.venueIntent);

  if (normalizedIntent === "cultural_restaurant") {
    tags.add("authentic-food");
    tags.add("casual");
  } else {
    tags.add("watch-party");
    tags.add("loud");
  }

  if (row.venueTypes.some((type) => type === "supporter_club")) tags.add("supporters-club");
  if (row.venueTypes.some((type) => type === "bakery" || type === "cafe")) tags.add("brunch");
  if (row.venueTypes.some((type) => type === "lounge" || type === "bar")) tags.add("late-night");
  if (normalizedIntent !== "cultural_restaurant" && row.approximateCapacity && row.approximateCapacity >= 80) {
    tags.add("big-groups");
  }
  if (normalizedIntent !== "cultural_restaurant" && row.venueTypes.some((type) => type === "bar" || type === "lounge")) {
    tags.add("outdoor");
  }

  return Array.from(tags) as Venue["atmosphereTags"];
}

function cuisineTagsForOverride(row: CsvVenueOverride) {
  const countryName = row.likelySupporterCountry ? countryNameBySlug.get(row.likelySupporterCountry) : null;
  const tags = new Set<string>();
  const normalizedIntent = normalizeVenueIntent(row.venueIntent);

  if (countryName) {
    tags.add(countryName.toLowerCase());
    tags.add(`${countryName.toLowerCase()} cuisine`);
  }

  if (normalizedIntent === "cultural_restaurant") tags.add("authentic food");
  if (row.venueTypes.some((type) => type === "bar" || type === "lounge")) tags.add("match-day drinks");
  if (row.venueTypes.some((type) => type === "bakery" || type === "cafe")) tags.add("coffee");

  return Array.from(tags);
}

function numberOfScreensForOverride(row: CsvVenueOverride) {
  if (!row.showsSoccer) return row.venueTypes.some((type) => type === "cafe" || type === "bakery") ? 1 : 2;
  if (row.venueTypes.some((type) => type === "supporter_club")) return 8;
  if (row.venueTypes.some((type) => type === "bar" || type === "lounge")) return row.gameDayScore && row.gameDayScore >= 8 ? 6 : 4;
  return 2;
}

function buildVenueFromCsvRow(row: CsvVenueOverride): Venue {
  const now = "2026-04-23T00:00:00.000Z";
  const normalizedIntent = normalizeVenueIntent(row.venueIntent);
  const gameDayScore = row.gameDayScore ?? 6.5;
  const reviewCount = Math.max(12, Math.round((row.rating ?? 4.3) * 18));
  const sourceConfidence = row.notes?.toLowerCase().includes("low_confidence") ? 0.68 : 0.96;
  const approximateCapacity = row.approximateCapacity ?? (normalizedIntent === "cultural_restaurant" ? 54 : 90);
  const reservationType = row.reservationType ?? "none";
  const acceptsReservations = reservationType !== "none";
  const numberOfScreens = numberOfScreensForOverride(row);
  const hasProjector = row.showsSoccer && row.venueTypes.some((type) => type === "bar" || type === "lounge" || type === "supporter_club");
  const hasOutdoorViewing = row.venueTypes.some((type) => type === "lounge" || type === "bar") && row.showsSoccer;
  const familyFriendly = normalizedIntent === "cultural_restaurant" || row.venueTypes.some((type) => type === "cafe" || type === "bakery" || type === "restaurant");
  const standingRoomFriendly = row.showsSoccer || row.venueTypes.some((type) => type === "bar" || type === "lounge" || type === "supporter_club");
  const privateEventsAvailable = acceptsReservations || row.venueTypes.includes("supporter_club");
  const goodForGroups = approximateCapacity >= 75 || normalizedIntent !== "cultural_restaurant";
  const capacityBucket = capacityBucketFromValue(approximateCapacity);
  const isFeatured = gameDayScore >= 8.1 || row.showsSoccer;
  const isOfficialFanHub = row.showsSoccer && gameDayScore >= 8.6;
  const editorialBoost = isFeatured ? 0.8 : 0.35;
  const fanLikelihoodScore = row.showsSoccer
    ? Math.min(9.6, gameDayScore + (row.likelySupporterCountry ? 1.1 : 0.4))
    : Math.min(8.2, gameDayScore + 0.2);

  return {
    id: row.slug,
    slug: row.slug,
    name: row.name,
    description: row.notes || `${row.name} in ${row.neighborhood}, one of the US host cities.`,
    address: row.address,
    city: "New York",
    state: "NY",
    postalCode: parsePostalCode(row.address),
    lat: row.lat,
    lng: row.lng,
    borough: row.borough,
    neighborhood: row.neighborhood,
    phone: row.reservationPhone,
    website: row.website,
    instagramUrl: undefined,
    venueTypes: row.venueTypes,
    associatedCountries: row.likelySupporterCountry ? [row.likelySupporterCountry] : [],
    likelySupporterCountry: row.likelySupporterCountry,
    venueIntent: normalizedIntent,
    cuisineTags: cuisineTagsForOverride(row),
    atmosphereTags: atmosphereForOverride(row),
    showsSoccer: row.showsSoccer,
    openNow: true,
    priceLevel: normalizedIntent === "cultural_restaurant" ? 3 : 2,
    rating: row.rating,
    reviewCount,
    numberOfScreens,
    hasProjector,
    hasOutdoorViewing,
    familyFriendly,
    standingRoomFriendly,
    privateEventsAvailable,
    goodForGroups,
    acceptsReservations,
    reservationType,
    reservationUrl: row.reservationUrl,
    reservationPhone: row.reservationPhone,
    approximateCapacity,
    capacityBucket,
    capacityConfidence: row.notes?.toLowerCase().includes("low_confidence") ? "estimated" : "verified_by_venue",
    sourceType: "curated_csv",
    sourceName: "realVenues.csv",
    sourceExternalId: row.slug,
    sourceConfidence,
    verificationStatus: "imported",
    isFeatured,
    isOfficialFanHub,
    gameDayScore,
    fanLikelihoodScore,
    editorialBoost,
    editorialNotes: row.notes,
    matchdayNotes: row.notes,
    supporterNotes: row.notes,
    imageUrls: [],
    createdAt: now,
    updatedAt: now
  } satisfies Venue;
}

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseBoolean(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

function parseNumber(value: string | undefined) {
  if (!value || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseCsv(content: string) {
  const rows = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (!rows.length) return [];

  const headers = splitCsvLine(rows[0]).map((header) => header.trim());

  return rows.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return headers.reduce<Record<string, string>>((accumulator, header, index) => {
      accumulator[header] = cells[index] ?? "";
      return accumulator;
    }, {});
  });
}

function hydrateOverride(row: Record<string, string>): CsvVenueOverride {
  return {
    slug: row.slug,
    name: row.name,
    address: row.address,
    borough: row.borough as BoroughKey,
    neighborhood: row.neighborhood,
    lat: Number(row.lat),
    lng: Number(row.lng),
    likelySupporterCountry: row.likelySupporterCountry.trim() ? row.likelySupporterCountry : null,
    venueTypes: row.venueTypes
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean) as VenueTypeKey[],
    venueIntent: row.venueIntent as LegacyVenueIntentKey,
    showsSoccer: parseBoolean(row.showsSoccer),
    rating: parseNumber(row.rating),
    gameDayScore: parseNumber(row.gameDayScore),
    website: row.website || undefined,
    notes: row.notes || undefined,
    approximateCapacity: parseNumber(row.approximateCapacity),
    reservationType: (row.reservationType as ReservationType) || undefined,
    reservationUrl: row.reservationUrl || undefined,
    reservationPhone: row.reservationPhone || undefined
  };
}

export async function loadRealVenueCsvOverrides(csvPath = defaultCsvPath): Promise<CsvVenueOverride[]> {
  const cached = csvOverrideCache.get(csvPath);
  if (cached) return cached;

  const promise = (async () => {
    try {
      const content = await readFile(csvPath, "utf8");
      return parseCsv(content).map(hydrateOverride).filter((row) => row.slug.length > 0);
    } catch {
      return [];
    }
  })();

  csvOverrideCache.set(csvPath, promise);
  return promise;
}

function isNewYorkCitySearch(city?: string) {
  if (!city) return true;
  const normalized = slugify(city);
  return normalized === "nyc" || normalized === "new-york" || normalized === "new-york-city";
}

export function clearRealVenueCsvCache(csvPath = defaultCsvPath) {
  csvOverrideCache.delete(csvPath);
}

export class CsvVenueProvider implements VenueProvider {
  id = "csv";
  label = "CSV Import";

  constructor(private readonly csvPath: string = defaultCsvPath) {}

  async listCountries(): Promise<CountrySummary[]> {
    await rateLimit(this.id);
    return demoCountries;
  }

  async getCountryBySlug(slug: string): Promise<CountrySummary | null> {
    await rateLimit(this.id);
    return demoCountries.find((country) => country.slug === slug) ?? null;
  }

  async listVenues(params?: VenueSearchParams): Promise<Venue[]> {
    await rateLimit(this.id);
    const overrides = await loadRealVenueCsvOverrides(this.csvPath);
    const venues = overrides.map((row) => buildVenueFromCsvRow(row));

    if (params?.city && !isNewYorkCitySearch(params.city)) {
      return [];
    }

    if (params?.countrySlug) {
      return venues.filter((venue) => venue.associatedCountries.includes(params.countrySlug!));
    }

    return venues;
  }

  async getVenueBySlug(slug: string): Promise<Venue | null> {
    await rateLimit(this.id);
    return (await this.listVenues()).find((venue) => venue.slug === slug) ?? null;
  }

  async listSubmissions(): Promise<SubmissionRecord[]> {
    await rateLimit(this.id);
    return demoSubmissions;
  }

  async listImportJobs(): Promise<ImportJobRecord[]> {
    await rateLimit(this.id);
    return demoImportJobs;
  }
}
