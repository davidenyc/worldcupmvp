import { NextResponse } from "next/server";

import { searchGooglePlacesVenues } from "@/lib/providers/googlePlaces";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseNumber(value: string | null) {
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const city = url.searchParams.get("city") ?? undefined;
    const countrySlug = url.searchParams.get("country") ?? undefined;
    const cityLat = parseNumber(url.searchParams.get("cityLat"));
    const cityLng = parseNumber(url.searchParams.get("cityLng"));

    if (!city || !countrySlug) {
      return NextResponse.json([]);
    }

    const venues = await searchGooglePlacesVenues({
      city,
      countrySlug,
      cityLat,
      cityLng
    });

    return NextResponse.json(venues);
  } catch (error) {
    console.warn("Venue search route failed:", error);
    return NextResponse.json([]);
  }
}
