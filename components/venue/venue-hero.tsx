"use client";

import Image from "next/image";
import { useState } from "react";
import { MapPin, Share2, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { RankedVenue } from "@/lib/types";
import { formatPriceLevel } from "@/lib/utils";

function intentBanner(venueIntent: RankedVenue["venueIntent"]) {
  if (venueIntent === "watch_party") {
    return {
      label: "📺 This is a dedicated match venue",
      className: "bg-emerald-950 text-emerald-50"
    };
  }

  if (venueIntent === "sports_bar") {
    return {
      label: "⚽ Sports bar — games always on",
      className: "bg-sky-700 text-white"
    };
  }

  if (venueIntent === "both") {
    return {
      label: "🏆 Authentic dining + match coverage",
      className: "bg-violet-700 text-white"
    };
  }

  return {
    label: "🍽️ Authentic dining — call ahead for game coverage",
    className: "bg-amber-500 text-white"
  };
}

export function VenueHero({ venue }: { venue: RankedVenue }) {
  const [toastVisible, setToastVisible] = useState(false);
  const banner = intentBanner(venue.venueIntent);

  async function copyShareLink() {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 1500);
  }

  return (
    <section className="container-shell py-10">
      <div className="relative grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="absolute right-0 top-0 z-20">
          {toastVisible && (
            <div className="mb-3 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white shadow-card">
              Link copied!
            </div>
          )}
        </div>
        <div className="surface-strong overflow-hidden p-4">
          <div className={`mb-4 rounded-3xl px-4 py-3 text-sm font-semibold ${banner.className}`}>
            {banner.label}
          </div>
          <div className="flex items-center justify-between gap-4 pb-4">
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Venue spotlight</div>
            <button
              type="button"
              onClick={copyShareLink}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy transition hover:bg-sky/50"
            >
              <Share2 className="h-4 w-4" />
              Share this spot
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-[1.1fr,0.9fr]">
            <div className="relative min-h-[360px] overflow-hidden rounded-[28px]">
              <Image
                src={venue.imageUrls[0]}
                alt={venue.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/10 to-transparent" />
              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                {venue.isOfficialFanHub && <Badge className="bg-accent text-white">Official fan hub</Badge>}
                {venue.acceptsReservations && <Badge>Reserve a spot</Badge>}
              </div>
              <div className="absolute bottom-5 left-5 right-5">
                <h1 className="text-4xl font-semibold tracking-tight text-deep">{venue.name}</h1>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-navy/75">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    {venue.address}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Star className="h-4 w-4 text-accent" />
                    {venue.rating ?? "N/A"} rating
                  </span>
                  <span>{formatPriceLevel(venue.priceLevel)}</span>
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              {venue.imageUrls.slice(1, 3).map((image, index) => (
                <div key={image} className="relative min-h-[172px] overflow-hidden rounded-[24px]">
                  <Image src={image} alt={`${venue.name} gallery ${index + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="surface p-5">
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Best for watching matches</div>
            <div className="mt-2 text-2xl font-semibold text-deep">
              {venue.gameDayScore >= 9 ? "Premium watch-party pick" : "Reliable match-day venue"}
            </div>
            <p className="mt-3 text-sm leading-6 text-navy/72">{venue.editorialNotes}</p>
          </div>
          <div className="surface p-5">
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Capacity and reservation</div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white p-4">
                <div className="text-xs text-mist">Approx. capacity</div>
                <div className="mt-2 text-3xl font-semibold text-deep">{venue.approximateCapacity ?? "--"}</div>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <div className="text-xs text-mist">Reservation status</div>
                <div className="mt-2 text-xl font-semibold text-deep">
                  {venue.acceptsReservations ? "Available" : "Walk-in"}
                </div>
              </div>
            </div>
          </div>
          <div className="surface p-5">
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Atmosphere</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {venue.atmosphereTags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
