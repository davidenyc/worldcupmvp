"use client";

import { useUserStore } from "@/lib/store/user";

type WatchPlanMap = Record<string, string | null>;

export interface WatchlistState {
  watchedMatches: string[];
  watchVenues: WatchPlanMap;
  toggleWatchedMatch: (matchId: string) => void;
  setWatchVenue: (matchId: string, venueSlug: string | null) => void;
  clearWatchVenue: (matchId: string) => void;
  resetWatchlist: () => void;
}

function toWatchlistState(state: ReturnType<typeof useUserStore.getState>): WatchlistState {
  return {
    watchedMatches: state.profile.watchlistMatchIds,
    watchVenues: state.profile.watchVenues,
    toggleWatchedMatch: state.toggleWatchlistMatch,
    setWatchVenue: state.setWatchVenue,
    clearWatchVenue: state.clearWatchVenue,
    resetWatchlist: () =>
      state.updateUser({
        watchlistMatchIds: [],
        watchVenues: {}
      })
  };
}

export function useWatchlistStore<T>(selector: (state: WatchlistState) => T) {
  return useUserStore((state) => selector(toWatchlistState(state)));
}
