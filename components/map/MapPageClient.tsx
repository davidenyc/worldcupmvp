"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { MapBreadcrumbs } from "@/components/map/MapBreadcrumbs";
import { FlagFilterBar } from "@/components/map/FlagFilterBar";
import { MatchdayBanner } from "@/components/map/MatchdayBanner";
import { MapLegend } from "@/components/map/MapLegend";
import { MapResultsPanel } from "@/components/map/MapResultsPanel";
import { MapShell } from "@/components/map/MapShell";
import { MapToolbar } from "@/components/map/MapToolbar";
import { getMatchDateKey, worldCup2026Matches } from "@/lib/data/matches";
import { buildGeoHierarchy } from "@/lib/maps/geoHierarchy";
import { MapPageData, MapSortKey } from "@/lib/maps/types";
import { RankedVenue, VenueIntentKey } from "@/lib/types";

const defaultVenueIntents: VenueIntentKey[] = ["watch_party", "sports_bar", "both"];
const emptySearchParams = new URLSearchParams();

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

function parseIntentParam(value: string | null) {
  const parsed = parseCsvParam(value).filter((item): item is VenueIntentKey =>
    ["watch_party", "sports_bar", "cultural_dining", "both"].includes(item)
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
  capacityBucket,
  familyFriendly,
  outdoorSeating,
  sortKey,
  query,
  showAllVenues
}: {
  selectedCountrySlugs: string[];
  selectedVenueIntents: VenueIntentKey[];
  soccerBarsMode: boolean;
  venueType: string;
  borough: string;
  neighborhood: string;
  acceptsReservations: boolean;
  capacityBucket: string;
  familyFriendly: boolean;
  outdoorSeating: boolean;
  sortKey: MapSortKey;
  query: string;
  showAllVenues: boolean;
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

  if (selectedVenueIntents.length !== defaultVenueIntents.length || selectedVenueIntents.includes("cultural_dining")) {
    params.set("intents", selectedVenueIntents.join(","));
  }

  if (soccerBarsMode) params.set("soccerBars", "1");
  if (venueType) params.set("venueType", venueType);
  if (borough) params.set("borough", borough);
  if (neighborhood) params.set("neighborhood", neighborhood);
  if (acceptsReservations) params.set("reservations", "1");
  if (capacityBucket) params.set("capacityBucket", capacityBucket);
  if (familyFriendly) params.set("familyFriendly", "1");
  if (outdoorSeating) params.set("outdoorSeating", "1");
  if (sortKey !== "matchday") params.set("sort", sortKey);
  if (query.trim()) params.set("q", query.trim());
  if (showAllVenues) params.set("expanded", "1");

  return params;
}

const NYCFlagPinMap = dynamic(
  () => import("@/components/map/NYCFlagPinMap").then((mod) => mod.NYCFlagPinMap),
  { ssr: false }
);

const intentOptions: Array<{
  key: VenueIntentKey;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    key: "watch_party",
    label: "Watch Party",
    icon: "📺",
    description: "Primary purpose is showing games"
  },
  {
    key: "sports_bar",
    label: "Sports Bar",
    icon: "⚽",
    description: "General sports bar with game coverage"
  },
  {
    key: "cultural_dining",
    label: "Authentic Dining",
    icon: "🍽️",
    description: "Cuisine-first, probably not showing games"
  },
  {
    key: "both",
    label: "Both",
    icon: "🏆",
    description: "Authentic restaurant that also shows games"
  }
];

