export type ConfederationKey =
  | "AFC"
  | "CAF"
  | "Concacaf"
  | "CONMEBOL"
  | "OFC"
  | "UEFA";

export type VenueTypeKey =
  | "bar"
  | "restaurant"
  | "cafe"
  | "bakery"
  | "lounge"
  | "cultural_center"
  | "supporter_club";

export type BoroughKey =
  | "Manhattan"
  | "Brooklyn"
  | "Queens"
  | "Bronx"
  | "Staten Island";

export type CapacityBucket =
  | "under_30"
  | "30_60"
  | "60_100"
  | "100_200"
  | "200_plus";

export type CapacityConfidence = "estimated" | "verified_by_venue" | "user_submitted";

export type ReservationType =
  | "opentable"
  | "resy"
  | "external_url"
  | "phone"
  | "request_form"
  | "none";

export type VerificationStatus = "demo_editorial" | "imported" | "user_submitted" | "verified";

export type SourceType =
  | "editorial"
  | "curated_csv"
  | "user_submission"
  | "official_api"
  | "manual"
  | "partner";

export type AtmosphereKey =
  | "loud"
  | "casual"
  | "outdoor"
  | "family"
  | "late-night"
  | "supporters-club"
  | "brunch"
  | "big-groups"
  | "authentic-food"
  | "watch-party";

export type VenueIntentKey =
  | "watch_party"
  | "sports_bar"
  | "cultural_dining"
  | "both";

export interface CountrySummary {
  slug: string;
  name: string;
  fifaCode: string;
  iso2: string;
  confederation: ConfederationKey;
  continent: string;
  flagEmoji: string;
  flagAsset: string;
  primaryColors: [string, string];
  supportersLabel: string;
  supporterKeywords: string[];
  featured: boolean;
}

export interface BoroughSummary {
  key: BoroughKey;
  label: string;
  centerLat: number;
  centerLng: number;
}

export interface NeighborhoodSummary {
  id: string;
  name: string;
  borough: BoroughKey;
  lat: number;
  lng: number;
}

export interface VenueSourceRecord {
  sourceName: string;
  sourceType: SourceType;
  sourceExternalId?: string;
  sourceConfidence: number;
  attributionLabel: string;
}

export interface ReservationDetails {
  acceptsReservations: boolean;
  reservationType: ReservationType;
  reservationUrl?: string;
  reservationPhone?: string;
  reservationNotes?: string;
}

export interface VenueAmenitySnapshot {
  numberOfScreens: number;
  hasProjector: boolean;
  hasOutdoorViewing: boolean;
  familyFriendly: boolean;
  standingRoomFriendly: boolean;
  privateEventsAvailable: boolean;
  goodForGroups: boolean;
}

export interface Venue {
  id: string;
  slug: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  lat: number;
  lng: number;
  borough: BoroughKey;
  neighborhood: string;
  phone?: string;
  website?: string;
  instagramUrl?: string;
  venueTypes: VenueTypeKey[];
  associatedCountries: string[];
  likelySupporterCountry: string | null;
  venueIntent: VenueIntentKey;
  cuisineTags: string[];
  atmosphereTags: AtmosphereKey[];
  showsSoccer: boolean;
  openNow: boolean;
  priceLevel?: number;
  rating?: number;
  reviewCount?: number;
  numberOfScreens: number;
  hasProjector: boolean;
  hasOutdoorViewing: boolean;
  familyFriendly: boolean;
  standingRoomFriendly: boolean;
  privateEventsAvailable: boolean;
  goodForGroups: boolean;
  acceptsReservations: boolean;
  reservationType: ReservationType;
  reservationUrl?: string;
  reservationPhone?: string;
  approximateCapacity?: number;
  capacityBucket: CapacityBucket;
  capacityConfidence: CapacityConfidence;
  sourceType: SourceType;
  sourceName: string;
  sourceExternalId?: string;
  sourceConfidence: number;
  verificationStatus: VerificationStatus;
  isFeatured: boolean;
  isOfficialFanHub: boolean;
  gameDayScore: number;
  fanLikelihoodScore: number;
  editorialBoost: number;
  editorialNotes?: string;
  matchdayNotes?: string;
  supporterNotes?: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RankedVenue extends Venue {
  rankScore: number;
  rankingReasons: string[];
}

export interface CountryPageData {
  country: CountrySummary;
  venues: RankedVenue[];
  featuredVenues: RankedVenue[];
  largeGroupVenues: RankedVenue[];
  reservableVenues: RankedVenue[];
  authenticVibeVenues: RankedVenue[];
  matches: MatchCard[];
}

export interface SubmissionRecord {
  id: string;
  name: string;
  address: string;
  borough: BoroughKey;
  neighborhood?: string;
  website?: string;
  instagram?: string;
  countryAssociation: string;
  showsSoccer: boolean;
  acceptsReservations: boolean;
  approximateCapacity?: number;
  description: string;
  status: "pending" | "approved" | "rejected";
  sourceConfidence: number;
  createdAt: string;
}

export interface MatchCard {
  id: string;
  homeCountry: string;
  awayCountry: string;
  startsAt: string;
  competition: string;
  note: string;
}

export interface ImportJobRecord {
  id: string;
  sourceName: string;
  fileName: string;
  status: "draft" | "processing" | "completed";
  rowsProcessed: number;
  createdAt: string;
}

export interface CountryFilters {
  borough?: BoroughKey | "";
  neighborhood?: string;
  venueType?: VenueTypeKey | "";
  openNow?: boolean;
  takesReservations?: boolean;
  capacityBucket?: CapacityBucket | "";
  atmosphere?: AtmosphereKey | "";
  minRating?: number;
  goodForWatchingGames?: boolean;
  query?: string;
}

export type CountrySortKey =
  | "matchday"
  | "rating"
  | "capacity"
  | "reservations"
  | "neighborhood";
