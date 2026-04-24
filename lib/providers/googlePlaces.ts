import { readPlacesCache, isFreshPlacesCache, writePlacesCache } from "../cache/places";
import { demoCountries } from "../data/demo";
import { getHostCity } from "../data/hostCities";
import { slugify } from "../utils";
import { rateLimit } from "./rateLimit";
import { VenueProvider, VenueSearchParams } from "./types";
import {
  BoroughKey,
  CapacityBucket,
  CountrySummary,
  ImportJobRecord,
  ReservationType,
  SubmissionRecord,
  Venue,
  VenueIntentKey,
  VenueTypeKey
} from "../types";

export type GooglePlacesSearchParams = VenueSearchParams & {
  cityLat?: number;
  cityLng?: number;
};

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  googleMapsUri?: string;
  regularOpeningHours?: { openNow?: boolean } | null;
  priceLevel?: number;
  types?: string[];
};

type GooglePlacesResponse = {
  places?: GooglePlace[];
};

const GOOGLE_PLACES_SEARCH_URL =
  process.env.GOOGLE_PLACES_TEXT_SEARCH_URL ?? "https://places.googleapis.com/v1/places:searchText";
const countryNameBySlug = new Map(demoCountries.map((country) => [country.slug, country.name] as const));

function parsePostalCode(address?: string) {
  const match = address?.match(/\b\d{5}(?:-\d{4})?\b/);
  return match?.[0] ?? "";
}

function venueTypesFromGoogleTypes(types: string[] = []) {
  const normalized = new Set(types.map((type) => type.toLowerCase()));
  const venueTypes: VenueTypeKey[] = [];

  if (normalized.has("bar") || normalized.has("night_club")) venueTypes.push("bar");
  if (normalized.has("restaurant")) venueTypes.push("restaurant");
  if (normalized.has("cafe") || normalized.has("coffee_shop")) venueTypes.push("cafe");
  if (normalized.has("bakery")) venueTypes.push("bakery");
  if (normalized.has("lounge")) venueTypes.push("lounge");
  if (normalized.has("cultural_center") || normalized.has("community_center")) {
    venueTypes.push("cultural_center");
  }
  if (
    normalized.has("sports_bar") ||
    normalized.has("pub") ||
    normalized.has("social_club") ||
    normalized.has("supporter_club")
  ) {
    venueTypes.push("supporter_club");
  }

  return Array.from(new Set(venueTypes)) as VenueTypeKey[];
}

function venueIntentFromTypes(types: VenueTypeKey[]): VenueIntentKey {
  if (types.includes("bar") || types.includes("lounge") || types.includes("supporter_club")) {
    return "sports_bar";
  }
  if (types.length === 1 && types[0] === "restaurant") {
    return "cultural_dining";
  }
  return "both";
}

function capacityBucketFromEstimate(value?: number): CapacityBucket {
  if (!value || value < 30) return "under_30";
  if (value <= 60) return "30_60";
  if (value <= 100) return "60_100";
  if (value <= 200) return "100_200";
  return "200_plus";
}

function deriveBorough(_cityKey: string): BoroughKey {
  return "Manhattan";
}

function calculateGameDayScore(rating?: number, reviewCount?: number, intent: VenueIntentKey = "both") {
  const ratingBoost = rating ? Math.max(0, rating - 3.6) * 1.15 : 0.5;
  const reviewBoost = reviewCount ? Math.min(reviewCount / 250, 1.5) : 0.25;
  const intentBoost = intent === "sports_bar" ? 1.3 : intent === "both" ? 1 : 0.25;
  return Math.min(10, Math.max(3.5, 4.2 + ratingBoost + reviewBoost + intentBoost));
}

function buildSearchQueries(params: GooglePlacesSearchParams, cityLabel?: string, cityCountry?: string) {
  const resolvedLabel = cityLabel ?? params.city ?? "city";
  const countryName = params.countrySlug ? countryNameBySlug.get(params.countrySlug) ?? params.countrySlug : "country";
  const english = `${countryName} bar restaurant soccer watch party ${resolvedLabel}`;

  if (cityCountry === "mexico") {
    return [english, `${countryName} bar restaurante futbol ver partido ${resolvedLabel}`];
  }

  return [english];
}

async function fetchGooglePlacesForQuery(params: GooglePlacesSearchParams, textQuery: string): Promise<Venue[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    return [];
  }

  await rateLimit("google-places-search");
  const requestBody: Record<string, unknown> = {
    textQuery,
    maxResultCount: 10
  };

  if (typeof params.cityLat === "number" && typeof params.cityLng === "number") {
    requestBody.locationBias = {
      circle: {
        center: {
          latitude: params.cityLat,
          longitude: params.cityLng
        },
        radius: 25_000
      }
    };
  }

  try {
    const response = await fetch(GOOGLE_PLACES_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.websiteUri,places.googleMapsUri,places.regularOpeningHours,places.priceLevel,places.types,places.photos"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.warn(`Google Places search failed for ${textQuery}: ${response.status} ${response.statusText}`);
      return [];
    }

    const payload = (await response.json()) as GooglePlacesResponse;
    return (payload.places ?? [])
      .map((place) => buildVenueFromGooglePlace(params, place))
      .filter((venue): venue is Venue => venue !== null);
  } catch (error) {
    console.warn(`Google Places search error for ${textQuery}:`, error);
    return [];
  }
}

