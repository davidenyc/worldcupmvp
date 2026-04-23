"use client";

import Link from "next/link";
import { MapPin, Phone, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useFavoritesStore } from "@/lib/store/favorites";
import { CountrySummary, RankedVenue } from "@/lib/types";

function intentBadge(venueIntent: RankedVenue["venueIntent"]) {
  if (venueIntent === "cultural_dining") {
    return {
      label: "🍽️ Authentic dining",
      className: "bg-amber-100 text-amber-800 border border-amber-200"
    };
  }

  return {
    label: "📺 Showing games",
    className: "bg-emerald-100 text-emerald-800 border border-emerald-200"
  };
}

function getCountryFlagEmoji(countries: CountrySummary[], slug: string | null) {
  if (!slug) return "📍";
  return countries.find((country) => country.slug === slug)?.flagEmoji ?? "📍";
}

export function MapResultsPanel({
  venues,
  countries,
  selectedVenueId,
  onSelect
}: {
  venues: RankedVenue[];
  countries: CountrySummary[];
  selectedVenueId?: string;
  onSelect: (venue: RankedVenue) => void;
}) {
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  return (
    <div className="space-y-3">
      {venues.map((venue) => {
        const selected = venue.id === selectedVenueId;
        const intent = intentBadge(venue.venueIntent);
        const flagEmoji = getCountryFlagEmoji(countries, venue.likelySupporterCountry);
        const favorite = favorites.includes(venue.slug);
        const reservationLabel =
          venue.reservationType === "opentable"
            ? "OpenTable"
            : venue.reservationType === "resy"
              ? "Resy"
              : venue.reservationType === "external_url"
                ? "Booking link"
                : venue.reservationType === "phone"
                  ? "Call venue"
                  : venue.reservationType === "request_form"
                    ? "Request form"
                    : "";
        return (
          <div
            key={venue.id}
            onClick={() => onSelect(venue)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(venue);
              }
            }}
            role="button"
            tabIndex={0}
            className={`surface block w-full p-4 text-left transition ${
              selected ? "border-accent shadow-card" : "hover:border-accent/30"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={intent.className}>{intent.label}</Badge>
                  {reservationLabel && venue.reservationType !== "none" && (
                    <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-800">
                      <span className="mr-1 inline-block text-emerald-600">●</span>
                      {reservationLabel}
                    </Badge>
                  )}
                  {venue.associatedCountries.slice(0, 2).map((country) => (
                    <Badge key={country}>{country.replace(/-/g, " ")}</Badge>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 text-lg font-semibold text-deep">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
                    {flagEmoji}
                  </span>
                  <span>{venue.name}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-navy/70">
                  <MapPin className="h-4 w-4" />
                  {venue.neighborhood}, {venue.borough}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  aria-pressed={favorite}
                  aria-label={favorite ? "Remove from favorites" : "Save to favorites"}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleFavorite(venue.slug);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    favorite
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-line bg-white text-navy hover:bg-sky/50"
                  }`}
                >
                  {favorite ? "Saved" : "Save"}
                </button>
                <div className="rounded-2xl bg-sky/60 px-3 py-2 text-right">
                  <div className="text-xs uppercase tracking-[0.2em] text-navy/50">Vibe</div>
                  <div className="text-lg font-semibold text-deep">{venue.gameDayScore.toFixed(1)}</div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="text-sm text-navy/70">
                {venue.venueTypes[0].replace(/_/g, " ")} · ~{venue.approximateCapacity ?? "?"}
              </div>
              <div className="flex items-center gap-2 text-sm text-navy/70">
                <Star className="h-4 w-4 text-accent" />
                {venue.rating ?? "N/A"}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/venue/${venue.slug}`}
                onClick={(event) => event.stopPropagation()}
                className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-navy"
              >
                Details
              </Link>
              <a
                href={`https://maps.apple.com/?q=${encodeURIComponent(venue.address)}`}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-navy"
              >
                Directions
              </a>
              {venue.acceptsReservations && (
                <a
                  href={venue.reservationUrl ?? `tel:${venue.reservationPhone ?? ""}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="rounded-full bg-accent px-3 py-2 text-xs font-semibold text-white"
                >
                  Reserve
                </a>
              )}
              {(venue.reservationPhone || venue.phone) && (
                <a
                  href={`tel:${venue.reservationPhone ?? venue.phone ?? ""}`}
                  onClick={(event) => event.stopPropagation()}
                  className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-navy"
                >
                  <Phone className="inline h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
