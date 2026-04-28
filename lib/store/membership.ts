"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MembershipTier = "free" | "fan" | "elite";

export type PremiumFeature =
  | "unlimited_country_filters"
  | "unlimited_saves"
  | "unlimited_promo_redemptions"
  | "reservation_request"
  | "premium_venue_badges"
  | "match_alerts"
  | "elite_activity_timeline"
  | "venue_concierge"
  | "early_access"
  | "advanced_filters"
  | "export_list"
  | "watch_party_groups"
  | "priority_support";

export const FEATURE_GATES: Record<PremiumFeature, MembershipTier[]> = {
  unlimited_country_filters: ["fan", "elite"],
  unlimited_saves: ["fan", "elite"],
  unlimited_promo_redemptions: ["fan", "elite"],
  reservation_request: ["fan", "elite"],
  premium_venue_badges: ["fan", "elite"],
  match_alerts: ["elite"],
  elite_activity_timeline: ["elite"],
  venue_concierge: ["elite"],
  early_access: ["elite"],
  advanced_filters: ["elite"],
  export_list: ["elite"],
  watch_party_groups: ["fan", "elite"],
  priority_support: ["elite"]
};

export const TIER_META = {
  free: {
    label: "Free",
    price: "$0",
    priceMonthly: 0,
    color: "#6b7280",
    badge: "Free",
    emoji: "",
    features: [
      "Browse all 17 host cities",
      "View full match schedule",
      "Filter by up to 2 countries",
      "Save up to 5 venues",
      "Basic venue info"
    ],
    limits: { maxCountryFilters: 2, maxSaves: 5 }
  },
  fan: {
    label: "Fan Pass",
    price: "$4.99",
    priceMonthly: 4.99,
    color: "#f4b942",
    badge: "⭐ Fan Pass",
    emoji: "⭐",
    features: [
      "Everything in Free",
      "Filter by all 48 countries at once",
      "Save unlimited venues",
      "Make reservation requests at any venue",
      "Premium venue picks & Hot Spot badges",
      "Create and join GameDay crews",
      "Fan Pass member badge"
    ],
    limits: { maxCountryFilters: 48, maxSaves: Number.POSITIVE_INFINITY }
  },
  elite: {
    label: "Supporter Elite",
    price: "$12.99",
    priceMonthly: 12.99,
    color: "#0a1628",
    badge: "👑 Elite",
    emoji: "👑",
    features: [
      "Everything in Fan Pass",
      "Match day alerts (email/push)",
      "Venue Concierge — we find your spot",
      "Early access to new venue drops",
      "Advanced filters (capacity, reservation type)",
      "Export your saved venue list as PDF",
      "Create and manage supporter crews",
      "Priority support",
      "Supporter Elite badge"
    ],
    limits: { maxCountryFilters: 48, maxSaves: Number.POSITIVE_INFINITY }
  }
} as const;

interface MembershipState {
  tier: MembershipTier;
  upgradedAt: string | null;
  setTier: (tier: MembershipTier) => void;
  reset: () => void;
  hasFeature: (feature: PremiumFeature) => boolean;
  canAddCountryFilter: (currentCount: number) => boolean;
  canSaveVenue: (currentCount: number) => boolean;
  getLimit: (key: keyof typeof TIER_META.free.limits) => number;
}

export const useMembership = create<MembershipState>()(
  persist(
    (set, get) => ({
      tier: "free",
      upgradedAt: null,
      setTier: (tier) =>
        set({
          tier,
          upgradedAt: tier === "free" ? null : new Date().toISOString()
        }),
      reset: () => set({ tier: "free", upgradedAt: null }),
      hasFeature: (feature) => {
        const { tier } = get();
        return FEATURE_GATES[feature].includes(tier);
      },
      canAddCountryFilter: (currentCount) => {
        const { tier } = get();
        const limit = TIER_META[tier].limits.maxCountryFilters;
        return currentCount < limit;
      },
      canSaveVenue: (currentCount) => {
        const { tier } = get();
        const limit = TIER_META[tier].limits.maxSaves;
        return currentCount < limit;
      },
      getLimit: (key) => {
        const { tier } = get();
        return TIER_META[tier].limits[key];
      }
    }),
    { name: "gameday-membership" }
  )
);
