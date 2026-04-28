#!/usr/bin/env tsx
/**
 * NYC deep venue scraper — TWO modes:
 *
 * 1. BARS mode (default): city-wide watch venues, NOT country-tagged.
 *    Iterates 30 neighborhoods × 5 query variants × 3 pages.
 *    Output: lib/cache/places/nyc-sportsbars.json
 *
 * 2. CULTURAL mode: per-country restaurants AND cultural bars.
 *    Each venue is associated with exactly one of the 48 World Cup 2026
 *    participating countries (cuisine-tagged). City-wide location bias.
 *    Output: lib/cache/places/nyc-{countrySlug}.json (per-country files,
 *    same convention used by the venue provider).
 *
 * The two modes target different cache files so they never overwrite each
 * other. `--mode=both` runs bars first, then cultural.
 *
 * TV / showsSoccer tagging is HEURISTIC. We mark:
 *   sports_bar          → 6 screens, projector,  showsSoccer=true
 *   bar_with_tv         → 3 screens, no projector, showsSoccer=true
 *   cultural_bar        → 2 screens, no projector, showsSoccer=true
 *   cultural_restaurant → 0 screens, no projector, showsSoccer=false
 *
 * Cultural restaurants land with hasTV=false on purpose — they're potential
 * watch-party hosts the team can convince to add TVs / shut their bar for
 * matchday events. The UI / sales motion uses this distinction.
 *
 * Usage:
 *   GOOGLE_PLACES_API_KEY=xxx npx tsx scripts/seed-places-nyc-deep.ts \
 *     [--mode=bars|cultural|both] [--cap=300] [--dry-run] [--resume]
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// ---------- config ----------

const COST_PER_REQUEST = 0.032;
const RADIUS_M = 1800;
const MAX_PAGES = 3;
const MAX_RESULTS_PER_PAGE = 20;
const RATE_LIMIT_MS = 200;
const URL_DEFAULT = "https://places.googleapis.com/v1/places:searchText";
const FIELD_MASK = [
  "places.id", "places.displayName", "places.formattedAddress",
  "places.location", "places.rating", "places.userRatingCount",
  "places.websiteUri", "places.googleMapsUri",
  "places.regularOpeningHours", "places.priceLevel", "places.types",
  "nextPageToken"
].join(",");

// NYC center for cultural-mode location bias (city-wide, no per-hood loop).
const NYC_CENTER = { lat: 40.7549, lng: -73.984 };
const NYC_CITY_RADIUS_M = 14000; // ~9 mi — covers all 5 boroughs + JC/Hoboken

// 5 high-yield bar queries. Low overlap, high recall for NYC watch venues.
const BAR_QUERIES = [
  "sports bar",
  "irish pub",
  "bar with TVs",
  "gastropub",
  "bar with outdoor seating"
];

// ---------- neighborhoods (bars mode only) ----------

interface Hood { slug: string; name: string; borough: string; lat: number; lng: number; }
const HOODS: Hood[] = [
  { slug: "west-village", name: "West Village", borough: "Manhattan", lat: 40.7359, lng: -74.0036 },
  { slug: "east-village", name: "East Village", borough: "Manhattan", lat: 40.7265, lng: -73.9815 },
  { slug: "lower-east-side", name: "Lower East Side", borough: "Manhattan", lat: 40.715, lng: -73.9843 },
  { slug: "chelsea", name: "Chelsea", borough: "Manhattan", lat: 40.7465, lng: -74.0014 },
  { slug: "midtown", name: "Midtown", borough: "Manhattan", lat: 40.7549, lng: -73.984 },
  { slug: "hells-kitchen", name: "Hell's Kitchen", borough: "Manhattan", lat: 40.7638, lng: -73.9918 },
  { slug: "upper-east-side", name: "Upper East Side", borough: "Manhattan", lat: 40.7736, lng: -73.9566 },
  { slug: "upper-west-side", name: "Upper West Side", borough: "Manhattan", lat: 40.787, lng: -73.9754 },
  { slug: "harlem", name: "Harlem", borough: "Manhattan", lat: 40.8116, lng: -73.9465 },
  { slug: "fidi", name: "Financial District", borough: "Manhattan", lat: 40.7075, lng: -74.009 },
  { slug: "williamsburg", name: "Williamsburg", borough: "Brooklyn", lat: 40.7081, lng: -73.9571 },
  { slug: "greenpoint", name: "Greenpoint", borough: "Brooklyn", lat: 40.7295, lng: -73.954 },
  { slug: "bushwick", name: "Bushwick", borough: "Brooklyn", lat: 40.6958, lng: -73.9171 },
  { slug: "bed-stuy", name: "Bed-Stuy", borough: "Brooklyn", lat: 40.6872, lng: -73.9418 },
  { slug: "boerum-hill", name: "Boerum Hill", borough: "Brooklyn", lat: 40.6857, lng: -73.9837 },
  { slug: "park-slope", name: "Park Slope", borough: "Brooklyn", lat: 40.6712, lng: -73.978 },
  { slug: "downtown-bk", name: "Downtown Brooklyn", borough: "Brooklyn", lat: 40.6905, lng: -73.9846 },
  { slug: "crown-heights", name: "Crown Heights", borough: "Brooklyn", lat: 40.6694, lng: -73.9422 },
  { slug: "bay-ridge", name: "Bay Ridge", borough: "Brooklyn", lat: 40.6259, lng: -74.0306 },
  { slug: "astoria", name: "Astoria", borough: "Queens", lat: 40.7644, lng: -73.9235 },
  { slug: "lic", name: "Long Island City", borough: "Queens", lat: 40.7447, lng: -73.9485 },
  { slug: "jackson-heights", name: "Jackson Heights", borough: "Queens", lat: 40.7557, lng: -73.8831 },
  { slug: "flushing", name: "Flushing", borough: "Queens", lat: 40.7654, lng: -73.8318 },
  { slug: "forest-hills", name: "Forest Hills", borough: "Queens", lat: 40.7196, lng: -73.8448 },
  { slug: "fordham", name: "Fordham", borough: "Bronx", lat: 40.8615, lng: -73.8904 },
  { slug: "south-bronx", name: "South Bronx", borough: "Bronx", lat: 40.8167, lng: -73.9167 },
  { slug: "st-george", name: "St. George", borough: "Staten Island", lat: 40.6437, lng: -74.0736 },
  { slug: "jc-downtown", name: "Downtown Jersey City", borough: "Jersey City", lat: 40.7178, lng: -74.0431 },
  { slug: "jc-grove", name: "Jersey City Grove St", borough: "Jersey City", lat: 40.7196, lng: -74.0431 },
  { slug: "hoboken", name: "Hoboken", borough: "Hoboken", lat: 40.7439, lng: -74.0324 }
];

// ---------- participating countries ----------

interface CountryDef { slug: string; name: string; cuisineQuery: string; }

// 48 World Cup 2026 participating countries with cuisine search terms.
// cuisineQuery is fed verbatim to Google Places — keep terms specific.
const PARTICIPATING_COUNTRIES: CountryDef[] = [
  { slug: "argentina", name: "Argentina", cuisineQuery: "Argentine restaurant parrilla steakhouse" },
  { slug: "australia", name: "Australia", cuisineQuery: "Australian cafe brunch" },
  { slug: "belgium", name: "Belgium", cuisineQuery: "Belgian beer bar mussels frites" },
  { slug: "bosnia-and-herzegovina", name: "Bosnia and Herzegovina", cuisineQuery: "Bosnian Balkan cevapi restaurant" },
  { slug: "brazil", name: "Brazil", cuisineQuery: "Brazilian restaurant churrascaria Brazilian bar" },
  { slug: "canada", name: "Canada", cuisineQuery: "Canadian restaurant poutine" },
  { slug: "cabo-verde", name: "Cabo Verde", cuisineQuery: "Cape Verdean Portuguese African restaurant" },
  { slug: "colombia", name: "Colombia", cuisineQuery: "Colombian restaurant arepa Latin bar" },
  { slug: "congo-dr", name: "DR Congo", cuisineQuery: "Congolese African restaurant" },
  { slug: "croatia", name: "Croatia", cuisineQuery: "Croatian Balkan restaurant" },
  { slug: "cura-ao", name: "Curaçao", cuisineQuery: "Caribbean Dutch Caribbean restaurant" },
  { slug: "czechia", name: "Czechia", cuisineQuery: "Czech beer hall restaurant" },
  { slug: "cote-d-ivoire", name: "Côte d'Ivoire", cuisineQuery: "Ivorian West African restaurant" },
  { slug: "ecuador", name: "Ecuador", cuisineQuery: "Ecuadorian Latin American restaurant" },
  { slug: "egypt", name: "Egypt", cuisineQuery: "Egyptian Middle Eastern restaurant" },
  { slug: "england", name: "England", cuisineQuery: "English pub British pub gastropub" },
  { slug: "france", name: "France", cuisineQuery: "French bistro brasserie French restaurant cafe" },
  { slug: "germany", name: "Germany", cuisineQuery: "German biergarten beer hall restaurant" },
  { slug: "ghana", name: "Ghana", cuisineQuery: "Ghanaian West African restaurant" },
  { slug: "haiti", name: "Haiti", cuisineQuery: "Haitian Caribbean restaurant" },
  { slug: "ir-iran", name: "Iran", cuisineQuery: "Persian Iranian restaurant kebab" },
  { slug: "iraq", name: "Iraq", cuisineQuery: "Iraqi Middle Eastern restaurant" },
  { slug: "japan", name: "Japan", cuisineQuery: "Japanese izakaya ramen sushi restaurant" },
  { slug: "jordan", name: "Jordan", cuisineQuery: "Jordanian Levantine Middle Eastern restaurant" },
  { slug: "korea-republic", name: "South Korea", cuisineQuery: "Korean BBQ Korean restaurant soju bar" },
  { slug: "mexico", name: "Mexico", cuisineQuery: "Mexican taqueria cantina Mexican bar" },
  { slug: "morocco", name: "Morocco", cuisineQuery: "Moroccan tagine North African restaurant" },
  { slug: "netherlands", name: "Netherlands", cuisineQuery: "Dutch beer bar Belgian Dutch restaurant" },
  { slug: "new-zealand", name: "New Zealand", cuisineQuery: "New Zealand cafe brunch" },
  { slug: "norway", name: "Norway", cuisineQuery: "Scandinavian Norwegian Nordic restaurant" },
  { slug: "panama", name: "Panama", cuisineQuery: "Panamanian Latin American restaurant" },
  { slug: "paraguay", name: "Paraguay", cuisineQuery: "Paraguayan South American restaurant" },
  { slug: "portugal", name: "Portugal", cuisineQuery: "Portuguese tasca restaurant fado" },
  { slug: "qatar", name: "Qatar", cuisineQuery: "Qatari Middle Eastern Arabic restaurant" },
  { slug: "saudi-arabia", name: "Saudi Arabia", cuisineQuery: "Saudi Middle Eastern Arabic restaurant" },
  { slug: "scotland", name: "Scotland", cuisineQuery: "Scottish whisky bar pub" },
  { slug: "senegal", name: "Senegal", cuisineQuery: "Senegalese West African restaurant" },
  { slug: "south-africa", name: "South Africa", cuisineQuery: "South African braai restaurant" },
  { slug: "spain", name: "Spain", cuisineQuery: "Spanish tapas paella bar restaurant" },
  { slug: "sweden", name: "Sweden", cuisineQuery: "Swedish Scandinavian restaurant" },
  { slug: "switzerland", name: "Switzerland", cuisineQuery: "Swiss fondue restaurant" },
  { slug: "tunisia", name: "Tunisia", cuisineQuery: "Tunisian North African restaurant" },
  { slug: "turkiye", name: "Türkiye", cuisineQuery: "Turkish kebab meze restaurant" },
  { slug: "uruguay", name: "Uruguay", cuisineQuery: "Uruguayan parrilla South American restaurant" },
  { slug: "usa", name: "USA", cuisineQuery: "American sports bar grill" },
  { slug: "uzbekistan", name: "Uzbekistan", cuisineQuery: "Uzbek Central Asian plov restaurant" },
  { slug: "algeria", name: "Algeria", cuisineQuery: "Algerian North African restaurant" }
];

// ---------- args ----------

function args() {
  const o = { cap: 300, resume: false, dryRun: false, mode: "bars" as "bars" | "cultural" | "both" };
  for (const a of process.argv.slice(2)) {
    if (a.startsWith("--cap=")) o.cap = Number(a.slice(6));
    else if (a === "--resume") o.resume = true;
    else if (a === "--dry-run") o.dryRun = true;
    else if (a === "--mode=bars") o.mode = "bars";
    else if (a === "--mode=cultural") o.mode = "cultural";
    else if (a === "--mode=both") o.mode = "both";
  }
  return o;
}

// ---------- helpers ----------

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface TVStatus { numberOfScreens: number; hasProjector: boolean; showsSoccer: boolean; }
// We can't verify actual screen counts from Google Places — keep it binary.
// numberOfScreens is used here as a 1/0 "hasTV" flag. The UI shows ranges if
// it wants ("multiple TVs", "has a TV", "no TVs"); the data layer stays honest.
// A bar surfaced via any sports / soccer / pub / bar query has at least 1 TV.
// Cultural restaurants default to 0 — sales targets to convince later.
function deriveTVStatus(intent: string): TVStatus {
  if (intent === "sports_bar") return { numberOfScreens: 1, hasProjector: false, showsSoccer: true };
  if (intent === "bar_with_tv") return { numberOfScreens: 1, hasProjector: false, showsSoccer: true };
  if (intent === "cultural_bar") return { numberOfScreens: 1, hasProjector: false, showsSoccer: true };
  if (intent === "cultural_restaurant") return { numberOfScreens: 0, hasProjector: false, showsSoccer: false };
  return { numberOfScreens: 0, hasProjector: false, showsSoccer: false };
}

// Fallback signal: scan place name for keywords that imply TV / soccer presence.
// Used to upgrade ambiguous venues (e.g., a "bar" with no Google sports_bar tag
// but called "Smithfield Hall Sports Bar").
function nameSuggestsSportsTV(name: string): boolean {
  const lower = name.toLowerCase();
  return /\b(sports?|soccer|football|game ?day|tv|tavern|pub|alehouse)\b/.test(lower);
}

function classifyIntent(types: Set<string>, isCulturalPass: boolean) {
  const isSportsBar = types.has("sports_bar");
  const isBar = types.has("bar") || types.has("night_club") || types.has("pub");
  const isRestaurant = types.has("restaurant") || types.has("food");
  if (isSportsBar) return "sports_bar";
  if (isCulturalPass) {
    if (isBar) return "cultural_bar";
    return "cultural_restaurant";
  }
  if (isBar) return "bar_with_tv";
  return "cultural_bar";
}

function buildVenue(p: any, ctx: { hood?: Hood; country?: CountryDef; query: string }) {
  const name = p?.displayName?.text?.trim();
  const lat = p?.location?.latitude;
  const lng = p?.location?.longitude;
  if (!name || typeof lat !== "number" || typeof lng !== "number" || !p?.id) return null;

  const types: string[] = p.types ?? [];
  const tset = new Set(types.map((t) => t.toLowerCase()));

  const venueTypes: string[] = [];
  if (tset.has("bar") || tset.has("night_club")) venueTypes.push("bar");
  if (tset.has("restaurant")) venueTypes.push("restaurant");
  if (tset.has("sports_bar") || tset.has("pub")) venueTypes.push("supporter_club");

  const isCulturalPass = !!ctx.country;
  const intent = classifyIntent(tset, isCulturalPass);
  let tv = deriveTVStatus(intent);
  // Name-keyword upgrade: catch "cultural restaurants" or generic places whose
  // name implies they have TVs / show sports (e.g., "Murphy's Tavern", "Public
  // House", "Soccer House"). A name match overrides the zero-TV default.
  if (tv.numberOfScreens === 0 && nameSuggestsSportsTV(name)) {
    tv = { numberOfScreens: 1, hasProjector: false, showsSoccer: true };
  }

  const rating = p.rating ?? 4;
  const reviews = p.userRatingCount ?? 0;
  const score = Math.min(10, Math.max(3.5,
    4.2 + Math.max(0, rating - 3.6) * 1.15 +
    Math.min(reviews / 250, 1.5) +
    (intent === "sports_bar" ? 1.25 : intent === "bar_with_tv" ? 0.85 : intent === "cultural_bar" ? 0.65 : 0.4)
  ));

  const hoodSlugForId = ctx.hood?.slug ?? ctx.country?.slug ?? "nyc";
  const hoodNameForLabel = ctx.hood?.name ?? ctx.country?.name ?? "NYC";
  const slug = slugify(`nyc-${hoodSlugForId}-${name}`);

  const cap = venueTypes.includes("supporter_club") ? 120 : venueTypes.includes("bar") ? 70 : 45;
  const isNJ = ctx.hood?.borough === "Jersey City" || ctx.hood?.borough === "Hoboken";
  const acceptsRes = !!p.websiteUri;

  const associatedCountries = ctx.country ? [ctx.country.slug] : [];
  const likelySupporterCountry = ctx.country?.slug ?? "";
  const cuisineTags = ctx.country
    ? [ctx.country.name.toLowerCase(), `${ctx.country.name.toLowerCase()} cuisine`]
    : [];

  return {
    id: slug, slug, name,
    description: ctx.country
      ? `${name} — ${ctx.country.name} ${intent === "cultural_bar" ? "bar" : "restaurant"} in NYC.`
      : `${name} — ${hoodNameForLabel} ${intent === "sports_bar" ? "sports bar" : "watch spot"} via Google Places.`,
    address: p.formattedAddress?.trim() ?? `${hoodNameForLabel}, ${isNJ ? "NJ" : "NY"}`,
    city: "nyc", state: isNJ ? "NJ" : "NY",
    postalCode: (p.formattedAddress ?? "").match(/\b\d{5}(?:-\d{4})?\b/)?.[0] ?? "",
    lat, lng,
    borough: isNJ ? "Manhattan" : (ctx.hood && ["Manhattan","Brooklyn","Queens","Bronx","Staten Island"].includes(ctx.hood.borough) ? ctx.hood.borough : "Manhattan"),
    neighborhood: hoodNameForLabel,
    website: p.websiteUri, googleMapsUrl: p.googleMapsUri,
    venueTypes,
    associatedCountries, likelySupporterCountry,
    venueIntent: intent, cuisineTags,
    atmosphereTags:
      intent === "sports_bar" ? ["watch-party","loud","big-groups"] :
      intent === "cultural_bar" ? ["authentic-food","watch-party","casual"] :
      intent === "cultural_restaurant" ? ["authentic-food","casual"] :
      ["casual","watch-party"],
    showsSoccer: tv.showsSoccer,
    openNow: p.regularOpeningHours?.openNow ?? true,
    priceLevel: typeof p.priceLevel === "number" ? p.priceLevel : 2,
    rating, reviewCount: reviews,
    numberOfScreens: tv.numberOfScreens,
    hasProjector: tv.hasProjector,
    hasOutdoorViewing: venueTypes.includes("bar"),
    familyFriendly: intent === "cultural_restaurant",
    standingRoomFriendly: intent !== "cultural_restaurant",
    privateEventsAvailable: acceptsRes,
    goodForGroups: true,
    acceptsReservations: acceptsRes,
    reservationType: p.websiteUri ? "external_url" : "none",
    reservationUrl: p.websiteUri,
    approximateCapacity: cap,
    capacityBucket: cap < 30 ? "under_30" : cap <= 60 ? "30_60" : cap <= 100 ? "60_100" : cap <= 200 ? "100_200" : "200_plus",
    capacityConfidence: "estimated",
    sourceType: "official_api",
    sourceName: ctx.country ? "Google Places (cultural)" : "Google Places (deep)",
    sourceExternalId: p.id,
    sourceConfidence: 0.92,
    verificationStatus: "imported",
    isRealVenue: true,
    isFeatured: score >= 8,
    isOfficialFanHub: false,
    gameDayScore: score,
    fanLikelihoodScore: Math.min(10, score + (ctx.country ? 0.5 : 0.25)),
    editorialBoost: 0.1,
    editorialNotes: ctx.country
      ? `Cultural ${intent === "cultural_bar" ? "bar" : "restaurant"} for ${ctx.country.name} (query: "${ctx.query}").`
      : `Imported via deep NYC sweep — ${hoodNameForLabel}, query: "${ctx.query}".`,
    imageUrls: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// ---------- google places fetch ----------

async function fetchPage(textQuery: string, lat: number, lng: number, radius: number, key: string, pageToken?: string) {
  const url = process.env.GOOGLE_PLACES_TEXT_SEARCH_URL ?? URL_DEFAULT;
  const body: any = {
    textQuery,
    maxResultCount: MAX_RESULTS_PER_PAGE,
    locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius } }
  };
  if (pageToken) body.pageToken = pageToken;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": FIELD_MASK },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 300)}`);
  return await res.json() as { places?: any[]; nextPageToken?: string };
}

// ---------- runners ----------

async function runBars(o: ReturnType<typeof args>, key: string, cp: { done: string[]; requests: number }) {
  const cwd = process.cwd();
  const outPath = join(cwd, "lib/cache/places/nyc-sportsbars.json");
  const venues = new Map<string, any>();
  try {
    for (const v of JSON.parse(await readFile(outPath, "utf8")) ?? []) {
      if (v.sourceExternalId) venues.set(v.sourceExternalId, v);
    }
    console.log(`[bars] Loaded ${venues.size} existing venues from nyc-sportsbars.json.`);
  } catch { console.log("[bars] Starting fresh nyc-sportsbars.json."); }

  const total = HOODS.length * BAR_QUERIES.length;
  console.log(`[bars] Plan: ${HOODS.length} hoods × ${BAR_QUERIES.length} queries = ${total} pairs. Up to ${total * MAX_PAGES} requests.`);

  let i = 0;
  outer: for (const h of HOODS) {
    for (const q of BAR_QUERIES) {
      const pair = `bars::${h.slug}::${q}`;
      i++;
      if (cp.done.includes(pair)) continue;
      if (cp.requests >= o.cap) { console.log(`[bars] Cap ${o.cap} reached.`); break outer; }
      let pageToken: string | undefined;
      let page = 0;
      try {
        do {
          if (cp.requests >= o.cap) break;
          const r = await fetchPage(`${q} in ${h.name}, NYC`, h.lat, h.lng, RADIUS_M, key, pageToken);
          cp.requests++; page++;
          let added = 0;
          for (const p of r.places ?? []) {
            if (!p.id || venues.has(p.id)) continue;
            const v = buildVenue(p, { hood: h, query: q });
            if (v) { venues.set(p.id, v); added++; }
          }
          console.log(`[bars] ${h.slug}::${q} p${page}: +${added} (total ${venues.size}, req ${cp.requests}/${o.cap})`);
          pageToken = r.nextPageToken;
          if (!pageToken || page >= MAX_PAGES) break;
          await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));
        } while (true);
      } catch (e) { console.warn(`[bars] Error ${pair}:`, (e as Error).message); }
      cp.done.push(pair);
      if (i % 5 === 0) await writeFile(outPath, JSON.stringify([...venues.values()], null, 2), "utf8");
    }
  }
  await writeFile(outPath, JSON.stringify([...venues.values()], null, 2), "utf8");
  console.log(`[bars] DONE. ${venues.size} venues → ${outPath}`);
}

async function runCultural(o: ReturnType<typeof args>, key: string, cp: { done: string[]; requests: number }) {
  const cwd = process.cwd();
  const cacheDir = join(cwd, "lib/cache/places");

  const total = PARTICIPATING_COUNTRIES.length;
  console.log(`[cultural] Plan: ${total} countries × 1 cuisine query × up to ${MAX_PAGES} pages = up to ${total * MAX_PAGES} requests.`);

  let i = 0;
  outer: for (const c of PARTICIPATING_COUNTRIES) {
    const pair = `cultural::${c.slug}`;
    i++;
    if (cp.done.includes(pair)) continue;
    if (cp.requests >= o.cap) { console.log(`[cultural] Cap ${o.cap} reached.`); break outer; }

    const outPath = join(cacheDir, `nyc-${c.slug}.json`);
    const venues = new Map<string, any>();
    try {
      for (const v of JSON.parse(await readFile(outPath, "utf8")) ?? []) {
        if (v.sourceExternalId) venues.set(v.sourceExternalId, v);
      }
    } catch { /* fresh file */ }

    let pageToken: string | undefined;
    let page = 0;
    let added = 0;
    try {
      do {
        if (cp.requests >= o.cap) break;
        const r = await fetchPage(`${c.cuisineQuery} in NYC`, NYC_CENTER.lat, NYC_CENTER.lng, NYC_CITY_RADIUS_M, key, pageToken);
        cp.requests++; page++;
        for (const p of r.places ?? []) {
          if (!p.id || venues.has(p.id)) continue;
          const v = buildVenue(p, { country: c, query: c.cuisineQuery });
          if (v) { venues.set(p.id, v); added++; }
        }
        pageToken = r.nextPageToken;
        if (!pageToken || page >= MAX_PAGES) break;
        await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));
      } while (true);
    } catch (e) { console.warn(`[cultural] Error ${c.slug}:`, (e as Error).message); }

    await writeFile(outPath, JSON.stringify([...venues.values()], null, 2), "utf8");
    console.log(`[cultural] ${c.slug}: +${added} new, total ${venues.size} → nyc-${c.slug}.json (req ${cp.requests}/${o.cap})`);
    cp.done.push(pair);
  }
  console.log(`[cultural] DONE. Updated up to ${PARTICIPATING_COUNTRIES.length} per-country files.`);
}

