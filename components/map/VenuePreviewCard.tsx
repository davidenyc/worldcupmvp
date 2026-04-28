"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Clock3, Heart, Instagram, MapPin, Phone, Star } from "lucide-react";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { Badge } from "@/components/ui/badge";
import { UpgradeModal } from "@/components/membership/UpgradeModal";
import { usePremiumGate } from "@/lib/hooks/usePremiumGate";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useMembership } from "@/lib/store/membership";
import { CountrySummary, RankedVenue } from "@/lib/types";
import { getSoccerAtmosphereRating, toTitleCase } from "@/lib/utils";
import { getVenueIntentMeta } from "@/lib/venueIntents";

const popupChipBaseClass =
  "inline-flex h-6.5 items-center justify-center rounded-full px-2 text-[9px] font-semibold tracking-[0.07em]";

const popupSecondaryChipClass =
  `${popupChipBaseClass} w-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]`;

const popupActionClass =
  "flex h-8 items-center justify-center rounded-full px-2 text-center text-[11px] font-semibold transition";

function isNeutralSportsBar(venue: RankedVenue) {
  return (
    (
      venue.venueIntent === "sports_bar" ||
      venue.venueIntent === "bar_with_tv" ||
      (venue.venueTypes as string[]).includes("sports_bar")
    ) &&
    !venue.likelySupporterCountry
  );
}

