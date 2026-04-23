"use client";

import Link from "next/link";
import { ExternalLink, Heart, Instagram, MapPin, Phone, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useFavoritesStore } from "@/lib/store/favorites";
import { formatPriceLevel, formatScore } from "@/lib/utils";
import { RankedVenue } from "@/lib/types";

function capacityLabel(venue: RankedVenue) {
  if (venue.approximateCapacity) return `~${venue.approximateCapacity}`;
  return venue.capacityBucket.replace(/_/g, " ");
}

export function VenueCard({ venue }: { venue: RankedVenue }) {
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const favorite = favorites.includes(venue.slug);

  return (
    <div className="surface relative p-5 transition hover:-translate-y-0.5 hover:border-accent/40">
      <button
        type="button"
        aria-pressed={favorite}
        aria-label={favorite ? "Remove from favorites" : "Save to favorites"}
        onClick={(event) => {
          event.stopPropagation();
          toggleFavorite(venue.slug);
        }}
        className={`absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
          favorite
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-line bg-white text-navy hover:bg-sky/50"
        }`}
      >
        <Heart className={`h-3.5 w-3.5 ${favorite ? "fill-current" : ""}`} />
        {favorite ? "Saved" : "Save"}
      </button>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {venue.isOfficialFanHub && <Badge className="bg-accent text-white">Official fan hub</Badge>}
            {venue.acceptsReservations && <Badge>Reserve available</Badge>}
            {venue.goodForGroups && <Badge>Good for big groups</Badge>}
          </div>
          <Link href={`/venue/${venue.slug}`} className="mt-3 block text-xl font-semibold tracking-tight text-deep">
            {venue.name}
          </Link>
          <div className="mt-2 flex items-center gap-2 text-sm text-navy/65">
            <MapPin className="h-4 w-4" />
            {venue.address}
          </div>
        </div>
        <div className="rounded-2xl bg-sky/60 px-3 py-2 text-right">
          <div className="text-xs uppercase tracking-[0.2em] text-navy/55">Vibe</div>
          <div className="text-xl font-semibold text-deep">{formatScore(venue.gameDayScore)}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {venue.venueTypes.map((type) => (
          <Badge key={type}>{type.replace(/_/g, " ")}</Badge>
        ))}
        {venue.associatedCountries.map((country) => (
          <Badge key={country} className="bg-white">
            {country.replace(/-/g, " ")}
          </Badge>
        ))}
        {venue.cuisineTags.slice(0, 3).map((tag) => (
          <Badge key={tag} className="bg-white">
            {tag}
          </Badge>
        ))}
      </div>

      <p className="mt-4 text-sm leading-6 text-navy/75">{venue.description}</p>

      <div className="mt-4 grid gap-3 rounded-2xl border border-line bg-white/80 p-4 md:grid-cols-5">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-mist">Rating</div>
          <div className="mt-1 flex items-center gap-2 text-sm text-navy">
            <Star className="h-4 w-4 text-accent" />
            {venue.rating ?? "N/A"}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-mist">Fan score</div>
          <div className="mt-1 text-sm text-navy">{formatScore(venue.fanLikelihoodScore)}/10</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-mist">Capacity</div>
          <div className="mt-1 text-sm text-navy">{capacityLabel(venue)}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-mist">Reservations</div>
          <div className="mt-1 text-sm text-navy">{venue.acceptsReservations ? "Available" : "Walk-in"}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-mist">Price</div>
          <div className="mt-1 text-sm text-navy">{formatPriceLevel(venue.priceLevel)}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {venue.rankingReasons.map((reason) => (
          <Badge key={reason} className="bg-accent/12 text-accent">
            {reason}
          </Badge>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        <a
          href={`https://maps.apple.com/?q=${encodeURIComponent(venue.address)}`}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-navy"
          rel="noreferrer"
        >
          <MapPin className="h-4 w-4" />
          Directions
        </a>
        {venue.website && (
          <a
            href={venue.website}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-navy"
            rel="noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
            Website
          </a>
        )}
        {venue.acceptsReservations && (
          <a
            href={venue.reservationUrl ?? `tel:${venue.reservationPhone ?? ""}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-2 text-white"
            rel="noreferrer"
          >
            Reserve
          </a>
        )}
        {(venue.reservationPhone || venue.phone) && (
          <a
            href={`tel:${venue.reservationPhone ?? venue.phone ?? ""}`}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-navy"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
        )}
        {venue.instagramUrl && (
          <a
            href={venue.instagramUrl}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-navy"
            rel="noreferrer"
          >
            <Instagram className="h-4 w-4" />
            IG
          </a>
        )}
      </div>
    </div>
  );
}
