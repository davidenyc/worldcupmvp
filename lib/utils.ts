import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RankedVenue, VenueIntentKey } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatScore(value: number) {
  return Math.round(value * 10) / 10;
}

export function formatPriceLevel(level?: number | null) {
  if (!level) return "N/A";
  return "$".repeat(level);
}

export function formatBorough(value: string) {
  return value.replace(/_/g, " ");
}

export function toTitleCase(value: string): string {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatCapacityBucket(bucket: string): string {
  switch (bucket) {
    case "under_30":
      return "Under 30";
    case "30_60":
      return "30–60";
    case "60_100":
      return "60–100";
    case "100_200":
      return "100–200";
    case "200_plus":
      return "200+";
    default:
      return toTitleCase(bucket.replace(/_/g, " "));
  }
}

export function getSoccerAtmosphereRating(params: {
  gameDayScore: number;
  fanLikelihoodScore: number;
  numberOfScreens: number;
  showsSoccer: boolean;
}): "High" | "Medium" | "Low" {
  const combinedScore =
    params.gameDayScore * 0.55 +
    params.fanLikelihoodScore * 0.25 +
    Math.min(params.numberOfScreens, 12) * 0.2;

  if (params.showsSoccer && combinedScore >= 6.8) {
    return "High";
  }

  if (params.showsSoccer || combinedScore >= 4.8) {
    return "Medium";
  }

  return "Low";
}

export function getVenueTvLabel(params: { numberOfScreens: number; showsSoccer: boolean }) {
  if (params.numberOfScreens <= 0) {
    return "No TVs — book a private event";
  }

  if (params.showsSoccer) {
    return "Has TV — shows soccer";
  }

  return "Has TV";
}

type VenueCopySubject = {
  name: string;
  neighborhood: string;
  city: string;
  venueIntent: VenueIntentKey;
  venueTypes: string[];
  likelySupporterCountry: string | null;
  numberOfScreens: number;
  showsSoccer: boolean;
  gameDayScore: number;
  fanLikelihoodScore: number;
  acceptsReservations: boolean;
  goodForGroups: boolean;
  approximateCapacity?: number;
  description?: string;
  editorialNotes?: string;
  supporterNotes?: string;
  matchdayNotes?: string;
};

const DEBUG_VENUE_COPY_PATTERN =
  /imported from|verified via|name match|type match|query:|watch-party style venue/i;

function isStockImportedDescription(value?: string | null) {
  if (!value) return true;
  return /^.+ is a .+ in .+\.$/i.test(value.trim()) || DEBUG_VENUE_COPY_PATTERN.test(value);
}

function getVenueIntentLabel(intent: VenueIntentKey) {
  switch (intent) {
    case "sports_bar":
      return "sports bar";
    case "bar_with_tv":
      return "bar with match coverage";
    case "cultural_bar":
      return "cultural bar";
    case "fan_fest":
      return "fan-fest room";
    case "cultural_restaurant":
    default:
      return "restaurant";
  }
}

function getGroupLabel(venue: VenueCopySubject) {
  if (venue.goodForGroups || (venue.approximateCapacity ?? 0) >= 90) {
    return "built for bigger groups";
  }
  return "easy to settle into with a small crew";
}

function getScreensLabel(venue: VenueCopySubject) {
  if (venue.numberOfScreens >= 8) return `${venue.numberOfScreens}+ screens`;
  if (venue.numberOfScreens > 0) return `${venue.numberOfScreens} screens`;
  if (venue.showsSoccer) return "reliable match coverage";
  return "watch-party friendly service";
}

function getReservationLabel(venue: VenueCopySubject) {
  return venue.acceptsReservations ? "reservations available" : "walk-in friendly";
}

export function hasDebugVenueCopy(value?: string | null) {
  return isStockImportedDescription(value);
}

export function getVenueDescriptionCopy(venue: VenueCopySubject, countryName?: string | null) {
  if (venue.description && !isStockImportedDescription(venue.description)) {
    return venue.description;
  }

  const supporterLabel = countryName ? `${countryName}-leaning crowd` : "mixed match crowd";
  return `${toTitleCase(getVenueIntentLabel(venue.venueIntent))} in ${venue.neighborhood} with ${getScreensLabel(venue)}, ${getReservationLabel(venue)}, and ${getGroupLabel(venue)} for a ${supporterLabel}.`;
}

export function getVenueEditorialCopy(venue: VenueCopySubject, countryName?: string | null) {
  if (venue.editorialNotes && !hasDebugVenueCopy(venue.editorialNotes)) {
    return venue.editorialNotes;
  }

  const atmosphere = getSoccerAtmosphereRating(venue as Pick<RankedVenue, "gameDayScore" | "fanLikelihoodScore" | "numberOfScreens" | "showsSoccer">)
    .toLowerCase();
  const countryLead = countryName ? `${countryName}-leaning ` : "";
  return `${toTitleCase(atmosphere)}-energy ${countryLead}${getVenueIntentLabel(venue.venueIntent)} with ${getScreensLabel(venue)} and ${getGroupLabel(venue)} on match day.`;
}

export function getVenueSupporterCopy(venue: VenueCopySubject, countryName?: string | null) {
  if (venue.supporterNotes && !hasDebugVenueCopy(venue.supporterNotes)) {
    return venue.supporterNotes;
  }

  if (countryName) {
    return `Expect a strong ${countryName} lean here on marquee nights, with ${getReservationLabel(venue)} and a room that feels ${getGroupLabel(venue)}.`;
  }

  return `A mixed-crowd room with ${getScreensLabel(venue)} and a dependable match-night setup for fans drifting in before kickoff.`;
}

export function getVenueMatchdayCopy(venue: VenueCopySubject, countryName?: string | null) {
  if (venue.matchdayNotes && !hasDebugVenueCopy(venue.matchdayNotes)) {
    return venue.matchdayNotes;
  }

  const countryLead = countryName ? `${countryName} supporters` : "fans";
  return `Best for ${countryLead} looking for ${getScreensLabel(venue)}, ${getReservationLabel(venue)}, and ${getGroupLabel(venue)} once the slate gets busy.`;
}
