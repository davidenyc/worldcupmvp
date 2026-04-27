"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface VenueReview {
  id: string;
  venueId: string;
  userId: string;
  rating: number;
  text: string;
  vibe: string;
  visitedAt: string;
  createdAt: string;
  displayName?: string;
  avatarEmoji?: string;
}

interface ReviewState {
  reviews: VenueReview[];
  addReview: (review: Omit<VenueReview, "id" | "createdAt">) => void;
  getVenueReviews: (venueId: string) => VenueReview[];
  getVenueRating: (venueId: string) => number | null;
  hasReviewed: (venueId: string, userId: string) => boolean;
  reset: () => void;
}

export const useReviews = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: [],
      addReview: (data) =>
        set({
          reviews: [
            ...get().reviews,
            {
              ...data,
              id: Math.random().toString(36).slice(2, 10),
              createdAt: new Date().toISOString()
            }
          ]
        }),
      getVenueReviews: (venueId) =>
        get()
          .reviews.filter((r) => r.venueId === venueId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      getVenueRating: (venueId) => {
        const rs = get().reviews.filter((r) => r.venueId === venueId);
        if (!rs.length) return null;
        return rs.reduce((sum, review) => sum + review.rating, 0) / rs.length;
      },
      hasReviewed: (venueId, userId) =>
        get().reviews.some((r) => r.venueId === venueId && r.userId === userId),
      reset: () => set({ reviews: [] })
    }),
    { name: "gameday-reviews" }
  )
);
