"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { EmailCaptureBanner } from "@/components/marketing/EmailCaptureBanner";
import { MatchStrip } from "@/components/today/MatchStrip";
import { ModeToggle } from "@/components/today/ModeToggle";
import { TodayHero } from "@/components/today/TodayHero";
import { TodayVenueGrid } from "@/components/today/TodayVenueGrid";
import { TrustStrip } from "@/components/today/TrustStrip";
import { HOST_CITIES, type HostCity } from "@/lib/data/hostCities";
import {
  type TodayPageMode,
  filterVenuesByMatch,
  filterVenuesByMode,
  getMatchCollectionsForTimeZone,
  sortTodayVenues
} from "@/lib/data/today";
import type { WorldCupMatch } from "@/lib/data/matches";
import type { CountrySummary, RankedVenue } from "@/lib/types";

type TodayPageClientProps = {
  countries: CountrySummary[];
  city: HostCity;
  allMatches: WorldCupMatch[];
  allVenues: RankedVenue[];
  initialMode: TodayPageMode;
  initialMatchId: string | null;
  trustStats: {
    venueCount: number;
    nationCount: number;
    hostCityCount: number;
  };
};

function buildSearch(searchParams: URLSearchParams, updates: Record<string, string | null>) {
  const next = new URLSearchParams(searchParams.toString());
  Object.entries(updates).forEach(([key, value]) => {
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
  });
  return next.toString();
}

function getTodayHeadline(matchCount: number, cityLabel: string, nextMatch: WorldCupMatch | null, daysUntilNext: number | null) {
  if (matchCount > 0) {
    return `${matchCount} ${matchCount === 1 ? "match" : "matches"} today in ${cityLabel}`;
  }

  if (!nextMatch || daysUntilNext === null) {
    return "No matches are scheduled yet.";
  }

  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(nextMatch.startsAt));
  if (daysUntilNext === 1) {
    return `Next matches tomorrow — book your spot now.`;
  }

  if (daysUntilNext > 1) {
    return `Next matches ${weekday} — book your spot now.`;
  }

  return `Next matches in ${daysUntilNext} days`;
}

function getHeroSubhead() {
  return "World Cup 2026 watch parties in your city, ranked by atmosphere.";
}

function getHostingCount(venues: RankedVenue[], matches: WorldCupMatch[]) {
  if (matches.length === 0) return 0;
  const countries = new Set(matches.flatMap((match) => [match.homeCountry, match.awayCountry]));
  return venues.filter((venue) => {
    if (venue.likelySupporterCountry && countries.has(venue.likelySupporterCountry)) return true;
    return venue.associatedCountries.some((country) => countries.has(country));
  }).length;
}

