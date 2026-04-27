#!/usr/bin/env tsx
/**
 * NYC deep sports-bar scraper.
 * Hits Google Places Text Search for each NYC neighborhood × query variant,
 * paginates up to 3 pages, dedupes by Google place ID, merges into
 * lib/cache/places/nyc-sportsbars.json.
 *
 * Usage:
 *   GOOGLE_PLACES_API_KEY=xxx npx tsx scripts/seed-places-nyc-deep.ts [--cap=300] [--dry-run] [--resume]
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

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

const QUERY_VARIANTS = ["sports bar", "soccer bar", "pub with TVs", "watch party bar", "soccer pub"];

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

function args() {
  const o = { cap: 300, resume: false, dryRun: false };
  for (const a of process.argv.slice(2)) {
    if (a.startsWith("--cap=")) o.cap = Number(a.slice(6));
    else if (a === "--resume") o.resume = true;
    else if (a === "--dry-run") o.dryRun = true;
  }
  return o;
}

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildVenue(p: any, h: Hood, q: string) {
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
  const isSports = tset.has("sports_bar");
  const intent = isSports ? "sports_bar" : venueTypes.includes("bar") ? "bar_with_tv" : "cultural_bar";
  const rating = p.rating ?? 4;
  const reviews = p.userRatingCount ?? 0;
  const score = Math.min(10, Math.max(3.5, 4.2 + Math.max(0, rating - 3.6) * 1.15 + Math.min(reviews / 250, 1.5) + (intent === "sports_bar" ? 1.25 : 0.65)));
  const slug = slugify(`nyc-${h.slug}-${name}`);
  const cap = venueTypes.includes("supporter_club") ? 120 : venueTypes.includes("bar") ? 70 : 45;
  const isNJ = h.borough === "Jersey City" || h.borough === "Hoboken";
  const acceptsRes = !!p.websiteUri;
  return {
    id: slug, slug, name,
    description: `${name} — ${h.name} ${intent === "sports_bar" ? "sports bar" : "watch spot"} via Google Places.`,
    address: p.formattedAddress?.trim() ?? `${h.name}, ${isNJ ? "NJ" : "NY"}`,
    city: "nyc", state: isNJ ? "NJ" : "NY",
    postalCode: (p.formattedAddress ?? "").match(/\b\d{5}(?:-\d{4})?\b/)?.[0] ?? "",
    lat, lng,
    borough: isNJ ? "Manhattan" : (["Manhattan","Brooklyn","Queens","Bronx","Staten Island"].includes(h.borough) ? h.borough : "Manhattan"),
    neighborhood: h.name,
    website: p.websiteUri, googleMapsUrl: p.googleMapsUri,
    venueTypes, associatedCountries: [], likelySupporterCountry: "",
    venueIntent: intent, cuisineTags: [],
    atmosphereTags: intent === "sports_bar" ? ["watch-party","loud","big-groups"] : ["casual","watch-party"],
    showsSoccer: true, openNow: p.regularOpeningHours?.openNow ?? true,
    priceLevel: typeof p.priceLevel === "number" ? p.priceLevel : 2,
    rating, reviewCount: reviews,
    numberOfScreens: intent === "sports_bar" ? 6 : intent === "bar_with_tv" ? 3 : 1,
    hasProjector: intent === "sports_bar", hasOutdoorViewing: venueTypes.includes("bar"),
    familyFriendly: false, standingRoomFriendly: true,
    privateEventsAvailable: acceptsRes, goodForGroups: true,
    acceptsReservations: acceptsRes,
    reservationType: p.websiteUri ? "external_url" : "none", reservationUrl: p.websiteUri,
    approximateCapacity: cap,
    capacityBucket: cap < 30 ? "under_30" : cap <= 60 ? "30_60" : cap <= 100 ? "60_100" : cap <= 200 ? "100_200" : "200_plus",
    capacityConfidence: "estimated",
    sourceType: "official_api", sourceName: "Google Places (deep)", sourceExternalId: p.id,
    sourceConfidence: 0.92, verificationStatus: "imported",
    isRealVenue: true, isFeatured: score >= 8, isOfficialFanHub: false,
    gameDayScore: score, fanLikelihoodScore: Math.min(10, score + 0.25), editorialBoost: 0.1,
    editorialNotes: `Imported via deep NYC sweep — ${h.name}, query: "${q}".`,
    imageUrls: [],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
}

async function fetchPage(query: string, h: Hood, key: string, pageToken?: string) {
  const url = process.env.GOOGLE_PLACES_TEXT_SEARCH_URL ?? URL_DEFAULT;
  const body: any = {
    textQuery: `${query} in ${h.name}, NYC`,
    maxResultCount: MAX_RESULTS_PER_PAGE,
    locationBias: { circle: { center: { latitude: h.lat, longitude: h.lng }, radius: RADIUS_M } }
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

async function main() {
  const o = args();
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key && !o.dryRun) { console.error("GOOGLE_PLACES_API_KEY not set."); process.exit(1); }

  const cwd = process.cwd();
  const cacheDir = join(cwd, "lib/cache/places");
  const checkpointPath = join(cwd, "scripts/.seed-deep-checkpoint.json");
  const outPath = join(cacheDir, "nyc-sportsbars.json");
  await mkdir(cacheDir, { recursive: true });

  let cp = { done: [] as string[], requests: 0 };
  if (o.resume) try { cp = JSON.parse(await readFile(checkpointPath, "utf8")); } catch {}

  const venues = new Map<string, any>();
  try {
    for (const v of JSON.parse(await readFile(outPath, "utf8")) ?? []) {
      if (v.sourceExternalId) venues.set(v.sourceExternalId, v);
    }
    console.log(`Loaded ${venues.size} existing venues.`);
  } catch { console.log("Starting fresh master file."); }

  const total = HOODS.length * QUERY_VARIANTS.length;
  console.log(`Plan: ${HOODS.length} hoods × ${QUERY_VARIANTS.length} variants = ${total} pairs. Up to ${total * MAX_PAGES} requests. Cap: ${o.cap} (~$${(o.cap * COST_PER_REQUEST).toFixed(2)}).`);
  if (o.dryRun) { console.log("DRY RUN — exiting."); return; }

  let i = 0;
  outer: for (const h of HOODS) {
    for (const q of QUERY_VARIANTS) {
      const pair = `${h.slug}::${q}`;
      i++;
      if (cp.done.includes(pair)) continue;
      if (cp.requests >= o.cap) { console.log(`Cap ${o.cap} reached.`); break outer; }
      let pageToken: string | undefined;
      let page = 0;
      try {
        do {
          if (cp.requests >= o.cap) break;
          const r = await fetchPage(q, h, key!, pageToken);
          cp.requests++; page++;
          let added = 0;
          for (const p of r.places ?? []) {
            if (!p.id || venues.has(p.id)) continue;
            const v = buildVenue(p, h, q);
            if (v) { venues.set(p.id, v); added++; }
          }
          console.log(`${pair} p${page}: +${added} (total ${venues.size}, req ${cp.requests}/${o.cap})`);
          pageToken = r.nextPageToken;
          if (!pageToken || page >= MAX_PAGES) break;
          await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));
        } while (true);
      } catch (e) { console.warn(`Error ${pair}:`, (e as Error).message); }
      cp.done.push(pair);
      if (i % 5 === 0) {
        await writeFile(outPath, JSON.stringify([...venues.values()], null, 2), "utf8");
        await writeFile(checkpointPath, JSON.stringify(cp, null, 2), "utf8");
      }
    }
  }

  await writeFile(outPath, JSON.stringify([...venues.values()], null, 2), "utf8");
  await writeFile(checkpointPath, JSON.stringify(cp, null, 2), "utf8");
  console.log(`\nDONE. Pairs: ${cp.done.length}/${total}. Requests: ${cp.requests}. Venues: ${venues.size}. Cost: $${(cp.requests * COST_PER_REQUEST).toFixed(2)}.\n  Output: ${outPath}`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
