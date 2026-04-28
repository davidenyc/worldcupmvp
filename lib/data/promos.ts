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
  description?: string;
  terms?: string;
  termsUrl?: string;
  qrTemplate: string;
  imageUrl?: string;
  startsAt: string;
  endsAt: string;
  validFrom?: string;
  validTo?: string;
  validDays?: string[];
  tier: "free" | "fan" | "elite";
  featured: boolean;
  eliteOnly?: boolean;
  sponsorshipTier?: 1 | 2 | 3;
  perUserLimit: number;
  totalLimit?: number;
  redemptionStrategy: "qr_show" | "qr_scan_at_venue" | "promo_code";
  redemptionCode?: string;
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

PROMO_SEED.push(
  {
    id: "promo-nyc-legends-halftime-wings",
    venueSlug: "usa-legends",
    cityKey: "nyc",
    countrySlugs: ["usa", "argentina"],
    matchIds: ["i-1", "e-2"],
    title: "Half-price wings during halftime",
    body: "Hit the bar before the second half and a halftime wings order lands at 50% off on USA and Argentina nights.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-01T17:30:00-04:00",
    endsAt: "2026-05-01T23:30:00-04:00",
    tier: "free",
    featured: false,
    perUserLimit: 1,
    totalLimit: 120,
    redemptionStrategy: "promo_code"
  },
  {
    id: "promo-nyc-coppelia-late-kickoff",
    venueSlug: "cuba-coppelia",
    cityKey: "nyc",
    countrySlugs: ["mexico", "japan"],
    matchIds: ["a-1", "f-3"],
    title: "Arrive after 10pm, free late-kickoff dessert",
    body: "Late slate fans get a complimentary dessert when they check in after 10pm and show their GameDay Map code.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-02T22:00:00-04:00",
    endsAt: "2026-05-03T01:00:00-04:00",
    tier: "fan",
    featured: false,
    perUserLimit: 1,
    totalLimit: 55,
    redemptionStrategy: "qr_show"
  },
  {
    id: "promo-la-jamesons-watch-party-entry",
    venueSlug: "usa-jamesons-pub",
    cityKey: "los-angeles",
    countrySlugs: ["usa", "mexico"],
    matchIds: ["i-1", "a-1"],
    title: "Show your QR, free watch party entry",
    body: "Skip the cover on high-demand USA and Mexico nights when you show the code at the door before kickoff.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-03T15:00:00-07:00",
    endsAt: "2026-05-03T21:30:00-07:00",
    tier: "free",
    featured: true,
    sponsorshipTier: 2,
    perUserLimit: 1,
    totalLimit: 150,
    redemptionStrategy: "qr_show"
  },
  {
    id: "promo-la-33-taps-beer-flight",
    venueSlug: "usa-33-taps-silver-lake",
    cityKey: "los-angeles",
    countrySlugs: ["usa", "canada"],
    matchIds: ["i-1", "h-2"],
    title: "$5 off your first beer flight",
    body: "Lock in a seat for a daytime match and your first beer flight comes with a five-dollar match-day discount.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-04T14:00:00-07:00",
    endsAt: "2026-05-04T20:00:00-07:00",
    tier: "free",
    featured: false,
    perUserLimit: 1,
    totalLimit: 90,
    redemptionStrategy: "promo_code"
  },
  {
    id: "promo-la-ye-rustic-table-drop",
    venueSlug: "england-ye-rustic-inn",
    cityKey: "los-angeles",
    countrySlugs: ["england", "france"],
    matchIds: ["d-2", "g-1"],
    title: "Reserve before public release, 15% off your table",
    body: "Fan Pass members get first crack at the best tables and a 15% match-night credit on England and France fixtures.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-05T16:00:00-07:00",
    endsAt: "2026-05-05T23:00:00-07:00",
    tier: "fan",
    featured: true,
    sponsorshipTier: 3,
    perUserLimit: 1,
    totalLimit: 75,
    redemptionStrategy: "qr_scan_at_venue"
  },
  {
    id: "promo-miami-fritz-priority-booth",
    venueSlug: "germany-fritz-and-franz-bierhaus",
    cityKey: "miami",
    countrySlugs: ["germany", "argentina"],
    matchIds: ["g-2", "e-2"],
    title: "Priority booth release for early arrivals",
    body: "Show up 30 minutes early and unlock the first wave of booth seating before the general walk-in queue.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-06T16:30:00-04:00",
    endsAt: "2026-05-06T23:30:00-04:00",
    tier: "fan",
    featured: false,
    perUserLimit: 1,
    totalLimit: 40,
    redemptionStrategy: "qr_scan_at_venue"
  },
  {
    id: "promo-miami-boteco-caipirinha",
    venueSlug: "brazil-boteco",
    cityKey: "miami",
    countrySlugs: ["brazil"],
    matchIds: ["c-1", "c-4"],
    title: "Free caipirinha topper with any reserved table",
    body: "Brazil match nights come with a complimentary topper on your first caipirinha when you reserve through GameDay Map.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-06T17:00:00-04:00",
    endsAt: "2026-05-07T00:30:00-04:00",
    tier: "fan",
    featured: true,
    sponsorshipTier: 2,
    perUserLimit: 1,
    totalLimit: 70,
    redemptionStrategy: "qr_scan_at_venue"
  },
  {
    id: "promo-miami-auld-dubliner-entry",
    venueSlug: "ireland-the-auld-dubliner",
    cityKey: "miami",
    countrySlugs: ["england", "portugal"],
    matchIds: ["d-2", "h-1"],
    title: "Free entry before the anthem",
    body: "Beat the door and your cover is waived if you arrive before the teams walk out for the anthem.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-07T18:00:00-04:00",
    endsAt: "2026-05-08T00:00:00-04:00",
    tier: "free",
    featured: false,
    perUserLimit: 1,
    totalLimit: 140,
    redemptionStrategy: "qr_show"
  },
  {
    id: "promo-dallas-katy-trail-round",
    venueSlug: "usa-katy-trail-ice-house",
    cityKey: "dallas",
    countrySlugs: ["usa", "mexico"],
    matchIds: ["i-1", "a-1"],
    title: "First round on us for early tables",
    body: "Reserve before noon on match day and your first domestic draft round is covered for the table captain.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-08T16:00:00-05:00",
    endsAt: "2026-05-08T22:00:00-05:00",
    tier: "fan",
    featured: false,
    perUserLimit: 1,
    totalLimit: 80,
    redemptionStrategy: "qr_scan_at_venue"
  },
  {
    id: "promo-dallas-happiest-hour-snack",
    venueSlug: "usa-happiest-hour",
    cityKey: "dallas",
    countrySlugs: ["usa", "france"],
    matchIds: ["i-1", "g-1"],
    title: "Free shareable snack with your first booking",
    body: "Book a group table and a first-round snack board is complimentary for your opening whistle crew.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-08T17:00:00-05:00",
    endsAt: "2026-05-09T00:00:00-05:00",
    tier: "free",
    featured: false,
    perUserLimit: 1,
    totalLimit: 60,
    redemptionStrategy: "qr_show"
  },
  {
    id: "promo-dallas-harp-late-pint",
    venueSlug: "england-the-harp",
    cityKey: "dallas",
    countrySlugs: ["england", "netherlands"],
    matchIds: ["d-2", "g-3"],
    title: "Second pint half off after 9pm",
    body: "Late kickoff watchers get a half-price second pint once the crowd settles in after 9pm.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-09T21:00:00-05:00",
    endsAt: "2026-05-10T00:30:00-05:00",
    tier: "free",
    featured: false,
    perUserLimit: 1,
    totalLimit: 100,
    redemptionStrategy: "promo_code"
  },
  {
    id: "promo-atl-brewhouse-patio",
    venueSlug: "usa-brewhouse-cafe",
    cityKey: "atlanta",
    countrySlugs: ["usa", "argentina"],
    matchIds: ["i-1", "e-2"],
    title: "Outdoor patio seating opens 20 minutes early",
    body: "Outdoor seating fans can enter the patio line 20 minutes before everyone else on major match days.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-10T16:40:00-04:00",
    endsAt: "2026-05-10T22:30:00-04:00",
    tier: "fan",
    featured: false,
    perUserLimit: 1,
    totalLimit: 50,
    redemptionStrategy: "qr_show"
  },
  {
    id: "promo-atl-fados-cover",
    venueSlug: "ireland-fado-irish-pub",
    cityKey: "atlanta",
    countrySlugs: ["portugal", "england"],
    matchIds: ["h-1", "d-2"],
    title: "Free watch party cover before kickoff",
    body: "Show your QR before kickoff and skip the door fee on selected Portugal and England nights.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-10T18:00:00-04:00",
    endsAt: "2026-05-11T00:00:00-04:00",
    tier: "free",
    featured: false,
    perUserLimit: 1,
    totalLimit: 120,
    redemptionStrategy: "qr_show"
  },
  {
    id: "promo-atl-estoria-happy-hour",
    venueSlug: "mexico-estoria",
    cityKey: "atlanta",
    countrySlugs: ["mexico"],
    matchIds: ["a-1", "a-4"],
    title: "$5 off the first margarita tower",
    body: "Big groups get a five-dollar credit on their first margarita tower when they check in before halftime.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-11T17:00:00-04:00",
    endsAt: "2026-05-11T23:00:00-04:00",
    tier: "free",
    featured: false,
    perUserLimit: 1,
    totalLimit: 70,
    redemptionStrategy: "promo_code"
  },
  {
    id: "promo-tor-real-sports-booth",
    venueSlug: "canada-real-sports",
    cityKey: "toronto",
    countrySlugs: ["canada", "france"],
    matchIds: ["h-2", "g-1"],
    title: "First booth release goes to Fan Pass",
    body: "Fan Pass unlocks the first release of booth inventory on Canada and France nights in Toronto.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-12T17:00:00-04:00",
    endsAt: "2026-05-12T23:59:00-04:00",
    tier: "fan",
    featured: true,
    sponsorshipTier: 3,
    perUserLimit: 1,
    totalLimit: 36,
    redemptionStrategy: "qr_scan_at_venue"
  },
  {
    id: "promo-tor-hemingways-brunch",
    venueSlug: "england-hemingways",
    cityKey: "toronto",
    countrySlugs: ["england", "canada"],
    matchIds: ["d-2", "h-2"],
    title: "Brunch cocktail on us for early kickoff tables",
    body: "Morning match crowds get a complimentary brunch cocktail with every reserved table before 11am.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-13T09:00:00-04:00",
    endsAt: "2026-05-13T13:00:00-04:00",
    tier: "free",
    featured: false,
    perUserLimit: 1,
    totalLimit: 65,
    redemptionStrategy: "qr_show"
  },
  {
    id: "promo-tor-cafe-diplomatico-dessert",
    venueSlug: "portugal-cafe-diplomatico",
    cityKey: "toronto",
    countrySlugs: ["portugal"],
    matchIds: ["h-1", "h-4"],
    title: "Complimentary pastel de nata after a Portugal win",
    body: "Stick around after the final whistle and your table gets a complimentary tray of pasteis de nata after Portugal wins.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-13T17:30:00-04:00",
    endsAt: "2026-05-13T23:30:00-04:00",
    tier: "elite",
    featured: false,
    eliteOnly: true,
    perUserLimit: 1,
    totalLimit: 45,
    redemptionStrategy: "qr_show"
  },
  {
    id: "promo-van-library-square-entry",
    venueSlug: "canada-library-square-pub",
    cityKey: "vancouver",
    countrySlugs: ["canada", "japan"],
    matchIds: ["h-2", "f-3"],
    title: "Free entry to the supporter room",
    body: "Show your QR to enter the supporter room without the cover charge on marquee Canada and Japan fixtures.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-14T17:00:00-07:00",
    endsAt: "2026-05-14T23:30:00-07:00",
    tier: "free",
    featured: false,
    perUserLimit: 1,
    totalLimit: 100,
    redemptionStrategy: "qr_show"
  },
  {
    id: "promo-van-portside-highballs",
    venueSlug: "japan-portside-pub",
    cityKey: "vancouver",
    countrySlugs: ["japan"],
    matchIds: ["f-3", "f-5"],
    title: "Two-for-one highballs through halftime",
    body: "Japan supporters can grab two-for-one highballs through halftime on every Japan group-stage night.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-14T18:00:00-07:00",
    endsAt: "2026-05-15T00:00:00-07:00",
    tier: "free",
    featured: false,
    perUserLimit: 1,
    totalLimit: 75,
    redemptionStrategy: "promo_code"
  },
  {
    id: "promo-mexico-city-azul-historic",
    venueSlug: "mexico-azul-historico",
    cityKey: "mexico-city",
    countrySlugs: ["mexico", "argentina"],
    matchIds: ["a-1", "e-2"],
    title: "Free welcome mezcal before kickoff",
    body: "Check in through GameDay Map and your table gets a welcome mezcal pour before the anthem.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-15T17:30:00-06:00",
    endsAt: "2026-05-15T23:30:00-06:00",
    tier: "free",
    featured: true,
    sponsorshipTier: 1,
    perUserLimit: 1,
    totalLimit: 180,
    redemptionStrategy: "qr_show"
  },
  {
    id: "promo-mexico-city-jardin-fast-lane",
    venueSlug: "mexico-jardin-juarez",
    cityKey: "mexico-city",
    countrySlugs: ["mexico", "brazil"],
    matchIds: ["a-1", "c-1"],
    title: "Elite fast-lane entry",
    body: "Elite members can use the priority lane on high-demand Mexico and Brazil match nights.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-16T18:00:00-06:00",
    endsAt: "2026-05-17T00:00:00-06:00",
    tier: "elite",
    featured: true,
    eliteOnly: true,
    sponsorshipTier: 2,
    perUserLimit: 1,
    totalLimit: 50,
    redemptionStrategy: "qr_show"
  },
  {
    id: "promo-guadalajara-abaje-o-brunch",
    venueSlug: "mexico-abaje-o",
    cityKey: "guadalajara",
    countrySlugs: ["mexico", "portugal"],
    matchIds: ["a-1", "h-1"],
    title: "Brunch combo for the first 50 tables",
    body: "Morning kickoffs come with a discounted brunch combo for the first fifty tables that check in on time.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-17T10:00:00-06:00",
    endsAt: "2026-05-17T14:00:00-06:00",
    tier: "free",
    featured: false,
    perUserLimit: 1,
    totalLimit: 50,
    redemptionStrategy: "qr_show"
  },
  {
    id: "promo-guadalajara-cantina-plate",
    venueSlug: "mexico-la-cantina",
    cityKey: "guadalajara",
    countrySlugs: ["mexico", "france"],
    matchIds: ["a-4", "g-1"],
    title: "Free shareable plate with reserved seating",
    body: "Reserve through GameDay Map and a match-day shareable plate is on the house for your table.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-17T17:00:00-06:00",
    endsAt: "2026-05-17T23:00:00-06:00",
    tier: "fan",
    featured: false,
    perUserLimit: 1,
    totalLimit: 60,
    redemptionStrategy: "qr_scan_at_venue"
  },
  {
    id: "promo-monterrey-pinto-opening-round",
    venueSlug: "mexico-pinto-bar",
    cityKey: "monterrey",
    countrySlugs: ["mexico", "usa"],
    matchIds: ["a-1", "i-1"],
    title: "Opening round is half off",
    body: "Get the first round at 50% off when you arrive before the broadcast countdown ends.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-18T17:00:00-06:00",
    endsAt: "2026-05-18T22:30:00-06:00",
    tier: "free",
    featured: false,
    perUserLimit: 1,
    totalLimit: 95,
    redemptionStrategy: "promo_code"
  },
  {
    id: "promo-monterrey-fundidora-priority",
    venueSlug: "mexico-fundidora-social",
    cityKey: "monterrey",
    countrySlugs: ["mexico", "argentina"],
    matchIds: ["a-1", "e-2"],
    title: "Priority terrace seating for Fan Pass",
    body: "Fan Pass members unlock early terrace seating drops on the biggest Monterrey match days.",
    qrTemplate: QR_TEMPLATE,
    startsAt: "2026-05-18T18:00:00-06:00",
    endsAt: "2026-05-19T00:00:00-06:00",
    tier: "fan",
    featured: false,
    perUserLimit: 1,
    totalLimit: 42,
    redemptionStrategy: "qr_scan_at_venue"
  }
);

