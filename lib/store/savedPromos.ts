"use client";

import { usePromosStore } from "@/lib/store/promos";

import type { SavedPromo } from "@/lib/data/promos";

export interface SavedPromosState {
  savedPromos: SavedPromo[];
  savePromo: (promo: SavedPromo) => void;
  markRedeemed: (promoId: string, redeemedAt?: string) => void;
  removePromo: (promoId: string) => void;
  clearExpiredPromos: (now?: string) => void;
  resetSavedPromos: () => void;
}

function toSavedPromosState(state: ReturnType<typeof usePromosStore.getState>): SavedPromosState {
  return {
    savedPromos: state.savedPromos,
    savePromo: state.savePromo,
    markRedeemed: state.markRedeemed,
    removePromo: state.removePromo,
    clearExpiredPromos: state.clearExpiredPromos,
    resetSavedPromos: state.resetPromos
  };
}

export function useSavedPromosStore<T>(selector: (state: SavedPromosState) => T) {
  return usePromosStore((state) => selector(toSavedPromosState(state)));
}
