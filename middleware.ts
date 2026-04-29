import { NextRequest, NextResponse } from "next/server";

import { getHostCity } from "@/lib/data/hostCities";
import { updateSession } from "@/lib/supabase/middleware";

const VALID_CITY_KEYS = new Set([
  "nyc",
  "los-angeles",
  "dallas",
  "miami",
  "atlanta",
  "houston",
  "san-francisco",
  "seattle",
  "boston",
  "philadelphia",
  "kansas-city",
  "las-vegas",
  "toronto",
  "vancouver",
  "mexico-city",
  "guadalajara",
  "monterrey"
]);

const VALID_TOP_LEVEL_ROUTES = new Set([
  "about",
  "admin",
  "account",
  "auth",
  "country",
  "groups",
  "map",
  "matches",
  "me",
  "membership",
  "offline",
  "og",
  "privacy",
  "promos",
  "saved",
  "search",
  "submit",
  "terms",
  "today",
  "tonight",
  "welcome",
  "venue"
]);

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.[^/]+$/)
  ) {
    return updateSession(request);
  }

  const response = await updateSession(request);

  if (pathname === "/tonight") {
    const url = new URL(`/today${search}`, request.url);
    return NextResponse.redirect(url, 301);
  }

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (
    !firstSegment ||
    VALID_CITY_KEYS.has(firstSegment) ||
    VALID_TOP_LEVEL_ROUTES.has(firstSegment) ||
    getHostCity(firstSegment)
  ) {
    return response;
  }

  const restOfPath = segments.slice(1).join("/");
  const destinationPath = restOfPath ? `/nyc/${restOfPath}` : "/nyc";
  const url = new URL(`${destinationPath}${search}`, request.url);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};
