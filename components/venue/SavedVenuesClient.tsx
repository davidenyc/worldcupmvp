"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { VenueCard } from "@/components/venue/venue-card";
import { useFavoritesStore } from "@/lib/store/favorites";
import { RankedVenue } from "@/lib/types";

export function SavedVenuesClient({ venues }: { venues: RankedVenue[] }) {
  const favorites = useFavoritesStore((state) => state.favorites);
  const savedVenues = venues.filter((venue) => favorites.includes(venue.slug));

  return (
    <section className="surface p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-mist">Saved venues</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-deep">Your saved watch spots</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-navy/72">
            Keep your favorite bars and restaurants in one place so it is easy to come back to them.
          </p>
        </div>
        <div className="rounded-full bg-sky/60 px-3 py-1 text-xs font-semibold text-navy">
          {savedVenues.length ? `${savedVenues.length} saved` : "No saved venues yet"}
        </div>
      </div>

      {savedVenues.length ? (
        <div className="mt-6 grid gap-4">
          {savedVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-line bg-white/80 p-8 text-center dark:border-white/10 dark:bg-white/5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky/70 text-accent dark:bg-white/10">
            <Heart className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-deep">Nothing saved yet</h2>
          <p className="mt-2 text-sm leading-6 text-navy/72">
            Tap <span className="font-semibold">Save</span> on any venue card and it will show up here.
          </p>
          <Link
            href="/nyc/map"
            className="mt-5 inline-flex rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-[#0a1628]"
          >
            Explore venues
          </Link>
        </div>
      )}
    </section>
  );
}
