# Codex Brief — Google Places provider hardening

You (Codex) are executing. Claude (separate agent) has already diagnosed the
current state of the provider stack and is acting as architect/reviewer.
Read this brief end-to-end before writing any code.

The previous brief (two-map homepage) is complete; this one supersedes it.

---

## 1. Reality on disk (verified by Claude — do NOT redo)

| Concern | State | Action |
| --- | --- | --- |
| `lib/providers/types.ts` — `priceLevel?: number` | **Already present** on `VenueSearchParams` (line 12). | Nothing. |
| `lib/providers/googlePlaces.ts` — TypeScript errors | **Zero.** `npx tsc --noEmit` returns clean for the entire project. | Nothing. |
| `lib/providers/googlePlaces.ts` — implementation | Production-grade: Google Places `searchText` POST, location bias, classification via `lib/venues/googleClassification`, host-city aware via `getHostCity`, file-cache integration. | Nothing structural. Step B-2 below adds memory-cache calls. |
| `lib/cache/places/index.ts` — file cache | Working: 7-day TTL, exposes `getPlacesCachePath`, `isFreshPlacesCache`, `readPlacesCache`, `readPlacesCacheForCity`, `findPlacesVenueBySlug`, `writePlacesCache`. **833 cached JSON files seeded** across 17 cities × ~48 keys. | Step B-1 — add memory-cache layer. |
| `lib/providers/index.ts` — selector | Already defaults to mock (`process.env.DATA_PROVIDER ?? "mock"`) with a fallback to mock for unknown values. | Step C — add API-key safety check. |
| `app/api/venues/route.ts` | **Does NOT exist.** | Step D — create it. |
| `app/api/venues/search/route.ts` | Exists. Calls `searchGooglePlacesVenues` directly (bypasses `DATA_PROVIDER`); returns bare `Venue[]`; no city validation. | Leave alone for now (existing callers may depend on it). The new `/api/venues` is a different shape. |
| `lib/providers/rateLimit.ts` | Per-key cooldown, 150 ms default. Imported correctly in `googlePlaces.ts`. | Nothing. |
| `.env.example` | Already lists `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACES_TEXT_SEARCH_URL`, `DATA_PROVIDER="mock"`. | Nothing. |

---

## 2. Hard rules

