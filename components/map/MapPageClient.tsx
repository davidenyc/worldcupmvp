"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { UpgradeModal } from "@/components/membership/UpgradeModal";
import { FilterDrawer } from "@/components/map/FilterDrawer";
import { MatchdayBanner } from "@/components/map/MatchdayBanner";
import { NYCFlagPinMap } from "@/components/map/NYCFlagPinMap";
import { MapResultsPanel } from "@/components/map/MapResultsPanel";
import { MapShell } from "@/components/map/MapShell";
import { CitySelector } from "@/components/ui/CitySelector";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { HOST_CITIES, getHostCity } from "@/lib/data/hostCities";
import { getPromosByCity } from "@/lib/data/promos";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { getMatchHostCityKey } from "@/lib/data/matchLocations";
import { WorldCupMatch, getMatchDateKey, worldCup2026Matches } from "@/lib/data/matches";
import { MapPageData, MapSortKey } from "@/lib/maps/types";
import { useMembership } from "@/lib/store/membership";
import { RankedVenue, VenueIntentKey } from "@/lib/types";
import { getSoccerAtmosphereRating } from "@/lib/utils";

const allVenueIntents: VenueIntentKey[] = [
  "sports_bar",
  "bar_with_tv",
  "cultural_restaurant",
  "cultural_bar",
  "fan_fest"
];
const defaultVenueIntents: VenueIntentKey[] = allVenueIntents;
const emptySearchParams = new URLSearchParams();
const INITIAL_MAP_VENUE_COUNT = 80;
const MID_MAP_VENUE_COUNT = 140;
const LATE_MAP_VENUE_COUNT = 240;
const FULL_AUTO_REVEAL_RATIO = 0.82;
const MID_MAP_REVEAL_ZOOM = 12;
const LATE_MAP_REVEAL_ZOOM = 13;
const FULL_MAP_REVEAL_ZOOM = 14;
const REGIONAL_REVEAL_ZOOM = 10.6;
const QUICK_MATCH_LIMIT = 4;
const RESULTS_PAGE_SIZE = 12;

type QuickMatchBucket = "local" | "today" | "tomorrow" | "upcoming";

function isSportsBarVenue(venue: RankedVenue) {
  return venue.venueIntent === "sports_bar" || (venue.venueTypes as string[]).includes("sports_bar");
}

function isGamesFocusedBar(venue: RankedVenue) {
  return venue.venueIntent === "sports_bar" || venue.venueIntent === "bar_with_tv" || venue.venueIntent === "fan_fest";
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
      y: Math.min(size.y - 84, Math.max(278, size.y * 0.78))
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
    allVenueIntents.some((intent) => intent === item)
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
  query,
  selectedVenueSlug
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
  selectedVenueSlug?: string | null;
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
  if (selectedVenueSlug) params.set("venue", selectedVenueSlug);
  return params;
}