// ---------- main ----------

async function main() {
  const o = args();
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key && !o.dryRun) { console.error("GOOGLE_PLACES_API_KEY not set."); process.exit(1); }

  const cwd = process.cwd();
  const cacheDir = join(cwd, "lib/cache/places");
  const checkpointPath = join(cwd, "scripts/.seed-deep-checkpoint.json");
  await mkdir(cacheDir, { recursive: true });

  let cp = { done: [] as string[], requests: 0 };
  if (o.resume) try { cp = JSON.parse(await readFile(checkpointPath, "utf8")); } catch {}

  console.log(`Mode: ${o.mode} — cap ${o.cap} (~$${(o.cap * COST_PER_REQUEST).toFixed(2)} max)`);
  if (o.dryRun) {
    console.log(`Bars plan:    ${HOODS.length} hoods × ${BAR_QUERIES.length} queries = ${HOODS.length * BAR_QUERIES.length} pairs (up to ${HOODS.length * BAR_QUERIES.length * MAX_PAGES} requests)`);
    console.log(`Cultural plan: ${PARTICIPATING_COUNTRIES.length} countries × 1 query × up to ${MAX_PAGES} pages = up to ${PARTICIPATING_COUNTRIES.length * MAX_PAGES} requests`);
    console.log("DRY RUN — exiting before any API calls.");
    return;
  }

  if (o.mode === "bars" || o.mode === "both") {
    await runBars(o, key!, cp);
    await writeFile(checkpointPath, JSON.stringify(cp, null, 2), "utf8");
  }
  if (o.mode === "cultural" || o.mode === "both") {
    await runCultural(o, key!, cp);
    await writeFile(checkpointPath, JSON.stringify(cp, null, 2), "utf8");
  }

  console.log(`\nALL DONE. Requests: ${cp.requests}. Cost: $${(cp.requests * COST_PER_REQUEST).toFixed(2)}.`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
