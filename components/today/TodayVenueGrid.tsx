"use client";

import Link from "next/link";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { getVenueDistanceMiles, type TodayPageMode } from "@/lib/data/today";
import type { WorldCupMatch } from "@/lib/data/matches";
import type { CountrySummary, RankedVenue } from "@/lib/types";
import { getVenueTvLabel } from "@/lib/utils";

type TodayVenueGridProps = {
  venues: RankedVenue[];
  visibleCount: number;
  city: { key: string; label: string; lat: number; lng: number };
  countriesBySlug: Record<string, CountrySummary>;
  activeMode: TodayPageMode;
  activeMatch: WorldCupMatch | null;
  onShowMore: () => void;
};

function getVenueHeading(
  cityLabel: string,
  mode: TodayPageMode,
  activeMatch: WorldCupMatch | null,
  countriesBySlug: Record<string, CountrySummary>
) {
  if (activeMatch) {
    const home = countriesBySlug[activeMatch.homeCountry]?.fifaCode ?? activeMatch.homeCountry.toUpperCase();
    const away = countriesBySlug[activeMatch.awayCountry]?.fifaCode ?? activeMatch.awayCountry.toUpperCase();
    const matchup = `${home}-${away}`;
    if (mode === "bar") return `${matchup} bars in ${cityLabel}`;
    if (mode === "restaurant") return `${matchup} restaurants in ${cityLabel}`;
    return `${matchup} watch spots in ${cityLabel}`;
  }

  if (mode === "restaurant") return "Cultural restaurants for today's matches";
  if (mode === "bar") return `Bars in ${cityLabel} today`;
  return `All watch spots in ${cityLabel} today`;
}

function getVenueCountry(venue: RankedVenue, countriesBySlug: Record<string, CountrySummary>) {
  return countriesBySlug[venue.likelySupporterCountry ?? venue.associatedCountries[0] ?? ""] ?? null;
}

function getEmptyFlag(activeMatch: WorldCupMatch | null, countriesBySlug: Record<string, CountrySummary>) {
  if (!activeMatch) return "🏟️";
  return countriesBySlug[activeMatch.homeCountry]?.flagEmoji ?? "⚽";
}

export function TodayVenueGrid({
  venues,
  visibleCount,
  city,
  countriesBySlug,
  activeMode,
  activeMatch,
  onShowMore
}: TodayVenueGridProps) {
  const heading = getVenueHeading(city.label, activeMode, activeMatch, countriesBySlug);
  const visibleVenues = venues.slice(0, visibleCount);

  return (
    <section id="today-venue-list" className="space-y-5 scroll-mt-28">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-mist">Watch spots in {city.label}</div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-deep">{heading}</h2>
        </div>
        <div className="text-sm text-[color:var(--fg-secondary)]">{venues.length} places ranked by game-day score</div>
      </div>

      {venues.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-emoji">{getEmptyFlag(activeMatch, countriesBySlug)}</div>
          <div className="mt-4 text-2xl font-semibold text-deep">No bars showing this match yet — be the first.</div>
          <p className="mt-2 max-w-md text-body text-[color:var(--fg-secondary)]">
            We&apos;re still building this room list. Add the spot you trust and we&apos;ll review it for the matchday map.
          </p>
          <Link
            href="/submit"
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-[color:var(--fg-on-accent)]"
          >
            Add a venue →
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleVenues.map((venue) => {
              const country = getVenueCountry(venue, countriesBySlug);
              const distance = getVenueDistanceMiles(venue, city);
              const badges = [
                getVenueTvLabel(venue),
                venue.acceptsReservations ? "Reservations" : null,
                venue.hasOutdoorViewing ? "Outdoor" : null
              ].filter(Boolean).slice(0, 3) as string[];

              return (
                <Link
                  key={venue.slug}
                  href={`/venue/${venue.slug}`}
                  aria-label={`Open venue details for ${venue.name}`}
                  className="rounded-[1.5rem] border border-line bg-[var(--bg-surface)] p-4 shadow-sm transition hover:border-[color:var(--accent)] hover:shadow-card"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 pt-1">
                      <CountryFlag country={country} size="md" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[color:var(--fg-secondary)]">
                        {country?.name ?? "Mixed crowd"}
                      </div>
                      <h3 className="mt-1 text-[17px] font-semibold leading-6 text-deep">{venue.name}</h3>
                      <div className="mt-1 text-sm text-mist">
                        {venue.neighborhood} · {venue.borough}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-[color:var(--fg-secondary)]">
                    ⭐ {(venue.rating ?? 0).toFixed(1)} · {(venue.reviewCount ?? 0).toLocaleString()} reviews
                  </div>
                  <div className="mt-2 text-sm text-[color:var(--fg-secondary)]">
                    {venue.openNow ? "Open now · Matchday ready" : "Closed right now · Check before kickoff"}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {badges.map((badge) => (
                      <span
                        key={badge}
                        className="inline-flex min-h-11 items-center rounded-full border border-line bg-[var(--bg-surface-elevated)] px-3 py-2 text-xs font-semibold text-deep"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-mist">{distance.toFixed(1)} mi from city center</div>
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {venues.length > visibleCount && visibleCount < 36 ? (
              <button
                type="button"
                onClick={onShowMore}
                aria-label="Show more watch spots"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 py-3 text-sm font-semibold text-deep"
              >
                Show more
              </button>
            ) : null}

            {venues.length > 36 || visibleCount >= 36 ? (
              <Link
                href={`/${city.key}/map${activeMatch ? `?match=${activeMatch.id}&mode=${activeMode}` : `?mode=${activeMode}`}`}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-[color:var(--fg-on-accent)]"
              >
                See all on the map →
              </Link>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