export function VenuePreviewCard({
  venue,
  countries,
  activeCountrySlug,
  activeVenueIntent,
  activeVenueType,
  reservationsOnly = false,
  openNowOnly = false,
  highAtmosphereOnly = false,
  onToggleCountry,
  onToggleVenueIntent,
  onToggleVenueType,
  onToggleReservations,
  onToggleOpenNow,
  onToggleHighAtmosphere
}: {
  venue: RankedVenue;
  countries: CountrySummary[];
  activeCountrySlug?: string | null;
  activeVenueIntent?: RankedVenue["venueIntent"] | null;
  activeVenueType?: string;
  reservationsOnly?: boolean;
  openNowOnly?: boolean;
  highAtmosphereOnly?: boolean;
  onToggleCountry?: (slug: string) => void;
  onToggleVenueIntent?: (intent: RankedVenue["venueIntent"]) => void;
  onToggleVenueType?: (venueType: string) => void;
  onToggleReservations?: () => void;
  onToggleOpenNow?: () => void;
  onToggleHighAtmosphere?: () => void;
}) {
  const country = venue.likelySupporterCountry
    ? countries.find((item) => item.slug === venue.likelySupporterCountry) ?? null
    : null;
  const countryName = country?.name ?? null;
  const intent = getVenueIntentMeta(venue.venueIntent, countryName);
  const neutralSportsBar = isNeutralSportsBar(venue);
  const primaryVenueType = venue.venueTypes[0];
  const soccerAtmosphere = getSoccerAtmosphereRating(venue);
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const { canSaveVenue } = useMembership();
  const { showModal, setShowModal, requiredTier } = usePremiumGate("unlimited_saves");
  const favorite = favorites.includes(venue.slug);
  const isAtLimit = !favorite && !canSaveVenue(favorites.length);
  const countryChipSlug = neutralSportsBar ? null : venue.likelySupporterCountry ?? venue.associatedCountries[0] ?? null;
  const activeIntent = activeVenueIntent === venue.venueIntent;
  const utilityLinks = [
    venue.instagramUrl
      ? {
          href: venue.instagramUrl,
          icon: <Instagram className="h-3.5 w-3.5" />,
          label: "Instagram"
        }
      : null,
    venue.phone
      ? {
          href: `tel:${venue.phone}`,
          icon: <Phone className="h-3.5 w-3.5" />,
          label: "Call"
        }
      : null
  ].filter(Boolean) as Array<{ href: string; icon: ReactNode; label: string }>;

  function handleSave(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (isAtLimit) {
      setShowModal(true);
      return;
    }
    toggleFavorite(venue.slug);
  }

  function chipButtonClass(active: boolean, emphasis: "default" | "success" = "default") {
    if (emphasis === "success") {
      return `${popupChipBaseClass} w-full border ${
        active
          ? "border-emerald-500 bg-emerald-500 text-white dark:border-emerald-400 dark:bg-emerald-500 dark:text-[#0a1628]"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
      } transition`;
    }

    return `${popupChipBaseClass} w-full border ${
      active
        ? "border-[#f4b942] bg-[#fff4d6] text-[#0a1628] dark:border-[#f4b942] dark:bg-[#f4b942]/20 dark:text-[#ffd56b]"
        : "border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]"
    } transition`;
  }

  return (
    <div className="w-[min(206px,calc(100vw-76px))] max-w-[calc(100vw-76px)] px-2.5 py-2.5">
      <div className="space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleVenueIntent?.(venue.venueIntent);
            }}
            className={`${popupChipBaseClass} w-full transition ${intent.className} ${activeIntent ? "ring-2 ring-[#f4b942]/70 ring-offset-1 ring-offset-transparent" : ""}`}
          >
            {intent.label}
          </button>
          {primaryVenueType ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onToggleVenueType?.(primaryVenueType);
              }}
              className={chipButtonClass(activeVenueType === primaryVenueType)}
            >
              {toTitleCase(primaryVenueType.replace(/_/g, " "))}
            </button>
          ) : (
            <Badge className={popupSecondaryChipClass}>Watch spot</Badge>
          )}
        </div>

        <div className="grid grid-cols-[28px_minmax(0,1fr)_28px] items-start gap-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--country-flag-bg)] shadow-[0_1px_3px_rgba(10,22,40,0.12)]">
            {neutralSportsBar ? <span className="text-base leading-none">📍</span> : <CountryFlag country={country} size="sm" />}
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="text-[0.82rem] font-semibold leading-tight text-[color:var(--fg-primary)]">
              {venue.name}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[color:var(--fg-secondary)]">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {[venue.neighborhood, venue.borough].filter(Boolean).join(", ")}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[11px] text-[color:var(--fg-secondary)]">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span>{Number(venue.rating ?? 0).toFixed(1)}</span>
              </span>
              {venue.reviewCount ? (
                <span className="text-[9px] text-[color:var(--fg-muted)]">
                  {venue.reviewCount.toLocaleString()} reviews
                </span>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            aria-label={favorite ? "Remove from saved venues" : "Save venue"}
            onClick={handleSave}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full border transition ${
              favorite
                ? "border-[#f4b942] bg-[#fff4d6] text-[#c98a00] dark:border-[#f4b942] dark:bg-[#f4b942]/20 dark:text-[#ffd56b]"
                : "border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)] hover:brightness-[0.98]"
            }`}
          >
            <Heart className={`h-3 w-3 ${favorite ? "fill-current" : ""}`} />
            {isAtLimit ? <span className="absolute -right-1 -top-1 text-[9px]">🔒</span> : null}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (countryChipSlug) onToggleCountry?.(countryChipSlug);
            }}
            className={chipButtonClass(Boolean(countryChipSlug && activeCountrySlug === countryChipSlug))}
            disabled={!countryChipSlug}
          >
            {neutralSportsBar
              ? "Mixed crowd"
              : toTitleCase((venue.likelySupporterCountry ?? venue.associatedCountries[0] ?? "watch spot").replace(/-/g, " "))}
          </button>
          {venue.acceptsReservations ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onToggleReservations?.();
              }}
              className={chipButtonClass(reservationsOnly)}
            >
              Reservations
            </button>
          ) : (
            <Badge className={popupSecondaryChipClass}>~{venue.approximateCapacity ?? "?"} cap</Badge>
          )}
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleOpenNow?.();
            }}
            className={chipButtonClass(openNowOnly, "success")}
          >
            <Clock3 className="mr-1 h-3.5 w-3.5" />
            {venue.openNow ? "Open now" : "Hours vary"}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleHighAtmosphere?.();
            }}
            className={chipButtonClass(highAtmosphereOnly, "success")}
          >
            {soccerAtmosphere} atmosphere
          </button>
          {venue.acceptsReservations ? <Badge className={popupSecondaryChipClass}>~{venue.approximateCapacity ?? "?"} cap</Badge> : <div />}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <Link
            href={`/venue/${venue.slug}`}
            className={`${popupActionClass} bg-[#f4b942] text-[#0a1628] hover:bg-[#f0c86b]`}
          >
            Details
          </Link>
          {venue.acceptsReservations && (venue.reservationUrl || venue.reservationPhone) ? (
            <a
              href={venue.reservationUrl ?? `tel:${venue.reservationPhone!}`}
              target="_blank"
              rel="noreferrer"
              className={`${popupActionClass} bg-[#f4b942] text-[#0a1628] hover:bg-[#f0c86b]`}
            >
              Reserve
            </a>
          ) : venue.website ? (
            <a
              href={venue.website}
              target="_blank"
              rel="noreferrer"
              className={`${popupActionClass} border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]`}
            >
              Website
            </a>
          ) : venue.reservationPhone || venue.phone ? (
            <a
              href={`tel:${venue.reservationPhone ?? venue.phone ?? ""}`}
              className={`${popupActionClass} border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]`}
            >
              Call
            </a>
          ) : (
            <div className={`${popupActionClass} border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-muted)]`}>
              Venue info
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          <a
            href={`https://maps.apple.com/?q=${encodeURIComponent(venue.address)}`}
            target="_blank"
            rel="noreferrer"
            className={`${popupActionClass} border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]`}
          >
            Directions
          </a>
        </div>
        {utilityLinks.length ? (
          <div className="grid grid-cols-1 gap-1.5">
            <a
              href={utilityLinks[0].href}
              target={utilityLinks[0].href.startsWith("tel:") ? undefined : "_blank"}
              rel={utilityLinks[0].href.startsWith("tel:") ? undefined : "noreferrer"}
              className={`${popupActionClass} gap-1.5 border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[color:var(--fg-primary)]`}
              aria-label={utilityLinks[0].label}
            >
              {utilityLinks[0].icon}
              {utilityLinks[0].label}
            </a>
          </div>
        ) : null}
      </div>
      {showModal ? (
        <UpgradeModal
          feature="unlimited_saves"
          requiredTier={requiredTier}
          onClose={() => setShowModal(false)}
        />
      ) : null}
    </div>
  );
}
