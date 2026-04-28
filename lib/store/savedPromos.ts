"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { SavedPromo } from "@/lib/data/promos";

interface SavedPromosState {
  savedPromos: SavedPromo[];
  savePromo: (promo: SavedPromo) => void;
  markRedeemed: (promoId: string, redeemedAt?: string) => void;
  removePromo: (promoId: string) => void;
  clearExpiredPromos: (now?: string) => void;
  resetSavedPromos: () => void;
}

export const useSavedPromosStore = create<SavedPromosState>()(
  persist(
    (set) => ({
      savedPromos: [],
      savePromo: (promo) =>
        set((state) => ({
          savedPromos: state.savedPromos.some((entry) => entry.promoId === promo.promoId)
            ? state.savedPromos.map((entry) => (entry.promoId === promo.promoId ? promo : entry))
            : [promo, ...state.savedPromos]
        })),
      markRedeemed: (promoId, redeemedAt = new Date().toISOString()) =>
        set((state) => ({
          savedPromos: state.savedPromos.map((entry) =>
            entry.promoId === promoId ? { ...entry, redeemedAt } : entry
          )
        })),
      removePromo: (promoId) =>
        set((state) => ({
          savedPromos: state.savedPromos.filter((entry) => entry.promoId !== promoId)
        })),
      clearExpiredPromos: (now = new Date().toISOString()) =>
        set((state) => ({
          savedPromos: state.savedPromos.filter((entry) => Date.parse(entry.expiresAt) > Date.parse(now))
        })),
      resetSavedPromos: () => set({ savedPromos: [] })
    }),
    {
      name: "gameday-saved-promos"
    }
  )
);
