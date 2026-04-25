"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { FilterDrawer } from "@/components/map/FilterDrawer";
import { MatchdayBanner } from "@/components/map/MatchdayBanner";
import { MapResultsPanel } from "@/components/map/MapResultsPanel";
import { MapShell } from "@/components/map/MapShell";
import { CitySelector } from "@/components/ui/CitySelector";
import { HOST_CITIES, getHostCity } from "@/lib/data/hostCities";
import { getMatchHostCityKey } from "@/lib/data/matchLocations";
import { WorldCupMatch, getMatchDateKey, worldCup2026Matches } from "@/lib/data/matches";
import { MapPageData, MapSortKey } from "@/lib/maps/types";
import { RankedVenue, VenueIntentKey } from "@/lib/types";
import { getSoccerAtmosphereRating } from "@/lib/utils";
import { DEFAULT_GAMES_FOCUSED_VENUE_INTENTS } from "@/lib/venueIntents";

const defaultVenueIntents: VenueIntentKey[] = DEFAULT_GAMES_FOCUSED_VENUE_INTENTS;
const emptySearchParams = new URLSearchParams();
const INITIAL_MAP_VENUE_COUNT = 42;
const MID_MAP_VENUE_COUNT = 72;
const LATE_MAP_VENUE_COUNT = 110;
const MID_MAP_REVEAL_ZOOM = 12;
const LATE_MAP_REVEAL_ZOOM = 13;
const FULL_MAP_REVEAL_ZOOM = 14;
const REGIONAL_REVEAL_ZOOM = 10.6;
const QUICK_MATCH_LIMIT = 4;

type QuickMatchBucket = "today" | "tomorrow" | "upcoming";

function isSportsBarVenue(venue: RankedVenue) {
  return venue.venueIntent === "sports_bar" || (venue.venueTypes as string[]).includes("sports_bar");
}

function getSelectionSafePoint(
  map: import("leaflet").Map,
  desktopResultsExpanded: boolean
) {
  const size = map.getSize();
  const isDesktop = window.innerWidth >= 1024;

  if (!isDesktop) {
    return {
      x: size.x / 2,
      y: Math.min(size.y - 124, Math.max(220, size.y * 0.68))
    };
  }

  const leftControlsWidth = 210;
  const rightResultsWidth = desktopResultsExpanded ? Math.min(544, size.x * 0.34) : 304;
  const popupWidth = 252;
  const safeLeft = 24 + leftControlsWidth;
  const safeRight = 24 + rightResultsWidth;
  const maxX = size.x - safeRight - popupWidth / 2;
  const minX = safeLeft + popupWidth / 2;

  return {
    x: Math.max(minX, Math.min(maxX, size.x * 0.53)),
    y: Math.min(size.y - 110, Math.max(240, size.y * 0.64))
  };
}

function getOffsetCenter(
  map: import("leaflet").Map,
  targetCenter: [number, number],
  zoom: number,
  desktopResultsExpanded: boolean
) {
  const size = map.getSize();
  const safePoint = getSelectionSafePoint(map, desktopResultsExpanded);
  const centerOffset = {
    x: safePoint.x - size.x / 2,
    y: safePoint.y - size.y / 2
  };
  const venuePoint = map.project(targetCenter as unknown as import("leaflet").LatLngExpression, zoom);

  return map.unproject(venuePoint.subtract([centerOffset.x, centerOffset.y]), zoom);
}

function getVenuePriorityScore(venue: RankedVenue, center: [number, number]) {
  const distance = Math.hypot(venue.lat - center[0], venue.lng - center[1]);
  const reviewSignal = Math.log10((venue.reviewCount ?? 0) + 10) * 4;
  const ratingSignal = (venue.rating ?? 0) * 3;
  const screensSignal = Math.min(venue.numberOfScreens, 18) * 0.7;
  const sourceSignal = (venue.sourceConfidence ?? 0) * 10;
  const intentSignal =
    venue.venueIntent === "sports_bar"
      ? 18
      : venue.venueIntent === "bar_with_tv"
        ? 12
      : venue.venueIntent === "fan_fest"
        ? 17
        : venue.venueIntent === "cultural_bar"
          ? 11
          : -10;
  const soccerSignal = venue.showsSoccer ? 10 : -10;
  const groupSignal = venue.goodForGroups ? 3 : 0;
  const reservationSignal = venue.acceptsReservations ? 2 : 0;
  const distancePenalty = distance * 65;

  return (
    venue.rankScore * 10 +
    reviewSignal +
    ratingSignal +
    screensSignal +
    sourceSignal +
    intentSignal +
    soccerSignal +
    groupSignal +
    reservationSignal -
    distancePenalty
  );
}

function getDistancePercentile(venues: RankedVenue[], center: [number, number], percentile: number) {
  if (!venues.length) return 0;
  const distances = venues
    .map((venue) => Math.hypot(venue.lat - center[0], venue.lng - center[1]))
    .sort((a, b) => a - b);
  const index = Math.max(0, Math.min(distances.length - 1, Math.floor((distances.length - 1) * percentile)));
  return distances[index] ?? 0;
}

