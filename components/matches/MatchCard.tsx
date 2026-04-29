"use client";

import { useState } from "react";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { Badge } from "@/components/ui/badge";
import { WatchedCheckInSheet } from "@/components/matches/WatchedCheckInSheet";
import { getHostCity } from "@/lib/data/hostCities";
import { useUserCity } from "@/lib/hooks/useUserCity";
import { getMatchLocationLabel } from "@/lib/data/matchLocations";
import { WorldCupMatch } from "@/lib/data/matches";
import { useWatchlistStore } from "@/lib/store/watchlist";
import { CountrySummary } from "@/lib/types";

function getCountry(countries: CountrySummary[], slug: string) {
  return countries.find((country) => country.slug === slug);
}

function getDateParts(value: string) {
  const date = new Date(value);
  return {
    dateKey: date.toLocaleDateString("en-CA", { timeZone: "America/New_York" }),
    dateLabel: date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "America/New_York"
    }),
    timeLabel: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/New_York"
    })
  };
}

function getTodayKey() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

function getTomorrowKey() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

function formatVenueLabel(value?: string | null) {
  if (!value) return null;
  return value
    .split("-")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export function MatchCard({
  match,
  countries,
  hostCityKey,
  hostCityLabel: _hostCityLabel,
  onWatchSpots,
  onRequestCitySelector
}: {
  match: WorldCupMatch;
  countries: CountrySummary[];
  hostCityKey: string;
  hostCityLabel?: string;
  onWatchSpots: (match: WorldCupMatch, cityKey: string) => void;
  onRequestCitySelector: () => void;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { userCity } = useUserCity();
  const watchedMatches = useWatchlistStore((state) => state.watchedMatches);
  const watchStatuses = useWatchlistStore((state) => state.watchStatuses);
  const watchVenues = useWatchlistStore((state) => state.watchVenues);
  const watchRatings = useWatchlistStore((state) => state.watchRatings);
  const planWatchMatch = useWatchlistStore((state) => state.planWatchMatch);
  const markWatchedMatch = useWatchlistStore((state) => state.markWatchedMatch);
  const { dateKey, dateLabel, timeLabel } = getDateParts(match.startsAt);
  const todayKey = getTodayKey();
  const tomorrowKey = getTomorrowKey();
  const home = getCountry(countries, match.homeCountry);
  const away = getCountry(countries, match.awayCountry);
  const stadiumLabel = getMatchLocationLabel(match);
  const isLocal = !!userCity && userCity === hostCityKey;
  const isToday = dateKey === todayKey;
  const isTomorrow = dateKey === tomorrowKey;
  const kickoffPassed = Date.now() > Date.parse(match.startsAt);
  const status = watchStatuses[match.id];
  const isTracked = watchedMatches.includes(match.id);
  const isWatched = status === "watched";
  const plannedVenue = formatVenueLabel(watchVenues[match.id]);
  const hostCityLabel = _hostCityLabel ?? getHostCity(hostCityKey)?.label ?? "the host city";

  return (
    <>
    <article className="rounded-[1.35rem] border border-line bg-white p-4 text-deep shadow-sm dark:border-line dark:bg-[var(--bg-surface-strong)] dark:text-[color:var(--fg-on-strong)] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-deep dark:text-[color:var(--fg-on-strong)] sm:text-base">
            <CountryFlag country={home} size="md" />
            <span>{home?.name ?? match.homeCountry}</span>
            <span className="text-[color:var(--ink-40)] dark:text-[color:var(--fg-on-strong)]/35">vs</span>
            <span>{away?.name ?? match.awayCountry}</span>
            <CountryFlag country={away} size="md" />
          </div>
          <div className="text-xs text-[color:var(--fg-secondary)] dark:text-[color:var(--fg-muted-on-strong)] sm:text-sm">
            {match.group ? `Group ${match.group}` : match.stageLabel} · {dateLabel} · {timeLabel} ET
          </div>
          <div className="text-xs text-[color:var(--fg-secondary)] dark:text-[color:var(--fg-muted-on-strong)] sm:text-sm">📍 {match.stadiumName}, {stadiumLabel}</div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          {isToday && (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-600 ring-1 ring-red-200">
              🔴 Today
            </span>
          )}
          {isTomorrow && (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600 ring-1 ring-amber-200">
              ⚡ Tomorrow
            </span>
          )}
          {isLocal && <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-deep dark:bg-white/10 dark:text-[color:var(--fg-on-strong)]">📍 Local</span>}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ink-45)]">Where to watch</div>
        <div className="mt-2.5">
          {userCity ? (
            <button
              type="button"
              onClick={() => onWatchSpots(match, userCity)}
              className="inline-flex w-full items-center justify-center rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-deep transition hover:brightness-105 sm:w-auto"
            >
              📍 Find watch spots near you →
            </button>
          ) : (
            <button
              type="button"
              onClick={onRequestCitySelector}
              className="inline-flex w-full items-center justify-center rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-deep transition hover:bg-surface-2 dark:border-line dark:bg-white/5 dark:text-[color:var(--fg-on-strong)] dark:hover:bg-white/10 sm:w-auto"
            >
              📍 Find watch spots near you →
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge className="bg-surface-2 text-deep dark:bg-white/10 dark:text-[color:var(--fg-on-strong)]">{match.stageLabel}</Badge>
        {isToday && <Badge className="bg-red-50 text-red-700 ring-1 ring-red-200">Today</Badge>}
        {isTomorrow && <Badge className="bg-amber-50 text-amber-700 ring-1 ring-amber-200">Tomorrow</Badge>}
        {isLocal && <Badge className="bg-surface-2 text-deep dark:bg-white/10 dark:text-[color:var(--fg-on-strong)]">Local</Badge>}
      </div>

      <div className="mt-4 space-y-3">
        {isWatched ? (
          <div className="rounded-2xl border border-gold bg-gold/10 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-deep">✓ Watched</div>
                <div className="mt-1 text-xs text-[color:var(--fg-secondary)]">
                  {plannedVenue ? `Checked in at ${plannedVenue}` : "Checked in without a venue."}
                </div>
                {watchRatings[match.id] ? (
                  <div className="mt-1 text-xs font-medium text-[color:var(--accent-soft-fg)]">
                    {watchRatings[match.id]} star watch rating saved
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface-2"
              >
                Edit
              </button>
            </div>
          </div>
        ) : kickoffPassed ? (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-deep transition hover:brightness-105 sm:w-auto"
          >
            I watched this →
          </button>
        ) : isTracked ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex min-h-11 items-center rounded-full border border-[color:var(--accent-soft-fg)] bg-[var(--accent-soft-bg)] px-4 text-sm font-semibold text-[color:var(--accent-soft-fg)]">
              ✓ Watching
            </span>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface-2"
            >
              {plannedVenue ? "Edit plan" : "Add venue"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => planWatchMatch(match.id)}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[color:var(--accent-soft-fg)] bg-[var(--accent-soft-bg)] px-4 text-sm font-semibold text-[color:var(--accent-soft-fg)] transition hover:brightness-105 sm:w-auto"
          >
            I’ll watch this →
          </button>
        )}

        {!kickoffPassed && plannedVenue && !isWatched ? (
          <div className="text-xs text-[color:var(--fg-secondary)]">Planned venue: {plannedVenue}</div>
        ) : null}
      </div>
    </article>
    <WatchedCheckInSheet
      open={sheetOpen}
      cityKey={hostCityKey}
      cityLabel={hostCityLabel}
      kickoffPassed={kickoffPassed}
      initialVenueSlug={watchVenues[match.id]}
      initialRating={watchRatings[match.id]}
      onClose={() => setSheetOpen(false)}
      onSubmit={({ venueSlug, rating }) => {
        if (kickoffPassed) {
          markWatchedMatch(match.id, { venueSlug, rating });
        } else {
          planWatchMatch(match.id, venueSlug);
        }
        setSheetOpen(false);
      }}
    />
    </>
  );
}
