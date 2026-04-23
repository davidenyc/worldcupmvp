"use client";

import { useEffect, useMemo, useState } from "react";

import { NycMapPanel } from "@/components/map/nyc-map-panel";
import { VenueCard } from "@/components/venue/venue-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { filterAndSortCountryVenues } from "@/lib/data/countryFiltering";
import { CountrySortKey, RankedVenue } from "@/lib/types";

export function CountryBrowser({
  venues,
  neighborhoods
}: {
  venues: RankedVenue[];
  neighborhoods: string[];
}) {
  const [view, setView] = useState<"map" | "list">("list");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [borough, setBorough] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [venueType, setVenueType] = useState("");
  const [openNow, setOpenNow] = useState("all");
  const [takesReservations, setTakesReservations] = useState("all");
  const [capacityBucket, setCapacityBucket] = useState("");
  const [atmosphere, setAtmosphere] = useState("");
  const [minRating, setMinRating] = useState("");
  const [watchGames, setWatchGames] = useState("all");
  const [sortKey, setSortKey] = useState<CountrySortKey>("matchday");

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query), 180);
    return () => window.clearTimeout(id);
  }, [query]);

  const filtered = useMemo(() => {
    return filterAndSortCountryVenues(
      venues,
      {
        borough: borough as never,
        neighborhood,
        venueType: venueType as never,
        openNow: openNow === "yes",
        takesReservations: takesReservations === "yes",
        capacityBucket: capacityBucket as never,
        atmosphere: atmosphere as never,
        minRating: minRating ? Number(minRating) : undefined,
        goodForWatchingGames: watchGames === "yes",
        query: debouncedQuery
      },
      sortKey
    );
  }, [
    atmosphere,
    borough,
    capacityBucket,
    debouncedQuery,
    minRating,
    neighborhood,
    openNow,
    sortKey,
    takesReservations,
    venueType,
    watchGames,
    venues
  ]);

  return (
    <div className="space-y-6">
      <div className="surface grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-5">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search venues, neighborhoods, cuisines"
          className="xl:col-span-2"
        />
        <Select value={borough} onChange={(event) => setBorough(event.target.value)}>
          <option value="">Borough</option>
          <option value="Manhattan">Manhattan</option>
          <option value="Brooklyn">Brooklyn</option>
          <option value="Queens">Queens</option>
          <option value="Bronx">Bronx</option>
          <option value="Staten Island">Staten Island</option>
        </Select>
        <Select value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)}>
          <option value="">Neighborhood</option>
          {neighborhoods.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select value={sortKey} onChange={(event) => setSortKey(event.target.value as CountrySortKey)}>
          <option value="matchday">Best matchday vibe</option>
          <option value="rating">Highest rated</option>
          <option value="capacity">Largest capacity</option>
          <option value="reservations">Takes reservations</option>
          <option value="neighborhood">Closest to selected neighborhood</option>
        </Select>
        <Select value={venueType} onChange={(event) => setVenueType(event.target.value)}>
          <option value="">Venue type</option>
          <option value="bar">Bar</option>
          <option value="restaurant">Restaurant</option>
          <option value="cafe">Cafe</option>
          <option value="bakery">Bakery</option>
          <option value="lounge">Lounge</option>
          <option value="cultural_center">Cultural center</option>
          <option value="supporter_club">Supporter club</option>
        </Select>
        <Select value={openNow} onChange={(event) => setOpenNow(event.target.value)}>
          <option value="all">Open now</option>
          <option value="yes">Open now</option>
        </Select>
        <Select value={takesReservations} onChange={(event) => setTakesReservations(event.target.value)}>
          <option value="all">Reservations</option>
          <option value="yes">Takes reservations</option>
        </Select>
        <Select value={capacityBucket} onChange={(event) => setCapacityBucket(event.target.value)}>
          <option value="">Capacity</option>
          <option value="under_30">Under 30</option>
          <option value="30_60">30-60</option>
          <option value="60_100">60-100</option>
          <option value="100_200">100-200</option>
          <option value="200_plus">200+</option>
        </Select>
        <Select value={atmosphere} onChange={(event) => setAtmosphere(event.target.value)}>
          <option value="">Atmosphere</option>
          <option value="loud">Loud</option>
          <option value="casual">Casual</option>
          <option value="outdoor">Outdoor</option>
          <option value="supporters-club">Supporters club</option>
          <option value="big-groups">Big groups</option>
          <option value="authentic-food">Authentic food</option>
        </Select>
        <Select value={minRating} onChange={(event) => setMinRating(event.target.value)}>
          <option value="">Rating</option>
          <option value="4">4.0+</option>
          <option value="4.3">4.3+</option>
          <option value="4.5">4.5+</option>
        </Select>
        <Select value={watchGames} onChange={(event) => setWatchGames(event.target.value)}>
          <option value="all">Good for watching games</option>
          <option value="yes">Yes</option>
        </Select>
        <div className="flex items-center justify-end gap-2 xl:col-span-2">
          <Button variant={view === "list" ? "primary" : "secondary"} onClick={() => setView("list")}>
            List
          </Button>
          <Button variant={view === "map" ? "primary" : "secondary"} onClick={() => setView("map")}>
            Map
          </Button>
        </div>
      </div>

      {view === "map" ? (
        <NycMapPanel venues={filtered} title="Country venue map" />
      ) : (
        <div className="grid gap-4">
          {filtered.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
}
