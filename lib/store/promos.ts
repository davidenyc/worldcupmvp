"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { SavedPromo } from "@/lib/data/promos";

interface PromosState {
  savedPromos: SavedPromo[];
  redeemedPromoIds: string[];
  redemptionCodes: Record<string, string>;
  savePromo: (promo: SavedPromo) => void;
  markRedeemed: (promoId: string, redeemedAt?: string) => void;
  removePromo: (promoId: string) => void;
  clearExpiredPromos: (now?: string) => void;
  resetPromos: () => void;
}

function buildDerivedState(savedPromos: SavedPromo[]) {
  return {
    savedPromos,
    redeemedPromoIds: savedPromos.filter((entry) => Boolean(entry.redeemedAt)).map((entry) => entry.promoId),
    redemptionCodes: Object.fromEntries(savedPromos.map((entry) => [entry.promoId, entry.code]))
  };
}

export const usePromosStore = create<PromosState>()(
  persist(
    (set) => ({
      ...buildDerivedState([]),
      savePromo: (promo) =>
        set((state) =>
          buildDerivedState(
            state.savedPromos.some((entry) => entry.promoId === promo.promoId)
              ? state.savedPromos.map((entry) => (entry.promoId === promo.promoId ? promo : entry))
              : [promo, ...state.savedPromos]
          )
        ),
      markRedeemed: (promoId, redeemedAt = new Date().toISOString()) =>
        set((state) =>
          buildDerivedState(
            state.savedPromos.map((entry) =>
              entry.promoId === promoId ? { ...entry, redeemedAt } : entry
            )
          )
        ),
      removePromo: (promoId) =>
        set((state) => buildDerivedState(state.savedPromos.filter((entry) => entry.promoId !== promoId))),
      clearExpiredPromos: (now = new Date().toISOString()) =>
        set((state) =>
          buildDerivedState(
            state.savedPromos.filter((entry) => Date.parse(entry.expiresAt) > Date.parse(now))
          )
        ),
      resetPromos: () => set(buildDerivedState([]))
    }),
    {
      name: "gameday-promos"
    }
  )
);