function inferPromoType(promo: Promo): PromoType {
  const lower = `${promo.title} ${promo.description ?? promo.body}`.toLowerCase();
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
  const lower = `${promo.title} ${promo.description ?? promo.body}`.toLowerCase();
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
  return promo.redemptionCode ?? promo.id.replace(/^promo-/, "").replace(/-/g, "").slice(0, 12).toUpperCase();
}

function getDateKey(iso: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "America/New_York" })
    .format(new Date(iso))
    .toLowerCase()
    .slice(0, 3);
}

function normalizePromo(promo: Promo): Promo {
  return {
    ...promo,
    description: promo.description ?? promo.body,
    terms:
      promo.terms ??
      "Valid while capacity lasts. One redemption per person unless noted otherwise. Participating venue may verify match-day arrival before honoring the offer.",
    validFrom: promo.validFrom ?? promo.startsAt,
    validTo: promo.validTo ?? promo.endsAt,
    validDays: promo.validDays ?? [getDateKey(promo.startsAt)],
    eliteOnly: promo.eliteOnly ?? promo.tier === "elite",
    redemptionCode: promo.redemptionCode ?? buildPromoCode(promo)
  };
}

function toPromoRecord(seedPromo: Promo): PromoRecord {
  const promo = normalizePromo(seedPromo);
  return {
    id: promo.id,
    venue_id: promo.venueSlug,
    city_key: promo.cityKey,
    country_slugs: promo.countrySlugs,
    match_ids: promo.matchIds ?? [],
    title: promo.title,
    description: promo.description ?? promo.body,
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
  return PROMO_SEED.map(normalizePromo);
}

export function getPromosByCity(cityKey: string, _venues: RankedVenue[] = []) {
  return getAllPromos().filter((promo) => promo.cityKey === cityKey).map(toPromoRecord);
}

export function getPromoSeedById(promoId: string) {
  const promo = PROMO_SEED.find((entry) => entry.id === promoId);
  return promo ? normalizePromo(promo) : null;
}

export function isPromoActive(promo: PromoRecord, now = new Date()) {
  return Date.parse(promo.start_iso) <= now.getTime() && now.getTime() <= Date.parse(promo.end_iso);
}

export function getActivePromosByCity(cityKey: string, venues: RankedVenue[] = [], now = new Date()) {
  return getPromosByCity(cityKey, venues).filter((promo) => promo.verified && isPromoActive(promo, now));
}

export function isPromoLiveToday(promo: Promo, now = new Date()) {
  const normalized = normalizePromo(promo);
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "America/New_York"
  })
    .format(now)
    .toLowerCase()
    .slice(0, 3);

  return (
    Date.parse(normalized.validFrom ?? normalized.startsAt) <= now.getTime() &&
    now.getTime() <= Date.parse(normalized.validTo ?? normalized.endsAt) &&
    (normalized.validDays ?? []).includes(weekday)
  );
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
