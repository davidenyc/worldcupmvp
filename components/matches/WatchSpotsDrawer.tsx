"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { WorldCupMatch } from "@/lib/data/matches";
import { CountrySummary, Venue } from "@/lib/types";

function getCountry(countries: CountrySummary[], slug: string | null) {
  if (!slug) return null;
  return countries.find((country) => country.slug === slug) ?? null;
}

function intentLabel(venueIntent: Venue["venueIntent"]) {
  if (venueIntent === "cultural_restaurant") {
    return "🍽️ Cultural restaurant";
  }
  if (venueIntent === "bar_with_tv") {
    return "📺 Bar with TVs";
  }
  if (venueIntent === "cultural_bar") {
    return "🍺 Cultural bar";
  }
  if (venueIntent === "fan_fest") {
    return "🏆 Fan Fest";
  }
  return "⚽ Sports bar";
}

export function WatchSpotsDrawer({
  open,
  cityKey,
  cityLabel,
  match,
  venues,
  countries,
  onClose
}: {
  open: boolean;
  cityKey: string;
  cityLabel: string;
  match: WorldCupMatch | null;
  venues: Venue[];
  countries: CountrySummary[];
  onClose: () => void;
}) {
  const home = match ? getCountry(countries, match.homeCountry) : null;
  const away = match ? getCountry(countries, match.awayCountry) : null;

  const matchingVenues = (match
    ? venues.filter(
        (venue) =>
          venue.likelySupporterCountry === match.homeCountry ||
          venue.likelySupporterCountry === match.awayCountry ||
          venue.associatedCountries.includes(match.homeCountry) ||
          venue.associatedCountries.includes(match.awayCountry)
      )
    : [])
    .slice()
    .sort((a, b) => (b.gameDayScore ?? 0) - (a.gameDayScore ?? 0) || (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 5);

  return (
    <>
      <button
        type="button"
        aria-label="Close watch spots drawer"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-deep/20 transition-opacity md:block ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <aside
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col overflow-hidden border-t border-line bg-white text-deep shadow-2xl transition-transform duration-300 ease-out dark:border-line dark:bg-[var(--bg-surface-strong)] dark:text-[color:var(--fg-on-strong)] md:bottom-4 md:left-auto md:right-4 md:top-[81px] md:w-[28rem] md:rounded-[1.5rem] md:border md:border-line dark:md:border-white/10 ${
          open ? "translate-y-0 md:translate-y-0" : "translate-y-full md:translate-y-0 md:opacity-0 md:pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4 dark:border-line">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--ink-45)] dark:text-[color:var(--fg-on-strong)]/45">Watch spots</div>
            <h3 className="mt-1 text-lg font-semibold text-deep dark:text-[color:var(--fg-on-strong)]">
              {match ? `${home?.name ?? match.homeCountry} vs ${away?.name ?? match.awayCountry}` : "Select a match"}
            </h3>
            <div className="mt-1 text-sm text-mist dark:text-[color:var(--fg-muted-on-strong)]">
              {match ? `${cityLabel} · Top venues for this matchup` : "Choose a match to see venues"}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line bg-surface-2 px-3 py-2 text-sm font-semibold text-deep transition hover:bg-surface-2 dark:border-line dark:bg-white/5 dark:text-[color:var(--fg-on-strong)] dark:hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-safe md:px-5 md:py-4">
          {!match ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-line bg-surface-2 p-8 text-center text-mist dark:border-line dark:bg-white/5 dark:text-[color:var(--fg-muted-on-strong)]">
              Pick a match to see the top venues in {cityLabel}.
            </div>
          ) : matchingVenues.length ? (
            <div className="space-y-3">
              {matchingVenues.map((venue) => {
                const flag = getCountry(countries, venue.likelySupporterCountry)?.flagEmoji ?? "📍";
                const intent = intentLabel(venue.venueIntent);
                return (
                  <div key={venue.id} className="rounded-2xl border border-line bg-surface-2 p-4 dark:border-line dark:bg-white/5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{flag}</span>
                        <div>
                          <div className="font-semibold text-deep dark:text-[color:var(--fg-on-strong)]">{venue.name}</div>
                          <div className="mt-1 text-sm text-mist dark:text-[color:var(--fg-muted-on-strong)]">{venue.address}</div>
                        </div>
                      </div>
                      <Badge className="border border-line bg-white text-deep dark:border-line dark:bg-white/8 dark:text-[color:var(--fg-on-strong)]">{intent}</Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-sm text-[color:var(--fg-secondary)] dark:text-[color:var(--fg-secondary-on-strong)]">
                      <span>⭐ {Number(venue.rating ?? 0).toFixed(1)}</span>
                      <span className="text-[color:var(--ink-30)] dark:text-[color:var(--fg-on-strong)]/30">·</span>
                      <span>{venue.neighborhood}</span>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={`/${cityKey}/map?country=${match.homeCountry}&vsCountry=${match.awayCountry}&venue=${encodeURIComponent(venue.slug)}`}
                        className="inline-flex items-center rounded-full bg-gold px-4 py-2 text-sm font-semibold text-deep transition hover:brightness-105"
                      >
                        View on map →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-line bg-surface-2 p-8 text-center text-mist dark:border-line dark:bg-white/5 dark:text-[color:var(--fg-muted-on-strong)]">
              No cached venues found yet for this matchup in {cityLabel}.
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
