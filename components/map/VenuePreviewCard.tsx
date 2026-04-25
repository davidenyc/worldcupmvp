"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Clock3, ExternalLink, Heart, Instagram, MapPin, Phone, Star } from "lucide-react";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { Badge } from "@/components/ui/badge";
import { useFavoritesStore } from "@/lib/store/favorites";
import { CountrySummary, RankedVenue } from "@/lib/types";
import { getSoccerAtmosphereRating, toTitleCase } from "@/lib/utils";
import { getVenueIntentMeta } from "@/lib/venueIntents";

const popupChipBaseClass =
  "inline-flex h-7 items-center justify-center rounded-full px-2.5 text-[10px] font-semibold tracking-[0.08em]";

const popupSecondaryChipClass =
  `${popupChipBaseClass} w-full border border-[#d8e3f5] bg-white text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white`;

const popupActionClass =
  "flex h-10 items-center justify-center rounded-full px-3 text-center text-[13px] font-semibold transition";

function isNeutralSportsBar(venue: RankedVenue) {
  return (
    (venue.venueIntent === "sports_bar" || (venue.venueTypes as string[]).includes("sports_bar")) &&
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
  const favorite = favorites.includes(venue.slug);
  const countryChipSlug = neutralSportsBar ? null : venue.likelySupporterCountry ?? venue.associatedCountries[0] ?? null;
  const activeIntent = activeVenueIntent === venue.venueIntent;
  const utilityLinks = [
    venue.website
      ? {
          href: venue.website,
          icon: <ExternalLink className="h-4 w-4" />,
          label: "Website"
        }
      : null
  ].filter(Boolean) as Array<{ href: string; icon: ReactNode; label: string }>;

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
        : "border border-[#d8e3f5] bg-white text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white"
    } transition`;
  }

  return (
    <div className="w-[min(228px,calc(100vw-64px))] max-w-[calc(100vw-64px)] px-3.5 py-3.5">
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
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
            <div />
          )}
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
            <div />
          )}
          <button
            type="button"
            aria-label={favorite ? "Remove from saved venues" : "Save venue"}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleFavorite(venue.slug);
            }}
            className={`inline-flex h-7 w-full items-center justify-center rounded-full border transition ${
              favorite
                ? "border-[#f4b942] bg-[#fff4d6] text-[#c98a00] dark:border-[#f4b942] dark:bg-[#f4b942]/20 dark:text-[#ffd56b]"
                : "border-[#d8e3f5] bg-white text-[#0a1628] hover:bg-[#f8fbff] dark:border-white/15 dark:bg-white/8 dark:text-white dark:hover:bg-white/12"
            }`}
          >
            <Heart className={`h-3 w-3 ${favorite ? "fill-current" : ""}`} />
          </button>
        </div>

        <div className="grid grid-cols-[34px_minmax(0,1fr)] items-start gap-2.5">
          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-[#f8fbff] shadow-[0_1px_3px_rgba(10,22,40,0.12)] dark:bg-white/10">
            {neutralSportsBar ? <span className="text-base leading-none">📍</span> : <CountryFlag country={country} size="sm" />}
          </div>
          <div className="min-w-0 space-y-1">
            <div className="text-[0.88rem] font-semibold leading-tight text-[#0a1628] dark:text-white">
              {venue.name}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#0a1628]/60 dark:text-white/60">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {[venue.neighborhood, venue.borough].filter(Boolean).join(", ")}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[11px] text-[#0a1628]/68 dark:text-white/68">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span>{Number(venue.rating ?? 0).toFixed(1)}</span>
              </span>
              {venue.reviewCount ? (
                <span className="text-[10px] text-[#0a1628]/42 dark:text-white/42">
                  {venue.reviewCount.toLocaleString()} reviews
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
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
          <Badge className={popupSecondaryChipClass}>~{venue.approximateCapacity ?? "?"} cap</Badge>
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
        </div>

        <div className="grid grid-cols-2 gap-2">
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
              className={`${popupActionClass} border border-[#d8e3f5] bg-white text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white`}
            >
              Website
            </a>
          ) : venue.reservationPhone || venue.phone ? (
            <a
              href={`tel:${venue.reservationPhone ?? venue.phone ?? ""}`}
              className={`${popupActionClass} border border-[#d8e3f5] bg-white text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white`}
            >
              Call
            </a>
          ) : (
            <div className={`${popupActionClass} border border-[#d8e3f5] bg-white/70 text-[#0a1628]/45 dark:border-white/15 dark:bg-white/5 dark:text-white/40`}>
              Venue info
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a
            href={`https://maps.apple.com/?q=${encodeURIComponent(venue.address)}`}
            target="_blank"
            rel="noreferrer"
            className={`${popupActionClass} border border-[#d8e3f5] bg-white text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white`}
          >
            Directions
          </a>
          {utilityLinks.length ? (
            utilityLinks[0] ? (
              <a
                href={utilityLinks[0].href}
                target={utilityLinks[0].href.startsWith("tel:") ? undefined : "_blank"}
                rel={utilityLinks[0].href.startsWith("tel:") ? undefined : "noreferrer"}
                className={`${popupActionClass} border border-[#d8e3f5] bg-white text-[#0a1628] dark:border-white/15 dark:bg-white/8 dark:text-white`}
                aria-label={utilityLinks[0].label}
              >
                {utilityLinks[0].icon}
              </a>
            ) : (
              <div />
            )
          ) : (
            <div />
          )}

        </div>
      </div>
    </div>
  );
}
