import Link from "next/link";
import dynamic from "next/dynamic";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { HOST_CITIES } from "@/lib/data/hostCities";
import { getMatchHostCityKey } from "@/lib/data/matchLocations";
import { worldCup2026Matches } from "@/lib/data/matches";
import { getAdminQueue, getAllCountries, getMapPageData } from "@/lib/data/repository";
import { getFallbackTonightFeed, getTonightFeed, type TonightFeed } from "@/lib/hooks/useTonightFeed";
import { getSeededGoingCount } from "@/lib/social/seededGoingCount";
import { getVenueImageSet } from "@/lib/utils/venueImages";
import { ActionHero, ActionHeroError } from "./ActionHero";
import { AliveMatchCard } from "./AliveMatchCard";
import { FeaturedVenuesForMatch } from "./FeaturedVenuesForMatch";
import { HomeViewTracker } from "./HomeViewTracker";
import { LiveActivityTicker } from "./LiveActivityTicker";
import { PrimaryCountryStrip } from "./PrimaryCountryStrip";

const NorthAmericaMap = dynamic(() => import("./NorthAmericaMap").then((mod) => mod.NorthAmericaMap), {
  ssr: false
});

async function getCityVenueCount(cityKey: string) {
  const data = await getMapPageData(cityKey);
  return {
    venueCount: data.venues.length,
    reservableCount: data.venues.filter((venue) => venue.acceptsReservations).length
  };
}

function getMatchCount(cityKey: string) {
  return worldCup2026Matches.filter((match) => getMatchHostCityKey(match) === cityKey).length;
}

