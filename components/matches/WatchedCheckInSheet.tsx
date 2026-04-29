// Bottom-sheet check-in UI for MatchCard to save planned or watched matches with venue and rating.
"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, Star } from "lucide-react";

type VenueOption = {
  slug: string;
  name: string;
  neighborhood?: string | null;
  supporterCountry?: string | null;
};

const OTHER_OPTION = "__other__";

export function WatchedCheckInSheet({
  open,
  cityKey,
  cityLabel,
  kickoffPassed,
  initialVenueSlug,
  initialRating,
  onClose,
  onSubmit
}: {
  open: boolean;
  cityKey: string;
  cityLabel: string;
  kickoffPassed: boolean;
  initialVenueSlug?: string | null;
  initialRating?: number | null;
  onClose: () => void;
  onSubmit: (payload: { venueSlug: string | null; rating: number | null }) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [venueSlug, setVenueSlug] = useState(initialVenueSlug ?? OTHER_OPTION);
  const [rating, setRating] = useState(initialRating ?? 0);

  useEffect(() => {
    if (!open) return;
    setVenueSlug(initialVenueSlug ?? OTHER_OPTION);
    setRating(initialRating ?? 0);
  }, [initialRating, initialVenueSlug, open]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);

    void fetch(`/api/cities/${cityKey}/watch-venues`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load venues");
        }

        return response.json();
      })
      .then((payload) => {
        if (cancelled) return;
        setVenues(payload.venues ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setVenues([]);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cityKey, open]);

  if (!open) return null;

  const venueOptions = [
    {
      slug: OTHER_OPTION,
      name: kickoffPassed ? "Other / watched at home" : "Other / still deciding"
    },
    ...venues
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-deep/45 px-4 py-6 backdrop-blur-[2px]">
      <button
        type="button"
        aria-label="Close check-in sheet"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative z-[1] w-full max-w-lg rounded-[2rem] border border-line bg-surface p-5 shadow-card">
        <div className="mx-auto h-1.5 w-14 rounded-full bg-surface-2" />

        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-mist">
            {kickoffPassed ? "Match check-in" : "Watch plan"}
          </div>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-deep">
            {kickoffPassed ? "Tell us where you watched." : "Lock your watch plan."}
          </h3>
          <p className="mt-2 text-sm text-[color:var(--fg-secondary)]">
            {kickoffPassed
              ? `Pick a spot in ${cityLabel} or log that you watched from somewhere else.`
              : `Save a venue in ${cityLabel} now so My Cup keeps your plan together.`}
          </p>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <div className="text-sm font-semibold text-deep">
              {kickoffPassed ? "Where did you watch?" : "Where will you watch?"}
            </div>
            <div className="mt-3 grid gap-2">
              {loading ? (
                <div className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-line bg-surface-2 px-4 text-sm text-[color:var(--fg-secondary)]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading city venues…
                </div>
              ) : (
                venueOptions.map((venue) => {
                  const selected = venueSlug === venue.slug;
                  return (
                    <button
                      key={venue.slug}
                      type="button"
                      onClick={() => setVenueSlug(venue.slug)}
                      className={`flex min-h-11 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                        selected
                          ? "border-gold bg-gold/10 text-deep"
                          : "border-line bg-surface-2 text-deep hover:bg-surface"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{venue.name}</span>
                        {venue.neighborhood ? (
                          <span className="mt-1 block text-xs text-[color:var(--fg-secondary)]">
                            {venue.neighborhood}
                          </span>
                        ) : null}
                      </span>
                      <MapPin className={`h-4 w-4 shrink-0 ${selected ? "text-gold" : "text-mist"}`} />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-deep">
              {kickoffPassed ? "How was the watch?" : "How excited are you for this one?"}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {Array.from({ length: 5 }, (_, index) => {
                const nextRating = index + 1;
                const selected = nextRating <= rating;

                return (
                  <button
                    key={nextRating}
                    type="button"
                    onClick={() => setRating(selected && rating === nextRating ? 0 : nextRating)}
                    aria-label={`${nextRating} star${nextRating === 1 ? "" : "s"}`}
                    className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border transition ${
                      selected
                        ? "border-gold bg-gold/12 text-gold"
                        : "border-line bg-surface-2 text-mist hover:bg-surface"
                    }`}
                  >
                    <Star className={`h-5 w-5 ${selected ? "fill-current" : ""}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-5 text-sm font-semibold text-deep transition hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onSubmit({
                venueSlug: venueSlug === OTHER_OPTION ? null : venueSlug,
                rating: rating > 0 ? rating : null
              })
            }
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-deep transition hover:brightness-105"
          >
            {kickoffPassed ? "Save check-in →" : "Save plan →"}
          </button>
        </div>
      </div>
    </div>
  );
}
