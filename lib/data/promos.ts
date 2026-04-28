import type { MembershipTier } from "@/lib/store/membership";
import type { RankedVenue } from "@/lib/types";

export interface Promo {
  id: string;
  venueSlug: string;
  cityKey: string;
  countrySlugs: string[];
  matchIds?: string[];
  title: string;
  body: string;
  termsUrl?: string;
  qrTemplate: string;
  imageUrl?: string;
  startsAt: string;
  endsAt: string;
  tier: "free" | "fan" | "elite";
  featured: boolean;
  sponsorshipTier?: 1 | 2 | 3;
  perUserLimit: number;
  totalLimit?: number;
  redemptionStrategy: "qr_show" | "qr_scan_at_venue" | "promo_code";
}

export interface SavedPromo {
  promoId: string;
  venueSlug: string;
  code: string;
  claimedAt: string;
  expiresAt: string;
  redeemedAt?: string;
}

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
  city_key: string;
  country_slugs: string[];
  match_ids: string[];
  title: string;
  description: string;
  type: PromoType;
  discount_pct: number;
  applies_to: PromoAppliesTo;
  start_iso: string;
  end_iso: string;
  tier_required: MembershipTier;
  redemption: PromoRedemptionType;
  code: string;
  qr_payload: string;
  qr_template: string;
  max_redemptions: number;
  redemptions_used: number;
  image_url: string | null;
  verified: boolean;
  sponsored: boolean;
  sponsorship_tier?: 1 | 2 | 3;
  per_user_limit: number;
  terms_url?: string;
}

const QR_TEMPLATE = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={code}";

const PROMO_SEED: Promo[] = [
  {
    id: "promo-nyc-churchill-early-pint",
    venueSlug: "england-the-churchill-tavern",
    cityKey: "nyc",
    countrySlugs: ["england", "usa"],
    matchIds: ["c-1", "f-2", "k-3"],
    title: "Arrive early, save 50% on your first pint",
    body: "Sponsored by GameDay Map. Check in 30 minutes before kickoff and your first draft lands at half price.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-04-28T17:30:00-04:00",
    endsAt: "2026-04-29T01:00:00-04:00",
    tier: "free",
    featured: true,
    sponsorshipTier: 1,
    perUserLimit: 1,
    totalLimit: 120,
    redemptionStrategy: "qr_show"
  },
  {
    id: "promo-nyc-la-contenta-bogo",
    venueSlug: "mexico-la-contenta-oeste",
    cityKey: "nyc",
    countrySlugs: ["mexico"],
    matchIds: ["a-1", "a-4", "a-5"],
    title: "BOGO margaritas through halftime",
    body: "Sponsored by GameDay Map. Buy one margarita, get one free during the first half of every Mexico match.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-04-28T18:00:00-04:00",
    endsAt: "2026-04-29T00:30:00-04:00",
    tier: "free",
    featured: true,
    sponsorshipTier: 1,
    perUserLimit: 1,
    totalLimit: 200,
    redemptionStrategy: "promo_code"
  },
  {
    id: "promo-nyc-berimbau-caipirinha",
    venueSlug: "brazil-berimbau-36th-street",
    cityKey: "nyc",
    countrySlugs: ["brazil"],
    matchIds: ["c-1", "c-4"],
    title: "Members-only caipirinha upgrade",
    body: "Fan Pass and Elite members get a complimentary caipirinha upgrade with any same-day reservation.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-04-28T17:00:00-04:00",
    endsAt: "2026-04-29T23:30:00-04:00",
    tier: "fan",
    featured: true,
    sponsorshipTier: 2,
    perUserLimit: 1,
    totalLimit: 80,
    redemptionStrategy: "qr_scan_at_venue"
  },
  {
    id: "promo-nyc-carraghers-priority-entry",
    venueSlug: "england-carraghers",
    cityKey: "nyc",
    countrySlugs: ["england", "scotland"],
    matchIds: ["c-2", "c-3", "d-2"],
    title: "Skip-the-line entry lane",
    body: "Supporter Elite members can use the priority entry lane on England, Scotland, and marquee UEFA-style nights.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-04-28T18:00:00-04:00",
    endsAt: "2026-04-29T23:59:00-04:00",
    tier: "elite",
    featured: true,
    sponsorshipTier: 2,
    perUserLimit: 1,
    totalLimit: 60,
    redemptionStrategy: "qr_show"
  },
  {
    id: "promo-nyc-ofrenda-walk-in-plate",
    venueSlug: "mexico-ofrenda",
    cityKey: "nyc",
    countrySlugs: ["mexico"],
    matchIds: ["a-1", "a-4", "a-5"],
    title: "Free taco plate before halftime",
    body: "Show your code at the host stand and GameDay Map covers one taco plate before halftime on Mexico match nights.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-04-28T18:00:00-04:00",
    endsAt: "2026-04-29T00:30:00-04:00",
    tier: "free",
    featured: true,
    sponsorshipTier: 3,
    perUserLimit: 1,
    totalLimit: 45,
    redemptionStrategy: "qr_show"
  },
  {
    id: "promo-nyc-u-bar-first-beer",
    venueSlug: "nyc-usa-the-u-bar-and-grill",
    cityKey: "nyc",
    countrySlugs: ["usa"],
    matchIds: ["i-1", "i-4"],
    title: "$5 off your first beer on USA nights",
    body: "Grab a seat before kickoff and your first domestic draft is five dollars off all USA group-stage matches.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-04-29T17:30:00-04:00",
    endsAt: "2026-04-30T00:30:00-04:00",
    tier: "free",
    featured: false,
    perUserLimit: 1,
    totalLimit: 110,
    redemptionStrategy: "qr_show"
  },
  {
    id: "promo-nyc-kaia-brunch-table",
    venueSlug: "south-africa-kaia-wine-bar",
    cityKey: "nyc",
    countrySlugs: ["south-africa"],
    matchIds: ["a-1"],
    title: "Reserve early, get the brunch toast on us",
    body: "Fan Pass members who book before public release get a complimentary small plate for the opening brunch crowd.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-04-29T11:00:00-04:00",
    endsAt: "2026-04-29T16:00:00-04:00",
    tier: "fan",
    featured: false,
    perUserLimit: 1,
    totalLimit: 40,
    redemptionStrategy: "qr_scan_at_venue"
  },
  {
    id: "promo-nyc-banters-late-match",
    venueSlug: "england-banters",
    cityKey: "nyc",
    countrySlugs: ["england"],
    matchIds: ["d-2", "d-3"],
    title: "Second pint 50% off after the anthem",
    body: "For the late-match crowd: buy any pint and the second one is half off once the teams walk out.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-04-30T18:30:00-04:00",
    endsAt: "2026-05-01T00:00:00-04:00",
    tier: "free",
    featured: false,
    perUserLimit: 1,
    totalLimit: 90,
    redemptionStrategy: "promo_code"
  },
  {
    id: "promo-la-joxer-halftime",
    venueSlug: "england-joxer-daly-s",
    cityKey: "los-angeles",
    countrySlugs: ["england", "usa"],
    matchIds: ["d-2", "i-1"],
    title: "Buy one get one free through halftime",
    body: "Sponsored by GameDay Map. First-round pints are BOGO until the break on England and USA nights.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-04-28T15:00:00-07:00",
    endsAt: "2026-04-28T21:00:00-07:00",
    tier: "free",
    featured: true,
    sponsorshipTier: 2,
    perUserLimit: 1,
    totalLimit: 100,
    redemptionStrategy: "promo_code"
  },
  {
    id: "promo-la-toms-early-table",
    venueSlug: "usa-tom-s-watch-bar",
    cityKey: "los-angeles",
    countrySlugs: ["usa", "mexico"],
    matchIds: ["i-1", "a-1"],
    title: "15% off your table when you reserve early",
    body: "Fan Pass members can lock in a reserved table before public release on USA and Mexico nights.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-04-29T17:00:00-07:00",
    endsAt: "2026-04-30T00:00:00-07:00",
    tier: "fan",
    featured: true,
    sponsorshipTier: 3,
    perUserLimit: 1,
    totalLimit: 90,
    redemptionStrategy: "qr_scan_at_venue"
  }
];

