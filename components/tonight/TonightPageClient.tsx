"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { UpgradeModal } from "@/components/membership/UpgradeModal";
import { MemberPerksSection } from "@/components/membership/MemberPerksSection";
import { PromoCard } from "@/components/promos/PromoCard";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { HOST_CITIES } from "@/lib/data/hostCities";
import type { PromoRecord } from "@/lib/data/promos";
import type { WorldCupMatch } from "@/lib/data/matches";
import { useUserCity } from "@/lib/hooks/useUserCity";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useMembership } from "@/lib/store/membership";
import { useUser } from "@/lib/store/user";
import type { CountrySummary, RankedVenue } from "@/lib/types";
import { getSoccerAtmosphereRating, slugify, toTitleCase } from "@/lib/utils";
import matchPreviewData from "@/mvp/content/matches/2026.json";

type TonightMode = "bar" | "restaurant";
type TonightAtmosphere = "any" | "low" | "medium" | "high";

type CityTonightData = {
  venues: RankedVenue[];
  promos: PromoRecord[];
  matches: WorldCupMatch[];
};

type WeatherSnapshot = {
  temperature: number | null;
  sunset: string | null;
};

type MatchPreviewRecord = {
  id: string;
  stadium: string;
  host_city_code: string;
  home_country: string;
  away_country: string;
  blurb_short: string;
  fan_energy: string;
};

const MODE_STORAGE_KEY = "gameday-tonight-mode";
const MATCH_PREVIEWS = (matchPreviewData.matches ?? []) as MatchPreviewRecord[];

function getActiveCityKey(userCity: string | null, suggestedCity: string | null) {
  return userCity ?? suggestedCity ?? "nyc";
}

function isBarVenue(venue: RankedVenue) {
  return (
    venue.venueIntent === "sports_bar" ||
    venue.venueIntent === "bar_with_tv" ||
    venue.venueIntent === "cultural_bar" ||
    venue.venueIntent === "fan_fest" ||
    venue.venueTypes.includes("bar") ||
    venue.venueTypes.includes("lounge") ||
    venue.venueTypes.includes("supporter_club")
  );
}

function isRestaurantVenue(venue: RankedVenue) {
  return (
    venue.venueIntent === "cultural_restaurant" ||
    venue.venueTypes.includes("restaurant") ||
    venue.venueTypes.includes("cafe")
  );
}

function includesAny(values: string[], selected: string[]) {
  return selected.length === 0 || values.some((value) => selected.includes(value));
}

