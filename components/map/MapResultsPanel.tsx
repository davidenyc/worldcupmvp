"use client";

import Link from "next/link";
import { ChevronRight, Clock3, ExternalLink, Heart, MapPin, Star } from "lucide-react";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { SeededGoingChip } from "@/components/home/SeededGoingChip";
import { useFavoritesStore } from "@/lib/store/favorites";
import type { CountrySummary, RankedVenue } from "@/lib/types";
import { getVenueTvLabel } from "@/lib/utils";
import { getVenueIntentMeta } from "@/lib/venueIntents";

function getCountryBySlug(countries: CountrySummary[], slug: string | null | undefined) {
  if (!slug) return null;
  return countries.find((country) => country.slug === slug) ?? null;
}

export function MapResultsPanel({
  venues,
  countries,
  selectedVenueId,
  activeMatchId,
  selectedCountrySlugs,
  columns = 1,
  onSelect,
  onClearAll
}: {
  venues: RankedVenue[];
  countries: CountrySummary[];
  selectedVenueId?: string;
  activeMatchId?: string | null;
  selectedCountrySlugs: string[];
  columns?: 1 | 2;
  onSelect: (venue: RankedVenue) => void;
  onClearAll: () => void;
}) {
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const uniqueVenues = venues.filter(
    (venue, index, all) => all.findIndex((item) => (item.id || item.slug) === (venue.id || venue.slug)) === index
  );

  if (!uniqueVenues.length) {
    const emptyCountry = getCountryBySlug(countries, selectedCountrySlugs[0]);
    return (
      <div className="flex min-h-[42vh] flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-surface-elevated)] text-5xl">
          <CountryFlag country={emptyCountry} size="lg" />
        </div>
        <h3 className="mt-6 text-2xl font-semibold text-[color:var(--fg-primary)]">No spots found</h3>
        <p className="mt-2 max-w-xs text-sm leading-6 text-[color:var(--fg-muted)]">
          Try a different city or clear a filter to see results.
        </p>
        <button
          type="button"
          onClick={onClearAll}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-[color:var(--fg-on-accent)] transition hover:bg-gold/90"
        >
          Clear all
        </button>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-mist">Results</div>
          <div className="mt-1 text-base font-semibold text-deep">
            {uniqueVenues.length.toLocaleString()} {uniqueVenues.length === 1 ? "venue" : "venues"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ToolbarButton onClick={onClearAll}>Clear</ToolbarButton>
        </div>
      </header>

      <div className={columns === 2 ? "grid grid-cols-1 gap-3 md:grid-cols-2" : "grid grid-cols-1 gap-3"}>
        {uniqueVenues.map((venue) => {
          const country = getCountryBySlug(countries, venue.likelySupporterCountry ?? venue.associatedCountries?.[0]);
          const supporterLabel = country?.name ?? venue.associatedCountries?.[0] ?? "";
          const intent = getVenueIntentMeta(venue.venueIntent, country?.name ?? null);
          const hasTV = venue.numberOfScreens > 0;
          const selected = venue.id === selectedVenueId;
          const isSaved = favorites.includes(venue.slug);

          return (
            <article
              key={venue.id}
              className={[
                "flex flex-col gap-3 rounded-2xl border bg-[var(--bg-surface)] p-4 shadow-sm transition",
                selected
                  ? "border-gold ring-2 ring-gold/30"
                  : "border-[color:var(--border-subtle)] hover:border-[color:var(--border-strong)]"
              ].join(" ")}
            >
              <header className="flex items-start gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg-surface-elevated)] text-lg"
                  aria-hidden
                >
                  <CountryFlag country={country} size="sm" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold leading-5 text-deep [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                    {venue.name}
                  </h3>
                  <p className="mt-0.5 truncate text-sm text-mist">
                    {venue.neighborhood ?? venue.borough}
                    {supporterLabel ? ` · ${supporterLabel}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={isSaved ? "Remove from saved venues" : "Save venue"}
                  onClick={() => toggleFavorite(venue.slug)}
                  className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${
                    isSaved
                      ? "border-gold bg-gold/10 text-deep"
                      : "border-line bg-surface text-[color:var(--fg-secondary)] hover:border-[color:var(--border-strong)] hover:text-red"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                </button>
              </header>

              <div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${intent.className}`}>
                  {intent.label}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-mist">
                <Metric
                  icon={<Star className="h-3.5 w-3.5 text-gold" />}
                  value={venue.rating?.toFixed(1) ?? "—"}
                  sub={venue.reviewCount ? `(${venue.reviewCount.toLocaleString()})` : ""}
                />
                <Metric
                  icon={<Clock3 className="h-3.5 w-3.5 text-emerald-500" />}
                  value={venue.openNow ? "Open now" : "Closed"}
                  sub={venue.acceptsReservations ? "Reservations" : "Walk-in"}
                />
                <Metric
                  icon={<MapPin className="h-3.5 w-3.5 text-mist" />}
                  value={hasTV ? "Has TV" : "No TVs"}
                  sub={hasTV ? getVenueTvLabel(venue) : "book private"}
                />
              </div>
              {activeMatchId ? (
                <div>
                  <SeededGoingChip matchId={activeMatchId} venueSlug={venue.slug} venue={venue} />
                </div>
              ) : null}

              <footer className="grid grid-cols-3 gap-2">
                <ActionButton primary onClick={() => onSelect(venue)}>
                  Open details <ChevronRight className="h-3.5 w-3.5" />
                </ActionButton>
                <ActionButton href={venue.website ?? undefined}>
                  Website <ExternalLink className="h-3.5 w-3.5" />
                </ActionButton>
                <ActionButton href={venue.googleMapsUrl ?? `https://maps.google.com/?q=${venue.lat},${venue.lng}`}>
                  Directions
                </ActionButton>
              </footer>

              <Link
                href={`/venue/${venue.slug}`}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3 text-sm font-semibold text-[color:var(--fg-primary)] transition hover:brightness-[0.98]"
              >
                Full venue page
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ToolbarButton({
  children,
  onClick
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-4 text-sm font-medium text-deep transition hover:bg-surface-2"
    >
      {children}
    </button>
  );
}

function Metric({
  icon,
  value,
  sub
}: {
  icon: React.ReactNode;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <div className="flex items-center gap-1 text-deep">
        {icon}
        <span className="text-sm font-semibold">{value}</span>
      </div>
      {sub ? <span className="truncate text-[11px] text-mist">{sub}</span> : null}
    </div>
  );
}

function ActionButton({
  children,
  href,
  onClick,
  primary
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  primary?: boolean;
}) {
  const className = [
    "inline-flex min-h-11 items-center justify-center gap-1 rounded-full px-3 text-sm font-semibold transition",
    primary
      ? "bg-gold text-deep hover:bg-gold/90"
      : "border border-line bg-surface text-deep hover:border-[color:var(--border-strong)] hover:bg-surface-2"
  ].join(" ");

  if (href) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}
