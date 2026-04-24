import { NextRequest, NextResponse } from "next/server";

import { HOST_CITIES } from "@/lib/data/hostCities";

export const dynamic = "force-dynamic";

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNearestCity(lat: number, lng: number) {
  return HOST_CITIES.reduce<{ city: (typeof HOST_CITIES)[number]; distance: number } | null>(
    (closest, city) => {
      const distance = haversineDistance(lat, lng, city.lat, city.lng);
      return !closest || distance < closest.distance ? { city, distance } : closest;
    },
    null
  )?.city ?? null;
}

export async function GET(request: NextRequest) {
  const latHeader = request.headers.get("x-vercel-ip-latitude");
  const lngHeader = request.headers.get("x-vercel-ip-longitude");

  if (latHeader && lngHeader) {
    const lat = parseFloat(latHeader);
    const lng = parseFloat(lngHeader);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const nearest = getNearestCity(lat, lng);
      return NextResponse.json({
        cityKey: nearest?.key ?? "nyc",
        cityLabel: nearest?.label ?? "New York",
        lat,
        lng,
        source: "vercel-ip"
      });
    }
  }

  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const url =
      ip && ip !== "::1" && ip !== "127.0.0.1"
        ? `https://ipapi.co/${ip}/json/`
        : "https://ipapi.co/json/";

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const nearest = getNearestCity(lat, lng);
        return NextResponse.json({
          cityKey: nearest?.key ?? "nyc",
          cityLabel: nearest?.label ?? "New York",
          lat,
          lng,
          source: "ipapi-fallback"
        });
      }
    }
  } catch {
    // silently fall through
  }

  return NextResponse.json({ cityKey: "nyc", cityLabel: "New York", source: "default" });
}
