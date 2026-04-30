"use client";

import { track } from "@vercel/analytics";

export function trackHomeView(props: { variant: "marketing" | "active"; isExplicit: boolean }) {
  track("home_view", props);
}

export function trackActionHeroCtaClick(props: { matchId: string; isUserMatch: boolean }) {
  track("action_hero_cta_click", props);
}

export function trackCountryStripFlagTap(props: { countrySlug: string; cityKey: string }) {
  track("country_strip_flag_tap", props);
}

export function trackAliveMatchCardCtaClick(props: { matchId: string; cityKey: string }) {
  track("alive_match_card_cta_click", props);
}

export function trackPremiumGateHit(props: { feature: string; route: string }) {
  track("premium_gate_hit", props);
}
