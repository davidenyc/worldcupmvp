"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WatchPlanMap = Record<string, string | null>;

interface WatchlistState {
  watchedMatches: string[];
  watchVenues: WatchPlanMap;
  toggleWatchedMatch: (matchId: string) => void;
  setWatchVenue: (matchId: string, venueSlug: string | null) => void;
  clearWatchVenue: (matchId: string) => void;
  resetWatchlist: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchedMatches: [],
      watchVenues: {},
      toggleWatchedMatch: (matchId) =>
        set((state) => {
          const alreadyWatching = state.watchedMatches.includes(matchId);
          if (alreadyWatching) {
            const nextWatchVenues = { ...state.watchVenues };
            delete nextWatchVenues[matchId];
            return {
              watchedMatches: state.watchedMatches.filter((entry) => entry !== matchId),
              watchVenues: nextWatchVenues
            };
          }

          return {
            watchedMatches: [...state.watchedMatches, matchId],
            watchVenues: state.watchVenues
          };
        }),
      setWatchVenue: (matchId, venueSlug) =>
        set((state) => ({
          watchedMatches: state.watchedMatches.includes(matchId)
            ? state.watchedMatches
            : [...state.watchedMatches, matchId],
          watchVenues: {
            ...state.watchVenues,
            [matchId]: venueSlug
          }
        })),
      clearWatchVenue: (matchId) =>
        set((state) => {
          const nextWatchVenues = { ...state.watchVenues };
          delete nextWatchVenues[matchId];
          return { watchVenues: nextWatchVenues };
        }),
      resetWatchlist: () => set({ watchedMatches: [], watchVenues: {} })
    }),
    {
      name: "gameday-watchlist"
    }
  )
);
