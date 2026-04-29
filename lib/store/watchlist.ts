"use client";

import { WatchStatus, useUserStore } from "@/lib/store/user";

type WatchPlanMap = Record<string, string | null>;
type WatchStatusMap = Record<string, WatchStatus>;
type WatchRatingMap = Record<string, number | null>;

export interface WatchlistState {
  watchedMatches: string[];
  watchStatuses: WatchStatusMap;
  watchVenues: WatchPlanMap;
  watchRatings: WatchRatingMap;
  toggleWatchedMatch: (matchId: string) => void;
  planWatchMatch: (matchId: string, venueSlug?: string | null) => void;
  markWatchedMatch: (
    matchId: string,
    options?: { venueSlug?: string | null; rating?: number | null }
  ) => void;
  setWatchVenue: (matchId: string, venueSlug: string | null) => void;
  clearWatchVenue: (matchId: string) => void;
  resetWatchlist: () => void;
}

function toWatchlistState(state: ReturnType<typeof useUserStore.getState>): WatchlistState {
  return {
    watchedMatches: state.profile.watchlistMatchIds,
    watchStatuses: state.profile.watchStatuses,
    watchVenues: state.profile.watchVenues,
    watchRatings: state.profile.watchRatings,
    toggleWatchedMatch: state.toggleWatchlistMatch,
    planWatchMatch: state.planWatchMatch,
    markWatchedMatch: state.markWatchedMatch,
    setWatchVenue: state.setWatchVenue,
    clearWatchVenue: state.clearWatchVenue,
    resetWatchlist: () =>
      state.updateUser({
        watchlistMatchIds: [],
        watchStatuses: {},
        watchVenues: {},
        watchRatings: {}
      })
  };
}

export function useWatchlistStore<T>(selector: (state: WatchlistState) => T) {
  return useUserStore((state) => selector(toWatchlistState(state)));
}