function inferPromoType(promo: Promo): PromoType {
  const lower = `${promo.title} ${promo.body}`.toLowerCase();
  if (promo.tier !== "free") return "membership_perk";
  if (lower.includes("buy one") || lower.includes("bogo")) return "bogo";
  if (lower.includes("free")) return "free_item";
  if (lower.includes("%") || lower.includes("off")) return "percent_off";
  if (lower.includes("early") || lower.includes("halftime")) return "happy_hour";
  return "matchday_special";
}

function inferDiscount(promo: Promo) {
  const match = promo.title.match(/(\d+)%/);
  if (match) return Number(match[1]);
  if (promo.title.includes("$5")) return 5;
  return 0;
}

function inferAppliesTo(promo: Promo): PromoAppliesTo {
  const lower = `${promo.title} ${promo.body}`.toLowerCase();
  if (lower.includes("all day")) return "all_day";
  if (lower.includes("full") || lower.includes("through halftime")) return "full match";
  if (lower.includes("first") || lower.includes("before halftime") || lower.includes("before kickoff")) return "first hour";
  return "matchday";
}

function toLegacyRedemption(strategy: Promo["redemptionStrategy"]): PromoRedemptionType {
  switch (strategy) {
    case "promo_code":
      return "mention_code";
    case "qr_scan_at_venue":
      return "auto_applied";
    case "qr_show":
    default:
      return "show_qr";
  }
}

function buildPromoCode(promo: Promo) {
  return promo.id.replace(/^promo-/, "").replace(/-/g, "").slice(0, 12).toUpperCase();
}

function toPromoRecord(promo: Promo): PromoRecord {
  return {
    id: promo.id,
    venue_id: promo.venueSlug,
    city_key: promo.cityKey,
    country_slugs: promo.countrySlugs,
    match_ids: promo.matchIds ?? [],
    title: promo.title,
    description: promo.body,
    type: inferPromoType(promo),
    discount_pct: inferDiscount(promo),
    applies_to: inferAppliesTo(promo),
    start_iso: promo.startsAt,
    end_iso: promo.endsAt,
    tier_required: promo.tier,
    redemption: toLegacyRedemption(promo.redemptionStrategy),
    code: buildPromoCode(promo),
    qr_payload: `gdm:promo:${promo.venueSlug}:${promo.id}`,
    qr_template: promo.qrTemplate,
    max_redemptions: promo.totalLimit ?? 9999,
    redemptions_used: 0,
    image_url: promo.imageUrl ?? null,
    verified: true,
    sponsored: promo.featured,
    sponsorship_tier: promo.sponsorshipTier,
    per_user_limit: promo.perUserLimit,
    terms_url: promo.termsUrl
  };
}

export function getAllPromos() {
  return PROMO_SEED;
}

export function getPromosByCity(cityKey: string, _venues: RankedVenue[] = []) {
  return PROMO_SEED.filter((promo) => promo.cityKey === cityKey).map(toPromoRecord);
}

export function getPromoSeedById(promoId: string) {
  return PROMO_SEED.find((promo) => promo.id === promoId) ?? null;
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
