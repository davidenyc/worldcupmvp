import { NextRequest, NextResponse } from "next/server";

import { getHostCity } from "@/lib/data/hostCities";

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
  "venue"
]);

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.[^/]+$/)
  ) {
    return NextResponse.next();
  }

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
    return NextResponse.next();
  }

  const restOfPath = segments.slice(1).join("/");
  const destinationPath = restOfPath ? `/nyc/${restOfPath}` : "/nyc";
  const url = new URL(`${destinationPath}${search}`, request.url);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};