function pickDistributedVenues(
  venues: RankedVenue[],
  count: number,
  center: [number, number],
  zoom: number,
  selectedVenueId?: string
) {
  if (venues.length <= count) return venues;

  const minLat = Math.min(...venues.map((venue) => venue.lat));
  const maxLat = Math.max(...venues.map((venue) => venue.lat));
  const minLng = Math.min(...venues.map((venue) => venue.lng));
  const maxLng = Math.max(...venues.map((venue) => venue.lng));
  const latSpan = Math.max(maxLat - minLat, 0.08);
  const lngSpan = Math.max(maxLng - minLng, 0.08);
  const gridCols = zoom >= FULL_MAP_REVEAL_ZOOM ? 7 : zoom >= LATE_MAP_REVEAL_ZOOM ? 6 : 5;
  const gridRows = zoom >= FULL_MAP_REVEAL_ZOOM ? 6 : zoom >= LATE_MAP_REVEAL_ZOOM ? 5 : 4;
  const cellLat = latSpan / gridRows;
  const cellLng = lngSpan / gridCols;

  const buckets = new Map<string, RankedVenue[]>();
  venues.forEach((venue) => {
    const row = Math.min(gridRows - 1, Math.max(0, Math.floor((venue.lat - minLat) / cellLat)));
    const col = Math.min(gridCols - 1, Math.max(0, Math.floor((venue.lng - minLng) / cellLng)));
    const key = `${row}:${col}`;
    const list = buckets.get(key) ?? [];
    list.push(venue);
    buckets.set(key, list);
  });

  const chosen: RankedVenue[] = [];
  const chosenIds = new Set<string>();
  const pushVenue = (venue: RankedVenue | undefined) => {
    if (!venue || chosenIds.has(venue.id) || chosen.length >= count) return;
    chosen.push(venue);
    chosenIds.add(venue.id);
  };

  const sortByPriority = (a: RankedVenue, b: RankedVenue) => {
    if (selectedVenueId === a.id) return -1;
    if (selectedVenueId === b.id) return 1;
    return getVenuePriorityScore(b, center) - getVenuePriorityScore(a, center);
  };

  const cellLeaders = Array.from(buckets.values())
    .map((bucket) => [...bucket].sort(sortByPriority)[0])
    .sort(sortByPriority);

  const distributedQuota = Math.min(cellLeaders.length, Math.max(12, Math.round(count * 0.55)));
  cellLeaders.slice(0, distributedQuota).forEach(pushVenue);

  const outerThreshold = getDistancePercentile(venues, center, 0.72);
  const outerVenues = [...venues]
    .filter((venue) => !chosenIds.has(venue.id))
    .filter((venue) => Math.hypot(venue.lat - center[0], venue.lng - center[1]) >= outerThreshold)
    .sort(sortByPriority);
  const outerQuota = Math.min(Math.max(4, Math.round(count * 0.2)), count - chosen.length);
  outerVenues.slice(0, outerQuota).forEach(pushVenue);

  const remaining = [...venues].filter((venue) => !chosenIds.has(venue.id)).sort(sortByPriority);
  remaining.forEach(pushVenue);

  return chosen.slice(0, count);
}

function buildInitialMapView(venues: RankedVenue[], fallbackCenter: [number, number], cityKey: string) {
  if (!venues.length) {
    return { center: fallbackCenter, zoom: 12 };
  }

  const focusVenues = pickDistributedVenues(venues, Math.min(28, venues.length), fallbackCenter, 13);
  const trimThreshold = getDistancePercentile(focusVenues, fallbackCenter, 0.82);
  const trimmedFocus = focusVenues.filter((venue) => {
    const distance = Math.hypot(venue.lat - fallbackCenter[0], venue.lng - fallbackCenter[1]);
    return distance <= trimThreshold || getVenuePriorityScore(venue, fallbackCenter) >= getVenuePriorityScore(focusVenues[0], fallbackCenter) - 12;
  });
  const weightedVenues = trimmedFocus.length ? trimmedFocus : focusVenues;
  const totalWeight = weightedVenues.reduce(
    (sum, venue) => sum + Math.max(getVenuePriorityScore(venue, fallbackCenter), 1),
    0
  );

  const centerLat =
    weightedVenues.reduce(
      (sum, venue) => sum + venue.lat * Math.max(getVenuePriorityScore(venue, fallbackCenter), 1),
      0
    ) / totalWeight;
  const centerLng =
    weightedVenues.reduce(
      (sum, venue) => sum + venue.lng * Math.max(getVenuePriorityScore(venue, fallbackCenter), 1),
      0
    ) / totalWeight;

  const latSpan = Math.max(...weightedVenues.map((venue) => venue.lat)) - Math.min(...weightedVenues.map((venue) => venue.lat));
  const lngSpan = Math.max(...weightedVenues.map((venue) => venue.lng)) - Math.min(...weightedVenues.map((venue) => venue.lng));
  const spread = Math.max(latSpan, lngSpan);

  let zoom =
    spread > 0.75
      ? 10.8
      : spread > 0.5
        ? 11.2
        : spread > 0.32
          ? 11.7
          : spread > 0.2
            ? 12.2
            : spread > 0.12
              ? 12.7
              : 13.1;

  if (cityKey === "nyc") zoom += 0.15;
  if (cityKey === "los-angeles") zoom -= 0.15;
  if (cityKey === "dallas") zoom += 0.2;

  return {
    center: [centerLat, centerLng] as [number, number],
    zoom
  };
}