export function MapPageClient({ data }: { data: MapPageData }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/map";
  const searchParams = useSearchParams();
  const params = searchParams ?? emptySearchParams;
  const [selectedVenue, setSelectedVenue] = useState<RankedVenue | null>(data.venues[0] ?? null);
  const [selectedCountrySlugs, setSelectedCountrySlugs] = useState<string[]>(
    normalizeSelectedCountries(params)
  );
  const [selectedVenueIntents, setSelectedVenueIntents] = useState<VenueIntentKey[]>(
    parseIntentParam(params.get("intents"))
  );
  const [soccerBarsMode, setSoccerBarsMode] = useState(parseBooleanParam(params.get("soccerBars")));
  const [showAllVenues, setShowAllVenues] = useState(parseBooleanParam(params.get("expanded")));
  const [venueType, setVenueType] = useState(params.get("venueType") ?? "");
  const [borough, setBorough] = useState(params.get("borough") ?? "");
  const [neighborhood, setNeighborhood] = useState(params.get("neighborhood") ?? "");
  const [acceptsReservations, setAcceptsReservations] = useState(parseBooleanParam(params.get("reservations")));
  const [capacityBucket, setCapacityBucket] = useState(params.get("capacityBucket") ?? "");
  const [familyFriendly, setFamilyFriendly] = useState(parseBooleanParam(params.get("familyFriendly")));
  const [outdoorSeating, setOutdoorSeating] = useState(parseBooleanParam(params.get("outdoorSeating")));
  const [sortKey, setSortKey] = useState<MapSortKey>((params.get("sort") as MapSortKey) ?? "matchday");
  const [venueLayerVisible, setVenueLayerVisible] = useState(true);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const deferredQuery = useDeferredValue(query);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.742, -73.968]);
  const [mapZoom, setMapZoom] = useState<number>(11);
  const countryLookup = useMemo(
    () => new Map(data.countries.map((country) => [country.slug, country] as const)),
    [data.countries]
  );
  const hydratedRef = useRef(false);

  useEffect(() => {
    const nextIntents = parseIntentParam(params.get("intents"));
    const nextSoccerBars = parseBooleanParam(params.get("soccerBars"));
    const nextCountries = nextSoccerBars ? [] : normalizeSelectedCountries(params);
    const nextExpanded = parseBooleanParam(params.get("expanded"));
    const nextVenueType = params.get("venueType") ?? "";
    const nextBorough = params.get("borough") ?? "";
    const nextNeighborhood = params.get("neighborhood") ?? "";
    const nextReservations = parseBooleanParam(params.get("reservations"));
    const nextCapacity = params.get("capacityBucket") ?? "";
    const nextFamilyFriendly = parseBooleanParam(params.get("familyFriendly"));
    const nextOutdoorSeating = parseBooleanParam(params.get("outdoorSeating"));
    const nextSort = (params.get("sort") as MapSortKey) ?? "matchday";
    const nextQuery = params.get("q") ?? "";

    setSelectedCountrySlugs(nextCountries);
    setSelectedVenueIntents(nextIntents);
    setSoccerBarsMode(nextSoccerBars);
    setShowAllVenues(nextExpanded);
    setVenueType(nextVenueType);
    setBorough(nextBorough);
    setNeighborhood(nextNeighborhood);
    setAcceptsReservations(nextReservations);
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
      capacityBucket,
      familyFriendly,
      outdoorSeating,
      sortKey,
      query,
      showAllVenues
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
    neighborhood,
    outdoorSeating,
    pathname,
    query,
    router,
    searchParams,
    selectedCountrySlugs,
    selectedVenueIntents,
    showAllVenues,
    soccerBarsMode,
    sortKey,
    venueType
  ]);

  const hasCustomVenueIntentSelection =
    selectedVenueIntents.length !== defaultVenueIntents.length ||
    defaultVenueIntents.some((intent) => !selectedVenueIntents.includes(intent)) ||
    selectedVenueIntents.includes("cultural_dining");

  const hasActiveFilters =
    selectedCountrySlugs.length > 0 ||
    soccerBarsMode ||
    hasCustomVenueIntentSelection ||
    Boolean(venueType || borough || neighborhood || acceptsReservations || capacityBucket || familyFriendly || outdoorSeating || deferredQuery || sortKey !== "matchday");

  const shouldForceExpandedView = selectedCountrySlugs.length > 0 || soccerBarsMode;
  const stageOnePopularMode = !hasActiveFilters && !showAllVenues;

  useEffect(() => {
    if (shouldForceExpandedView) {
      setShowAllVenues(true);
    }
  }, [shouldForceExpandedView]);

  const breadcrumbs = useMemo(
    () =>
      buildGeoHierarchy({
        serviceAreaLabel: "NYC Metro",
        borough: borough || undefined
      }),
    [borough]
  );

  const filteredVenues = useMemo(() => {
    const filtered = data.venues.filter((venue) => {
      if (selectedCountrySlugs.length && !venue.associatedCountries.some((slug) => selectedCountrySlugs.includes(slug))) return false;
      if (selectedVenueIntents.length && !selectedVenueIntents.includes(venue.venueIntent)) return false;
      if (soccerBarsMode && !(venue.likelySupporterCountry === null && venue.showsSoccer)) return false;
      if (venueType && !venue.venueTypes.includes(venueType as never)) return false;
      if (borough && venue.borough !== borough) return false;
      if (neighborhood && venue.neighborhood !== neighborhood) return false;
      if (acceptsReservations && !venue.acceptsReservations) return false;
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
  }, [
    acceptsReservations,
    borough,
    capacityBucket,
    data.venues,
    deferredQuery,
    familyFriendly,
    mapCenter,
    neighborhood,
    outdoorSeating,
    selectedCountrySlugs,
    selectedVenueIntents,
    soccerBarsMode,
    sortKey,
    venueType
  ]);

  const displayedVenues = useMemo(
    () => (stageOnePopularMode ? filteredVenues.slice(0, 20) : filteredVenues),
    [filteredVenues, stageOnePopularMode]
  );

  const todayMatch = useMemo(() => {
    const todayKey = getMatchDateKey(new Date());
    return worldCup2026Matches.find((match) => getMatchDateKey(match.startsAt) === todayKey) ?? null;
  }, []);

  const comparisonBannerCountries =
    selectedCountrySlugs.length >= 2
      ? selectedCountrySlugs
          .slice(0, 2)
          .map((slug) => countryLookup.get(slug))
          .filter(Boolean)
      : [];

  useEffect(() => {
    if (stageOnePopularMode) {
      setVenueLayerVisible(true);
      return;
    }

    setVenueLayerVisible(false);
    const frame = window.requestAnimationFrame(() => setVenueLayerVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [displayedVenues.length, stageOnePopularMode]);

  useEffect(() => {
    setSelectedVenue((current) => {
      if (current && displayedVenues.some((venue) => venue.id === current.id)) {
        return current;
      }
      return displayedVenues[0] ?? null;
    });
  }, [displayedVenues]);

  const visibleNeighborhoods = useMemo(
    () =>
      Array.from(
        new Set(
          filteredVenues.map((venue) => venue.neighborhood)
        )
      ).sort(),
    [filteredVenues]
  );

  function resetFilters() {
    setSelectedCountrySlugs([]);
    setSelectedVenueIntents(defaultVenueIntents);
    setSoccerBarsMode(false);
    setShowAllVenues(false);
    setVenueType("");
    setBorough("");
    setNeighborhood("");
    setAcceptsReservations(false);
    setCapacityBucket("");
    setFamilyFriendly(false);
    setOutdoorSeating(false);
    setQuery("");
    setSortKey("matchday");
  }

  return (
    <div className="container-shell py-10">
      <div className="mb-6 space-y-3">
        <MatchdayBanner
          countries={data.countries}
          match={todayMatch}
          onApplyMatch={(match) => {
            router.push(`/map?country=${match.homeCountry}&vsCountry=${match.awayCountry}`);
          }}
        />
        <div className="text-sm uppercase tracking-[0.2em] text-mist">Flagship map</div>
        <h1 className="text-5xl font-semibold tracking-tight text-deep">NYC map built first, every country routed here.</h1>
        <p className="max-w-3xl text-lg leading-8 text-navy/72">
          Explore a fully interactive NYC venue map using seeded coordinates, supporter-country flag pins, synced results, and country-aware filtering from the world map.
        </p>
        <MapBreadcrumbs items={breadcrumbs} />
      </div>

      <MapToolbar query={query} onQueryChange={setQuery} onReset={resetFilters} totalResults={filteredVenues.length} />

      <div className="mt-6">
        <MapShell
          sidebar={
            <>
              <FlagFilterBar
                countries={data.countries}
                selectedCountrySlugs={selectedCountrySlugs}
                soccerBarsMode={soccerBarsMode}
                onSoccerBarsToggle={() => {
                  setSoccerBarsMode((current) => {
                    const next = !current;
                    if (next) {
                      setSelectedVenueIntents(defaultVenueIntents);
                      setSelectedCountrySlugs([]);
                    }
                    return next;
                  });
                }}
                onToggle={(slug) => {
                  setSoccerBarsMode(false);
                  setSelectedCountrySlugs((current) =>
                    current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]
                  );
                }}
                onClear={() => {
                  setSelectedCountrySlugs([]);
                  setSoccerBarsMode(false);
                }}
              />
              <div className="surface space-y-3 p-4">
                <div className="text-sm uppercase tracking-[0.2em] text-mist">Map filters</div>
                <div className="grid gap-3">
                  <select className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink" value={sortKey} onChange={(e) => setSortKey(e.target.value as MapSortKey)}>
                    <option value="matchday">Best match-day vibe</option>
                    <option value="rating">Highest rated</option>
                    <option value="capacity">Largest capacity</option>
                    <option value="reservations">Takes reservations</option>
                    <option value="distance">Closest to map center</option>
                  </select>
                  <select className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink" value={venueType} onChange={(e) => setVenueType(e.target.value)}>
                    <option value="">Venue type</option>
                    <option value="bar">Bar</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="cafe">Cafe</option>
                    <option value="bakery">Bakery</option>
                    <option value="lounge">Lounge</option>
                    <option value="cultural_center">Cultural center</option>
                    <option value="supporter_club">Supporter club</option>
                  </select>
                  <select className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink" value={borough} onChange={(e) => setBorough(e.target.value)}>
                    <option value="">Borough</option>
                    <option value="Manhattan">Manhattan</option>
                    <option value="Brooklyn">Brooklyn</option>
                    <option value="Queens">Queens</option>
                    <option value="Bronx">Bronx</option>
                    <option value="Staten Island">Staten Island</option>
                  </select>
                  <select className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)}>
                    <option value="">Neighborhood</option>
                    {visibleNeighborhoods.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <select className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink" value={capacityBucket} onChange={(e) => setCapacityBucket(e.target.value)}>
                    <option value="">Capacity</option>
                    <option value="under_30">Under 30</option>
                    <option value="30_60">30-60</option>
                    <option value="60_100">60-100</option>
                    <option value="100_200">100-200</option>
                    <option value="200_plus">200+</option>
                  </select>
                  <div className="space-y-2 rounded-2xl border border-line bg-white p-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-mist">Venue intent</div>
                    <div className="flex flex-wrap gap-2">
                      {intentOptions.map((option) => {
                        const active = selectedVenueIntents.includes(option.key);
                        return (
                          <button
                            key={option.key}
                            type="button"
                            title={option.description}
                            aria-pressed={active}
                            onClick={() =>
                              setSelectedVenueIntents((current) =>
                                current.includes(option.key)
                                  ? current.filter((item) => item !== option.key)
                                  : [...current, option.key]
                              )
                            }
                            className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                              active
                                ? "bg-accent text-white shadow-card"
                                : "border border-line bg-sky/40 text-navy hover:bg-sky/70"
                            }`}
                          >
                            <span className="mr-1">{option.icon}</span>
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <label className="flex items-center gap-3 text-sm text-navy/72">
                    <input type="checkbox" checked={acceptsReservations} onChange={(e) => setAcceptsReservations(e.target.checked)} />
                    Accepts reservations
                  </label>
                  <label className="flex items-center gap-3 text-sm text-navy/72">
                    <input type="checkbox" checked={familyFriendly} onChange={(e) => setFamilyFriendly(e.target.checked)} />
                    Family friendly
                  </label>
                  <label className="flex items-center gap-3 text-sm text-navy/72">
                    <input type="checkbox" checked={outdoorSeating} onChange={(e) => setOutdoorSeating(e.target.checked)} />
                    Outdoor seating
                  </label>
                </div>
              </div>
              <MapLegend />
            </>
          }
          map={
            <div className={`relative transition-opacity duration-300 ${venueLayerVisible ? "opacity-100" : "opacity-0"}`}>
              <NYCFlagPinMap
                countries={data.countries}
                venues={displayedVenues}
                selectedVenueId={selectedVenue?.id}
                onSelectVenue={setSelectedVenue}
                onMapChanged={(center, zoom) => {
                  setMapCenter(center);
                  setMapZoom(zoom);
                }}
              />
              {!hasActiveFilters && filteredVenues.length > 0 &&
                (stageOnePopularMode && filteredVenues.length > 20 ? (
                  <button
                    type="button"
                    onClick={() => setShowAllVenues(true)}
                    className="absolute bottom-4 left-1/2 z-50 w-[min(92vw,34rem)] -translate-x-1/2 rounded-full bg-slate-950/90 px-4 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur"
                  >
                    {`Showing top 20 spots · Tap to explore all ${filteredVenues.length} venues`}
                  </button>
                ) : showAllVenues ? (
                  <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-950/90 px-4 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur">
                    {`${filteredVenues.length} venues`}
                  </div>
                ) : null)}
            </div>
          }
          results={
            <div className={`transition-opacity duration-300 ${venueLayerVisible ? "opacity-100" : "opacity-0"}`}>
              {comparisonBannerCountries.length === 2 && (
                <div className="mb-3 rounded-3xl border border-sky-200 bg-white/90 px-4 py-3 text-sm font-semibold text-deep shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{comparisonBannerCountries[0]?.flagEmoji ?? "🏁"}</span>
                    <span>{comparisonBannerCountries[0]?.name}</span>
                    <span className="text-navy/40">vs</span>
                    <span className="text-lg">{comparisonBannerCountries[1]?.flagEmoji ?? "🏁"}</span>
                    <span>{comparisonBannerCountries[1]?.name}</span>
                  </div>
                  <div className="mt-1 text-xs font-normal text-navy/65">
                    Watching spots for both sets of fans
                  </div>
                </div>
              )}
              <MapResultsPanel
                venues={displayedVenues}
                countries={data.countries}
                selectedVenueId={selectedVenue?.id}
                onSelect={setSelectedVenue}
              />
            </div>
          }
        />

        <div className="mt-6 xl:hidden">
          <div className="surface-strong p-4">
            <div className="mb-3 text-sm uppercase tracking-[0.2em] text-mist">Results</div>
            <MapResultsPanel
              venues={displayedVenues}
              countries={data.countries}
              selectedVenueId={selectedVenue?.id}
              onSelect={setSelectedVenue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
