import "server-only";

import { getHostCity } from "@/lib/data/hostCities";
import { worldCup2026Matches, type WorldCupMatch } from "@/lib/data/matches";
import { getAllCountries, getMapPageData } from "@/lib/data/repository";
import { getCityTimeZone } from "@/lib/data/cityTimezones";
import { type MatchWindow, classifyMatch } from "@/lib/time/matchWindows";
import { getCrowdSignal } from "@/lib/social/crowdSignals";
import { getSeededGoingCount } from "@/lib/social/seededGoingCount";
import { getStrongestCrowdNeighborhood } from "@/lib/social/strongestCrowdNeighborhood";

type MatchCountry = {
  slug: string;
  name: string;
  flagEmoji: string;
};

export interface TonightHeroData {
  matchId: string;
  homeCountry: MatchCountry;
  awayCountry: MatchCountry;
  startsAt: string;
  cityKey: string;
  cityLabel: string;
  venueCount: number;
  projectedGoingCount: number;
  crowdSignalCopy: string;
  topNeighborhood: { name: string; venueCount: number; supporterCountrySlug: string } | null;
  countdownSeed: string;
  isUserMatch: boolean;
  timeContext: ReturnType<typeof classifyMatch>;
}

export type TonightFeed = {
  hero: TonightHeroData | null;
  carousel: TonightHeroData[];
  windowLabel: string;
};

function sortMatchesByStart(matches: WorldCupMatch[]) {
  return [...matches].sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt));
}

function getWindowPriority(window: MatchWindow) {
  switch (window) {
    case "live":
      return 0;
    case "tonight":
      return 1;
    case "today":
      return 2;
    case "tomorrow":
      return 3;
    case "upcoming":
      return 4;
    case "past":
      return 5;
    default:
      return 99;
  }
}

function pickWindowLabel(matches: TonightHeroData[]) {
  if (matches.some((match) => match.timeContext.window === "live" || match.timeContext.window === "tonight")) {
    return "Tonight";
  }

  if (matches.some((match) => match.timeContext.window === "today")) {
    return "Today";
  }

  if (matches.some((match) => match.timeContext.window === "tomorrow")) {
    return "Tomorrow";
  }

  return "Next match day";
}

function buildCountryLookup(countries: Awaited<ReturnType<typeof getAllCountries>>) {
  return new Map(countries.map((country) => [country.slug, country] as const));
}

function selectCandidateMatches(now: Date, timeZone: string) {
  return sortMatchesByStart(worldCup2026Matches)
    .map((match) => ({ match, timeContext: classifyMatch(match, now, timeZone) }))
    .filter(({ match, timeContext }) => {
      if (timeContext.window === "past") {
        return false;
      }

      return Date.parse(match.startsAt) - now.getTime() <= 14 * 24 * 60 * 60 * 1000;
    })
    .slice(0, 24);
}

function pickHeroAndCarousel(enriched: TonightHeroData[], userCountrySlug?: string): TonightFeed {
  const liveTonightToday = enriched.filter((entry) =>
    ["live", "tonight", "today"].includes(entry.timeContext.window)
  );
  const tomorrowMatches = enriched.filter((entry) => entry.timeContext.window === "tomorrow");
  const upcomingMatches = enriched.filter((entry) => entry.timeContext.window === "upcoming");

  const carousel =
    liveTonightToday.length > 0
      ? liveTonightToday
      : tomorrowMatches.length > 0
        ? tomorrowMatches
        : upcomingMatches.slice(0, 6);

  const sortedCarousel = [...carousel].sort((left, right) => {
    const priorityDelta = getWindowPriority(left.timeContext.window) - getWindowPriority(right.timeContext.window);
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return Date.parse(left.startsAt) - Date.parse(right.startsAt);
  });

  const hero =
    sortedCarousel.find(
      (entry) =>
        Boolean(userCountrySlug) &&
        entry.isUserMatch &&
        (entry.timeContext.window === "today" || entry.timeContext.window === "tonight")
    ) ??
    sortedCarousel.find((entry) => entry.timeContext.window === "tonight") ??
    sortedCarousel.find((entry) => entry.timeContext.window === "today") ??
    sortedCarousel[0] ??
    null;

  return {
    hero,
    carousel: sortedCarousel,
    windowLabel: pickWindowLabel(sortedCarousel)
  };
}