function getFeaturedMatchDay() {
  const now = Date.now();
  const upcoming = worldCup2026Matches
    .filter((match) => Date.parse(match.startsAt) >= now)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

  if (!upcoming.length) {
    return { label: "Next match", matches: [] as typeof worldCup2026Matches };
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayMatches = upcoming.filter((match) => match.startsAt.slice(0, 10) === todayKey);
  if (todayMatches.length) {
    return { label: "Today's matches", matches: todayMatches.slice(0, 6) };
  }

  const nextKey = upcoming[0]!.startsAt.slice(0, 10);
  return { label: "Next match day", matches: upcoming.filter((match) => match.startsAt.slice(0, 10) === nextKey).slice(0, 6) };
}

async function getResolvedTonightFeed(cityKey: string, userCountrySlug?: string) {
  try {
    return {
      feed: await getTonightFeed(cityKey, userCountrySlug),
      feedError: false
    };
  } catch {
    try {
      return {
        feed: await getFallbackTonightFeed(cityKey, userCountrySlug),
        feedError: false
      };
    } catch {
      return {
        feed: { hero: null, carousel: [], windowLabel: "Next match day" } satisfies TonightFeed,
        feedError: true
      };
    }
  }
}

function getPrimaryCountrySlug(match: TonightFeed["hero"], userCountrySlug?: string) {
  if (!match) return null;
  if (userCountrySlug && [match.homeCountry.slug, match.awayCountry.slug].includes(userCountrySlug)) {
    return userCountrySlug;
  }

  return match.homeCountry.slug;
}

export async function USAHomepage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const profile = user
    ? await prisma.profile.findUnique({
        where: { id: user.id }
      })
    : null;
  const activeCity = profile?.homeCity ?? profile?.favoriteCity ?? "nyc";
  const userCountrySlug = profile?.favoriteCountrySlug ?? undefined;

  const allCountries = await getAllCountries();
  const countryLookup = new Map(allCountries.map((country) => [country.slug, country] as const));
  const featuredMatchDay = getFeaturedMatchDay();
  const fallbackMatch = featuredMatchDay.matches[0]
    ? (() => {
        const match = featuredMatchDay.matches[0]!;
        const home = countryLookup.get(match.homeCountry);
        const away = countryLookup.get(match.awayCountry);

        if (!home || !away) return null;

        return {
          label: featuredMatchDay.label,
          homeLabel: `${home.flagEmoji} ${home.name}`,
          awayLabel: `${away.flagEmoji} ${away.name}`,
          startsAt: match.startsAt
        };
      })()
    : null;
  const [cityCards, tonightFeedResult, activeMapData] = await Promise.all([
    Promise.all(
      HOST_CITIES.map(async (city) => ({
        ...city,
        matchCount: getMatchCount(city.key),
        ...(await getCityVenueCount(city.key))
      }))
    ),
    getResolvedTonightFeed(activeCity, userCountrySlug),
    getMapPageData(activeCity)
  ]);
  const { feed: tonightFeed, feedError } = tonightFeedResult;
  const heroMatch = tonightFeed.hero;
  const featuredCountrySlug = getPrimaryCountrySlug(tonightFeed.hero, userCountrySlug);
  const featuredCountry = featuredCountrySlug ? countryLookup.get(featuredCountrySlug) ?? null : null;
  const featuredMatchVenues =
    heroMatch && featuredCountrySlug
      ? activeMapData.venues
          .filter((venue) => {
            if (
              venue.likelySupporterCountry === heroMatch.homeCountry.slug ||
              venue.likelySupporterCountry === heroMatch.awayCountry.slug
            ) {
              return true;
            }

            return (
              venue.associatedCountries.includes(heroMatch.homeCountry.slug) ||
              venue.associatedCountries.includes(heroMatch.awayCountry.slug)
            );
          })
          .map((venue) => ({
            slug: venue.slug,
            name: venue.name,
            neighborhood: venue.neighborhood,
            imageUrl: getVenueImageSet(venue)[0] ?? "/og/default.png",
            rating: venue.rating,
            goingCount: getSeededGoingCount(heroMatch.matchId, venue.slug, venue),
            acceptsReservations: venue.acceptsReservations,
            rankScore: venue.rankScore
          }))
          .sort((left, right) => right.goingCount - left.goingCount || right.rankScore - left.rankScore)
          .slice(0, 3)
      : [];
  const matchSectionTitle =
    tonightFeed.windowLabel === "Next match day"
      ? "Next match day"
      : tonightFeed.windowLabel === "Tomorrow"
        ? "Tomorrow's matches"
        : tonightFeed.windowLabel === "Today"
          ? "Today's matches"
          : "Tonight's matches";
  const emptyScheduleCopy =
    tonightFeed.windowLabel === "Next match day"
      ? "The next match day is coming up. Pick your city or team now and we’ll point you to the right room."
      : tonightFeed.windowLabel === "Tomorrow"
        ? "Tomorrow’s slate is coming into focus. Pick your city or team and we’ll get you there."
        : "Tonight’s slate is coming into focus. Pick your city or team and we’ll get you there.";

  return (
    <main className="bg-bg text-deep">
      <HomeViewTracker variant="active" />
      <section className="bg-bg">
        <div className="container-shell space-y-8 py-8 lg:py-12">
          <LiveActivityTicker />
          {feedError ? (
            <ActionHeroError />
          ) : (
            <ActionHero
              cityKey={activeCity}
              cityLabel={HOST_CITIES.find((city) => city.key === activeCity)?.shortLabel ?? "NYC"}
              userCountrySlug={userCountrySlug}
              initialFeed={tonightFeed}
              fallbackMatch={fallbackMatch ? {
                ...fallbackMatch,
                venueCount: cityCards.find((city) => city.key === activeCity)?.venueCount
              } : null}
            />
          )}
          {tonightFeed.hero && featuredCountry ? (
            <FeaturedVenuesForMatch
              cityKey={activeCity}
              countryLabel={featuredCountry.name}
              countrySlug={featuredCountry.slug}
              totalVenueCount={tonightFeed.hero.venueCount}
              venues={featuredMatchVenues}
              matchId={tonightFeed.hero.matchId}
            />
          ) : null}
          <PrimaryCountryStrip countries={allCountries} cityKey={activeCity} />
          <section>
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-mist">{tonightFeed.windowLabel}</div>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-deep">{matchSectionTitle}</h2>
              </div>
              <Link href="/today" className="text-sm font-semibold text-[color:var(--fg-primary)]">
                See all matches →
              </Link>
            </div>
            {tonightFeed.carousel.length ? (
              <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
                {tonightFeed.carousel.map((match) => (
                  <AliveMatchCard key={match.matchId} match={match} />
                ))}
              </div>
            ) : (
              <div className="mt-5 surface px-5 py-4 text-sm text-[color:var(--fg-secondary)]">
                {emptyScheduleCopy}
              </div>
            )}
          </section>
        </div>
      </section>

      <section className="bg-bg px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <details className="surface p-5">
            <summary className="cursor-pointer list-none text-sm font-semibold text-[color:var(--fg-primary)]">
              Tap to expand · 17 host cities
            </summary>
            <div className="mt-5">
              <NorthAmericaMap cityCards={cityCards} />
            </div>
          </details>

          <section className="surface px-5 py-4 text-sm font-medium text-[color:var(--fg-secondary)]">
            Pick your city. Pick your team. Show up before kickoff.
          </section>

          <footer className="px-1 text-sm text-[color:var(--fg-secondary)]">
            <Link href="/membership" className="font-medium text-[color:var(--fg-primary)]">Fan Pass</Link>
            {" · "}
            <Link href="/membership?tier=elite#membership-cards" className="font-medium text-[color:var(--fg-primary)]">Elite</Link>
            {" · "}
            <Link href="/membership?tier=free#membership-cards" className="font-medium text-[color:var(--fg-primary)]">Free</Link>
          </footer>
        </div>
      </section>
    </main>
  );
}
