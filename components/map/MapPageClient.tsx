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

const defaultVenueIntents: VenueIntentKey[] = ["watch_party", "sports_bar", "both"];
const MAX_MAP_VENUES = 72;
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

export function MapPageClient({ data, city = "nyc" }: { data: MapPageData; city?: string }) {
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
  const [query, setQuery] = useState(params.get("q") ?? "");
  const deferredQuery = useDeferredValue(query);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.742, -73.968]);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const [matchdayDismissed, setMatchdayDismissed] = useState(false);
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [mobileResultsOpen, setMobileResultsOpen] = useState(false);
  const [desktopResultsExpanded, setDesktopResultsExpanded] = useState(false);
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

  const selectedCityConfig = useMemo(() => getHostCity(city) ?? HOST_CITIES[0], [city]);

  useEffect(() => {
    const nextCenter: [number, number] = [selectedCityConfig.lat, selectedCityConfig.lng];
    setMapCenter(nextCenter);
    mapInstanceRef.current?.flyTo(nextCenter, 11, { animate: true });
  }, [selectedCityConfig]);

  const hasCustomVenueIntentSelection =
    selectedVenueIntents.length !== defaultVenueIntents.length ||
    defaultVenueIntents.some((intent) => !selectedVenueIntents.includes(intent)) ||
    selectedVenueIntents.includes("cultural_dining");

  const hasActiveFilters =
    selectedCountrySlugs.length > 0 ||
    soccerBarsMode ||
    hasCustomVenueIntentSelection ||
    Boolean(
      venueType ||
        borough ||
        neighborhood ||
        acceptsReservations ||
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
    Boolean(capacityBucket),
    familyFriendly,
    outdoorSeating,
    Boolean(deferredQuery),
    sortKey !== "matchday"
  ].filter(Boolean).length;

  const shouldForceExpandedView = selectedCountrySlugs.length > 0 || soccerBarsMode;
  const stageOnePopularMode = !hasActiveFilters && !showAllVenues;

  useEffect(() => {
    if (shouldForceExpandedView) setShowAllVenues(true);
  }, [shouldForceExpandedView]);

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

  const mapVenues = useMemo(() => {
    if (displayedVenues.length <= MAX_MAP_VENUES) return displayedVenues;

    const limited = displayedVenues.slice(0, MAX_MAP_VENUES);
    if (
      selectedVenue &&
      displayedVenues.some((venue) => venue.id === selectedVenue.id) &&
      !limited.some((venue) => venue.id === selectedVenue.id)
    ) {
      limited[limited.length - 1] = selectedVenue;
    }

    return limited;
  }, [displayedVenues, selectedVenue]);

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
      if (current && displayedVenues.some((venue) => venue.id === current.id)) return current;
      return displayedVenues[0] ?? null;
    });
  }, [displayedVenues]);

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

  const handleSelectVenue = (venue: RankedVenue) => {
    setSelectedVenue(venue);
    mapInstanceRef.current?.flyTo([venue.lat, venue.lng], 15, { animate: true });
  };

  const handleToggleCountry = (slug: string) => {
    setSoccerBarsMode(false);
    setSelectedCountrySlugs((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]));
  };

  const handleToggleVenueIntent = (intent: VenueIntentKey) => {
    setSelectedVenueIntents((current) =>
      current.includes(intent) ? current.filter((item) => item !== intent) : [...current, intent]
    );
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

  const handleApplyMatch = (match: WorldCupMatch) => {
    setSelectedCountrySlugs([match.homeCountry, match.awayCountry]);
    setSoccerBarsMode(false);
    setShowAllVenues(true);
    setFilterDrawerOpen(false);
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
      {comparisonBannerCountries.length === 2 ? (
        <div className="rounded-2xl border border-[#d7dce8] bg-[#edf3ff] px-4 py-3 text-sm font-semibold text-[#0a1628] shadow-sm dark:border-white/10 dark:bg-white/8 dark:text-white">
          <div className="flex items-center gap-2">
            <span className="text-lg">{comparisonBannerCountries[0]?.flagEmoji ?? "🏁"}</span>
            <span>{comparisonBannerCountries[0]?.name}</span>
            <span className="text-[#0a1628]/40 dark:text-white/40">vs</span>
            <span className="text-lg">{comparisonBannerCountries[1]?.flagEmoji ?? "🏁"}</span>
            <span>{comparisonBannerCountries[1]?.name}</span>
          </div>
          <div className="mt-1 text-xs font-normal text-[#0a1628]/65 dark:text-white/65">Watching spots for both sets of fans</div>
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
        desktopResultsExpanded={desktopResultsExpanded}
        onDesktopResultsExpandedChange={setDesktopResultsExpanded}
        map={
          <div className="relative h-full">
            <NYCFlagPinMap
              countries={data.countries}
              venues={mapVenues}
              selectedVenueId={selectedVenue?.id}
              onSelectVenue={handleSelectVenue}
              onMapChanged={(center) => setMapCenter(center)}
              onMapReady={(map) => {
                mapInstanceRef.current = map;
                const nextCityConfig = getHostCity(city) ?? HOST_CITIES[0];
                map.flyTo([nextCityConfig.lat, nextCityConfig.lng], 11, { animate: true });
              }}
              heightClassName="h-full"
            />

            <div className="absolute left-3 top-3 z-30 flex max-w-[min(92vw,22rem)] flex-col items-start gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCitySelectorOpen((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d8e3f5] bg-white/95 px-4 py-2 text-sm font-semibold text-[#0a1628] shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#161b22]/95 dark:text-white"
                >
                  📍 {selectedCityConfig.label} ▾
                </button>
                {hasActiveFilters ? (
                  <span className="inline-flex items-center rounded-full bg-[#f4b942] px-3 py-2 text-xs font-bold text-[#0a1628] shadow-lg">
                    {selectedCountrySlugs.length > 0
                      ? selectedCountrySlugs.map((slug) => countryLookup.get(slug)?.flagEmoji ?? slug).join(" ")
                      : "Filtered"}
                    {` · ${filteredVenues.length} spots`}
                  </span>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => setFilterDrawerOpen(true)}
                className="hidden items-center gap-2 rounded-full border border-[#d8e3f5] bg-white/95 px-4 py-2.5 text-sm font-semibold text-[#0a1628] shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#161b22]/95 dark:text-white lg:inline-flex"
              >
                ⚙ Filters{hasActiveFilters ? ` · ${activeFilterCount}` : ""}
              </button>

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
            </div>

            {!hasActiveFilters && filteredVenues.length > 0 ? (
              stageOnePopularMode && filteredVenues.length > 20 ? (
                <button
                  type="button"
                  onClick={() => setShowAllVenues(true)}
                  className="absolute bottom-4 left-1/2 z-30 w-[min(92vw,34rem)] -translate-x-1/2 rounded-full border border-[#d8e3f5] bg-white/95 px-4 py-3 text-sm font-semibold text-[#0a1628] shadow-2xl backdrop-blur dark:border-white/10 dark:bg-[#161b22]/95 dark:text-white"
                >
                  {`Top 20 spots · Show all ${filteredVenues.length} results`}
                </button>
              ) : showAllVenues ? (
                <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full border border-[#d8e3f5] bg-white/95 px-4 py-3 text-sm font-semibold text-[#0a1628] shadow-2xl backdrop-blur dark:border-white/10 dark:bg-[#161b22]/95 dark:text-white">
                  {`All ${filteredVenues.length} spots in ${selectedCityConfig.label}`}
                </div>
              ) : null
            ) : null}
          </div>
        }
      />

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
      />
    </div>
  );
}