- **DO NOT change `DATA_PROVIDER=mock` as the default.**
- **DO NOT modify the mock provider** (`lib/providers/mock.ts`).
- **DO NOT modify `lib/data/demo.ts`.**
- **DO NOT change the `VenueProvider` interface** unless adding optional fields. (You don't need to.)
- **DO NOT touch `app/api/venues/search/route.ts`** — leave the existing route intact.
- **DO NOT modify `components/map/world-map.tsx`** name-matching logic.

---

## 3. Steps

### Step A — confirm baseline
Run `npx tsc --noEmit`. Confirm 0 errors before touching anything. If there
are errors, stop and report them — Claude's diagnosis says the project is
clean, so any errors mean something has changed since the diagnosis.

### Step B-1 — add a memory cache layer to `lib/cache/places/index.ts`
At the top of the file (after the existing imports, before `placesCacheDir`),
add:

```ts
type MemoryCacheEntry = { data: unknown; cachedAt: number };
const memoryCache = new Map<string, MemoryCacheEntry>();
const MEMORY_TTL_MS = 60 * 60 * 1000; // 1 hour

export function getFromMemoryCache<T = unknown>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > MEMORY_TTL_MS) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setInMemoryCache(key: string, data: unknown): void {
  memoryCache.set(key, { data, cachedAt: Date.now() });
}

export function buildPlacesCacheKey(city: string, countrySlug: string): string {
  return `${city}::${countrySlug}`;
}
```

Notes:
- Generic on `getFromMemoryCache` so callers don't need a cast.
- `buildPlacesCacheKey` keeps the key shape consistent across call sites; do
  NOT use the slugified file name — keep the raw inputs so a future cache
  walker can decode the key.
- The module-level `Map` survives across requests in a long-running Next.js
  server process (the desired behavior). It resets on cold starts, which is
  acceptable.

### Step B-2 — wire the memory cache into `lib/providers/googlePlaces.ts`
In `searchGooglePlacesVenues`, BEFORE the file-cache freshness check, look up
the memory cache:

```ts
import {
  readPlacesCache,
  isFreshPlacesCache,
  writePlacesCache,
  getFromMemoryCache,
  setInMemoryCache,
  buildPlacesCacheKey
} from "../cache/places";
```

Then near the top of `searchGooglePlacesVenues` (just after `cacheKey` is
computed and validated):

```ts
const memoryKey = buildPlacesCacheKey(cityKey, cacheKey);
const memoryHit = getFromMemoryCache<Venue[]>(memoryKey);
if (memoryHit) return memoryHit;
```

After a successful fetch + `writePlacesCache`, write to memory too:

```ts
await writePlacesCache(cityKey, cacheKey, venues);
setInMemoryCache(memoryKey, venues);
return venues;
```

Also: when the file cache returns a hit, populate the memory cache so the
next request skips disk I/O entirely:

```ts
const cached = fresh ? await readPlacesCache(cityKey, cacheKey) : null;
if (cached !== null) {
  setInMemoryCache(memoryKey, cached);
  return cached;
}
```

### Step C — API-key safety check in `lib/providers/index.ts`
Replace `getActiveVenueProvider` with:

```ts
export function getActiveVenueProvider() {
  const provider = process.env.DATA_PROVIDER ?? "mock";

  if (provider === "google" && !process.env.GOOGLE_PLACES_API_KEY?.trim()) {
    console.warn(
      "[GameDay Map] DATA_PROVIDER=google but GOOGLE_PLACES_API_KEY is not set. Falling back to mock."
    );
    return providers.mock;
  }

  return providers[provider] ?? providers.mock;
}
```

That's the only change to this file.

### Step D — create `app/api/venues/route.ts`
New file. Provider-agnostic (respects `DATA_PROVIDER`). Spec:

```
GET /api/venues?city=<key>&country=<slug>
```

- `city` is required. Validate against `HOST_CITIES` keys (import from
  `@/lib/data/hostCities`). Unknown city → 400 with
  `{ error: "Unknown city: <key>" }`.
- `country` is optional. Pass it through to the provider as
  `countrySlug`.
- Use `getActiveVenueProvider().listVenues({ city, countrySlug })`.
- Return shape: `{ venues: Venue[], city: string, country: string | null }`.
- Cache header: `Cache-Control: s-maxage=3600, stale-while-revalidate=86400`.
- `runtime = "nodejs"` (the provider uses `node:fs/promises` via the file
  cache — Edge runtime would fail).
- `dynamic = "force-dynamic"` so the cache header is the only caching layer.

Skeleton:

```ts
import { NextResponse } from "next/server";

import { HOST_CITIES } from "@/lib/data/hostCities";
import { getActiveVenueProvider } from "@/lib/providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_CITY_KEYS = new Set(HOST_CITIES.map((c) => c.key));

export async function GET(request: Request) {
  const url = new URL(request.url);
  const city = url.searchParams.get("city");
  const country = url.searchParams.get("country");

  if (!city) {
    return NextResponse.json({ error: "Missing required query param: city" }, { status: 400 });
  }
  if (!VALID_CITY_KEYS.has(city)) {
    return NextResponse.json({ error: `Unknown city: ${city}` }, { status: 400 });
  }

  try {
    const venues = await getActiveVenueProvider().listVenues({
      city,
      countrySlug: country ?? undefined
    });
    return NextResponse.json(
      { venues, city, country: country ?? null },
      { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } }
    );
  } catch (error) {
    console.warn("[/api/venues] failed:", error);
    return NextResponse.json({ error: "Provider failure" }, { status: 500 });
  }
}
```

If the `HOST_CITIES` shape is different from `{ key: string }[]`, adapt the
`VALID_CITY_KEYS` line — but check, don't guess.

### Step E — verify
Run, in order:
1. `npx tsc --noEmit` → must be 0 errors.
2. `npm run build` → must be green.
3. `DATA_PROVIDER=mock npm run dev`, then:
   - `curl 'http://localhost:3000/api/venues?city=nyc'` → 200 with non-empty
     `venues` array.
   - `curl 'http://localhost:3000/api/venues?city=nyc&country=brazil'` → 200,
     filtered.
   - `curl 'http://localhost:3000/api/venues?city=atlantis'` → 400.
   - `curl -i 'http://localhost:3000/api/venues?city=nyc'` → response includes
     `Cache-Control: s-maxage=3600, stale-while-revalidate=86400`.
4. With `DATA_PROVIDER=google` and **no** `GOOGLE_PLACES_API_KEY`, restart and
   confirm the warning prints once and the mock provider is used.

---

## 4. Acceptance criteria

- [ ] `lib/cache/places/index.ts` — memory cache helpers added; existing
      exports unchanged; nothing else touched.
- [ ] `lib/providers/googlePlaces.ts` — memory cache used before file cache,
      written after file cache hits AND after successful API fetches; no
      change to function signatures or API call structure.
- [ ] `lib/providers/index.ts` — API-key safety check added; `mock` remains
      the explicit default.
- [ ] `app/api/venues/route.ts` — new file, returns the documented shape,
      validates city, sets cache header.
- [ ] `app/api/venues/search/route.ts` — UNCHANGED.
- [ ] `npx tsc --noEmit` → 0 errors.
- [ ] `npm run build` → green.
- [ ] All Step E curl probes behave as described.

## 5. When you're done

Report back:
1. List every file changed (paths only).
2. Output of `tsc --noEmit` and `npm run build`.
3. Any decision you made where the brief was ambiguous, with one-line
   justification.