export function MapPageClient({
  data,
  city = "nyc",
  cityGuideIntro
}: {
  data: MapPageData;
  city?: string;
  cityGuideIntro?: string | null;
}) {
  const initialCityConfig = getHostCity(city) ?? HOST_CITIES[0];
  const router = useRouter();
  const { canAddCountryFilter, tier } = useMembership();
  const pathname = usePathname() ?? "/map";
  const searchParams = useSearchParams();
  const params = searchParams ?? emptySearchParams;
  const initialSelectedCountries = normalizeSelectedCountries(params);
  const [selectedVenue, setSelectedVenue] = useState<RankedVenue | null>(null);
  const [selectedVenueSlug, setSelectedVenueSlug] = useState(params.get("venue") ?? "");
  const [selectedCountrySlugs, setSelectedCountrySlugs] = useState<string[]>(
    initialSelectedCountries
  );
  const [selectedVenueIntents, setSelectedVenueIntents] = useState<VenueIntentKey[]>(
    params.get("intents")
      ? parseIntentParam(params.get("intents"))
      : initialSelectedCountries.length
        ? allVenueIntents
        : defaultVenueIntents
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
  const mobileSelectionTimeoutRef = useRef<number | null>(null);
  const [matchdayDismissed, setMatchdayDismissed] = useState(false);
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [mobileResultsOpen, setMobileResultsOpen] = useState(false);
  const [desktopResultsExpanded, setDesktopResultsExpanded] = useState(false);
  const [showAllMapVenues, setShowAllMapVenues] = useState(false);
  const [showAllLockedVenues, setShowAllLockedVenues] = useState<RankedVenue[] | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [upsellDismissed, setUpsellDismissed] = useState(false);
  const [quickMatchBucket, setQuickMatchBucket] = useState<QuickMatchBucket>("local");
  const [mobileGamesOpen, setMobileGamesOpen] = useState(false);
  const [mobileBrowseExpanded, setMobileBrowseExpanded] = useState(true);
  const [mobileDealsExpanded, setMobileDealsExpanded] = useState(true);
  const [mobileCityExpanded, setMobileCityExpanded] = useState(false);
  const [resultsVisibleCount, setResultsVisibleCount] = useState(RESULTS_PAGE_SIZE);
  const [resultsReady, setResultsReady] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const countryLookup = useMemo(
    () => new Map(data.countries.map((country) => [country.slug, country] as const)),
    [data.countries]
  );
  const hydratedRef = useRef(false);

  const usingDefaultGamesFocusedIntents =
    selectedVenueIntents.length === defaultVenueIntents.length &&
    defaultVenueIntents.every((intent) => selectedVenueIntents.includes(intent));

  useEffect(() => {
    setResultsReady(true);
  }, []);

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
    const nextVenueSlug = params.get("venue") ?? "";

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
    setSelectedVenueSlug(nextVenueSlug);
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
      query,
      selectedVenueSlug
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
    selectedVenueSlug,
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
    setShowAllLockedVenues(null);
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
    if (!selectedCountrySlugs.length || !usingDefaultGamesFocusedIntents) return;
    setSelectedVenueIntents(allVenueIntents);
  }, [selectedCountrySlugs, usingDefaultGamesFocusedIntents]);

  useEffect(() => {
    setShowAllMapVenues(false);
    setShowAllLockedVenues(null);
    setResultsVisibleCount(RESULTS_PAGE_SIZE);
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

  useEffect(() => {
    return () => {
      if (mobileSelectionTimeoutRef.current) {
        window.clearTimeout(mobileSelectionTimeoutRef.current);
      }
    };
  }, []);

  const autoShouldShowRegionalVenues = mapZoom <= REGIONAL_REVEAL_ZOOM && regionalFilteredVenues.length > 0;
  const shouldShowRegionalVenues = autoShouldShowRegionalVenues;
  const cityCandidateMapVenues = filteredVenues;
  const regionalCandidateMapVenues = useMemo(
    () => [...filteredVenues, ...regionalFilteredVenues],
    [filteredVenues, regionalFilteredVenues]
  );
  const baseCandidateMapVenues = shouldShowRegionalVenues ? regionalCandidateMapVenues : cityCandidateMapVenues;
  const candidateMapVenues = showAllMapVenues && showAllLockedVenues?.length ? showAllLockedVenues : baseCandidateMapVenues;

  const mapRevealCount = showAllMapVenues
    ? candidateMapVenues.length
    : mapZoom >= FULL_MAP_REVEAL_ZOOM
      ? Math.max(
          LATE_MAP_VENUE_COUNT,
          Math.min(candidateMapVenues.length, Math.round(candidateMapVenues.length * FULL_AUTO_REVEAL_RATIO))
        )
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
  const resultsVenues = useMemo(
    () => displayedVenues.slice(0, resultsVisibleCount),
    [displayedVenues, resultsVisibleCount]
  );
  const canShowMoreResults = displayedVenues.length > resultsVisibleCount;
  const allSelectableVenues = useMemo(
    () => [...filteredVenues, ...regionalFilteredVenues],
    [filteredVenues, regionalFilteredVenues]
  );
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
        { key: "local", label: "Local", matches: cityMatches.slice(0, 6) },
        { key: "today", label: "Today's games", matches: quickMatchBuckets.today },
        { key: "tomorrow", label: "Tomorrow's games", matches: quickMatchBuckets.tomorrow },
        { key: "upcoming", label: "Popular upcoming", matches: quickMatchBuckets.upcoming }
      ] as Array<{ key: QuickMatchBucket; label: string; matches: WorldCupMatch[] }>,
    [cityMatches, quickMatchBuckets]
  );

  const activeQuickMatchOption =
    quickMatchOptions.find((option) => option.key === quickMatchBucket && option.matches.length > 0) ??
    quickMatchOptions.find((option) => option.matches.length > 0) ??
    null;

  const promoVenues = useMemo(
    () => {
      const promoVenueIds = new Set(getPromosByCity(city, data.venues).map((promo) => promo.venue_id));
      return displayedVenues.filter((venue) => promoVenueIds.has(venue.slug) || promoVenueIds.has(venue.id)).slice(0, 3);
    },
    [city, data.venues, displayedVenues]
  );
  const promoVenueIds = useMemo(() => getPromosByCity(city, data.venues).map((promo) => promo.venue_id), [city, data.venues]);
  const activePromoCount = useMemo(() => getPromosByCity(city, data.venues).length, [city, data.venues]);

  const getMatchVenueStats = (match: WorldCupMatch) => {
    const relevantVenues = displayedVenues.filter(
      (venue) =>
        venue.associatedCountries.includes(match.homeCountry) ||
        venue.associatedCountries.includes(match.awayCountry)
    );

    return {
      spots: relevantVenues.length,
      sportsBars: relevantVenues.filter(isGamesFocusedBar).length
    };
  };

  useEffect(() => {
    if (!activeQuickMatchOption) return;
    if (activeQuickMatchOption.key !== quickMatchBucket) {
      setQuickMatchBucket(activeQuickMatchOption.key);
    }
  }, [activeQuickMatchOption, quickMatchBucket]);

  useEffect(() => {
    if (!mobileGamesOpen) return;
    setMobileBrowseExpanded(true);
    setMobileDealsExpanded(true);
    setMobileCityExpanded(false);
  }, [mobileGamesOpen, city]);

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
    setSelectedVenueSlug("");
  }

  const handleSelectVenue = useCallback((venue: RankedVenue) => {
    setSelectedVenueSlug(venue.slug);
    setCitySelectorOpen(false);
    setMobileGamesOpen(false);
    const map = mapInstanceRef.current;
    const isMobile = window.innerWidth < 1024;

    if (mobileSelectionTimeoutRef.current) {
      window.clearTimeout(mobileSelectionTimeoutRef.current);
      mobileSelectionTimeoutRef.current = null;
    }

    if (!map) {
      setSelectedVenue(venue);
      return;
    }

    if (!isMobile) {
      setSelectedVenue(venue);
    } else {
      setSelectedVenue(null);
    }

    map.stop();

    const currentCenter = map.getCenter();
    const distance = Math.hypot(currentCenter.lat - venue.lat, currentCenter.lng - venue.lng);
    const currentZoom = map.getZoom();
    const markerCenter: [number, number] = [venue.lat, venue.lng];
    const finalizeSelection = (delay: number) => {
      if (!isMobile) return;
      let handled = false;
      const finish = () => {
        if (handled) return;
        handled = true;
        if (mobileSelectionTimeoutRef.current) {
          window.clearTimeout(mobileSelectionTimeoutRef.current);
          mobileSelectionTimeoutRef.current = null;
        }
        setSelectedVenue(venue);
      };
      map.once("moveend", finish);
      mobileSelectionTimeoutRef.current = window.setTimeout(() => {
        finish();
      }, delay);
    };

    if (distance < 0.03) {
      map.panTo(getOffsetCenter(map, markerCenter, currentZoom, desktopResultsExpanded), {
        animate: true,
        duration: 0.42
      });
      finalizeSelection(220);
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
    finalizeSelection(430);
  }, [desktopResultsExpanded]);

  useEffect(() => {
    if (!selectedVenueSlug) return;
    const matchedVenue = allSelectableVenues.find((venue) => venue.slug === selectedVenueSlug);
    if (!matchedVenue) return;
    if (selectedVenue?.slug === matchedVenue.slug) return;
    handleSelectVenue(matchedVenue);
  }, [allSelectableVenues, handleSelectVenue, selectedVenue?.slug, selectedVenueSlug]);

  const handleToggleCountry = (slug: string) => {
    setSoccerBarsMode(false);
    setSelectedCountrySlugs((current) => {
      if (current.includes(slug)) {
        return current.filter((item) => item !== slug);
      }
      if (!canAddCountryFilter(current.length)) {
        setShowFilterModal(true);
        return current;
      }
      return [...current, slug];
    });
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
      {!resultsReady ? (
        <div className="space-y-3">
          <SkeletonCard className="border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)]" lines={2} />
          <SkeletonCard className="border border-[color:var(--border-subtle)] bg-[var(--bg-surface)]" lines={4} />
          <SkeletonCard className="border border-[color:var(--border-subtle)] bg-[var(--bg-surface)]" lines={4} />
        </div>
      ) : null}
      {resultsReady && cityGuideIntro ? (
        <section className="rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-4 py-3 text-sm text-[color:var(--fg-secondary)] shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">City guide</div>
          <p className="mt-2 leading-6">{cityGuideIntro}</p>
        </section>
      ) : null}
      {resultsReady && tier === "free" && !upsellDismissed ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#e6c879] bg-[var(--accent-soft-bg)] px-4 py-3 text-sm text-[color:var(--fg-primary)]">
          <button type="button" onClick={() => setShowFilterModal(true)} className="min-w-0 text-left">
            <span className="font-semibold text-[color:var(--fg-primary)]">Unlock ranked results, watch-party priority booking, and city alerts.</span>
            <span className="mt-1 block text-xs font-bold text-[#9b6b04]">Fan Pass $4.99/mo</span>
          </button>
          <button
            type="button"
            onClick={() => setUpsellDismissed(true)}
            className="shrink-0 rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1 text-xs font-semibold text-[color:var(--fg-muted)]"
          >
            Dismiss
          </button>
        </div>
      ) : null}
      {resultsReady ? (
        <MapResultsPanel
          venues={resultsVenues}
          countries={data.countries}
          selectedVenueId={selectedVenue?.id}
          selectedCountrySlugs={selectedCountrySlugs}
          columns={desktopResultsExpanded ? 2 : 1}
          onSelect={handleSelectVenue}
          onClearAll={clearAllFilters}
        />
      ) : null}
      {resultsReady && canShowMoreResults ? (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setResultsVisibleCount((current) => current + RESULTS_PAGE_SIZE)}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] px-5 text-sm font-semibold text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface-elevated)]"
          >
            Show 12 more
          </button>
        </div>
      ) : null}
    </div>
  );

  const handleToggleShowAllMapVenues = () => {
    setShowAllMapVenues((current) => {
      const next = !current;
      const nextLockedVenues = next
        ? [...regionalCandidateMapVenues]
        : null;
      setShowAllLockedVenues(nextLockedVenues);
      return next;
    });
  };

  return (
    <div className="map-page relative">
      <MapShell
        banner={
          <div className="hidden lg:block">
            <MatchdayBanner
              countries={data.countries}
              match={matchdayDismissed ? null : matchdayAlertMatch}
              onApplyMatch={handleApplyMatch}
              onDismiss={() => setMatchdayDismissed(true)}
            />
          </div>
        }
        results={resultsPanel}
        resultsCountLabel={`${filteredVenues.length} venues`}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
        onOpenFilters={() => setFilterDrawerOpen(true)}
        onOpenResults={() => setMobileResultsOpen(true)}
        onOpenGames={() => {
          setFilterDrawerOpen(false);
          setMobileResultsOpen(false);
          setMobileGamesOpen((current) => !current);
        }}
        mobileResultsOpen={mobileResultsOpen}
        mobileGamesOpen={mobileGamesOpen}
        onCloseResults={() => setMobileResultsOpen(false)}
        mobileFilterOpen={filterDrawerOpen}
        hideMobileResultsButton={Boolean(selectedVenue) || filterDrawerOpen || mobileResultsOpen || mobileGamesOpen}
        desktopResultsExpanded={desktopResultsExpanded}
        onDesktopResultsExpandedChange={setDesktopResultsExpanded}
        hideDesktopResults={citySelectorOpen}
        map={
          <div className="relative h-full">
            <NYCFlagPinMap
              countries={data.countries}
              promoVenueIds={promoVenueIds}
              venues={mapVenues}
              initialCenter={initialMapView.center}
              initialZoom={initialMapView.zoom}
              compactMarkers={isDesktop && showAllMapVenues && mapZoom <= LATE_MAP_REVEAL_ZOOM}
              selectedVenueId={selectedVenue?.id}
              activeCountrySlug={selectedCountrySlugs.length === 1 ? selectedCountrySlugs[0] : null}
              activeVenueIntent={selectedVenueIntents.length === 1 ? selectedVenueIntents[0] : null}
              activeVenueType={venueType}
              reservationsOnly={acceptsReservations}
              openNowOnly={openNowOnly}
              highAtmosphereOnly={highAtmosphereOnly}
              onSelectVenue={handleSelectVenue}
              onClearSelection={() => {
                setSelectedVenue(null);
                setSelectedVenueSlug("");
              }}
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
              className={`absolute left-3 top-5 z-30 hidden max-w-[min(92vw,22rem)] flex-col items-start gap-2.5 transition-all duration-200 lg:top-3 lg:flex ${
                selectedVenue
                  ? "pointer-events-none translate-y-2 opacity-0 lg:pointer-events-auto lg:translate-y-0 lg:opacity-100"
                  : "pointer-events-auto translate-y-0 opacity-100"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCitySelectorOpen(false);
                    setFilterDrawerOpen(false);
                    setMobileResultsOpen(false);
                    setMobileGamesOpen((current) => !current);
                  }}
                  className="inline-flex h-12 min-w-[11rem] items-center justify-between gap-2 rounded-full border border-[#d8e3f5] bg-white/95 px-4 text-sm font-semibold text-[#0a1628] shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#161b22]/95 dark:text-white"
                >
                  <span>🏟 Games</span>
                  <span className="text-xs opacity-65">▾</span>
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
                    className="inline-flex h-12 items-center rounded-full bg-[#f4b942] px-3.5 text-xs font-bold text-[#0a1628] shadow-lg"
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
                className="inline-flex h-12 min-w-[11rem] items-center gap-2 rounded-full border border-[#d8e3f5] bg-white/95 px-4 text-sm font-semibold text-[#0a1628] shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#161b22]/95 dark:text-white"
              >
                ⚙ Filters{hasActiveFilters ? ` · ${activeFilterCount}` : ""}
              </button>

              {activeQuickMatchOption && mobileGamesOpen ? (
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
                      const stats = getMatchVenueStats(match);

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
                          <div className="mt-1 text-[11px] text-[#0a1628]/58 dark:text-white/68">
                            {stats.spots} spots · {stats.sportsBars} sports bars
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {canToggleShowAllMapVenues ? (
                <button
                  type="button"
                  onClick={handleToggleShowAllMapVenues}
                  className="hidden h-12 min-w-[11rem] items-center justify-center gap-2 rounded-full border border-[#d8e3f5] bg-white/95 px-4 text-sm font-semibold text-[#0a1628] shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#161b22]/95 dark:text-white lg:inline-flex"
                >
                  {showAllMapVenues ? "Show fewer" : "Show all"}
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

      {!selectedVenue && !filterDrawerOpen && !mobileResultsOpen && !mobileGamesOpen && filteredVenues.length > 0 ? (
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+10.5rem)] z-40 lg:hidden">
          <div className="pointer-events-none flex items-center justify-center px-4">
            <div className="pointer-events-auto rounded-full border border-[#d8e3f5] bg-white/95 px-4 py-2 text-sm font-semibold text-[#0a1628] shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-[#161b22]/96 dark:text-white">
              {filteredVenues.length} venues
            </div>
          </div>
        </div>
      ) : null}

      {canToggleShowAllMapVenues && !selectedVenue && !filterDrawerOpen && !mobileResultsOpen && !mobileGamesOpen ? (
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+10.5rem)] z-40 lg:hidden">
          <div className="pointer-events-none flex items-end justify-end px-4">
            <button
              type="button"
              onClick={handleToggleShowAllMapVenues}
              className="pointer-events-auto rounded-full border border-[#d8e3f5] bg-white/95 px-4 py-2 text-sm font-semibold text-[#0a1628] shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-[#161b22]/96 dark:text-white"
            >
              {showAllMapVenues ? "Show fewer" : "Show all"}
            </button>
          </div>
        </div>
      ) : null}

      {activeQuickMatchOption && mobileGamesOpen ? (
        <>
          <button
            type="button"
            aria-label="Close games sheet"
            onClick={() => setMobileGamesOpen(false)}
            className="fixed inset-0 z-40 bg-[#0a1628]/18 lg:hidden"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
            <div className="mx-3 mb-[calc(env(safe-area-inset-bottom)+0.5rem)] overflow-hidden rounded-[1.75rem] border border-[#d8e3f5] bg-white text-[#0a1628] shadow-2xl">
              <div className="flex justify-center pt-3">
                <div className="h-1.5 w-14 rounded-full bg-[#0a1628]/12" />
              </div>
              <div className="border-b border-[#eef4ff] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0a1628]/45">
                      Games in {selectedCityConfig.label}
                    </div>
                    <div className="mt-1 text-base font-semibold">
                      {activeQuickMatchOption.key === "local" ? "Best matches for this city" : activeQuickMatchOption.label}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileGamesOpen(false)}
                    className="rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-3 py-1.5 text-xs font-semibold text-[#0a1628]"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="max-h-[72vh] space-y-3 overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <section className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0a1628]/45">Next up</div>
                  <div className="space-y-2">
                    {activeQuickMatchOption.matches.slice(0, 3).map((match) => {
                      const home = countryLookup.get(match.homeCountry);
                      const away = countryLookup.get(match.awayCountry);
                      const stats = getMatchVenueStats(match);

                      return (
                        <button
                          key={match.id}
                          type="button"
                          onClick={() => handleApplyMatch(match)}
                          className="w-full rounded-[1.35rem] border border-[#d8e3f5] bg-[#f8fbff] px-4 py-3 text-left shadow-sm transition hover:bg-[#eef4ff]"
                        >
                          <div className="flex items-center gap-2 text-sm font-semibold text-[#0a1628]">
                            <span>{home?.flagEmoji ?? "🏁"}</span>
                            <span className="truncate">{home?.name ?? match.homeCountry}</span>
                            <span className="text-[#0a1628]/35">vs</span>
                            <span>{away?.flagEmoji ?? "🏁"}</span>
                            <span className="truncate">{away?.name ?? match.awayCountry}</span>
                          </div>
                          <div className="mt-1 text-xs text-[#0a1628]/60">
                            {new Date(match.startsAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              timeZone: "America/New_York"
                            })}{" "}
                            ET
                          </div>
                          <div className="mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0a1628]/75">
                            {stats.spots} watch spots · {stats.sportsBars} sports bars
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="rounded-[1.35rem] border border-[#d8e3f5] bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setMobileBrowseExpanded((current) => !current)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0a1628]/45">Browse by day</div>
                      <div className="mt-1 text-sm font-semibold text-[#0a1628]">Today, tomorrow, or popular upcoming</div>
                    </div>
                    <span className="text-sm text-[#0a1628]/55">{mobileBrowseExpanded ? "−" : "+"}</span>
                  </button>
                  {mobileBrowseExpanded ? (
                    <div className="border-t border-[#eef4ff] px-4 py-3">
                      <div className="grid grid-cols-2 gap-2">
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
                                  ? "border border-[#d8e3f5] bg-[#f8fbff] text-[#0a1628]"
                                  : "border border-[#d8e3f5] bg-[#f8fbff] text-[#0a1628]/35"
                            }`}
                          >
                            {option.key === "local" ? selectedCityConfig.label : option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </section>

                <section className="rounded-[1.35rem] border border-[#d8e3f5] bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setMobileCityExpanded((current) => !current)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0a1628]/45">Host city</div>
                      <div className="mt-1 text-sm font-semibold text-[#0a1628]">{selectedCityConfig.label}</div>
                    </div>
                    <span className="text-sm text-[#0a1628]/55">{mobileCityExpanded ? "−" : "+"}</span>
                  </button>
                  {mobileCityExpanded ? (
                    <div className="border-t border-[#eef4ff] px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileGamesOpen(false);
                          setCitySelectorOpen(true);
                        }}
                        className="inline-flex w-full items-center justify-center rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-4 py-2.5 text-sm font-semibold text-[#0a1628]"
                      >
                        Switch city
                      </button>
                    </div>
                  ) : null}
                </section>

                <section className="rounded-[1.35rem] border border-[#d8e3f5] bg-[#fff8e7] shadow-sm">
                  <button
                    type="button"
                    onClick={() => setMobileDealsExpanded((current) => !current)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c98a00]">Game-day deals</div>
                      <div className="mt-1 text-sm font-semibold text-[#0a1628]">
                        {activePromoCount > 0 ? `${activePromoCount} live deals in ${selectedCityConfig.shortLabel}` : "Sponsored match-night perks"}
                      </div>
                    </div>
                    <span className="text-sm text-[#0a1628]/55">{mobileDealsExpanded ? "−" : "+"}</span>
                  </button>
                  {mobileDealsExpanded ? (
                    <div className="space-y-2 border-t border-[#f4d18c] px-4 py-3">
                      <div className="text-xs text-[#0a1628]/70">
                        Show up 30 minutes before the match or reserve ahead to unlock participating venue promos.
                      </div>
                      {promoVenues.map((venue) => (
                        <div key={venue.id} className="rounded-2xl border border-[#f4d18c] bg-white px-3 py-3">
                          <div className="text-sm font-semibold text-[#0a1628]">{venue.name}</div>
                          <div className="mt-1 text-xs text-[#0a1628]/60">{venue.neighborhood} · {venue.acceptsReservations ? "Reserve to lock it in" : "Walk in 30 min early"}</div>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setMobileGamesOpen(false);
                                handleSelectVenue(venue);
                              }}
                              className="inline-flex flex-1 items-center justify-center rounded-full bg-[#f4b942] px-3 py-2 text-xs font-semibold text-[#0a1628]"
                            >
                              View on map
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMobileGamesOpen(false);
                                setMobileResultsOpen(true);
                              }}
                              className="inline-flex flex-1 items-center justify-center rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-3 py-2 text-xs font-semibold text-[#0a1628]"
                            >
                              Reserve / lock in
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </section>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {citySelectorOpen ? (
        <>
          <button
            type="button"
            aria-label="Close city selector"
            onClick={() => setCitySelectorOpen(false)}
            className="fixed inset-0 z-40 bg-[#0a1628]/18 lg:hidden"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-hidden rounded-t-[1.75rem] border-t border-[#d8e3f5] bg-white/97 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-[#161b22]/96 lg:hidden">
            <div className="flex justify-center pt-4">
              <div className="h-1.5 w-14 rounded-full bg-[#0a1628]/12" />
            </div>
            <div className="border-b border-[#d8e3f5] px-4 py-3">
              <div className="text-xs uppercase tracking-[0.22em] text-[#0a1628]/45">Switch city</div>
              <div className="mt-1 text-sm font-semibold text-[#0a1628]">Choose your host city</div>
            </div>
            <div className="max-h-[calc(80vh-4.5rem)] overflow-y-auto p-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <CitySelector
                selectedCity={city}
                onSelectCity={(nextCity) => {
                  setCitySelectorOpen(false);
                  handleSelectCity(nextCity);
                }}
              />
            </div>
          </div>
        </>
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
      {showFilterModal ? (
        <UpgradeModal
          feature="unlimited_country_filters"
          requiredTier="fan"
          onClose={() => setShowFilterModal(false)}
        />
      ) : null}
    </div>
  );
}
