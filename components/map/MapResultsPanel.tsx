"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Clock3, Star } from "lucide-react";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { CountrySummary, RankedVenue } from "@/lib/types";
import { getSoccerAtmosphereRating, getVenueTvLabel, toTitleCase } from "@/lib/utils";
import { getVenueIntentMeta } from "@/lib/venueIntents";

function getCountryName(countries: CountrySummary[], slug: string | null) {
  if (!slug) return null;
  return countries.find((country) => country.slug === slug)?.name ?? null;
}

function isNeutralSportsBar(venue: RankedVenue) {
  return (
    venue.venueIntent === "sports_bar" ||
    venue.venueIntent === "bar_with_tv" ||
    (venue.venueTypes as string[]).includes("sports_bar")
  ) && !venue.likelySupporterCountry;
}

export function MapResultsPanel({
  venues,
  countries,
  selectedVenueId,
  selectedCountrySlugs,
  columns = 1,
  onSelect,
  onClearAll
}: {
  venues: RankedVenue[];
  countries: CountrySummary[];
  selectedVenueId?: string;
  selectedCountrySlugs: string[];
  columns?: 1 | 2;
  onSelect: (venue: RankedVenue) => void;
  onClearAll: () => void;
}) {
  const countryLookup = useMemo(
    () => new Map(countries.map((country) => [country.slug, country])),
    [countries]
  );
  const uniqueVenues = useMemo(() => {
    const seen = new Set<string>();
    return venues.filter((venue) => {
      const key = venue.id || venue.slug;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [venues]);
  const emptyFlagSlug = selectedCountrySlugs[0] ?? null;
  const emptyCountry = emptyFlagSlug ? countryLookup.get(emptyFlagSlug) ?? null : null;

  if (!uniqueVenues.length) {
    return (
      <div className="flex min-h-[42vh] flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f8fbff] text-5xl dark:bg-white/5">
          <CountryFlag country={emptyCountry} size="lg" />
        </div>
        <h3 className="mt-6 text-2xl font-semibold text-[#0a1628] dark:text-white">No spots found</h3>
        <p className="mt-2 max-w-xs text-sm leading-6 text-[#0a1628]/55 dark:text-white/55">
          Try a different city or clear a filter to see results.
        </p>
        <button
          type="button"
          onClick={onClearAll}
          className="mt-5 rounded-full bg-[#f4b942] px-4 py-2.5 text-sm font-semibold text-[#0a1628] transition hover:bg-[#f0c86b]"
        >
          Clear all
        </button>
      </div>
    );
  }

  return (
    <div className={columns === 2 ? "grid gap-3 xl:grid-cols-2" : "space-y-3"}>
      {uniqueVenues.map((venue) => {
        const selected = venue.id === selectedVenueId;
        const country = venue.likelySupporterCountry ? countryLookup.get(venue.likelySupporterCountry) ?? null : null;
        const countryName = getCountryName(countries, venue.likelySupporterCountry);
        const neutralSportsBar = isNeutralSportsBar(venue);
        const intent = getVenueIntentMeta(venue.venueIntent, countryName);
        const reservationsLabel = venue.acceptsReservations ? "Reservations" : "Walk-in";
        const reviewCountLabel = typeof venue.reviewCount === "number" ? venue.reviewCount.toLocaleString() : "0";
        const primaryVenueType = venue.venueTypes[0];
        const phoneNumber = venue.reservationPhone ?? venue.phone ?? null;
        const soccerAtmosphere = getSoccerAtmosphereRating(venue);
        const tvLabel = getVenueTvLabel(venue);
        const secondaryAction = venue.acceptsReservations && (venue.reservationUrl || venue.reservationPhone)
          ? {
              href: venue.reservationUrl ?? `tel:${venue.reservationPhone!}`,
              label: "Reserve",
              highlight: true,
              external: Boolean(venue.reservationUrl)
            }
          : venue.website
            ? {
                href: venue.website,
                label: "Website",
                highlight: false,
                external: true
              }
            : phoneNumber
              ? {
                  href: `tel:${phoneNumber}`,
                  label: "Call",
                  highlight: false,
                  external: false
                }
              : null;
        return (
          <button
            key={venue.id}
            type="button"
            onClick={() => onSelect(venue)}
            className={`group w-full rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] p-3 text-left shadow-sm transition sm:p-4 ${
              selected
                ? "border-[color:var(--accent)] bg-[var(--bg-surface-elevated)]"
                : "hover:border-[color:var(--border-strong)] hover:bg-[var(--bg-surface-elevated)]"
            }`}
          >
            <div className="flex items-start gap-3 transition">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--country-flag-bg)]">
                {neutralSportsBar ? <span className="text-sm leading-none">📍</span> : <CountryFlag country={country} size="sm" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-semibold text-[color:var(--fg-primary)]">{venue.name}</div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${intent.className}`}>
                    {intent.label}
                  </span>
                </div>
                <div className="mt-1 text-sm text-[color:var(--fg-secondary)]">{venue.neighborhood}</div>
                <div className="mt-1 text-xs text-[color:var(--fg-muted)]">
                  {neutralSportsBar ? "Mixed crowd" : countryName ?? venue.borough}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2.5 text-sm">
                  <span className="inline-flex items-center gap-1 text-[color:var(--fg-secondary)]">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {Number(venue.rating ?? 0).toFixed(1)}
                    <span className="text-xs text-[color:var(--fg-muted)]">({reviewCountLabel})</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[color:var(--fg-secondary)]">
                    <span className={`h-2.5 w-2.5 rounded-full ${venue.acceptsReservations ? "bg-emerald-500" : "bg-[color:var(--border-strong)]"}`} />
                    {reservationsLabel}
                  </span>
                  {primaryVenueType ? (
                    <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">
                      {toTitleCase(primaryVenueType.replace(/_/g, " "))}
                    </span>
                  ) : null}
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${venue.openNow ? "text-emerald-600 dark:text-emerald-400" : "text-[color:var(--fg-muted)]"}`}>
                    <Clock3 className="h-3.5 w-3.5" />
                    {venue.openNow ? "Open now" : "Hours vary"}
                  </span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                    soccerAtmosphere === "High"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : soccerAtmosphere === "Medium"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                        : "bg-[var(--pill-bg)] text-[color:var(--pill-fg)]"
                  }`}>
                    {soccerAtmosphere} atmosphere
                  </span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                    venue.numberOfScreens <= 0
                      ? "bg-[var(--pill-bg)] text-[color:var(--pill-fg)]"
                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                  }`}>
                    {tvLabel}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    href={`/venue/${venue.slug}`}
                    onClick={(event) => event.stopPropagation()}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3 text-[11px] font-semibold text-[color:var(--fg-primary)] transition hover:brightness-[0.98] sm:text-xs"
                  >
                    Details
                  </Link>
                  {secondaryAction ? (
                    <a
                      href={secondaryAction.href}
                      target={secondaryAction.external ? "_blank" : undefined}
                      rel={secondaryAction.external ? "noreferrer" : undefined}
                      onClick={(event) => event.stopPropagation()}
                      className={`inline-flex h-11 items-center justify-center rounded-full px-3 text-[11px] font-semibold transition sm:text-xs ${
                        secondaryAction.highlight
                          ? "bg-[#f4b942] text-[#0a1628] hover:bg-[#f0c86b]"
                          : "border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)] hover:brightness-[0.98]"
                      }`}
                    >
                      {secondaryAction.label}
                    </a>
                  ) : (
                    <div className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3 text-[11px] font-semibold text-[color:var(--fg-muted)] sm:text-xs">
                      Venue info
                    </div>
                  )}
                  {venue.address ? (
                    <a
                      href={`https://maps.apple.com/?q=${encodeURIComponent(venue.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="col-span-2 inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3 text-[11px] font-semibold text-[color:var(--fg-primary)] transition hover:brightness-[0.98] sm:text-xs"
                    >
                      Directions
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