export async function getTonightFeed(cityKey: string, userCountrySlug?: string): Promise<TonightFeed> {
  const [mapData, countries] = await Promise.all([getMapPageData(cityKey), getAllCountries()]);
  const city = getHostCity(cityKey) ?? getHostCity("nyc");
  const timeZone = getCityTimeZone(cityKey);
  const now = new Date();
  const countryLookup = buildCountryLookup(countries);
  const candidateMatches = selectCandidateMatches(now, timeZone);

  const enriched = candidateMatches
    .map<TonightHeroData | null>(({ match, timeContext }) => {
      const home = countryLookup.get(match.homeCountry);
      const away = countryLookup.get(match.awayCountry);

      if (!home || !away || !city) {
        return null;
      }

      const matchingVenues = mapData.venues.filter((venue) => {
        if (venue.likelySupporterCountry === match.homeCountry || venue.likelySupporterCountry === match.awayCountry) {
          return true;
        }

        return venue.associatedCountries.includes(match.homeCountry) || venue.associatedCountries.includes(match.awayCountry);
      });
      const projectedGoingCount = matchingVenues.reduce(
        (total, venue) => total + getSeededGoingCount(match.id, venue.slug, venue),
        0
      );
      const crowdSignal = getCrowdSignal(Math.round(projectedGoingCount / Math.max(1, matchingVenues.length || 1)));

      const crowdCandidates = [match.homeCountry, match.awayCountry]
        .map((countrySlug) => {
          const neighborhood = getStrongestCrowdNeighborhood(match.id, city.key, countrySlug, mapData.venues);
          return neighborhood
            ? {
                name: neighborhood.neighborhood,
                venueCount: neighborhood.venueCount,
                supporterCountrySlug: countrySlug
              }
            : null;
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
        .sort((left, right) => right.venueCount - left.venueCount);

      return {
        matchId: match.id,
        homeCountry: {
          slug: home.slug,
          name: home.name,
          flagEmoji: home.flagEmoji
        },
        awayCountry: {
          slug: away.slug,
          name: away.name,
          flagEmoji: away.flagEmoji
        },
        startsAt: match.startsAt,
        cityKey: city.key,
        cityLabel: city.shortLabel,
        venueCount: matchingVenues.length,
        projectedGoingCount,
        crowdSignalCopy: crowdSignal.copy,
        topNeighborhood: crowdCandidates[0] ?? null,
        countdownSeed: match.startsAt,
        isUserMatch: Boolean(
          userCountrySlug && (match.homeCountry === userCountrySlug || match.awayCountry === userCountrySlug)
        ),
        timeContext
      };
    })
    .filter((entry): entry is TonightHeroData => Boolean(entry));

  return pickHeroAndCarousel(enriched, userCountrySlug);
}

export async function getFallbackTonightFeed(cityKey: string, userCountrySlug?: string): Promise<TonightFeed> {
  const countries = await getAllCountries();
  const city = getHostCity(cityKey) ?? getHostCity("nyc");
  const timeZone = getCityTimeZone(cityKey);
  const now = new Date();
  const countryLookup = buildCountryLookup(countries);
  const candidateMatches = selectCandidateMatches(now, timeZone);

  if (!city) {
    return { hero: null, carousel: [], windowLabel: "Next match day" };
  }

  const fallbackMatches = candidateMatches.filter(
    ({ timeContext }) => timeContext.window === "tomorrow" || timeContext.window === "upcoming"
  );

  const enriched = fallbackMatches
    .map<TonightHeroData | null>(({ match, timeContext }) => {
      const home = countryLookup.get(match.homeCountry);
      const away = countryLookup.get(match.awayCountry);

      if (!home || !away) {
        return null;
      }

      return {
        matchId: match.id,
        homeCountry: {
          slug: home.slug,
          name: home.name,
          flagEmoji: home.flagEmoji
        },
        awayCountry: {
          slug: away.slug,
          name: away.name,
          flagEmoji: away.flagEmoji
        },
        startsAt: match.startsAt,
        cityKey: city.key,
        cityLabel: city.shortLabel,
        venueCount: 0,
        projectedGoingCount: 0,
        crowdSignalCopy: "Match radar warming up",
        topNeighborhood: null,
        countdownSeed: match.startsAt,
        isUserMatch: Boolean(
          userCountrySlug && (match.homeCountry === userCountrySlug || match.awayCountry === userCountrySlug)
        ),
        timeContext
      };
    })
    .filter((entry): entry is TonightHeroData => Boolean(entry));

  return pickHeroAndCarousel(enriched, userCountrySlug);
}
