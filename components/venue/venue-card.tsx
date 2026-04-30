"use client";

import Link from "next/link";
import { ExternalLink, Heart, Instagram, MapPin, Phone, Star } from "lucide-react";
import { useState } from "react";

import { UpgradeModal } from "@/components/membership/UpgradeModal";
import { Badge } from "@/components/ui/badge";
import { VenueShareButton } from "@/components/venue/VenueShareButton";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useMembership } from "@/lib/store/membership";
import { toast } from "@/lib/toast";
import {
  formatCapacityBucket,
  formatPriceLevel,
  formatScore,
  getVenueDescriptionCopy,
  getVenueTvLabel,
  toTitleCase
} from "@/lib/utils";
import { RankedVenue } from "@/lib/types";

function capacityLabel(venue: RankedVenue) {
  if (venue.approximateCapacity) return `~${venue.approximateCapacity}`;
  return formatCapacityBucket(venue.capacityBucket);
}

export function VenueCard({ venue }: { venue: RankedVenue }) {
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const { hasFeature, canSaveVenue } = useMembership();
  const favorite = favorites.includes(venue.slug);
  const isAtLimit = !favorite && !canSaveVenue(favorites.length);
  const canSeeBadges = hasFeature("premium_venue_badges");
  const canRequestReservation = hasFeature("reservation_request");
  const isHotSpot = Boolean(venue.isRealVenue && (venue.rating ?? 0) >= 4.4);
  const tvLabel = getVenueTvLabel(venue);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);

  function handleSave() {
    if (isAtLimit) {
      setShowSaveModal(true);
      return;
    }

    const wasFavorite = favorites.includes(venue.slug);
    toggleFavorite(venue.slug);
    if (wasFavorite) {
      toast("Removed from saved");
      return;
    }

    toast.success("Saved!");
  }

  return (
    <div className="surface relative p-5 transition hover:-translate-y-0.5 hover:border-accent/40">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]">
              {toTitleCase(venue.venueIntent.replace(/_/g, " "))}
            </Badge>
            <Badge className={venue.numberOfScreens <= 0 ? "border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"}>
              {tvLabel}
            </Badge>
            <Badge className="border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]">
              {venue.acceptsReservations ? "Reservations" : "Walk-in"}
            </Badge>
            {isHotSpot && canSeeBadges ? <Badge className="bg-red text-white">Hot Spot</Badge> : null}
            {isHotSpot && !canSeeBadges ? (
              <button
                type="button"
                onClick={() => setShowBadgeModal(true)}
                className="inline-flex items-center rounded-full border border-gold/40 bg-[var(--accent-soft-bg)] px-2 py-1 text-[10px] font-bold text-[color:var(--accent-soft-fg)]"
              >
                Hot Spot
              </button>
            ) : null}
          </div>
          <Link
            href={`/venue/${venue.slug}`}
            className="mt-3 block text-xl font-semibold tracking-tight text-[color:var(--fg-primary)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden"
          >
            {venue.name}
          </Link>
          <div className="mt-2 flex items-center gap-2 text-sm text-[color:var(--fg-secondary)]">
            <MapPin className="h-4 w-4" />
            {venue.neighborhood || venue.address}
          </div>
          <p className="mt-3 text-sm leading-6 text-[color:var(--fg-secondary)]">{getVenueDescriptionCopy(venue)}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            aria-pressed={favorite}
            aria-label={favorite ? "Remove from favorites" : "Save to favorites"}
            onClick={(event) => {
              event.stopPropagation();
              handleSave();
            }}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              favorite
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-line bg-white text-navy hover:bg-sky/50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${favorite ? "fill-current" : ""}`} />
            {favorite ? "Saved" : "Save"}
            {isAtLimit ? <span className="ml-1 text-[10px]">🔒</span> : null}
          </button>
          <div className="rounded-2xl bg-[var(--bg-surface-elevated)] px-3 py-2 text-right">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">Rating</div>
            <div className="mt-1 flex items-center justify-end gap-2 text-base font-semibold text-[color:var(--fg-primary)]">
              <Star className="h-4 w-4 text-accent" />
              <span>{venue.rating ?? "N/A"}</span>
              <span className="text-xs text-[color:var(--fg-muted)]">({venue.reviewCount ?? 0})</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-line bg-white/80 p-4 sm:grid-cols-3 dark:border-white/10 dark:bg-white/5">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.16em] text-mist dark:text-white/55">Rating</div>
          <div className="mt-1 flex items-center gap-2 text-sm text-navy dark:text-white">
            <Star className="h-4 w-4 text-accent" />
            {venue.rating ?? "N/A"}
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.16em] text-mist dark:text-white/55">Vibe</div>
          <div className="mt-1 text-sm text-navy dark:text-white">{formatScore(venue.fanLikelihoodScore)}/10</div>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.16em] text-mist dark:text-white/55">Capacity</div>
          <div className="mt-1 text-sm text-navy dark:text-white">{capacityLabel(venue)}</div>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.16em] text-mist dark:text-white/55">Reservations</div>
          <div className="mt-1 text-sm text-navy dark:text-white">{venue.acceptsReservations ? "Available" : "Walk-in"}</div>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.16em] text-mist dark:text-white/55">Price</div>
          <div className="mt-1 text-sm text-navy dark:text-white">{formatPriceLevel(venue.priceLevel)}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {venue.associatedCountries.slice(0, 2).map((country) => (
          <Link key={country} href={`/country/${country}`}>
            <Badge className="border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]">
              {toTitleCase(country.replace(/-/g, " "))}
            </Badge>
          </Link>
        ))}
        {venue.goodForGroups ? <Badge className="bg-accent/12 text-accent">Good for groups</Badge> : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        <a
          href={`https://maps.apple.com/?q=${encodeURIComponent(venue.address)}`}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-navy dark:border-white/10 dark:bg-white/5 dark:text-white"
          rel="noreferrer"
        >
          <MapPin className="h-4 w-4" />
          Directions
        </a>
        {venue.website && (
          <a
            href={venue.website}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-navy dark:border-white/10 dark:bg-white/5 dark:text-white"
            rel="noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
            Website
          </a>
        )}
        {venue.acceptsReservations && (venue.reservationUrl || venue.reservationPhone) ? (
          venue.reservationType === "request_form" && !canRequestReservation ? (
            <button
              type="button"
              onClick={() => setShowReservationModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-2 text-white"
            >
              Request reservation
            </button>
          ) : (
            <a
              href={venue.reservationUrl ?? `tel:${venue.reservationPhone!}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-2 text-white"
              rel="noreferrer"
            >
              {venue.reservationType === "request_form" ? "Request reservation" : "Reserve"}
            </a>
          )
        ) : null}
        {(venue.reservationPhone || venue.phone) && (
          <a
            href={`tel:${venue.reservationPhone ?? venue.phone ?? ""}`}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-navy dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
        )}
        {venue.instagramUrl && (
          <a
            href={venue.instagramUrl}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-navy dark:border-white/10 dark:bg-white/5 dark:text-white"
            rel="noreferrer"
          >
            <Instagram className="h-4 w-4" />
            IG
          </a>
        )}
        <VenueShareButton
          venueName={venue.name}
          countryName={venue.associatedCountries[0] ? toTitleCase(venue.associatedCountries[0].replace(/-/g, " ")) : "your team"}
          url={`https://gamedaymap.com/venue/${venue.slug}`}
        />
        <Link href={`/venue/${venue.slug}`} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-navy dark:border-white/10 dark:bg-white/5 dark:text-white">
          View details →
        </Link>
      </div>
      {showSaveModal ? (
        <UpgradeModal
          feature="unlimited_saves"
          requiredTier="fan"
          onClose={() => setShowSaveModal(false)}
        />
      ) : null}
      {showBadgeModal ? (
        <UpgradeModal
          feature="premium_venue_badges"
          requiredTier="fan"
          onClose={() => setShowBadgeModal(false)}
        />
      ) : null}
      {showReservationModal ? (
        <UpgradeModal
          feature="reservation_request"
          requiredTier="fan"
          onClose={() => setShowReservationModal(false)}
        />
      ) : null}
    </div>
  );
}
