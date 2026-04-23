"use client";

import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

export function VenuePreviewCard({ venue, countries }: { venue: RankedVenue; countries: CountrySummary[] }) {
  const intent = intentBadge(venue.venueIntent);
  const flagEmoji = getCountryFlagEmoji(countries, venue.likelySupporterCountry);

  return (
    <div className="min-w-[230px] space-y-3 p-1">
      <div className="flex flex-wrap gap-2">
        <Badge className={intent.className}>{intent.label}</Badge>
        <Badge>{venue.venueTypes[0].replace(/_/g, " ")}</Badge>
        {venue.acceptsReservations && <Badge className="bg-accent text-white">Reserve</Badge>}
      </div>
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-base shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
          {flagEmoji}
        </div>
        <div className="min-w-0">
          <div className="text-base font-semibold text-deep">{venue.name}</div>
          <div className="mt-1 flex items-center gap-2 text-sm text-navy/70">
            <MapPin className="h-4 w-4" />
            {venue.neighborhood}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {venue.associatedCountries.slice(0, 2).map((country) => (
          <Badge key={country}>{country.replace(/-/g, " ")}</Badge>
        ))}
        <Badge>~{venue.approximateCapacity ?? "?"}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {venue.acceptsReservations && (
          <a
            href={venue.reservationUrl ?? `tel:${venue.reservationPhone ?? ""}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-accent px-3 py-2 text-xs font-semibold text-white"
          >
            Reserve
          </a>
        )}
        <Link
          href={`/venue/${venue.slug}`}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-700"
        >
          View details →
        </Link>
        {(venue.reservationPhone || venue.phone) && (
          <a
            href={`tel:${venue.reservationPhone ?? venue.phone ?? ""}`}
            className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-navy"
          >
            <Phone className="inline h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
