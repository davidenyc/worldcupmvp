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

export function trackLiveActivityTickerView(props: { cityKey: string }) {
  track("live_activity_ticker_view", props);
}

export function trackFeaturedVenueCtaClick(props: { venueSlug: string; matchId: string; cityKey: string }) {
  track("featured_venue_cta_click", props);
}

export function trackEditorialPickCtaClick(props: { venueHref: string }) {
  track("editorial_pick_cta_click", props);
}

export function trackVibeChipTap(props: { vibe: string; cityKey: string }) {
  track("vibe_chip_tap", props);
}

export function trackSocialProofCtaClick(props: { href: string }) {
  track("social_proof_cta_click", props);
}

export function trackStickyTonightPillClick(props: { href: string }) {
  track("sticky_tonight_pill_click", props);
}
