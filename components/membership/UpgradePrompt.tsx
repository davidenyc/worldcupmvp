// Shared upgrade modal for /me and /promos gates, using FEATURE_GATES-backed feature keys for copy and tier targeting.
"use client";

import { useEffect } from "react";

import { trackPremiumGateHit } from "@/lib/analytics/track";
import type { MembershipTier, PremiumFeature } from "@/lib/store/membership";

const FEATURE_COPY: Record<
  PremiumFeature,
  {
    title: string;
    body: string;
    fanCta: string;
    eliteCta: string;
  }
> = {
  unlimited_country_filters: {
    title: "Follow every nation you care about",
    body: "Free fans can follow up to 2 countries. Fan Pass unlocks all 48 so your bars and promos stay personalized.",
    fanCta: "Upgrade to Fan Pass",
    eliteCta: "Get Elite"
  },
  unlimited_saves: {
    title: "Save unlimited venues",
    body: "You hit the free save cap. Fan Pass unlocks unlimited saves across all 17 host cities.",
    fanCta: "Upgrade to Fan Pass",
    eliteCta: "Get Elite"
  },
  unlimited_promo_redemptions: {
    title: "Claim more matchday deals",
    body: "Free fans get one promo redemption each week. Fan Pass unlocks unlimited promo claims and a bigger QR wallet.",
    fanCta: "Upgrade to Fan Pass",
    eliteCta: "Get Elite"
  },
  reservation_request: {
    title: "Reservation requests are a Fan Pass perk",
    body: "Try it free for 7 days and request reservations before match day gets crowded.",
    fanCta: "See plans",
    eliteCta: "Get Elite"
  },
  premium_venue_badges: {
    title: "Unlock premium venue picks",
    body: "Fan Pass surfaces Hot Spots and premium match-night signals across the map and saved lists.",
    fanCta: "Upgrade to Fan Pass",
    eliteCta: "Get Elite"
  },
  match_alerts: {
    title: "Elite-only matchday access",
    body: "Supporter Elite unlocks the highest-priority perks, QR access, and match alerts.",
    fanCta: "Upgrade to Fan Pass",
    eliteCta: "Get Elite"
  },
  elite_activity_timeline: {
    title: "See your full matchday timeline",
    body: "Elite members unlock venue visits, redeemed promos, and supporter activity in one running history.",
    fanCta: "Upgrade to Fan Pass",
    eliteCta: "Get Elite"
  },
  venue_concierge: {
    title: "Get venue concierge support",
    body: "Supporter Elite handles the back-and-forth on the busiest match nights so you don’t have to.",
    fanCta: "Upgrade to Fan Pass",
    eliteCta: "Get Elite"
  },
  early_access: {
    title: "Get access before the crowd",
    body: "Supporter Elite gets earlier reservation windows and first look at newly added partner venues.",
    fanCta: "Upgrade to Fan Pass",
    eliteCta: "Get Elite"
  },
  advanced_filters: {
    title: "Unlock advanced filters",
    body: "Supporter Elite adds deeper matchday discovery filters for big groups, reservations, and venue setup.",
    fanCta: "Upgrade to Fan Pass",
    eliteCta: "Get Elite"
  },
  export_list: {
    title: "Export your matchday shortlists",
    body: "Supporter Elite can export saved venues and planning notes in one shareable list.",
    fanCta: "Upgrade to Fan Pass",
    eliteCta: "Get Elite"
  },
  watch_party_groups: {
    title: "Unlock bigger watch-party tools",
    body: "Fan Pass and Elite give you richer group planning tools and better match-day coordination.",
    fanCta: "Upgrade to Fan Pass",
    eliteCta: "Get Elite"
  },
  priority_support: {
    title: "Get priority support",
    body: "Supporter Elite is the fastest path when you need help on a match day.",
    fanCta: "Upgrade to Fan Pass",
    eliteCta: "Get Elite"
  }
};

export function UpgradePrompt({
  feature,
  requiredTier,
  onClose
}: {
  feature: PremiumFeature;
  requiredTier?: MembershipTier;
  onClose: () => void;
}) {
  const copy = FEATURE_COPY[feature];
  const tier = requiredTier ?? "fan";
  const ctaLabel = tier === "elite" ? copy.eliteCta : copy.fanCta;
  const returnQuery = encodeURIComponent("/me");

  useEffect(() => {
    trackPremiumGateHit({ feature, route: "/me" });
  }, [feature]);

  return (
    <>
      <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-[111] rounded-t-[2rem] bg-[var(--bg-surface)] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 shadow-2xl sm:left-1/2 sm:top-1/2 sm:w-[min(30rem,92vw)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[2rem]">
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-line sm:hidden" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-mist">
              {tier === "elite" ? "Elite required" : "Fan Pass required"}
            </div>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-deep">{copy.title}</h3>
            <p className="mt-3 text-sm leading-6 text-mist">{copy.body}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface-2"
          >
            Close
          </button>
        </div>
        <a
          href={`/membership?tier=${tier}&feature=${feature}&return=${returnQuery}#membership-cards`}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-deep"
        >
          {ctaLabel} →
        </a>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-line bg-surface px-5 text-sm font-semibold text-deep transition hover:bg-surface-2"
        >
          Maybe later
        </button>
      </div>
    </>
  );
}