function formatShortTime(startsAt: string) {
  return new Date(startsAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function getBarRestaurantLabel(mode: TonightMode) {
  return mode === "bar" ? "bar" : "restaurant";
}

function getVenueFlagSlug(venue: RankedVenue) {
  return venue.likelySupporterCountry ?? venue.associatedCountries[0] ?? null;
}

function getMatchPreview(match: WorldCupMatch) {
  return (
    MATCH_PREVIEWS.find((preview) => {
      return (
        preview.stadium === match.stadiumName &&
        slugify(preview.home_country) === match.homeCountry &&
        slugify(preview.away_country) === match.awayCountry
      );
    }) ?? null
  );
}

function getTodayHeroCopy({
  liveMatch,
  marqueeMatch,
  matchesToday,
  now
}: {
  liveMatch: WorldCupMatch | null;
  marqueeMatch: WorldCupMatch | null;
  matchesToday: WorldCupMatch[];
  now: number;
}) {
  if (!marqueeMatch) {
    return {
      title: "No matches are scheduled yet — check back when the slate drops.",
      countdownTarget: null as string | null
    };
  }

  const matchLabel = `${marqueeMatch.homeCountry.toUpperCase()} vs ${marqueeMatch.awayCountry.toUpperCase()}`;
  const matchStart = Date.parse(marqueeMatch.startsAt);

  if (liveMatch && liveMatch.id === marqueeMatch.id) {
    return {
      title: `Live now: ${matchLabel}`,
      countdownTarget: marqueeMatch.startsAt
    };
  }

  if (!matchesToday.length) {
    return {
      title: `No matches today — here's what's worth a watch tomorrow at ${new Date(marqueeMatch.startsAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}.`,
      countdownTarget: marqueeMatch.startsAt
    };
  }

  if (matchStart - now > 24 * 60 * 60 * 1000) {
    return {
      title: `Up next: ${matchLabel} on ${new Date(marqueeMatch.startsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · Kickoff in`,
      countdownTarget: marqueeMatch.startsAt
    };
  }

  return {
    title: `Today at ${new Date(marqueeMatch.startsAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} · ${matchLabel}`,
    countdownTarget: marqueeMatch.startsAt
  };
}

function getMatchPriority(match: WorldCupMatch, favoriteCountries: string[]) {
  const favoriteBoost =
    favoriteCountries.includes(match.homeCountry) || favoriteCountries.includes(match.awayCountry) ? 100 : 0;
  return favoriteBoost - Date.parse(match.startsAt);
}

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function computeVenueMatchScore(
  venue: RankedVenue,
  match: WorldCupMatch,
  favoriteCountries: string[],
  ratingRange: { min: number; max: number },
  reviewRange: { min: number; max: number }
) {
  const rating = venue.rating ?? 0;
  const reviews = venue.reviewCount ?? 0;
  const normalizedRating =
    ratingRange.max === ratingRange.min ? 1 : (rating - ratingRange.min) / (ratingRange.max - ratingRange.min);
  const normalizedReviews =
    reviewRange.max === reviewRange.min ? 1 : (reviews - reviewRange.min) / (reviewRange.max - reviewRange.min);
  const teams = [match.homeCountry, match.awayCountry];
  const supporterBoost = favoriteCountries.length
    ? favoriteCountries.some((country) => venue.associatedCountries.includes(country) || venue.likelySupporterCountry === country)
      ? 1
      : 0
    : teams.some((country) => venue.associatedCountries.includes(country) || venue.likelySupporterCountry === country)
      ? 1
      : 0;
  const atmosphere = getSoccerAtmosphereRating(venue);
  const atmosphereBoost = atmosphere === "High" ? 1 : atmosphere === "Medium" ? 0.6 : 0.25;
  const capacityBoost = Math.min((venue.approximateCapacity ?? 40) / 200, 1);
  const reservationsBoost = venue.acceptsReservations ? 1 : 0;

  return (
    0.4 * normalizedRating +
    0.2 * normalizedReviews +
    0.15 * supporterBoost +
    0.1 * atmosphereBoost +
    0.1 * capacityBoost +
    0.05 * reservationsBoost
  );
}

function computeMatchRanges(venues: RankedVenue[]) {
  const ratings = venues.map((venue) => venue.rating ?? 0);
  const reviews = venues.map((venue) => venue.reviewCount ?? 0);
  return {
    ratingRange: { min: Math.min(...ratings, 0), max: Math.max(...ratings, 1) },
    reviewRange: { min: Math.min(...reviews, 0), max: Math.max(...reviews, 1) }
  };
}

function getDietaryMatch(venue: RankedVenue, key: "vegetarian" | "halal" | "kosher" | "live-music") {
  const haystack = [...venue.cuisineTags, ...venue.atmosphereTags].join(" ").toLowerCase();
  if (key === "vegetarian") return haystack.includes("vegetarian") || haystack.includes("vegan");
  if (key === "halal") return haystack.includes("halal") || haystack.includes("middle eastern");
  if (key === "kosher") return haystack.includes("kosher") || haystack.includes("jewish");
  return haystack.includes("music") || haystack.includes("late-night") || venue.venueTypes.includes("lounge");
}

function buildTonightUrlState(searchParams: URLSearchParams, updates: Record<string, string | null>) {
  const next = new URLSearchParams(searchParams.toString());
  Object.entries(updates).forEach(([key, value]) => {
    if (!value) next.delete(key);
    else next.set(key, value);
  });
  return next.toString();
}

function CollapsibleSection({
  title,
  subtitle,
  open,
  onToggle,
  children
}: {
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-4 text-left">
        <div>
          <div className="text-xl font-semibold text-[color:var(--fg-primary)]">{title}</div>
          <div className="mt-1 text-sm text-[color:var(--fg-secondary)]">{subtitle}</div>
        </div>
        <div className="text-sm font-semibold text-[color:var(--fg-muted)]">{open ? "Hide" : "Show"}</div>
      </button>
      {open ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

export function TodayPageClient({
  countries,
  cityDataByKey,
  allMatches
}: {
  countries: CountrySummary[];
  cityDataByKey: Record<string, CityTonightData>;
  allMatches: WorldCupMatch[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { userCity, suggestedCity, setUserCity } = useUserCity();
  const { tier, hasFeature } = useMembership();
  const user = useUser();
  const favorites = useFavoritesStore((state) => state.favorites);
  const [mode, setMode] = useState<TonightMode>((searchParams.get("mode") as TonightMode) || "bar");
  const [showUpgrade, setShowUpgrade] = useState<"fan" | "elite" | null>(null);
  const [showCountryGrid, setShowCountryGrid] = useState(false);
  const [weather, setWeather] = useState<WeatherSnapshot>({ temperature: null, sunset: null });
  const [topOpen, setTopOpen] = useState(true);
  const [reviewedOpen, setReviewedOpen] = useState(false);
  const [ratedOpen, setRatedOpen] = useState(false);

  const activeCityKey = getActiveCityKey(userCity, suggestedCity);
  const activeCity = HOST_CITIES.find((city) => city.key === activeCityKey) ?? HOST_CITIES[0];
  const cityData = cityDataByKey[activeCity.key] ?? { venues: [], promos: [], matches: [] };

  const selectedCountries = useMemo(
    () => (searchParams.get("country") ? searchParams.get("country")!.split(",").filter(Boolean) : []),
    [searchParams]
  );
  const reservationsOnly =
    searchParams.get("reservations") === "1" || (mode === "restaurant" && !searchParams.has("reservations"));
  const walkInOnly = searchParams.get("walkIn") === "1";
  const openNowOnly = searchParams.get("openNow") === "1";
  const outdoorOnly = searchParams.get("outdoor") === "1";
  const atmosphere = (searchParams.get("atmosphere") as TonightAtmosphere) || "any";
  const groupSize = Number(searchParams.get("size") ?? "2");
  const vegetarian = searchParams.get("vegetarian") === "1";
  const halal = searchParams.get("halal") === "1";
  const kosher = searchParams.get("kosher") === "1";
  const liveMusic = searchParams.get("liveMusic") === "1";

  useEffect(() => {
    const stored = window.localStorage.getItem(MODE_STORAGE_KEY) as TonightMode | null;
    if (!searchParams.get("mode") && stored && (stored === "bar" || stored === "restaurant")) {
      setMode(stored);
      const nextQuery = buildTonightUrlState(searchParams, { mode: stored });
      router.replace(`${pathname}?${nextQuery}`, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  useEffect(() => {
    window.localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    const controller = new AbortController();
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${activeCity.lat}&longitude=${activeCity.lng}&current=temperature_2m&daily=sunset&forecast_days=1&timezone=auto`;
    fetch(url, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!payload) return;
        setWeather({
          temperature: typeof payload.current?.temperature_2m === "number" ? Math.round(payload.current.temperature_2m) : null,
          sunset: payload.daily?.sunset?.[0] ?? null
        });
      })
      .catch(() => {
        setWeather({ temperature: null, sunset: null });
      });
    return () => controller.abort();
  }, [activeCity.lat, activeCity.lng]);

  const filteredVenues = useMemo(() => {
    return cityData.venues.filter((venue) => {
      const modeMatch = mode === "bar" ? isBarVenue(venue) : isRestaurantVenue(venue);
      if (!modeMatch) return false;
      if (selectedCountries.length > 0 && !includesAny([...(venue.associatedCountries ?? []), venue.likelySupporterCountry ?? ""], selectedCountries)) return false;
      if (reservationsOnly && !venue.acceptsReservations) return false;
      if (walkInOnly && venue.acceptsReservations) return false;
      if (openNowOnly && !venue.openNow) return false;
      if (outdoorOnly && !venue.hasOutdoorViewing) return false;
      if (groupSize > 0 && (venue.approximateCapacity ?? 40) < Math.max(12, groupSize * 2)) return false;
      if (atmosphere !== "any" && getSoccerAtmosphereRating(venue).toLowerCase() !== atmosphere) return false;
      if (mode === "restaurant" && vegetarian && !getDietaryMatch(venue, "vegetarian")) return false;
      if (mode === "restaurant" && halal && !getDietaryMatch(venue, "halal")) return false;
      if (mode === "restaurant" && kosher && !getDietaryMatch(venue, "kosher")) return false;
      if (mode === "restaurant" && liveMusic && !getDietaryMatch(venue, "live-music")) return false;
      return true;
    });
  }, [
    atmosphere,
    cityData.venues,
    groupSize,
    halal,
    kosher,
    liveMusic,
    mode,
    openNowOnly,
    outdoorOnly,
    reservationsOnly,
    selectedCountries,
    vegetarian,
    walkInOnly
  ]);

  const favoriteCountries = user.favoriteCountries;
  const now = Date.now();
  const sortedUpcomingMatches = useMemo(
    () => [...allMatches].sort((a, b) => getMatchPriority(b, favoriteCountries) - getMatchPriority(a, favoriteCountries)),
    [allMatches, favoriteCountries]
  );
  const matchesToday = useMemo(
    () => allMatches.filter((match) => isSameCalendarDay(new Date(match.startsAt), new Date(now))),
    [allMatches, now]
  );
  const liveMatch = useMemo(
    () =>
      matchesToday.find((match) => {
        const kickoff = Date.parse(match.startsAt);
        return now >= kickoff && now <= kickoff + 2 * 60 * 60 * 1000;
      }) ?? null,
    [matchesToday, now]
  );
  const upcomingTodayMatch = useMemo(
    () => matchesToday.find((match) => Date.parse(match.startsAt) >= now) ?? null,
    [matchesToday, now]
  );
  const marqueeMatch = liveMatch ?? upcomingTodayMatch ?? sortedUpcomingMatches[0] ?? null;
  const followUpMatches = sortedUpcomingMatches.filter((match) => match.id !== marqueeMatch?.id).slice(0, 5);

  const { ratingRange, reviewRange } = useMemo(() => computeMatchRanges(filteredVenues), [filteredVenues]);

  const topMatchPicks = useMemo(() => {
    if (!marqueeMatch) return [];
    return [...filteredVenues]
      .sort(
        (a, b) =>
          computeVenueMatchScore(b, marqueeMatch, favoriteCountries, ratingRange, reviewRange) -
          computeVenueMatchScore(a, marqueeMatch, favoriteCountries, ratingRange, reviewRange)
      )
      .slice(0, 3);
  }, [favoriteCountries, filteredVenues, marqueeMatch, ratingRange, reviewRange]);

  const mostReviewed = useMemo(
    () => [...filteredVenues].sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0)).slice(0, 5),
    [filteredVenues]
  );
  const highestRated = useMemo(
    () =>
      [...filteredVenues]
        .filter((venue) => (venue.reviewCount ?? 0) >= 50)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
        .slice(0, 5),
    [filteredVenues]
  );
  const tonightPromos = useMemo(() => cityData.promos.slice(0, 4), [cityData.promos]);
  const savedVenueCountForTonight = useMemo(
    () => filteredVenues.filter((venue) => favorites.includes(venue.slug)).length,
    [favorites, filteredVenues]
  );
  const marqueePreview = marqueeMatch ? getMatchPreview(marqueeMatch) : null;

  function updateQuery(updates: Record<string, string | null>) {
    const nextQuery = buildTonightUrlState(searchParams, updates);
    router.replace(`${pathname}?${nextQuery}`, { scroll: false });
  }

  function handleModeChange(nextMode: TonightMode) {
    setMode(nextMode);
    window.localStorage.setItem(MODE_STORAGE_KEY, nextMode);
    updateQuery({
      mode: nextMode,
      reservations: nextMode === "restaurant" ? "1" : searchParams.get("reservations")
    });
  }

  function toggleCountry(slug: string) {
    const nextSelected = selectedCountries.includes(slug)
      ? selectedCountries.filter((item) => item !== slug)
      : [...selectedCountries, slug];
    if (nextSelected.length > 2 && tier === "free") {
      setShowUpgrade("fan");
      return;
    }
    updateQuery({ country: nextSelected.length ? nextSelected.join(",") : null });
  }

  function lockedFanFeature() {
    if (!hasFeature("reservation_request")) {
      setShowUpgrade("fan");
    }
  }

  const kickoffHero = useMemo(
    () =>
      getTodayHeroCopy({
        liveMatch,
        marqueeMatch,
        matchesToday,
        now
      }),
    [liveMatch, marqueeMatch, matchesToday, now]
  );
  const marqueeMatchShortLabel = marqueeMatch
    ? `${countries.find((country) => country.slug === marqueeMatch.homeCountry)?.fifaCode ?? marqueeMatch.homeCountry.toUpperCase()} vs ${countries.find((country) => country.slug === marqueeMatch.awayCountry)?.fifaCode ?? marqueeMatch.awayCountry.toUpperCase()}`
    : null;

  return (
    <main className="bg-[var(--bg-page)] pb-24">
      <section className="border-b border-[color:var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="container-shell py-8">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1.25fr)_20rem]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-soft-fg)]">Today</div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-4xl font-semibold text-[color:var(--fg-primary)]">Today in {activeCity.label}</h1>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--fg-secondary)]">
                    The next match, the best room, the follow-up plan, the live deal, and what your membership unlocks.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setUserCity(activeCity.key)}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-4 text-sm font-semibold text-[color:var(--fg-primary)]"
                >
                  Set city as default
                </button>
              </div>

              <div className="mt-6 inline-flex rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-1">
                <button
                  type="button"
                  onClick={() => handleModeChange("bar")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === "bar" ? "bg-[#f4b942] text-[#0a1628]" : "text-[color:var(--fg-secondary)]"}`}
                >
                  🍺 Find a bar
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("restaurant")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === "restaurant" ? "bg-[#f4b942] text-[#0a1628]" : "text-[color:var(--fg-secondary)]"}`}
                >
                  🍽️ Find a restaurant
                </button>
              </div>
            </div>

            <section className="rounded-[1.75rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--fg-muted)]">Today at a glance</div>
              <div className="mt-4 space-y-3 text-sm text-[color:var(--fg-secondary)]">
                <div>🌡 {weather.temperature !== null ? `${weather.temperature}°F` : "Weather loading"} {weather.sunset ? `· sunset ${new Date(weather.sunset).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : ""}</div>
                <div>🏟 {sortedUpcomingMatches.slice(0, 3).length} matches coming up soon</div>
                <div>📍 You&apos;re in {activeCity.label} · {activeCity.shortLabel}</div>
                <div>🎯 {savedVenueCountForTonight} saved venues match today&apos;s mode</div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <div className="container-shell space-y-6 py-6">
        <section className="rounded-[2rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--fg-muted)]">First match on deck</div>
              <h2 className="mt-2 text-3xl font-semibold text-[color:var(--fg-primary)]">{kickoffHero.title}</h2>
              {kickoffHero.countdownTarget ? (
                <div className="mt-4">
                  <CountdownTimer targetDate={kickoffHero.countdownTarget} label="" />
                </div>
              ) : null}
              {marqueeMatch ? (
                <>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-lg font-semibold text-[color:var(--fg-primary)]">
                    <CountryFlag country={countries.find((country) => country.slug === marqueeMatch.homeCountry)} size="sm" />
                    <span>{countries.find((country) => country.slug === marqueeMatch.homeCountry)?.name ?? marqueeMatch.homeCountry}</span>
                    <span className="text-[color:var(--fg-muted)]">vs</span>
                    <CountryFlag country={countries.find((country) => country.slug === marqueeMatch.awayCountry)} size="sm" />
                    <span>{countries.find((country) => country.slug === marqueeMatch.awayCountry)?.name ?? marqueeMatch.awayCountry}</span>
                  </div>
                  <div className="mt-2 text-sm text-[color:var(--fg-secondary)]">
                    {marqueeMatch.stadiumName} · {marqueeMatch.stageLabel}
                  </div>
                  {marqueePreview?.blurb_short ? (
                    <div className="mt-2 max-w-2xl text-sm text-[color:var(--fg-secondary)]">
                      {marqueePreview.blurb_short}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>

            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">
                Top 3 spots for {marqueeMatchShortLabel ?? "the next match"} in {activeCity.label}
              </div>
              <div className="mt-4 grid gap-3 [grid-auto-rows:1fr] sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {topMatchPicks.map((venue, index) => {
                  const flagSlug = getVenueFlagSlug(venue);
                  const country = flagSlug ? countries.find((entry) => entry.slug === flagSlug) ?? null : null;

                  return (
                    <div key={venue.id} className="flex h-full min-h-[14.75rem] flex-col rounded-[1.5rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-soft-fg)]">
                          #{index + 1}
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-page)]/55 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--fg-primary)]">
                          {country ? <CountryFlag country={country} size="sm" /> : <span>🏟️</span>}
                          <span>{country ? country.fifaCode : "Mixed"}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-lg font-semibold text-[color:var(--fg-primary)]">{venue.name}</div>
                      <div className="mt-2 text-sm text-[color:var(--fg-secondary)]">⭐ {(venue.rating ?? 0).toFixed(1)} · {(venue.reviewCount ?? 0).toLocaleString()} reviews</div>
                      <div className="mt-2 text-sm text-[color:var(--fg-secondary)]">
                        {venue.acceptsReservations ? "Reservations available" : "Walk-in friendly"} · {venue.neighborhood}
                      </div>
                      <div className="mt-3 text-sm text-[color:var(--fg-secondary)]">
                        {toTitleCase(venue.venueIntent.replace(/_/g, " "))} for {country?.name ?? "mixed supporter rooms"}.
                      </div>
                      <div className="mt-auto pt-4">
                        <div className="inline-flex min-h-8 items-center rounded-full bg-[#0a1628] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] leading-none text-white">
                          {getSoccerAtmosphereRating(venue)} atmosphere
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {marqueeMatch ? (
                <Link
                  href={`/${activeCity.key}/map?countries=${marqueeMatch.homeCountry},${marqueeMatch.awayCountry}`}
                  className="mt-4 inline-flex rounded-full bg-[#f4b942] px-4 py-2 text-sm font-semibold text-[#0a1628]"
                >
                  See all {filteredVenues.length} spots →
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--fg-muted)]">Where to go next</div>
              <div className="mt-1 text-sm text-[color:var(--fg-secondary)]">The next matches you&apos;re most likely to care about.</div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {followUpMatches.map((match) => {
              const home = countries.find((country) => country.slug === match.homeCountry) ?? null;
              const away = countries.find((country) => country.slug === match.awayCountry) ?? null;
              const preview = getMatchPreview(match);

              return (
                <Link
                  key={match.id}
                  href={`/${activeCity.key}/map?countries=${match.homeCountry},${match.awayCountry}`}
                  className="rounded-[1.5rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-4"
                >
                  <div className="flex items-center gap-2 text-lg font-semibold text-[color:var(--fg-primary)]">
                    <CountryFlag country={home} size="sm" />
                    <span>{home?.fifaCode ?? match.homeCountry.toUpperCase()}</span>
                    <span className="text-[color:var(--fg-muted)]">vs</span>
                    <CountryFlag country={away} size="sm" />
                    <span>{away?.fifaCode ?? match.awayCountry.toUpperCase()}</span>
                  </div>
                  <div className="mt-2 text-sm text-[color:var(--fg-secondary)]">{formatShortTime(match.startsAt)}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[color:var(--fg-muted)]">{match.stadiumName}</div>
                  {preview?.blurb_short ? (
                    <div className="mt-3 text-sm text-[color:var(--fg-secondary)]">{preview.blurb_short}</div>
                  ) : null}
                  <div className="mt-3 text-sm font-semibold text-[color:var(--fg-primary)]">Top spots →</div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => updateQuery({ reservations: reservationsOnly ? null : "1" })}
              className={`rounded-full px-3 py-2 text-sm font-semibold ${reservationsOnly ? "bg-[#f4b942] text-[#0a1628]" : "border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]"}`}
            >
              Reservations
            </button>
            <button
              type="button"
              onClick={() => updateQuery({ walkIn: walkInOnly ? null : "1" })}
              className={`rounded-full px-3 py-2 text-sm font-semibold ${walkInOnly ? "bg-[#f4b942] text-[#0a1628]" : "border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]"}`}
            >
              Walk-in only
            </button>
            <button
              type="button"
              onClick={() => updateQuery({ openNow: openNowOnly ? null : "1" })}
              className={`rounded-full px-3 py-2 text-sm font-semibold ${openNowOnly ? "bg-[#f4b942] text-[#0a1628]" : "border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]"}`}
            >
              Open now
            </button>
            <button
              type="button"
              onClick={() => updateQuery({ outdoor: outdoorOnly ? null : "1" })}
              className={`rounded-full px-3 py-2 text-sm font-semibold ${outdoorOnly ? "bg-[#f4b942] text-[#0a1628]" : "border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]"}`}
            >
              Outdoor seating
            </button>
            <button
              type="button"
              onClick={() => lockedFanFeature()}
              className="rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3 py-2 text-sm font-semibold text-[color:var(--fg-primary)]"
            >
              📍 Distance from me {hasFeature("reservation_request") ? "on" : "🔒"}
            </button>
            <select
              value={atmosphere}
              onChange={(event) => updateQuery({ atmosphere: event.target.value === "any" ? null : event.target.value })}
              className="rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3 py-2 text-sm font-semibold text-[color:var(--fg-primary)]"
            >
              <option value="any">Any atmosphere</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              type="number"
              min={2}
              value={groupSize}
              onChange={(event) => updateQuery({ size: event.target.value })}
              className="h-10 w-24 rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3 text-sm font-semibold text-[color:var(--fg-primary)]"
            />
            {mode === "restaurant" ? (
              <>
                <button type="button" onClick={() => updateQuery({ vegetarian: vegetarian ? null : "1" })} className={`rounded-full px-3 py-2 text-sm font-semibold ${vegetarian ? "bg-[#f4b942] text-[#0a1628]" : "border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]"}`}>Vegetarian</button>
                <button type="button" onClick={() => updateQuery({ halal: halal ? null : "1" })} className={`rounded-full px-3 py-2 text-sm font-semibold ${halal ? "bg-[#f4b942] text-[#0a1628]" : "border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]"}`}>Halal</button>
                <button type="button" onClick={() => updateQuery({ kosher: kosher ? null : "1" })} className={`rounded-full px-3 py-2 text-sm font-semibold ${kosher ? "bg-[#f4b942] text-[#0a1628]" : "border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]"}`}>Kosher</button>
                <button type="button" onClick={() => updateQuery({ liveMusic: liveMusic ? null : "1" })} className={`rounded-full px-3 py-2 text-sm font-semibold ${liveMusic ? "bg-[#f4b942] text-[#0a1628]" : "border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]"}`}>Live music</button>
              </>
            ) : null}
            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 pr-3">
              {countries.map((country) => {
                const active = selectedCountries.includes(country.slug);
                return (
                  <button
                    key={country.slug}
                    type="button"
                    onClick={() => toggleCountry(country.slug)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold ${active ? "bg-[#0a1628] text-white" : "border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]"}`}
                  >
                    <CountryFlag country={country} size="sm" />
                    <span>{country.fifaCode}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3 py-3">
              <div className="text-sm text-[color:var(--fg-secondary)]">
                Need the full country list? Open all 48 supporter filters in one tap.
              </div>
              <button
                type="button"
                onClick={() => setShowCountryGrid(true)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#f4b942] px-3 py-2 text-sm font-semibold text-[#0a1628]"
              >
                See all 48
              </button>
            </div>
          </div>
        </section>

        <section id="deals-today" className="space-y-4 scroll-mt-28">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--fg-muted)]">🎯 Deals today in {activeCity.label}</div>
              <div className="mt-1 text-sm text-[color:var(--fg-secondary)]">
                Match-day offers, QR redemptions, and member-only perks.
              </div>
            </div>
            <Link href="/membership" className="text-sm font-semibold text-[color:var(--fg-primary)] underline">
              Member perks →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {tonightPromos.map((promo) => {
              const venue = cityData.venues.find((entry) => entry.slug === promo.venue_id);
              return (
                <PromoCard
                  key={promo.id}
                  promo={promo}
                  venueName={venue?.name ?? promo.venue_id}
                  reservationUrl={venue?.reservationUrl}
                />
              );
            })}
          </div>
        </section>

        <CollapsibleSection
          title={`Top 3 in ${activeCity.label} today`}
          subtitle={`Ranked ${getBarRestaurantLabel(mode)} picks for the current city and mode.`}
          open={topOpen}
          onToggle={() => setTopOpen((current) => !current)}
        >
          <div className="space-y-3">
            {topMatchPicks.map((venue, index) => (
              <div key={venue.id} className="rounded-[1.5rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">{index + 1}</div>
                    <div className="mt-1 text-lg font-semibold text-[color:var(--fg-primary)]">{venue.name}</div>
                    <div className="mt-1 text-sm text-[color:var(--fg-secondary)]">
                      ⭐ {(venue.rating ?? 0).toFixed(1)} ({(venue.reviewCount ?? 0).toLocaleString()}) · {venue.neighborhood}
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link href={`/venue/${venue.slug}`} className="rounded-full border border-[color:var(--border-subtle)] px-3 py-2 text-sm font-semibold">
                      Reserve
                    </Link>
                    <a
                      href={`https://maps.apple.com/?q=${encodeURIComponent(venue.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-[#0a1628] px-3 py-2 text-sm font-semibold text-white"
                    >
                      Directions
                    </a>
                  </div>
                </div>
              </div>
            ))}
            <Link href={`/${activeCity.key}/map`} className="inline-flex rounded-full bg-[#f4b942] px-4 py-2 text-sm font-semibold text-[#0a1628]">
              See all →
            </Link>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title={`Most reviewed in ${activeCity.label}`}
          subtitle="Crowd-proof rooms sorted strictly by review count."
          open={reviewedOpen}
          onToggle={() => setReviewedOpen((current) => !current)}
        >
          <div className="space-y-3">
            {mostReviewed.map((venue, index) => (
              <div key={venue.id} className="rounded-[1.5rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-4 text-sm">
                <div className="font-semibold text-[color:var(--fg-primary)]">
                  {index + 1}. {venue.name}
                </div>
                <div className="mt-1 text-[color:var(--fg-secondary)]">
                  ⭐ {(venue.rating ?? 0).toFixed(1)} · {(venue.reviewCount ?? 0).toLocaleString()} reviews
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title={`Highest rated in ${activeCity.label}`}
          subtitle="Minimum 50 reviews to avoid tiny-sample outliers."
          open={ratedOpen}
          onToggle={() => setRatedOpen((current) => !current)}
        >
          <div className="space-y-3">
            {highestRated.map((venue, index) => (
              <div key={venue.id} className="rounded-[1.5rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-4 text-sm">
                <div className="font-semibold text-[color:var(--fg-primary)]">
                  {index + 1}. {venue.name}
                </div>
                <div className="mt-1 text-[color:var(--fg-secondary)]">
                  ⭐ {(venue.rating ?? 0).toFixed(1)} · {(venue.reviewCount ?? 0).toLocaleString()} reviews
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <MemberPerksSection />
      </div>
      {showUpgrade ? (
        <UpgradeModal
          feature={showUpgrade === "elite" ? "match_alerts" : "unlimited_country_filters"}
          requiredTier={showUpgrade}
          onClose={() => setShowUpgrade(null)}
        />
      ) : null}
      {showCountryGrid ? (
        <>
          <button
            type="button"
            aria-label="Close country picker"
            onClick={() => setShowCountryGrid(false)}
            className="fixed inset-0 z-40 bg-[#0a1628]/45"
          />
          <div className="fixed inset-x-4 bottom-4 z-50 max-h-[70vh] overflow-hidden rounded-[1.75rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[color:var(--border-subtle)] px-4 py-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">Country filter</div>
                <div className="text-sm font-semibold text-[color:var(--fg-primary)]">All 48 nations</div>
              </div>
              <button
                type="button"
                onClick={() => setShowCountryGrid(false)}
                className="rounded-full border border-[color:var(--border-subtle)] px-3 py-1.5 text-xs font-semibold text-[color:var(--fg-primary)]"
              >
                Close
              </button>
            </div>
            <div className="grid max-h-[calc(70vh-4.5rem)] grid-cols-2 gap-2 overflow-y-auto p-4 sm:grid-cols-3">
              {countries.map((country) => {
                const active = selectedCountries.includes(country.slug);
                return (
                  <button
                    key={country.slug}
                    type="button"
                    onClick={() => toggleCountry(country.slug)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-3 py-3 text-left text-sm font-semibold ${
                      active
                        ? "bg-[#0a1628] text-white"
                        : "border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]"
                    }`}
                  >
                    <CountryFlag country={country} size="sm" />
                    <span>{country.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
}

export { TodayPageClient as TonightPageClient };
