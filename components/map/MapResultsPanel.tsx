"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Clock3, ExternalLink, Instagram, Phone, Star } from "lucide-react";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { CountrySummary, RankedVenue } from "@/lib/types";
import { getSoccerAtmosphereRating, toTitleCase } from "@/lib/utils";

function getCountryName(countries: CountrySummary[], slug: string | null) {
  if (!slug) return null;
  return countries.find((country) => country.slug === slug)?.name ?? null;
}

function intentBadge(venueIntent: RankedVenue["venueIntent"]) {
  switch (venueIntent) {
    case "watch_party":
      return {
        label: "📺 Watch party",
        className: "border border-[#d8e3f5] border-l-[#f4b942] bg-white text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white"
      };
    case "sports_bar":
      return {
        label: "⚽ Sports bar",
        className: "border border-[#d8e3f5] border-l-[#f4b942] bg-white text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white"
      };
    case "cultural_dining":
      return {
        label: "🍽️ Authentic dining",
        className: "border border-[#d8e3f5] border-l-[#f4b942] bg-white text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white"
      };
    case "both":
      return {
        label: "🏆 Both",
        className: "border border-[#d8e3f5] border-l-[#f4b942] bg-white text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white"
      };
    default:
      return {
        label: "📺 Watch party",
        className: "border border-[#d8e3f5] border-l-[#f4b942] bg-white text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white"
      };
  }
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
  const emptyFlagSlug = selectedCountrySlugs[0] ?? null;
  const emptyCountry = emptyFlagSlug ? countryLookup.get(emptyFlagSlug) ?? null : null;

  if (!venues.length) {
    return (
      <div className="flex min-h-[42vh] flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eef4ff] text-5xl shadow-inner">
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
      {venues.map((venue) => {
        const selected = venue.id === selectedVenueId;
        const country = venue.likelySupporterCountry ? countryLookup.get(venue.likelySupporterCountry) ?? null : null;
        const countryName = getCountryName(countries, venue.likelySupporterCountry);
        const intent = intentBadge(venue.venueIntent);
        const reservationsLabel = venue.acceptsReservations ? "Reservations" : "Walk-in";
        const reviewCountLabel = typeof venue.reviewCount === "number" ? venue.reviewCount.toLocaleString() : "0";
        const primaryVenueType = venue.venueTypes[0];
        const phoneNumber = venue.reservationPhone ?? venue.phone ?? null;
        const soccerAtmosphere = getSoccerAtmosphereRating(venue);
        return (
          <button
            key={venue.id}
            type="button"
            onClick={() => onSelect(venue)}
            className={`group w-full rounded-2xl border border-[#d8e3f5] border-l-4 border-l-transparent bg-white p-4 text-left shadow-sm transition dark:border-white/8 dark:bg-[#1c2330] ${
              selected
                ? "border-[#f4b942] border-l-[#f4b942] bg-[#eef4ff] dark:border-[#f4b942] dark:bg-[#1c2330]"
                : "hover:border-[#cdd9ef] hover:bg-[#f8fbff] dark:hover:border-white/20 dark:hover:bg-[#1f2836]"
            }`}
          >
            <div className="flex items-start gap-3 transition">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f8fbff] shadow-[0_1px_3px_rgba(10,22,40,0.12)]">
                <CountryFlag country={country} size="sm" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-semibold text-[#0a1628] dark:text-white">{venue.name}</div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${intent.className}`}>
                    {intent.label}
                  </span>
                </div>
                <div className="mt-1 text-sm text-[#0a1628]/55 dark:text-white/55">{venue.neighborhood}</div>
                {countryName && <div className="mt-1 text-xs text-[#0a1628]/40 dark:text-white/40">{countryName}</div>}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1 text-[#0a1628]/75 dark:text-white/75">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {Number(venue.rating ?? 0).toFixed(1)}
                    <span className="text-xs text-[#0a1628]/40 dark:text-white/40">({reviewCountLabel})</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#0a1628]/75 dark:text-white/75">
                    <span className={`h-2.5 w-2.5 rounded-full ${venue.acceptsReservations ? "bg-emerald-500" : "bg-[#0a1628]/30"}`} />
                    {reservationsLabel}
                  </span>
                  {primaryVenueType ? (
                    <span className="text-xs uppercase tracking-[0.18em] text-[#0a1628]/40 dark:text-white/40">
                      {toTitleCase(primaryVenueType.replace(/_/g, " "))}
                    </span>
                  ) : null}
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${venue.openNow ? "text-emerald-600 dark:text-emerald-400" : "text-[#0a1628]/45 dark:text-white/45"}`}>
                    <Clock3 className="h-3.5 w-3.5" />
                    {venue.openNow ? "Open now" : "Hours vary"}
                  </span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                    soccerAtmosphere === "High"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : soccerAtmosphere === "Medium"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                        : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/70"
                  }`}>
                    {soccerAtmosphere} atmosphere
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/venue/${venue.slug}`}
                    onClick={(event) => event.stopPropagation()}
                    className="rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-3 py-1.5 text-xs font-semibold text-[#0a1628] transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    View details →
                  </Link>
                  {venue.website ? (
                    <a
                      href={venue.website}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-full border border-[#d8e3f5] bg-white px-3 py-1.5 text-xs font-semibold text-[#0a1628] transition hover:bg-[#f8fbff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Website
                    </a>
                  ) : null}
                  {venue.instagramUrl ? (
                    <a
                      href={venue.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-full border border-[#d8e3f5] bg-white px-3 py-1.5 text-xs font-semibold text-[#0a1628] transition hover:bg-[#f8fbff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                      <Instagram className="h-3.5 w-3.5" />
                      Insta
                    </a>
                  ) : null}
                  {phoneNumber ? (
                    <a
                      href={`tel:${phoneNumber}`}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-full border border-[#d8e3f5] bg-white px-3 py-1.5 text-xs font-semibold text-[#0a1628] transition hover:bg-[#f8fbff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call
                    </a>
                  ) : null}
                  {venue.address ? (
                    <a
                      href={`https://maps.apple.com/?q=${encodeURIComponent(venue.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="rounded-full border border-[#d8e3f5] bg-white px-3 py-1.5 text-xs font-semibold text-[#0a1628] transition hover:bg-[#f8fbff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                      Directions
                    </a>
                  ) : null}
                  {venue.acceptsReservations && (venue.reservationUrl || venue.reservationPhone) ? (
                    <a
                      href={venue.reservationUrl ?? `tel:${venue.reservationPhone!}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="rounded-full bg-[#f4b942] px-3 py-1.5 text-xs font-semibold text-[#0a1628] transition hover:bg-[#f0c86b]"
                    >
                      Reserve
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
