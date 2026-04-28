import nycPromos from "@/data/promos/nyc.json";
import losAngelesPromos from "@/data/promos/los-angeles.json";
import { HOST_CITIES } from "@/lib/data/hostCities";
import type { MembershipTier } from "@/lib/store/membership";
import type { RankedVenue } from "@/lib/types";

export type PromoType =
  | "bogo"
  | "percent_off"
  | "free_item"
  | "happy_hour"
  | "matchday_special"
  | "membership_perk";

export type PromoAppliesTo = "first hour" | "full match" | "matchday" | "all_day";
export type PromoRedemptionType = "show_qr" | "mention_code" | "auto_applied" | "walk_in";

export interface PromoRecord {
  id: string;
  venue_id: string;
  title: string;
  description: string;
  type: PromoType;
  discount_pct: number;
  applies_to: PromoAppliesTo;
  match_ids: string[];
  start_iso: string;
  end_iso: string;
  tier_required: MembershipTier;
  redemption: PromoRedemptionType;
  code: string;
  qr_payload: string;
  max_redemptions: number;
  redemptions_used: number;
  image_url: string | null;
  verified: boolean;
  sponsored: boolean;
}

const PROMOS_BY_CITY: Record<string, PromoRecord[]> = {
  nyc: nycPromos as PromoRecord[],
  "los-angeles": losAngelesPromos as PromoRecord[]
};

function createFallbackPromo(cityKey: string, venue: RankedVenue, index: number): PromoRecord {
  const city = HOST_CITIES.find((entry) => entry.key === cityKey);
  const matchFocus = venue.matchFocus?.slice(0, 2) ?? [];
  const id = `promo-${cityKey}-${venue.slug}-${index + 1}`;
  const start = new Date("2026-06-11T17:00:00.000Z");
  start.setDate(start.getDate() + index);
  const end = new Date(start);
  end.setHours(end.getHours() + 3);

  const promoVariants: Array<Pick<PromoRecord, "title" | "description" | "type" | "tier_required" | "redemption" | "discount_pct" | "code">> = [
    {
      title: "50% off your first round before kickoff",
      description: `Sponsored by GameDay Map. Arrive early at ${venue.name} in ${city?.label ?? cityKey} and your opening round is half off.`,
      type: "happy_hour",
      tier_required: "free",
      redemption: "show_qr",
      discount_pct: 50,
      code: "KICKOFF50"
    },
    {
      title: "Reserved-table early access",
      description: `Fan Pass members can book ${venue.name} ahead of the public release window on big match nights.`,
      type: "membership_perk",
      tier_required: "fan",
      redemption: "auto_applied",
      discount_pct: 0,
      code: "FANPASS"
    },
    {
      title: "Elite skip-the-line lane",
      description: `Supporter Elite members get the fast lane and a priority host check-in at ${venue.name}.`,
      type: "membership_perk",
      tier_required: "elite",
      redemption: "show_qr",
      discount_pct: 0,
      code: "ELITEQR"
    }
  ];

  const variant = promoVariants[index % promoVariants.length];

  return {
    id,
    venue_id: venue.slug,
    title: variant.title,
    description: variant.description,
    type: variant.type,
    discount_pct: variant.discount_pct,
    applies_to: variant.type === "happy_hour" ? "first hour" : "matchday",
    match_ids: matchFocus,
    start_iso: start.toISOString(),
    end_iso: end.toISOString(),
    tier_required: variant.tier_required,
    redemption: variant.redemption,
    code: variant.code,
    qr_payload: `gdm:promo:${venue.slug}:${start.toISOString().slice(0, 10)}`,
    max_redemptions: 75,
    redemptions_used: 0,
    image_url: null,
    verified: true,
    sponsored: true
  };
}

function generateFallbackPromos(cityKey: string, venues: RankedVenue[]) {
  return venues.slice(0, 3).map((venue, index) => createFallbackPromo(cityKey, venue, index));
}

export function getPromosByCity(cityKey: string, venues: RankedVenue[] = []) {
  const seeded = PROMOS_BY_CITY[cityKey] ?? [];
  if (seeded.length > 0) return seeded;
  return generateFallbackPromos(cityKey, venues);
}

export function isPromoActive(promo: PromoRecord, now = new Date()) {
  return Date.parse(promo.start_iso) <= now.getTime() && now.getTime() <= Date.parse(promo.end_iso);
}

export function getActivePromosByCity(cityKey: string, venues: RankedVenue[] = [], now = new Date()) {
  return getPromosByCity(cityKey, venues).filter((promo) => promo.verified && isPromoActive(promo, now));
}

export function getVenuePromos(cityKey: string, venueId: string, venues: RankedVenue[] = [], now = new Date()) {
  return getPromosByCity(cityKey, venues)
    .filter((promo) => promo.venue_id === venueId)
    .sort((a, b) => Date.parse(a.start_iso) - Date.parse(b.start_iso))
    .map((promo) => ({
      ...promo,
      isActive: isPromoActive(promo, now)
    }));
}

export function getPromoTypeLabel(promo: PromoRecord) {
  switch (promo.type) {
    case "bogo":
      return "Buy one get one free";
    case "percent_off":
      return `${promo.discount_pct}% off ${promo.applies_to}`;
    case "free_item":
      return "Free item with reservation";
    case "happy_hour":
      return "Happy hour deal";
    case "matchday_special":
      return "Match-day special";
    case "membership_perk":
      return "Members only";
    default:
      return "Deal";
  }
}

export function getPromoRedemptionLabel(redemption: PromoRedemptionType) {
  switch (redemption) {
    case "show_qr":
      return "📱 QR";
    case "mention_code":
      return "💬 Code";
    case "walk_in":
      return "🚪 Walk-in";
    case "auto_applied":
      return "🎫 Auto";
    default:
      return "🎯 Deal";
  }
}

export function canRedeemPromo(tier: MembershipTier, promo: PromoRecord) {
  if (promo.tier_required === "free") return true;
  if (promo.tier_required === "fan") return tier === "fan" || tier === "elite";
  return tier === "elite";
}

export function getPromoLockCopy(promo: PromoRecord) {
  if (promo.tier_required === "fan") return "Unlock with Fan Pass";
  if (promo.tier_required === "elite") return "Get Elite to redeem";
  return "Tap to redeem";
}

export function getPromoVenueIdsWithActiveDeals(cityKey: string, venues: RankedVenue[] = [], now = new Date()) {
  return new Set(getActivePromosByCity(cityKey, venues, now).map((promo) => promo.venue_id));
}

export function isElitePartnerVenue(cityKey: string, venueId: string, venues: RankedVenue[] = []) {
  return getPromosByCity(cityKey, venues).some(
    (promo) => promo.venue_id === venueId && promo.tier_required === "elite"
  );
}
