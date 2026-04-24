"use client";

import Link from "next/link";
import { Clock3, ExternalLink, Instagram, MapPin, Phone, Star } from "lucide-react";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { Badge } from "@/components/ui/badge";
import { CountrySummary, RankedVenue } from "@/lib/types";
import { getSoccerAtmosphereRating, toTitleCase } from "@/lib/utils";

function intentBadge(venueIntent: RankedVenue["venueIntent"]) {
  switch (venueIntent) {
    case "watch_party":
      return {
        label: "📺 Watch party",
        className: "border border-[#d8e3f5] border-l-emerald-400 bg-white text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white"
      };
    case "sports_bar":
      return {
        label: "⚽ Sports bar",
        className: "border border-[#d8e3f5] border-l-emerald-400 bg-white text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white"
      };
    case "cultural_dining":
      return {
        label: "🍽️ Authentic dining",
        className: "border border-[#d8e3f5] border-l-amber-400 bg-white text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white"
      };
    case "both":
      return {
        label: "🏆 Both",
        className: "border border-[#d8e3f5] border-l-[#f4b942] bg-white text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white"
      };
    default:
      return {
        label: "📺 Watch party",
        className: "border border-[#d8e3f5] border-l-emerald-400 bg-white text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white"
      };
  }
}

export function VenuePreviewCard({ venue, countries }: { venue: RankedVenue; countries: CountrySummary[] }) {
  const intent = intentBadge(venue.venueIntent);
  const country = venue.likelySupporterCountry
    ? countries.find((item) => item.slug === venue.likelySupporterCountry) ?? null
    : null;
  const primaryVenueType = venue.venueTypes[0];
  const soccerAtmosphere = getSoccerAtmosphereRating(venue);

  return (
    <div className="w-[min(260px,82vw)] space-y-3 p-1">
      <div className="flex flex-wrap gap-2">
        <Badge className={intent.className}>{intent.label}</Badge>
        {primaryVenueType ? (
          <Badge className="bg-[#eef4ff] text-[#0a1628] dark:bg-white/10 dark:text-white">
            {toTitleCase(primaryVenueType.replace(/_/g, " "))}
          </Badge>
        ) : null}
        {venue.acceptsReservations && <Badge className="bg-[#eef4ff] text-[#0a1628] dark:bg-white/10 dark:text-white">Reservations available</Badge>}
      </div>
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f8fbff] shadow-[0_1px_3px_rgba(10,22,40,0.12)]">
          <CountryFlag country={country} size="sm" />
        </div>
        <div className="min-w-0">
          <div className="text-base font-semibold text-[#0a1628] dark:text-white">{venue.name}</div>
          <div className="mt-1 flex items-center gap-2 text-sm text-[#0a1628]/60 dark:text-white/60">
            <MapPin className="h-4 w-4" />
            {venue.neighborhood}
          </div>
          <div className="mt-2 flex items-center gap-1 text-sm text-[#0a1628]/65 dark:text-white/65">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{Number(venue.rating ?? 0).toFixed(1)}</span>
            {venue.reviewCount ? <span className="text-xs text-[#0a1628]/40 dark:text-white/40">({venue.reviewCount.toLocaleString()})</span> : null}
            <span className="mx-2 text-[#0a1628]/20 dark:text-white/20">·</span>
            <span className="text-xs text-[#0a1628]/55 dark:text-white/55">{venue.borough}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {venue.associatedCountries.slice(0, 2).map((country) => (
          <Badge key={country} className="bg-[#eef4ff] text-[#0a1628] dark:bg-white/10 dark:text-white">
            {toTitleCase(country.replace(/-/g, " "))}
          </Badge>
        ))}
        <Badge className="bg-[#eef4ff] text-[#0a1628] dark:bg-white/10 dark:text-white">~{venue.approximateCapacity ?? "?"}</Badge>
        <Badge className={`${venue.openNow ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-[#eef4ff] text-[#0a1628] dark:bg-white/10 dark:text-white"}`}>
          <Clock3 className="mr-1 inline h-3.5 w-3.5" />
          {venue.openNow ? "Open now" : "Hours vary"}
        </Badge>
        <Badge className={`${
          soccerAtmosphere === "High"
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
            : soccerAtmosphere === "Medium"
              ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
              : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/70"
        }`}>
          {soccerAtmosphere} atmosphere
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {venue.acceptsReservations && (venue.reservationUrl || venue.reservationPhone) && (
          <a
            href={venue.reservationUrl ?? `tel:${venue.reservationPhone!}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[#f4b942] px-3 py-2 text-xs font-semibold text-[#0a1628]"
          >
            Reserve
          </a>
        )}
        <Link
          href={`/venue/${venue.slug}`}
          className="rounded-full bg-[#f4b942] px-3 py-1.5 text-xs font-semibold text-[#0a1628] transition hover:bg-[#f0c86b]"
        >
          View details →
        </Link>
        {(venue.reservationPhone || venue.phone) && (
          <a
            href={`tel:${venue.reservationPhone ?? venue.phone ?? ""}`}
            className="rounded-full border border-[#d8e3f5] bg-white px-3 py-2 text-xs font-semibold text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white"
          >
            <Phone className="inline h-3.5 w-3.5" />
          </a>
        )}
        {venue.website && (
          <a
            href={venue.website}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[#d8e3f5] bg-white px-3 py-2 text-xs font-semibold text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white"
          >
            <ExternalLink className="inline h-3.5 w-3.5" />
          </a>
        )}
        {venue.instagramUrl && (
          <a
            href={venue.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[#d8e3f5] bg-white px-3 py-2 text-xs font-semibold text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white"
          >
            <Instagram className="inline h-3.5 w-3.5" />
          </a>
        )}
        {venue.address && (
          <a
            href={`https://maps.apple.com/?q=${encodeURIComponent(venue.address)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[#d8e3f5] bg-white px-3 py-2 text-xs font-semibold text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white"
          >
            Directions
          </a>
        )}
      </div>
    </div>
  );
}
