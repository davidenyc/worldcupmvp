import type { HostCity } from "@/lib/data/hostCities";
import type { WorldCupMatch } from "@/lib/data/matches";
import type { RankedVenue } from "@/lib/types";

export type TodayPageMode = "all" | "bar" | "restaurant";

const BAR_INTENTS = new Set(["sports_bar", "bar_with_tv", "cultural_bar"]);

export function getDateKeyInTimeZone(dateLike: string | number | Date, timeZone: string) {
  const date = typeof dateLike === "string" || typeof dateLike === "number" ? new Date(dateLike) : dateLike;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function isBarModeVenue(venue: RankedVenue) {
  return BAR_INTENTS.has(venue.venueIntent);
}

export function isRestaurantModeVenue(venue: RankedVenue) {
  return venue.venueIntent === "cultural_restaurant";
}

export function filterVenuesByMode(venues: RankedVenue[], mode: TodayPageMode) {
  if (mode === "bar") return venues.filter(isBarModeVenue);
  if (mode === "restaurant") return venues.filter(isRestaurantModeVenue);
  return venues;
}

export function filterVenuesByMatch(venues: RankedVenue[], match: WorldCupMatch | null) {
  if (!match) return venues;
  const countries = new Set([match.homeCountry, match.awayCountry]);
  return venues.filter((venue) => {
    if (venue.likelySupporterCountry && countries.has(venue.likelySupporterCountry)) return true;
    return venue.associatedCountries.some((country) => countries.has(country));
  });
}

export function sortTodayVenues(venues: RankedVenue[], match: WorldCupMatch | null) {
  const countries = match ? new Set([match.homeCountry, match.awayCountry]) : null;
  return [...venues].sort((left, right) => {
    const leftBoost = countries
      ? Number(
          (left.likelySupporterCountry && countries.has(left.likelySupporterCountry)) ||
            left.associatedCountries.some((country) => countries.has(country))
        )
      : 0;
    const rightBoost = countries
      ? Number(
          (right.likelySupporterCountry && countries.has(right.likelySupporterCountry)) ||
            right.associatedCountries.some((country) => countries.has(country))
        )
      : 0;

    const scoreDelta = (right.gameDayScore + rightBoost) - (left.gameDayScore + leftBoost);
    if (scoreDelta !== 0) return scoreDelta;

    const reviewDelta = (right.reviewCount ?? 0) - (left.reviewCount ?? 0);
    if (reviewDelta !== 0) return reviewDelta;

    return (right.rating ?? 0) - (left.rating ?? 0);
  });
}

export function getMatchCollectionsForTimeZone(
  matches: WorldCupMatch[],
  timeZone: string,
  now = new Date()
) {
  const sorted = [...matches].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const todayKey = getDateKeyInTimeZone(now, timeZone);
  const todayMatches = sorted.filter((match) => getDateKeyInTimeZone(match.startsAt, timeZone) === todayKey);

  if (todayMatches.length > 0) {
    return {
      todayMatches,
      stripMatches: todayMatches,
      nextMatchDayMatches: todayMatches,
      daysUntilNext: 0
    };
  }

  const nextMatch = sorted.find((match) => Date.parse(match.startsAt) >= now.getTime()) ?? sorted[0] ?? null;
  if (!nextMatch) {
    return {
      todayMatches: [],
      stripMatches: [],
      nextMatchDayMatches: [],
      daysUntilNext: null as number | null
    };
  }

  const nextKey = getDateKeyInTimeZone(nextMatch.startsAt, timeZone);
  const nextMatchDayMatches = sorted.filter((match) => getDateKeyInTimeZone(match.startsAt, timeZone) === nextKey);
  const diffMs = new Date(`${nextKey}T00:00:00`).getTime() - new Date(`${todayKey}T00:00:00`).getTime();
  const daysUntilNext = Math.max(1, Math.round(diffMs / (24 * 60 * 60 * 1000)));

  return {
    todayMatches: [],
    stripMatches: nextMatchDayMatches,
    nextMatchDayMatches,
    daysUntilNext
  };
}

export function getVenueDistanceMiles(venue: RankedVenue, city: Pick<HostCity, "lat" | "lng">) {
  const earthRadiusMiles = 3958.8;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(venue.lat - city.lat);
  const dLng = toRadians(venue.lng - city.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(city.lat)) * Math.cos(toRadians(venue.lat)) * Math.sin(dLng / 2) ** 2;
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatMatchStageCompact(match: WorldCupMatch) {
  if (match.group) {
    const matchNumber = match.id.split("-")[1];
    return `Group ${match.group}${matchNumber ? ` · Match ${matchNumber}` : ""}`;
  }
  return match.stageLabel;
}
