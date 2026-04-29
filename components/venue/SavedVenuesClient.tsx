"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { VenueCard } from "@/components/venue/venue-card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useUserCity } from "@/lib/hooks/useUserCity";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useMembership } from "@/lib/store/membership";
import { RankedVenue } from "@/lib/types";

export function SavedVenuesClient({ venues }: { venues: RankedVenue[] }) {
  const favorites = useFavoritesStore((state) => state.favorites);
  const { tier } = useMembership();
  const { userCity } = useUserCity();
  const savedVenues = venues.filter((venue) => favorites.includes(venue.slug));
  const exploreHref = `/${userCity ?? "nyc"}/map`;

  return (
    <section className="surface p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-mist">Saved venues</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-deep">❤️ Saved Venues</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-navy/72">
            Keep your favorite bars and restaurants in one place so it is easy to come back to them.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-sky/60 px-3 py-1 text-xs font-semibold text-navy">
            {savedVenues.length ? `${savedVenues.length} saved` : "No saved venues yet"}
          </div>
          {savedVenues.length ? (
            <button
              type="button"
              onClick={async () => {
                const text = `My GameDay Map venues: ${savedVenues.map((venue) => venue.name).join(", ")} gamedaymap.com`;
                if (navigator.share) {
                  await navigator.share({ title: "My GameDay Map venues", text });
                } else {
                  await navigator.clipboard.writeText(text);
                  toast.success("List copied!");
                }
              }}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-deep"
            >
              Share my list
            </button>
          ) : null}
        </div>
      </div>

      {tier === "free" && favorites.length >= 5 ? (
        <div className="mt-6 rounded-2xl border border-gold bg-[var(--accent-soft-bg)] p-4">
          <div className="font-bold text-deep">⭐ You&apos;ve saved 5 venues — the Free limit</div>
          <div className="mt-1 text-sm text-[color:var(--fg-secondary)]">
            Upgrade to Fan Pass to save unlimited venues from all 17 cities.
          </div>
          <Link
            href="/membership?feature=unlimited_saves&return=%2Fsaved"
            className="mt-3 inline-flex rounded-full bg-gold px-4 py-2 text-sm font-bold text-deep"
          >
            Upgrade to Fan Pass →
          </Link>
        </div>
      ) : null}

      {savedVenues.length ? (
        <div className="mt-6 grid gap-4">
          {savedVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            emoji="❤️"
            title="No saved venues yet"
            subtitle="Browse venues in your city and tap the heart to save them."
            action={
              <Link href={exploreHref} className="inline-flex rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-deep">
                Find venues →
              </Link>
            }
          />
        </div>
      )}
    </section>
  );
}