function parseCsvParam(value: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBooleanParam(value: string | null) {
  return value === "1" || value === "true";
}

function isSameLocalDay(date: Date, compare: Date) {
  return (
    date.getFullYear() === compare.getFullYear() &&
    date.getMonth() === compare.getMonth() &&
    date.getDate() === compare.getDate()
  );
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function getQuickMatchBuckets(matches: WorldCupMatch[], now: Date) {
  const upcomingMatches = matches
    .filter((match) => Date.parse(match.startsAt) >= now.getTime())
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const tomorrow = addDays(now, 1);

  return {
    today: upcomingMatches.filter((match) => isSameLocalDay(new Date(match.startsAt), now)).slice(0, QUICK_MATCH_LIMIT),
    tomorrow: upcomingMatches.filter((match) => isSameLocalDay(new Date(match.startsAt), tomorrow)).slice(0, QUICK_MATCH_LIMIT),
    upcoming: upcomingMatches.slice(0, QUICK_MATCH_LIMIT)
  };
}

function parseIntentParam(value: string | null) {
  const parsed = parseCsvParam(value).filter((item): item is VenueIntentKey =>
    ["sports_bar", "bar_with_tv", "cultural_restaurant", "cultural_bar", "fan_fest"].includes(item)
  );
  return parsed.length ? parsed : defaultVenueIntents;
}

function normalizeSelectedCountries(params: URLSearchParams) {
  const countries = parseCsvParam(params.get("countries"));
  if (countries.length > 0) return countries;

  return [params.get("country"), params.get("vsCountry")].filter(Boolean) as string[];
}

function serializeFilterState({
  selectedCountrySlugs,
  selectedVenueIntents,
  soccerBarsMode,
  venueType,
  borough,
  neighborhood,
  acceptsReservations,
  openNowOnly,
  highAtmosphereOnly,
  capacityBucket,
  familyFriendly,
  outdoorSeating,
  sortKey,
  query
}: {
  selectedCountrySlugs: string[];
  selectedVenueIntents: VenueIntentKey[];
  soccerBarsMode: boolean;
  venueType: string;
  borough: string;
  neighborhood: string;
  acceptsReservations: boolean;
  openNowOnly: boolean;
  highAtmosphereOnly: boolean;
  capacityBucket: string;
  familyFriendly: boolean;
  outdoorSeating: boolean;
  sortKey: MapSortKey;
  query: string;
}) {
  const params = new URLSearchParams();
  const countries = selectedCountrySlugs.filter(Boolean);

  if (countries.length === 1) {
    params.set("country", countries[0]);
  } else if (countries.length === 2) {
    params.set("country", countries[0]);
    params.set("vsCountry", countries[1]);
  } else if (countries.length > 2) {
    params.set("countries", countries.join(","));
  }

  if (selectedVenueIntents.length !== defaultVenueIntents.length || selectedVenueIntents.includes("cultural_restaurant")) {
    params.set("intents", selectedVenueIntents.join(","));
  }

  if (soccerBarsMode) params.set("soccerBars", "1");
  if (venueType) params.set("venueType", venueType);
  if (borough) params.set("borough", borough);
  if (neighborhood) params.set("neighborhood", neighborhood);
  if (acceptsReservations) params.set("reservations", "1");
  if (openNowOnly) params.set("openNow", "1");
  if (highAtmosphereOnly) params.set("highAtmosphere", "1");
  if (capacityBucket) params.set("capacityBucket", capacityBucket);
  if (familyFriendly) params.set("familyFriendly", "1");
  if (outdoorSeating) params.set("outdoorSeating", "1");
  if (sortKey !== "matchday") params.set("sort", sortKey);
  if (query.trim()) params.set("q", query.trim());
  return params;
}

const NYCFlagPinMap = dynamic(
  () => import("@/components/map/NYCFlagPinMap").then((mod) => mod.NYCFlagPinMap),
  { ssr: false }
);

export function MapPageClient({ data, city = "nyc" }: { data: MapPageData; city?: string }) {
  const initialCityConfig = getHostCity(city) ?? HOST_CITIES[0];
  const router = useRouter();
  const pathname = usePathname() ?? "/map";
  const searchParams = useSearchParams();
  const params = searchParams ?? emptySearchParams;
  const [selectedVenue, setSelectedVenue] = useState<RankedVenue | null>(null);
  const [selectedCountrySlugs, setSelectedCountrySlugs] = useState<string[]>(
    normalizeSelectedCountries(params)
  );
  const [selectedVenueIntents, setSelectedVenueIntents] = useState<VenueIntentKey[]>(
    parseIntentParam(params.get("intents"))
  );
  const [soccerBarsMode, setSoccerBarsMode] = useState(parseBooleanParam(params.get("soccerBars")));
  const [venueType, setVenueType] = useState(params.get("venueType") ?? "");
  const [borough, setBorough] = useState(params.get("borough") ?? "");
  const [neighborhood, setNeighborhood] = useState(params.get("neighborhood") ?? "");
  const [acceptsReservations, setAcceptsReservations] = useState(parseBooleanParam(params.get("reservations")));
  const [openNowOnly, setOpenNowOnly] = useState(parseBooleanParam(params.get("openNow")));
  const [highAtmosphereOnly, setHighAtmosphereOnly] = useState(parseBooleanParam(params.get("highAtmosphere")));
  const [capacityBucket, setCapacityBucket] = useState(params.get("capacityBucket") ?? "");
  const [familyFriendly, setFamilyFriendly] = useState(parseBooleanParam(params.get("familyFriendly")));
  const [outdoorSeating, setOutdoorSeating] = useState(parseBooleanParam(params.get("outdoorSeating")));
  const [sortKey, setSortKey] = useState<MapSortKey>((params.get("sort") as MapSortKey) ?? "matchday");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const deferredQuery = useDeferredValue(query);
  const [mapCenter, setMapCenter] = useState<[number, number]>([initialCityConfig.lat, initialCityConfig.lng]);
  const [mapZoom, setMapZoom] = useState(12);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const appliedInitialViewCityRef = useRef<string | null>(null);
  const [matchdayDismissed, setMatchdayDismissed] = useState(false);
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [mobileResultsOpen, setMobileResultsOpen] = useState(false);
  const [desktopResultsExpanded, setDesktopResultsExpanded] = useState(false);
  const [showAllMapVenues, setShowAllMapVenues] = useState(false);
  const [quickMatchBucket, setQuickMatchBucket] = useState<QuickMatchBucket>("upcoming");
  const [mobileGamesOpen, setMobileGamesOpen] = useState(false);
  const [mobileGamesPage, setMobileGamesPage] = useState(0);
  const countryLookup = useMemo(
    () => new Map(data.countries.map((country) => [country.slug, country] as const)),
    [data.countries]
  );
  const hydratedRef = useRef(false);

  useEffect(() => {
    const nextIntents = parseIntentParam(params.get("intents"));
    const nextSoccerBars = parseBooleanParam(params.get("soccerBars"));
    const nextCountries = nextSoccerBars ? [] : normalizeSelectedCountries(params);
    const nextVenueType = params.get("venueType") ?? "";
    const nextBorough = params.get("borough") ?? "";
    const nextNeighborhood = params.get("neighborhood") ?? "";
    const nextReservations = parseBooleanParam(params.get("reservations"));
    const nextOpenNowOnly = parseBooleanParam(params.get("openNow"));
    const nextHighAtmosphereOnly = parseBooleanParam(params.get("highAtmosphere"));
    const nextCapacity = params.get("capacityBucket") ?? "";
    const nextFamilyFriendly = parseBooleanParam(params.get("familyFriendly"));
    const nextOutdoorSeating = parseBooleanParam(params.get("outdoorSeating"));
    const nextSort = (params.get("sort") as MapSortKey) ?? "matchday";
    const nextQuery = params.get("q") ?? "";

    setSelectedCountrySlugs(nextCountries);
    setSelectedVenueIntents(nextIntents);
    setSoccerBarsMode(nextSoccerBars);
    setVenueType(nextVenueType);
    setBorough(nextBorough);
    setNeighborhood(nextNeighborhood);
    setAcceptsReservations(nextReservations);
    setOpenNowOnly(nextOpenNowOnly);
    setHighAtmosphereOnly(nextHighAtmosphereOnly);
    setCapacityBucket(nextCapacity);
    setFamilyFriendly(nextFamilyFriendly);
    setOutdoorSeating(nextOutdoorSeating);
    setSortKey(nextSort);
    setQuery(nextQuery);
    hydratedRef.current = true;
  }, [params]);

  useEffect(() => {
    if (!hydratedRef.current) return;

    const nextParams = serializeFilterState({
      selectedCountrySlugs,
      selectedVenueIntents,
      soccerBarsMode,
      venueType,
      borough,
      neighborhood,
      acceptsReservations,
      openNowOnly,
      highAtmosphereOnly,
      capacityBucket,
      familyFriendly,
      outdoorSeating,
      sortKey,
      query
    });
    const nextQueryString = nextParams.toString();
    const currentQueryString = searchParams?.toString() ?? "";

    if (nextQueryString !== currentQueryString) {
      router.replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname, { scroll: false });
    }
  }, [
    acceptsReservations,
    borough,
    capacityBucket,
    familyFriendly,
    highAtmosphereOnly,
    neighborhood,
    openNowOnly,
    outdoorSeating,
    pathname,
    query,
    router,
    searchParams,
    selectedCountrySlugs,
    selectedVenueIntents,
    soccerBarsMode,
    sortKey,
    venueType
  ]);

  const selectedCityConfig = useMemo(() => getHostCity(city) ?? HOST_CITIES[0], [city]);

  const hasCustomVenueIntentSelection =
    selectedVenueIntents.length !== defaultVenueIntents.length ||
    defaultVenueIntents.some((intent) => !selectedVenueIntents.includes(intent)) ||
    selectedVenueIntents.includes("cultural_restaurant");

  const hasActiveFilters =
    selectedCountrySlugs.length > 0 ||
    soccerBarsMode ||
    hasCustomVenueIntentSelection ||
    Boolean(
      venueType ||
        borough ||
        neighborhood ||
        acceptsReservations ||
        openNowOnly ||
        highAtmosphereOnly ||
        capacityBucket ||
        familyFriendly ||
        outdoorSeating ||
        deferredQuery ||
        sortKey !== "matchday"
    );

  const activeFilterCount = [
    selectedCountrySlugs.length > 0,
    soccerBarsMode,
    hasCustomVenueIntentSelection,
    Boolean(venueType),
    Boolean(borough),
    Boolean(neighborhood),
    acceptsReservations,
    openNowOnly,
    highAtmosphereOnly,
    Boolean(capacityBucket),
    familyFriendly,
    outdoorSeating,
    Boolean(deferredQuery),
    sortKey !== "matchday"
  ].filter(Boolean).length;

  const filterVenues = (venues: RankedVenue[]) => {
    const filtered = venues.filter((venue) => {
      if (selectedCountrySlugs.length && !venue.associatedCountries.some((slug) => selectedCountrySlugs.includes(slug))) return false;
      if (selectedVenueIntents.length && !selectedVenueIntents.includes(venue.venueIntent)) return false;
      if (soccerBarsMode && !(isSportsBarVenue(venue) && venue.showsSoccer)) return false;
      if (venueType && !venue.venueTypes.includes(venueType as never)) return false;
      if (borough && venue.borough !== borough) return false;
      if (neighborhood && venue.neighborhood !== neighborhood) return false;
      if (acceptsReservations && !venue.acceptsReservations) return false;
      if (openNowOnly && !venue.openNow) return false;
      if (highAtmosphereOnly && getSoccerAtmosphereRating(venue) !== "High") return false;
      if (capacityBucket && venue.capacityBucket !== capacityBucket) return false;
      if (familyFriendly && !venue.familyFriendly) return false;
      if (outdoorSeating && !venue.hasOutdoorViewing) return false;
      if (deferredQuery) {
        const haystack = [
          venue.name,
          venue.neighborhood,
          venue.borough,
          ...venue.cuisineTags,
          ...venue.associatedCountries
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(deferredQuery.toLowerCase())) return false;
      }
      return true;
    });

    const sorted = [...filtered];
    if (sortKey === "rating") sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (sortKey === "capacity") sorted.sort((a, b) => (b.approximateCapacity ?? 0) - (a.approximateCapacity ?? 0));
    else if (sortKey === "reservations") sorted.sort((a, b) => Number(b.acceptsReservations) - Number(a.acceptsReservations));
    else if (sortKey === "distance") {
      sorted.sort((a, b) => {
        const distA = Math.hypot(a.lat - mapCenter[0], a.lng - mapCenter[1]);
        const distB = Math.hypot(b.lat - mapCenter[0], b.lng - mapCenter[1]);
        return distA - distB;
      });
    } else {
      sorted.sort((a, b) => b.rankScore - a.rankScore);
    }

    return sorted;
  };

  const filteredVenues = useMemo(() => filterVenues(data.venues), [
    acceptsReservations,
    borough,
    capacityBucket,
    data.venues,
    deferredQuery,
    familyFriendly,
    highAtmosphereOnly,
    mapCenter,
    neighborhood,
    openNowOnly,
    outdoorSeating,
    selectedCountrySlugs,
    selectedVenueIntents,
    soccerBarsMode,
    sortKey,
    venueType
  ]);

  const regionalFilteredVenues = useMemo(() => filterVenues(data.regionalVenues), [
    acceptsReservations,
    borough,
    capacityBucket,
    data.regionalVenues,
    deferredQuery,
    familyFriendly,
    highAtmosphereOnly,
    mapCenter,
    neighborhood,
    openNowOnly,
    outdoorSeating,
    selectedCountrySlugs,
    selectedVenueIntents,
    soccerBarsMode,
    sortKey,
    venueType
  ]);

  const initialMapView = useMemo(
    () => buildInitialMapView(filteredVenues, [selectedCityConfig.lat, selectedCityConfig.lng], selectedCityConfig.key),
    [filteredVenues, selectedCityConfig]
  );

  useEffect(() => {
    const shouldApply = appliedInitialViewCityRef.current !== city;
    setShowAllMapVenues(false);
    if (shouldApply) {
      setMapCenter(initialMapView.center);
      setMapZoom(initialMapView.zoom);
    }

    const map = mapInstanceRef.current;
    if (!map || !shouldApply) return;

    appliedInitialViewCityRef.current = city;
    map.flyTo(initialMapView.center, initialMapView.zoom, {
      animate: true,
      duration: 0.85
    });
  }, [city, initialMapView]);

  useEffect(() => {
    setShowAllMapVenues(false);
  }, [
    acceptsReservations,
    borough,
    capacityBucket,
    city,
    deferredQuery,
    familyFriendly,
    highAtmosphereOnly,
    neighborhood,
    openNowOnly,
    outdoorSeating,
    selectedCountrySlugs,
    selectedVenueIntents,
    soccerBarsMode,
    sortKey,
    venueType
  ]);

  useEffect(() => {
    if (!citySelectorOpen) return;
    setFilterDrawerOpen(false);
    setMobileResultsOpen(false);
  }, [citySelectorOpen]);

  const shouldShowRegionalVenues = mapZoom <= REGIONAL_REVEAL_ZOOM && regionalFilteredVenues.length > 0;
  const candidateMapVenues = useMemo(
    () =>
      shouldShowRegionalVenues
        ? [...filteredVenues, ...regionalFilteredVenues]
        : filteredVenues,
    [filteredVenues, regionalFilteredVenues, shouldShowRegionalVenues]
  );

  const mapRevealCount = showAllMapVenues
    ? candidateMapVenues.length
    : mapZoom >= FULL_MAP_REVEAL_ZOOM
      ? candidateMapVenues.length
      : mapZoom >= LATE_MAP_REVEAL_ZOOM
        ? LATE_MAP_VENUE_COUNT
      : mapZoom >= MID_MAP_REVEAL_ZOOM
          ? MID_MAP_VENUE_COUNT
          : INITIAL_MAP_VENUE_COUNT;

  const prioritizedMapVenues = useMemo(
    () =>
      pickDistributedVenues(
        candidateMapVenues,
        Math.min(mapRevealCount, candidateMapVenues.length),
        mapCenter,
        mapZoom,
        selectedVenue?.id
      ),
    [candidateMapVenues, mapCenter, mapRevealCount, mapZoom, selectedVenue?.id]
  );

  const mapVenues = useMemo(() => prioritizedMapVenues, [prioritizedMapVenues]);
  const displayedVenues = filteredVenues;
  const canToggleShowAllMapVenues = candidateMapVenues.length > INITIAL_MAP_VENUE_COUNT;

  const comparisonBannerCountries =
    selectedCountrySlugs.length >= 2
      ? selectedCountrySlugs
          .slice(0, 2)
          .map((slug) => countryLookup.get(slug))
          .filter(Boolean)
      : [];

  const cityMatches = useMemo(
    () =>
      worldCup2026Matches
        .filter((match) => getMatchHostCityKey(match) === city)
        .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
        .slice(0, 8),
    [city]
  );

  const quickMatchBuckets = useMemo(
    () => getQuickMatchBuckets(cityMatches, new Date()),
    [cityMatches]
  );

  const quickMatchOptions = useMemo(
    () =>
      [
        { key: "today", label: "Today's games", matches: quickMatchBuckets.today },
        { key: "tomorrow", label: "Tomorrow's games", matches: quickMatchBuckets.tomorrow },
        { key: "upcoming", label: "Popular upcoming", matches: quickMatchBuckets.upcoming }
      ] as Array<{ key: QuickMatchBucket; label: string; matches: WorldCupMatch[] }>,
    [quickMatchBuckets]
  );

  const activeQuickMatchOption =
    quickMatchOptions.find((option) => option.key === quickMatchBucket && option.matches.length > 0) ??
    quickMatchOptions.find((option) => option.matches.length > 0) ??
    null;

  useEffect(() => {
    if (!activeQuickMatchOption) return;
    if (activeQuickMatchOption.key !== quickMatchBucket) {
      setQuickMatchBucket(activeQuickMatchOption.key);
    }
  }, [activeQuickMatchOption, quickMatchBucket]);

  useEffect(() => {
    setMobileGamesPage(0);
  }, [quickMatchBucket, mobileGamesOpen]);

  const topCountries = useMemo(() => {
    const counts = new Map<string, number>();
    data.venues.forEach((venue) => {
      venue.associatedCountries.forEach((slug) => {
        counts.set(slug, (counts.get(slug) ?? 0) + 1);
      });
    });

    return data.countries
      .filter((country) => counts.has(country.slug))
      .sort((a, b) => (counts.get(b.slug) ?? 0) - (counts.get(a.slug) ?? 0))
      .slice(0, 8);
  }, [data.countries, data.venues]);

  useEffect(() => {
    setSelectedVenue((current) => {
      if (!current) return null;
      if (current && displayedVenues.some((venue) => venue.id === current.id)) return current;
      return null;
    });
  }, [displayedVenues]);

  useEffect(() => {
    if (filterDrawerOpen || mobileResultsOpen || selectedVenue || citySelectorOpen) {
      setMobileGamesOpen(false);
    }
  }, [citySelectorOpen, filterDrawerOpen, mobileResultsOpen, selectedVenue]);

  const visibleNeighborhoods = useMemo(
    () => Array.from(new Set(filteredVenues.map((venue) => venue.neighborhood))).sort(),
    [filteredVenues]
  );

  const matchdayAlertMatch = useMemo(() => {
    const todayKey = getMatchDateKey(new Date());
    const tomorrowKey = getMatchDateKey(new Date(Date.now() + 24 * 60 * 60 * 1000));
    return (
      worldCup2026Matches
        .filter((match) => {
          const matchDayKey = getMatchDateKey(match.startsAt);
          return matchDayKey === todayKey || matchDayKey === tomorrowKey;
        })
        .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0] ?? null
    );
  }, []);

  function clearAllFilters() {
    setSelectedCountrySlugs([]);
    setSelectedVenueIntents(defaultVenueIntents);
    setSoccerBarsMode(false);
    setVenueType("");
    setBorough("");
    setNeighborhood("");
    setAcceptsReservations(false);
    setOpenNowOnly(false);
    setHighAtmosphereOnly(false);
    setCapacityBucket("");
    setFamilyFriendly(false);
    setOutdoorSeating(false);
    setQuery("");
    setSortKey("matchday");
  }

  const handleSelectVenue = (venue: RankedVenue) => {
    setSelectedVenue(venue);
    setCitySelectorOpen(false);
    setMobileGamesOpen(false);
    const map = mapInstanceRef.current;
    if (!map) return;

    map.stop();

    const currentCenter = map.getCenter();
    const distance = Math.hypot(currentCenter.lat - venue.lat, currentCenter.lng - venue.lng);
    const currentZoom = map.getZoom();
    const markerCenter: [number, number] = [venue.lat, venue.lng];

    if (distance < 0.03) {
      map.panTo(getOffsetCenter(map, markerCenter, currentZoom, desktopResultsExpanded), {
        animate: true,
        duration: 0.42
      });
      return;
    }

    const targetZoom =
      distance > 0.22
        ? Math.max(12.4, currentZoom)
        : distance > 0.1
          ? Math.max(13.1, currentZoom)
          : Math.max(13.8, currentZoom);
    const targetCenter = getOffsetCenter(map, markerCenter, targetZoom, desktopResultsExpanded);

    map.flyTo(targetCenter, targetZoom, {
      animate: true,
      duration: 0.95
    });
  };

  const handleToggleCountry = (slug: string) => {
    setSoccerBarsMode(false);
    setSelectedCountrySlugs((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]));
  };

  const handleToggleVenueIntent = (intent: VenueIntentKey) => {
    setSoccerBarsMode(false);
    setSelectedVenueIntents((current) => {
      if (current.length === 1 && current[0] === intent) {
        return defaultVenueIntents;
      }
      return [intent];
    });
  };

  const toggleSoccerBars = () => {
    setSoccerBarsMode((current) => {
      const next = !current;
      if (next) {
        setSelectedVenueIntents(defaultVenueIntents);
        setSelectedCountrySlugs([]);
      }
      return next;
    });
  };

  const clearCountryFilters = () => {
    setSelectedCountrySlugs([]);
  };

  const handleApplyMatch = (match: WorldCupMatch) => {
    const nextCountries = [match.homeCountry, match.awayCountry];
    const isSameMatchSelection =
      selectedCountrySlugs.length === 2 &&
      selectedCountrySlugs[0] === nextCountries[0] &&
      selectedCountrySlugs[1] === nextCountries[1];

    if (isSameMatchSelection) {
      clearCountryFilters();
      setMobileGamesOpen(false);
      setFilterDrawerOpen(false);
      return;
    }

    setSelectedCountrySlugs(nextCountries);
    setSoccerBarsMode(false);
    setFilterDrawerOpen(false);
    setMobileGamesOpen(false);
    router.replace(`/${city}/map?country=${match.homeCountry}&vsCountry=${match.awayCountry}`, { scroll: false });
  };

  const handleSelectCity = (nextCity: string) => {
    const nextParams = new URLSearchParams(searchParams?.toString() ?? "");
    nextParams.delete("city");
    const nextQuery = nextParams.toString();
    router.push(`/${nextCity}/map${nextQuery ? `?${nextQuery}` : ""}`);
  };

  const resultsPanel = (
    <div className="space-y-3">
      {canToggleShowAllMapVenues ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white">
          <div>
            {showAllMapVenues
              ? `Showing all ${candidateMapVenues.length} spots on the map right now.`
              : `Showing ${mapVenues.length} spots on the map right now.`}
          </div>
          <div className="mt-1 text-xs font-normal text-white/60">
            {showAllMapVenues
              ? "Too crowded? Switch back to a lighter map view any time."
              : shouldShowRegionalVenues
                ? `Regional host-city spots are in view. Show all ${candidateMapVenues.length} now if you want the full spread.`
                : `Zoom in to reveal more, or show all ${candidateMapVenues.length} now.`}
          </div>
        </div>
      ) : null}
      {comparisonBannerCountries.length === 2 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white">
          <div className="flex items-center gap-2">
            <span className="text-lg">{comparisonBannerCountries[0]?.flagEmoji ?? "🏁"}</span>
            <span>{comparisonBannerCountries[0]?.name}</span>
            <span className="text-white/40">vs</span>
            <span className="text-lg">{comparisonBannerCountries[1]?.flagEmoji ?? "🏁"}</span>
            <span>{comparisonBannerCountries[1]?.name}</span>
          </div>
          <div className="mt-1 text-xs font-normal text-white/60">Watching spots for both sets of fans</div>
        </div>
      ) : null}
      <MapResultsPanel
        venues={displayedVenues}
        countries={data.countries}
        selectedVenueId={selectedVenue?.id}
        selectedCountrySlugs={selectedCountrySlugs}
        columns={desktopResultsExpanded ? 2 : 1}
        onSelect={handleSelectVenue}
        onClearAll={clearAllFilters}
      />
    </div>
  );

  const handleToggleShowAllMapVenues = () => {
    setShowAllMapVenues((current) => !current);
  };

  return (
    <div className="relative">
      <MapShell
        banner={
          <MatchdayBanner
            countries={data.countries}
            match={matchdayDismissed ? null : matchdayAlertMatch}
            onApplyMatch={handleApplyMatch}
            onDismiss={() => setMatchdayDismissed(true)}
          />
        }
        results={resultsPanel}
        resultsCountLabel={`${filteredVenues.length} spots`}
        filterDrawerOpen={filterDrawerOpen}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
        onOpenFilters={() => setFilterDrawerOpen(true)}
        onOpenResults={() => setMobileResultsOpen(true)}
        mobileResultsOpen={mobileResultsOpen}
        onCloseResults={() => setMobileResultsOpen(false)}
        hideMobileResultsButton={Boolean(selectedVenue) || filterDrawerOpen || mobileResultsOpen || mobileGamesOpen}
        desktopResultsExpanded={desktopResultsExpanded}
        onDesktopResultsExpandedChange={setDesktopResultsExpanded}
        hideDesktopResults={citySelectorOpen}
        map={
          <div className="relative h-full">
            <NYCFlagPinMap
              countries={data.countries}
              venues={mapVenues}
              initialCenter={initialMapView.center}
              initialZoom={initialMapView.zoom}
              selectedVenueId={selectedVenue?.id}
              activeCountrySlug={selectedCountrySlugs.length === 1 ? selectedCountrySlugs[0] : null}
              activeVenueIntent={selectedVenueIntents.length === 1 ? selectedVenueIntents[0] : null}
              activeVenueType={venueType}
              reservationsOnly={acceptsReservations}
              openNowOnly={openNowOnly}
              highAtmosphereOnly={highAtmosphereOnly}
              onSelectVenue={handleSelectVenue}
              onClearSelection={() => setSelectedVenue(null)}
              onToggleCountry={handleToggleCountry}
              onToggleVenueIntent={handleToggleVenueIntent}
              onToggleVenueType={(nextVenueType) =>
                setVenueType((current) => (current === nextVenueType ? "" : nextVenueType))
              }
              onToggleReservations={() => setAcceptsReservations((current) => !current)}
              onToggleOpenNow={() => setOpenNowOnly((current) => !current)}
              onToggleHighAtmosphere={() => setHighAtmosphereOnly((current) => !current)}
              onMapChanged={(center, zoom) => {
                setMapCenter(center);
                setMapZoom(zoom);
              }}
              onMapReady={(map) => {
                mapInstanceRef.current = map;
                appliedInitialViewCityRef.current = city;
                setMapZoom(map.getZoom());
                map.flyTo(initialMapView.center, initialMapView.zoom, {
                  animate: true,
                  duration: 0.85
                });
              }}
              heightClassName="h-full"
            />

            <div
              className={`absolute left-3 top-3 z-30 flex max-w-[min(92vw,22rem)] flex-col items-start gap-3 transition-all duration-200 ${
                selectedVenue
                  ? "pointer-events-none translate-y-2 opacity-0 lg:pointer-events-auto lg:translate-y-0 lg:opacity-100"
                  : "pointer-events-auto translate-y-0 opacity-100"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCitySelectorOpen((current) => {
                      const next = !current;
                      if (next) {
                        setFilterDrawerOpen(false);
                        setMobileResultsOpen(false);
                        setMobileGamesOpen(false);
                      }
                      return next;
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-[#d8e3f5] bg-white/95 px-4 py-2 text-sm font-semibold text-[#0a1628] shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#161b22]/95 dark:text-white"
                >
                  📍 {selectedCityConfig.label} ▾
                </button>
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCountrySlugs.length > 0) {
                        clearCountryFilters();
                      } else {
                        clearAllFilters();
                      }
                    }}
                    className="inline-flex items-center rounded-full bg-[#f4b942] px-3 py-2 text-xs font-bold text-[#0a1628] shadow-lg"
                  >
                    {selectedCountrySlugs.length > 0
                      ? selectedCountrySlugs.map((slug) => countryLookup.get(slug)?.flagEmoji ?? slug).join(" ")
                      : "Filtered"}
                    {` · ${filteredVenues.length} spots`}
                  </button>
                ) : null}
              </div>

              {citySelectorOpen ? (
                <div className="w-[min(92vw,22rem)] overflow-hidden rounded-2xl border border-[#d8e3f5] bg-white shadow-2xl dark:border-white/10 dark:bg-[#161b22]">
                  <div className="max-h-[60vh] overflow-y-auto p-3">
                    <CitySelector
                      selectedCity={city}
                      onSelectCity={(nextCity) => {
                        setCitySelectorOpen(false);
                        handleSelectCity(nextCity);
                      }}
                    />
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setMobileGamesOpen(false);
                  setFilterDrawerOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#d8e3f5] bg-white/95 px-4 py-2.5 text-sm font-semibold text-[#0a1628] shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#161b22]/95 dark:text-white"
              >
                ⚙ Filters{hasActiveFilters ? ` · ${activeFilterCount}` : ""}
              </button>

              {activeQuickMatchOption ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setCitySelectorOpen(false);
                      setFilterDrawerOpen(false);
                      setMobileResultsOpen(false);
                      setMobileGamesOpen((current) => !current);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d8e3f5] bg-white/95 px-4 py-2.5 text-sm font-semibold text-[#0a1628] shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#161b22]/95 dark:text-white"
                  >
                    🏟 Games
                  </button>

                  {mobileGamesOpen ? (
                    <div className="hidden w-[min(92vw,22rem)] rounded-2xl border border-[#d8e3f5] bg-white/95 p-3 text-[#0a1628] shadow-2xl backdrop-blur dark:border-white/10 dark:bg-[#161b22]/95 dark:text-white lg:block">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0a1628]/55 dark:text-white">
                          Games
                        </div>
                        <button
                          type="button"
                          onClick={() => setMobileGamesOpen(false)}
                          className="rounded-full border border-[#d8e3f5] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0a1628] transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                        >
                          Close
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {quickMatchOptions.map((option) => (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => setQuickMatchBucket(option.key)}
                            disabled={!option.matches.length}
                            className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                              option.key === activeQuickMatchOption.key
                                ? "bg-[#f4b942] text-[#0a1628]"
                                : option.matches.length
                                  ? "border border-[#d8e3f5] bg-white text-[#0a1628] hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                                  : "border border-[#d8e3f5] bg-[#f8fbff] text-[#0a1628]/35 dark:border-white/10 dark:bg-white/5 dark:text-white/35"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>

                      <div className="mt-3 space-y-2">
                        {activeQuickMatchOption.matches.slice(0, 4).map((match) => {
                          const home = countryLookup.get(match.homeCountry);
                          const away = countryLookup.get(match.awayCountry);

                          return (
                            <button
                              key={match.id}
                              type="button"
                              onClick={() => handleApplyMatch(match)}
                              className="w-full rounded-2xl border border-[#d8e3f5] bg-white px-3 py-3 text-left transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                            >
                              <div className="text-sm font-semibold text-[#0a1628] dark:text-white">
                                <span className="inline-flex items-center gap-1">
                                  <span>{home?.flagEmoji ?? "🏁"}</span>
                                  <span>{home?.name ?? match.homeCountry}</span>
                                </span>
                                <span className="mx-2 text-[#0a1628]/40 dark:text-white">vs</span>
                                <span className="inline-flex items-center gap-1">
                                  <span>{away?.flagEmoji ?? "🏁"}</span>
                                  <span>{away?.name ?? match.awayCountry}</span>
                                </span>
                              </div>
                              <div className="mt-1 text-xs text-[#0a1628]/55 dark:text-white">
                                {new Date(match.startsAt).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                  timeZone: "America/New_York"
                                })}{" "}
                                ET
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}

              {canToggleShowAllMapVenues ? (
                <button
                  type="button"
                  onClick={handleToggleShowAllMapVenues}
                  className="hidden items-center gap-2 rounded-full border border-[#d8e3f5] bg-white/95 px-4 py-2.5 text-sm font-semibold text-[#0a1628] shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#161b22]/95 dark:text-white lg:inline-flex"
                >
                  {showAllMapVenues ? "Show fewer" : shouldShowRegionalVenues ? "Show all regional" : "Show all"}
                </button>
              ) : null}
            </div>

            {!hasActiveFilters && filteredVenues.length > 0 && !selectedVenue && !mobileGamesOpen ? (
              <div className="absolute bottom-4 left-1/2 z-30 hidden -translate-x-1/2 rounded-full border border-[#d8e3f5] bg-white/95 px-4 py-3 text-sm font-semibold text-[#0a1628] shadow-2xl backdrop-blur dark:border-white/10 dark:bg-[#161b22]/95 dark:text-white lg:block">
                {showAllMapVenues || !canToggleShowAllMapVenues
                  ? "All spots visible"
                  : `${mapVenues.length} spots shown`}
              </div>
            ) : null}
          </div>
        }
      />

      {canToggleShowAllMapVenues && !selectedVenue && !filterDrawerOpen && !mobileResultsOpen && !mobileGamesOpen ? (
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.4rem)] z-40 lg:hidden">
          <div className="pointer-events-none flex items-end justify-end px-4">
            <button
              type="button"
              onClick={handleToggleShowAllMapVenues}
              className="pointer-events-auto rounded-full border border-[#d8e3f5] bg-white/95 px-4 py-2 text-sm font-semibold text-[#0a1628] shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-[#161b22]/96 dark:text-white"
            >
              {showAllMapVenues ? "Show fewer" : shouldShowRegionalVenues ? "Show all regional" : "Show all"}
            </button>
          </div>
        </div>
      ) : null}

      {activeQuickMatchOption && mobileGamesOpen ? (
        <div className="fixed inset-x-2 bottom-[calc(env(safe-area-inset-bottom)+0.5rem)] z-40 lg:hidden">
          <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#161b22]/96 text-white shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 px-2 py-2">
              <button
                type="button"
                onClick={() => {
                  const available = quickMatchOptions.filter((option) => option.matches.length > 0);
                  const currentIndex = available.findIndex((option) => option.key === activeQuickMatchOption.key);
                  const next = available[(currentIndex + 1) % available.length];
                  if (next) setQuickMatchBucket(next.key);
                }}
                className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold text-white"
              >
                {activeQuickMatchOption.label}
              </button>

              <button
                type="button"
                onClick={() => setMobileGamesPage((current) => Math.max(0, current - 1))}
                disabled={mobileGamesPage === 0}
                className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-semibold text-white disabled:opacity-35"
              >
                ←
              </button>

              <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                {activeQuickMatchOption.matches
                  .slice(mobileGamesPage * 2, mobileGamesPage * 2 + 2)
                  .map((match) => {
                    const home = countryLookup.get(match.homeCountry);
                    const away = countryLookup.get(match.awayCountry);

                    return (
                      <button
                        key={match.id}
                        type="button"
                        onClick={() => handleApplyMatch(match)}
                        className="min-w-0 rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2 text-left transition hover:bg-white/10"
                      >
                        <div className="truncate text-[12px] font-semibold text-white">
                          <span>{home?.flagEmoji ?? "🏁"}</span>
                          <span className="mx-1">{home?.name ?? match.homeCountry}</span>
                          <span className="text-white/40">vs</span>
                          <span className="ml-1">{away?.flagEmoji ?? "🏁"}</span>
                        </div>
                        <div className="mt-1 truncate text-[10px] text-white/65">
                          {new Date(match.startsAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            timeZone: "America/New_York"
                          })}{" "}
                          ET
                        </div>
                      </button>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() =>
                  setMobileGamesPage((current) => {
                    const maxPage = Math.max(0, Math.ceil(activeQuickMatchOption.matches.length / 2) - 1);
                    return Math.min(maxPage, current + 1);
                  })
                }
                disabled={mobileGamesPage >= Math.max(0, Math.ceil(activeQuickMatchOption.matches.length / 2) - 1)}
                className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-semibold text-white disabled:opacity-35"
              >
                →
              </button>

              <button
                type="button"
                onClick={() => setMobileGamesOpen(false)}
                className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-2 text-[11px] font-semibold text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        countries={data.countries}
        selectedCountrySlugs={selectedCountrySlugs}
        selectedVenueIntents={selectedVenueIntents}
        soccerBarsMode={soccerBarsMode}
        topCountries={topCountries}
        cityMatches={cityMatches}
        neighborhoodOptions={visibleNeighborhoods}
        query={query}
        sortKey={sortKey}
        venueType={venueType}
        borough={borough}
        neighborhood={neighborhood}
        capacityBucket={capacityBucket}
        acceptsReservations={acceptsReservations}
        familyFriendly={familyFriendly}
        outdoorSeating={outdoorSeating}
        onQueryChange={setQuery}
        onSortKeyChange={setSortKey}
        onVenueTypeChange={setVenueType}
        onBoroughChange={setBorough}
        onNeighborhoodChange={setNeighborhood}
        onCapacityBucketChange={setCapacityBucket}
        onToggleReservations={() => setAcceptsReservations((current) => !current)}
        onToggleFamilyFriendly={() => setFamilyFriendly((current) => !current)}
        onToggleOutdoorSeating={() => setOutdoorSeating((current) => !current)}
        onToggleSoccerBars={toggleSoccerBars}
        onToggleVenueIntent={handleToggleVenueIntent}
        onToggleCountry={handleToggleCountry}
        onApplyMatch={handleApplyMatch}
        onClearAll={clearAllFilters}
        onToggleShowAllMapVenues={handleToggleShowAllMapVenues}
        canToggleShowAllMapVenues={canToggleShowAllMapVenues}
        showAllMapVenues={showAllMapVenues}
        totalVenueCount={filteredVenues.length}
      />
    </div>
  );
}
