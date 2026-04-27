"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/ui/EmptyState";
import { StarRating } from "@/components/ui/StarRating";
import { VibeSelector } from "@/components/ui/VibeSelector";
import { Badge } from "@/components/ui/badge";
import { useReviews } from "@/lib/store/reviews";
import { useUser } from "@/lib/store/user";

export function ReviewSection({ venueId }: { venueId: string }) {
  const user = useUser();
  const reviews = useReviews((state) => state.getVenueReviews(venueId));
  const addReview = useReviews((state) => state.addReview);
  const hasReviewed = useReviews((state) => state.hasReviewed(venueId, user.id));
  const [rating, setRating] = useState(5);
  const [vibe, setVibe] = useState("lively");
  const [text, setText] = useState("");
  const [visitedAt, setVisitedAt] = useState(new Date().toISOString().slice(0, 10));

  const average = useMemo(() => {
    if (!reviews.length) return null;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [reviews]);

  return (
    <section className="surface p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-mist">Fan Reviews ({reviews.length})</div>
          {average ? <div className="mt-2 text-sm text-navy/70">Average rating: {average.toFixed(1)} / 5</div> : null}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {reviews.length ? (
          reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-line bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{review.avatarEmoji ?? "⚽"}</span>
                  <div className="text-sm font-semibold text-deep dark:text-white">{review.displayName ?? "Fan"}</div>
                </div>
                <Badge>{review.vibe}</Badge>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <StarRating value={review.rating} readonly />
                <div className="text-xs text-navy/55 dark:text-white/55">{new Date(review.createdAt).toLocaleDateString("en-US")}</div>
              </div>
              <p className="mt-3 text-sm text-navy/75 dark:text-white/75">{review.text}</p>
            </div>
          ))
        ) : (
          <EmptyState emoji="⚽" title="No reviews yet — be the first!" />
        )}
      </div>

      <div className="mt-6 border-t border-line pt-6 dark:border-white/10">
        {hasReviewed ? (
          <div className="rounded-2xl bg-[#fff8e7] p-4 text-sm font-semibold text-[#0a1628]">
            You reviewed this venue already.
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!text.trim()) {
                toast.error("Add a quick note for other fans.");
                return;
              }
              addReview({
                venueId,
                userId: user.id,
                rating,
                text: text.trim(),
                vibe,
                visitedAt,
                displayName: user.displayName,
                avatarEmoji: user.avatarEmoji
              });
              toast.success("Review posted!");
              setText("");
            }}
          >
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Write a review</div>
            <StarRating value={rating} onChange={setRating} />
            <VibeSelector value={vibe} onChange={setVibe} />
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value.slice(0, 280))}
              placeholder="Tell other fans what to expect..."
              className="min-h-[110px] w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            <input
              type="date"
              value={visitedAt}
              onChange={(event) => setVisitedAt(event.target.value)}
              className="h-12 rounded-2xl border border-line bg-white px-4 text-sm text-navy dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            <button className="inline-flex rounded-full bg-[#f4b942] px-5 py-3 text-sm font-bold text-[#0a1628]" type="submit">
              Submit review
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