function buildVenueFromGooglePlace(params: GooglePlacesSearchParams, place: GooglePlace): Venue | null {
  const city = getHostCity(params.city);
  const name = place.displayName?.text?.trim();
  const latitude = place.location?.latitude;
  const longitude = place.location?.longitude;

  if (!name || typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  const venueTypes = venueTypesFromGoogleTypes(place.types ?? []);
  const venueIntent = venueIntentFromTypes(venueTypes);
  const reviewCount = place.userRatingCount ?? 0;
  const rating = place.rating ?? 4;
  const gameDayScore = calculateGameDayScore(rating, reviewCount, venueIntent);
  const slug = slugify(`${city?.key ?? params.city ?? "city"}-${params.countrySlug}-${name}`);
  const borough = deriveBorough(city?.key ?? params.city ?? "nyc");
  const address = place.formattedAddress?.trim() || `${city?.label ?? params.city ?? "Host city"} venue`;
  const countryName = params.countrySlug ? countryNameBySlug.get(params.countrySlug) ?? params.countrySlug : "country";
  const approximateCapacity = venueTypes.includes("supporter_club")
    ? 120
    : venueTypes.includes("bar") || venueTypes.includes("lounge")
      ? 70
      : 45;
  const reservationType: ReservationType = place.websiteUri ? "external_url" : "none";
  const acceptsReservations = reservationType !== "none";
  const openNow = place.regularOpeningHours?.openNow ?? true;
  const sourceConfidence = 0.92;

  return {
    id: slug,
    slug,
    name,
    description: `${name} in ${city?.label ?? params.city ?? "the host city"} for ${countryName}.`,
    address,
    city: city?.label ?? params.city ?? "",
    state: city?.state ?? "NY",
    postalCode: parsePostalCode(address),
    lat: latitude,
    lng: longitude,
    borough,
    neighborhood: city?.label ?? params.city ?? "Metro area",
    phone: undefined,
    website: place.websiteUri,
    googleMapsUrl: place.googleMapsUri,
    instagramUrl: undefined,
    venueTypes,
    associatedCountries: params.countrySlug ? [params.countrySlug] : [],
    likelySupporterCountry: params.countrySlug ?? null,
    venueIntent,
    cuisineTags: params.countrySlug ? [countryName.toLowerCase(), `${countryName.toLowerCase()} cuisine`] : [],
    atmosphereTags: (
      venueIntent === "cultural_dining" ? ["casual", "authentic-food"] : ["watch-party", "loud", "big-groups"]
    ) as Venue["atmosphereTags"],
    showsSoccer: venueIntent !== "cultural_dining",
    openNow,
    priceLevel: typeof place.priceLevel === "number" ? place.priceLevel : venueIntent === "cultural_dining" ? 3 : 2,
    rating,
    reviewCount,
    numberOfScreens: venueIntent === "cultural_dining" ? 1 : venueIntent === "both" ? 3 : 5,
    hasProjector: venueIntent !== "cultural_dining",
    hasOutdoorViewing: venueIntent !== "cultural_dining" && venueTypes.includes("bar"),
    familyFriendly: venueIntent === "cultural_dining" || venueTypes.includes("cafe") || venueTypes.includes("bakery"),
    standingRoomFriendly: venueIntent !== "cultural_dining",
    privateEventsAvailable: acceptsReservations,
    goodForGroups: venueIntent !== "cultural_dining" || approximateCapacity >= 80,
    acceptsReservations,
    reservationType,
    reservationUrl: place.websiteUri,
    reservationPhone: undefined,
    approximateCapacity,
    capacityBucket: capacityBucketFromEstimate(approximateCapacity),
    capacityConfidence: "estimated",
    sourceType: "official_api",
    sourceName: "Google Places",
    sourceExternalId: place.id,
    sourceConfidence,
    verificationStatus: "imported",
    isRealVenue: true,
    isFeatured: gameDayScore >= 8,
    isOfficialFanHub: gameDayScore >= 8.7 && venueIntent !== "cultural_dining",
    gameDayScore,
    fanLikelihoodScore: Math.min(10, gameDayScore + (params.countrySlug ? 0.8 : 0.25)),
    editorialBoost: 0.15,
    editorialNotes: undefined,
    matchdayNotes: undefined,
    supporterNotes: undefined,
    imageUrls: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export async function searchGooglePlacesVenues(params: GooglePlacesSearchParams): Promise<Venue[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const resolvedCity = getHostCity(params.city);
  const cityKey = slugify(resolvedCity?.key ?? params.city ?? "");
  const countrySlug = params.countrySlug?.trim();

  if (!cityKey || !countrySlug) {
    return [];
  }

  const fresh = await isFreshPlacesCache(cityKey, countrySlug);
  const cached = fresh ? await readPlacesCache(cityKey, countrySlug) : null;
  if (cached !== null) {
    return cached;
  }

  if (!apiKey) {
    console.warn("GOOGLE_PLACES_API_KEY is missing; returning no Google Places venues.");
    return [];
  }

  const queries = buildSearchQueries(params, resolvedCity?.label, resolvedCity?.country);
  const resultsById = new Map<string, Venue>();

  for (const query of queries) {
    const venues = await fetchGooglePlacesForQuery(params, query);
    for (const venue of venues) {
      const key = venue.sourceExternalId ?? venue.slug;
      if (!resultsById.has(key)) {
        resultsById.set(key, venue);
      }
    }
  }

  const venues = Array.from(resultsById.values());
  await writePlacesCache(cityKey, countrySlug, venues);
  return venues;
}

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

  async listVenues(params?: VenueSearchParams): Promise<Venue[]> {
    await rateLimit(this.id);
    if (!params?.city || !params.countrySlug) return [];
    return searchGooglePlacesVenues(params);
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