function scrollToVenueList() {
  const target = document.getElementById("today-venue-list");
  if (!target) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

export function TodayPageClient({
  countries,
  city,
  allMatches,
  allVenues,
  initialMode,
  initialMatchId,
  trustStats
}: TodayPageClientProps) {
  const pathname = usePathname();
  const [mode, setMode] = useState<TodayPageMode>(initialMode);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(initialMatchId);
  const [visibleCount, setVisibleCount] = useState(12);
  const [timeZone, setTimeZone] = useState("America/New_York");

  function normalizeMode(value: string | null): TodayPageMode {
    if (value === "bar" || value === "restaurant") return value;
    return "all";
  }

  useEffect(() => {
    const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (localZone) setTimeZone(localZone);
  }, []);

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setMode(normalizeMode(params.get("mode")));
      setSelectedMatchId(params.get("match"));
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const countriesBySlug = useMemo(
    () => Object.fromEntries(countries.map((country) => [country.slug, country] as const)),
    [countries]
  );

  const matchCollections = useMemo(
    () => getMatchCollectionsForTimeZone(allMatches, timeZone, new Date()),
    [allMatches, timeZone]
  );

  const activeMatch = useMemo(
    () => allMatches.find((match) => match.id === selectedMatchId) ?? null,
    [allMatches, selectedMatchId]
  );

  const matchFilteredVenues = useMemo(
    () => filterVenuesByMatch(allVenues, activeMatch),
    [allVenues, activeMatch]
  );

  const modeCounts = useMemo(
    () => ({
      all: matchFilteredVenues.length,
      bar: filterVenuesByMode(matchFilteredVenues, "bar").length,
      restaurant: filterVenuesByMode(matchFilteredVenues, "restaurant").length
    }),
    [matchFilteredVenues]
  );

  const visibleVenues = useMemo(
    () => sortTodayVenues(filterVenuesByMode(matchFilteredVenues, mode), activeMatch),
    [matchFilteredVenues, mode, activeMatch]
  );

  useEffect(() => {
    setVisibleCount(12);
  }, [mode, selectedMatchId]);

  function replaceUrl(updates: Record<string, string | null>, shouldScroll = false) {
    const nextSearch = buildSearch(new URLSearchParams(window.location.search), updates);
    const nextUrl = nextSearch ? `${pathname}?${nextSearch}` : pathname;
    window.history.replaceState({}, "", nextUrl);
    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  function handleModeChange(nextMode: TodayPageMode) {
    setMode(nextMode);
    replaceUrl({ mode: nextMode }, false);
    scrollToVenueList();
  }

  function handleMatchSelect(matchId: string | null) {
    setSelectedMatchId(matchId);
    replaceUrl({ match: matchId }, false);
    scrollToVenueList();
  }

  const headline = getTodayHeadline(
    matchCollections.todayMatches.length,
    city.label,
    matchCollections.nextMatchDayMatches[0] ?? null,
    matchCollections.daysUntilNext
  );

  const reservationsCount = visibleVenues.filter((venue) => venue.acceptsReservations).length;
  const hostingCount = getHostingCount(visibleVenues, matchCollections.stripMatches);
  const badgeLabel =
    matchCollections.todayMatches.length > 0
      ? "Today"
      : matchCollections.daysUntilNext === 1
        ? "Tomorrow"
        : matchCollections.daysUntilNext
          ? `In ${matchCollections.daysUntilNext} days`
          : "Coming up";

  return (
    <main className="bg-bg pb-24">
      <div className="container-shell space-y-6 py-6 sm:space-y-8 sm:py-8">
        <TodayHero
          headline={headline}
          subhead={getHeroSubhead()}
          venueCount={visibleVenues.length}
          reservationsCount={reservationsCount}
          hostingCount={hostingCount}
          onFindSpot={scrollToVenueList}
        />

        <ModeToggle activeMode={mode} counts={modeCounts} onChange={handleModeChange} />

        <MatchStrip
          matches={matchCollections.stripMatches}
          countriesBySlug={countriesBySlug}
          activeMatchId={selectedMatchId}
          badgeLabel={badgeLabel}
          onSelect={handleMatchSelect}
        />

        <TodayVenueGrid
          venues={visibleVenues}
          visibleCount={visibleCount}
          city={city}
          countriesBySlug={countriesBySlug}
          activeMode={mode}
          activeMatch={activeMatch}
          onShowMore={() => setVisibleCount((count) => Math.min(count + 12, visibleVenues.length))}
        />

        <TrustStrip
          venueCount={trustStats.venueCount}
          nationCount={trustStats.nationCount}
          hostCityCount={trustStats.hostCityCount}
        />

        <section className="space-y-5 rounded-[2rem] border border-line bg-[var(--bg-surface)] p-5 shadow-card">
          <EmailCaptureBanner />
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/submit"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 py-3 text-sm font-semibold text-deep"
            >
              Add a venue
            </Link>
            <Link
              href={`/${city.key}/map${selectedMatchId ? `?match=${selectedMatchId}&mode=${mode}` : `?mode=${mode}`}`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 py-3 text-sm font-semibold text-deep"
            >
              Browse the map
            </Link>
            <Link
              href="/matches"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 py-3 text-sm font-semibold text-deep"
            >
              All matches
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
