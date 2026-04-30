import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

import { searchGooglePlacesVenues } from "@/lib/providers/googlePlaces";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cachedSearch = unstable_cache(
  async (city: string, countrySlug: string, cityLat?: number, cityLng?: number) =>
    searchGooglePlacesVenues({
      city,
      countrySlug,
      cityLat,
      cityLng
    }),
  ["google-places-search"],
  { revalidate: 86400, tags: ["google-places"] }
);

function parseNumber(value: string | null) {
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const city = url.searchParams.get("city") ?? undefined;
    const countrySlug = url.searchParams.get("country") ?? undefined;
    const cityLat = parseNumber(url.searchParams.get("cityLat"));
    const cityLng = parseNumber(url.searchParams.get("cityLng"));

    if (!city || !countrySlug) {
      return NextResponse.json([]);
    }

    // TODO(security): apply Postgres-backed per-user rate limit here in commit 7.
    const venues = await cachedSearch(city, countrySlug, cityLat, cityLng);

    return NextResponse.json(venues);
  } catch (error) {
    console.warn("Venue search route failed:", error);
    return NextResponse.json([]);
  }
}
