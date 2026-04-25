"use client";

import { X } from "lucide-react";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { FlagFilterBar } from "@/components/map/FlagFilterBar";
import { WorldCupMatch } from "@/lib/data/matches";
import { MapSortKey } from "@/lib/maps/types";
import { CountrySummary, VenueIntentKey } from "@/lib/types";

const intentButtons: Array<{ key: VenueIntentKey; label: string }> = [
  { key: "sports_bar", label: "⚽ Sports bar" },
  { key: "bar_with_tv", label: "📺 Bars with TVs" },
  { key: "cultural_restaurant", label: "🍽️ Cultural restaurants" },
  { key: "cultural_bar", label: "🍺 Cultural bars" },
  { key: "fan_fest", label: "🏆 Fan Fest" }
];

export function FilterDrawer({
  open,
  onClose,
  countries,
  selectedCountrySlugs,
  selectedVenueIntents,
  soccerBarsMode,
  topCountries,
  cityMatches,
  neighborhoodOptions,
  query,
  sortKey,
  venueType,
  borough,
  neighborhood,
  capacityBucket,
  acceptsReservations,
  familyFriendly,
  outdoorSeating,
  onQueryChange,
  onSortKeyChange,
  onVenueTypeChange,
  onBoroughChange,
  onNeighborhoodChange,
  onCapacityBucketChange,
  onToggleReservations,
  onToggleFamilyFriendly,
  onToggleOutdoorSeating,
  onToggleSoccerBars,
  onToggleVenueIntent,
  onToggleCountry,
  onApplyMatch,
  onClearAll,
  onToggleShowAllMapVenues,
  canToggleShowAllMapVenues,
  showAllMapVenues,
  totalVenueCount
}: {
  open: boolean;
  onClose: () => void;
  countries: CountrySummary[];
  selectedCountrySlugs: string[];
  selectedVenueIntents: VenueIntentKey[];
  soccerBarsMode: boolean;
  topCountries: CountrySummary[];
  cityMatches: WorldCupMatch[];
  neighborhoodOptions: string[];
  query: string;
  sortKey: MapSortKey;
  venueType: string;
  borough: string;
  neighborhood: string;
  capacityBucket: string;
  acceptsReservations: boolean;
  familyFriendly: boolean;
  outdoorSeating: boolean;
  onQueryChange: (value: string) => void;
  onSortKeyChange: (value: MapSortKey) => void;
  onVenueTypeChange: (value: string) => void;
  onBoroughChange: (value: string) => void;
  onNeighborhoodChange: (value: string) => void;
  onCapacityBucketChange: (value: string) => void;
  onToggleReservations: () => void;
  onToggleFamilyFriendly: () => void;
  onToggleOutdoorSeating: () => void;
  onToggleSoccerBars: () => void;
  onToggleVenueIntent: (value: VenueIntentKey) => void;
  onToggleCountry: (slug: string) => void;
  onApplyMatch: (match: WorldCupMatch) => void;
  onClearAll: () => void;
  onToggleShowAllMapVenues: () => void;
  canToggleShowAllMapVenues: boolean;
  showAllMapVenues: boolean;
  totalVenueCount: number;
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-[#0a1628]/18 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed left-0 top-[73px] bottom-0 z-50 hidden w-80 overflow-y-auto border-r border-[#d7e4f8] bg-white/97 shadow-2xl backdrop-blur-md transition-transform duration-300 dark:border-white/8 dark:bg-[#161b22] dark:text-white lg:block ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <DrawerBody
          countries={countries}
          selectedCountrySlugs={selectedCountrySlugs}
          selectedVenueIntents={selectedVenueIntents}
          soccerBarsMode={soccerBarsMode}
          topCountries={topCountries}
          cityMatches={cityMatches}
          neighborhoodOptions={neighborhoodOptions}
          query={query}
          sortKey={sortKey}
          venueType={venueType}
          borough={borough}
          neighborhood={neighborhood}
          capacityBucket={capacityBucket}
          acceptsReservations={acceptsReservations}
          familyFriendly={familyFriendly}
          outdoorSeating={outdoorSeating}
          onQueryChange={onQueryChange}
          onSortKeyChange={onSortKeyChange}
          onVenueTypeChange={onVenueTypeChange}
          onBoroughChange={onBoroughChange}
          onNeighborhoodChange={onNeighborhoodChange}
          onCapacityBucketChange={onCapacityBucketChange}
          onToggleReservations={onToggleReservations}
          onToggleFamilyFriendly={onToggleFamilyFriendly}
          onToggleOutdoorSeating={onToggleOutdoorSeating}
          onToggleSoccerBars={onToggleSoccerBars}
          onToggleVenueIntent={onToggleVenueIntent}
          onToggleCountry={onToggleCountry}
          onApplyMatch={onApplyMatch}
          onClearAll={onClearAll}
          onToggleShowAllMapVenues={onToggleShowAllMapVenues}
          canToggleShowAllMapVenues={canToggleShowAllMapVenues}
          showAllMapVenues={showAllMapVenues}
          totalVenueCount={totalVenueCount}
          onClose={onClose}
        />
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-hidden rounded-t-[1.75rem] border-t border-[#d7e4f8] bg-white/97 shadow-2xl backdrop-blur-md transition-transform duration-300 dark:border-white/8 dark:bg-[#161b22] dark:text-white lg:hidden ${
          open ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
      >
        <DrawerBody
          countries={countries}
          selectedCountrySlugs={selectedCountrySlugs}
          selectedVenueIntents={selectedVenueIntents}
          soccerBarsMode={soccerBarsMode}
          topCountries={topCountries}
          cityMatches={cityMatches}
          neighborhoodOptions={neighborhoodOptions}
          query={query}
          sortKey={sortKey}
          venueType={venueType}
          borough={borough}
          neighborhood={neighborhood}
          capacityBucket={capacityBucket}
          acceptsReservations={acceptsReservations}
          familyFriendly={familyFriendly}
          outdoorSeating={outdoorSeating}
          onQueryChange={onQueryChange}
          onSortKeyChange={onSortKeyChange}
          onVenueTypeChange={onVenueTypeChange}
          onBoroughChange={onBoroughChange}
          onNeighborhoodChange={onNeighborhoodChange}
          onCapacityBucketChange={onCapacityBucketChange}
          onToggleReservations={onToggleReservations}
          onToggleFamilyFriendly={onToggleFamilyFriendly}
          onToggleOutdoorSeating={onToggleOutdoorSeating}
          onToggleSoccerBars={onToggleSoccerBars}
          onToggleVenueIntent={onToggleVenueIntent}
          onToggleCountry={onToggleCountry}
          onApplyMatch={onApplyMatch}
          onClearAll={onClearAll}
          onToggleShowAllMapVenues={onToggleShowAllMapVenues}
          canToggleShowAllMapVenues={canToggleShowAllMapVenues}
          showAllMapVenues={showAllMapVenues}
          totalVenueCount={totalVenueCount}
          onClose={onClose}
          mobile
        />
      </div>
    </>
  );
}

function DrawerBody({
  countries,
  selectedCountrySlugs,
  selectedVenueIntents,
  soccerBarsMode,
  topCountries,
  cityMatches,
  neighborhoodOptions,
  query,
  sortKey,
  venueType,
  borough,
  neighborhood,
  capacityBucket,
  acceptsReservations,
  familyFriendly,
  outdoorSeating,
  onQueryChange,
  onSortKeyChange,
  onVenueTypeChange,
  onBoroughChange,
  onNeighborhoodChange,
  onCapacityBucketChange,
  onToggleReservations,
  onToggleFamilyFriendly,
  onToggleOutdoorSeating,
  onToggleSoccerBars,
  onToggleVenueIntent,
  onToggleCountry,
  onApplyMatch,
  onClearAll,
  onToggleShowAllMapVenues,
  canToggleShowAllMapVenues,
  showAllMapVenues,
  totalVenueCount,
  onClose,
  mobile = false
}: {
  countries: CountrySummary[];
  selectedCountrySlugs: string[];
  selectedVenueIntents: VenueIntentKey[];
  soccerBarsMode: boolean;
  topCountries: CountrySummary[];
  cityMatches: WorldCupMatch[];
  neighborhoodOptions: string[];
  query: string;
  sortKey: MapSortKey;
  venueType: string;
  borough: string;
  neighborhood: string;
  capacityBucket: string;
  acceptsReservations: boolean;
  familyFriendly: boolean;
  outdoorSeating: boolean;
  onQueryChange: (value: string) => void;
  onSortKeyChange: (value: MapSortKey) => void;
  onVenueTypeChange: (value: string) => void;
  onBoroughChange: (value: string) => void;
  onNeighborhoodChange: (value: string) => void;
  onCapacityBucketChange: (value: string) => void;
  onToggleReservations: () => void;
  onToggleFamilyFriendly: () => void;
  onToggleOutdoorSeating: () => void;
  onToggleSoccerBars: () => void;
  onToggleVenueIntent: (value: VenueIntentKey) => void;
  onToggleCountry: (slug: string) => void;
  onApplyMatch: (match: WorldCupMatch) => void;
  onClearAll: () => void;
  onToggleShowAllMapVenues: () => void;
  canToggleShowAllMapVenues: boolean;
  showAllMapVenues: boolean;
  totalVenueCount: number;
  onClose: () => void;
  mobile?: boolean;
}) {
  return (
    <div className={`h-full ${mobile ? "max-h-[92vh] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]" : ""}`}>
      {mobile ? (
        <div className="flex justify-center pt-3">
          <div className="h-1.5 w-14 rounded-full bg-[#0a1628]/12 dark:bg-white/15" />
        </div>
      ) : null}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#eef4ff] bg-white/95 px-4 py-4 backdrop-blur dark:border-white/8 dark:bg-[#161b22]/95">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-[#0a1628]/45 dark:text-white">Filters</div>
          <div className="text-sm font-semibold text-[#0a1628] dark:text-white">Adjust your search</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d8e3f5] bg-[#f8fbff] text-[#0a1628] transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          aria-label="Close filters"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-5 p-4">
        <section className="space-y-3">
          <div className="text-xs uppercase tracking-[0.18em] text-[#0a1628]/45 dark:text-white">🏠 Venue type</div>
          <button
            type="button"
            aria-pressed={soccerBarsMode}
            onClick={onToggleSoccerBars}
            className={`w-full rounded-[1.15rem] border px-4 py-3 text-left transition ${
              soccerBarsMode
                ? "border-[#e63946] bg-[#fff1f2] shadow-sm dark:border-[#ff6b75] dark:bg-[#e63946]/12"
                : "border-[#d8e3f5] bg-white hover:bg-[#f4f8ff] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className={`text-sm font-semibold ${soccerBarsMode ? "text-[#a61d24] dark:text-[#ff9aa3]" : "text-[#0a1628] dark:text-white"}`}>
                  ⚽ Only sports bars
                </div>
                <div className="mt-1 text-xs text-[#0a1628]/55 dark:text-white">
                  Dedicated soccer and sports bars only, without the dining-led spots.
                </div>
              </div>
              <div
                className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[11px] font-semibold ${
                  soccerBarsMode
                    ? "bg-[#e63946] text-white dark:bg-[#ff6b75] dark:text-[#161b22]"
                    : "border border-[#d8e3f5] bg-[#f8fbff] text-[#0a1628]/65 dark:border-white/10 dark:bg-white/8 dark:text-white"
                }`}
              >
                {soccerBarsMode ? "On" : "Off"}
              </div>
            </div>
          </button>
          <div className="flex flex-wrap gap-2">
            {intentButtons.map((intent) => {
              const active = selectedVenueIntents.includes(intent.key);
              return (
                <button
                  key={intent.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onToggleVenueIntent(intent.key)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active ? "bg-[#f4b942] text-[#0a1628] shadow-sm" : "border border-[#d8e3f5] bg-white text-[#0a1628] hover:bg-[#f4f8ff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  }`}
                >
                  {intent.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-xs uppercase tracking-[0.18em] text-[#0a1628]/45 dark:text-white">🌍 Countries</div>
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-[#0a1628]/45 dark:text-white">Popular countries</div>
            <div className="flex flex-wrap gap-2">
              {topCountries.map((country) => {
                const active = selectedCountrySlugs.includes(country.slug);
                return (
                  <button
                    key={country.slug}
                    type="button"
                    onClick={() => onToggleCountry(country.slug)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition ${
                      active ? "bg-[#f4b942] text-[#0a1628]" : "border border-[#e0eaf8] bg-white text-[#0a1628] hover:bg-[#f4f8ff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    }`}
                  >
                    <CountryFlag country={country} size="sm" />
                    <span>{country.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <FlagFilterBar
            countries={countries}
            selectedCountrySlugs={selectedCountrySlugs}
            onToggleCountry={onToggleCountry}
            compact={false}
          />
        </section>

        <section className="space-y-3">
          <div className="text-xs uppercase tracking-[0.18em] text-[#0a1628]/45 dark:text-white">📅 Match</div>
          <div className="grid gap-2">
            {cityMatches.length ? (
              cityMatches.map((match) => {
                const home = countries.find((country) => country.slug === match.homeCountry);
                const away = countries.find((country) => country.slug === match.awayCountry);
                return (
                  <button
                    key={match.id}
                    type="button"
                    onClick={() => {
                      onApplyMatch(match);
                      onClose();
                    }}
                    className="rounded-2xl border border-[#d8e3f5] bg-white px-4 py-3 text-left text-sm transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <div className="font-semibold text-[#0a1628] dark:text-white">
                      <span className="inline-flex items-center gap-1">
                        <CountryFlag country={home} size="sm" />
                        {home?.name ?? match.homeCountry}
                      </span>
                      <span className="mx-2">vs</span>
                      <span className="inline-flex items-center gap-1">
                        <CountryFlag country={away} size="sm" />
                        {away?.name ?? match.awayCountry}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-[#0a1628]/55 dark:text-white">
                      {new Date(match.startsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {match.stadiumName}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d8e3f5] bg-white px-4 py-4 text-sm text-[#0a1628]/55 dark:border-white/10 dark:bg-white/5 dark:text-white">
                No matches loaded for this city yet.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-xs uppercase tracking-[0.18em] text-[#0a1628]/45 dark:text-white">⚙️ More</div>
          <div className="grid gap-3">
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search venues, neighborhoods, cuisine"
              className="h-11 rounded-full border border-[#d8e3f5] bg-white px-4 text-sm text-[#0a1628] outline-none placeholder:text-[#0a1628]/35 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/35"
            />
            <select
              className="rounded-2xl border border-[#d8e3f5] bg-white px-4 py-3 text-sm text-[#0a1628] dark:border-white/10 dark:bg-white/5 dark:text-white"
              value={sortKey}
              onChange={(event) => onSortKeyChange(event.target.value as MapSortKey)}
            >
              <option value="matchday">Best matchday vibe</option>
              <option value="rating">Highest rated</option>
              <option value="capacity">Largest capacity</option>
              <option value="reservations">Takes reservations</option>
              <option value="distance">Closest to map center</option>
            </select>
            <select
              className="rounded-2xl border border-[#d8e3f5] bg-white px-4 py-3 text-sm text-[#0a1628] dark:border-white/10 dark:bg-white/5 dark:text-white"
              value={borough}
              onChange={(event) => onBoroughChange(event.target.value)}
            >
              <option value="">All boroughs</option>
              <option value="Manhattan">Manhattan</option>
              <option value="Brooklyn">Brooklyn</option>
              <option value="Queens">Queens</option>
              <option value="Bronx">Bronx</option>
              <option value="Staten Island">Staten Island</option>
            </select>
            <select
              className="rounded-2xl border border-[#d8e3f5] bg-white px-4 py-3 text-sm text-[#0a1628] dark:border-white/10 dark:bg-white/5 dark:text-white"
              value={venueType}
              onChange={(event) => onVenueTypeChange(event.target.value)}
            >
              <option value="">All venue types</option>
              <option value="bar">Bar</option>
              <option value="restaurant">Restaurant</option>
              <option value="cafe">Cafe</option>
              <option value="bakery">Bakery</option>
              <option value="lounge">Lounge</option>
              <option value="cultural_center">Cultural center</option>
              <option value="supporter_club">Supporter club</option>
            </select>
            <select
              className="rounded-2xl border border-[#d8e3f5] bg-white px-4 py-3 text-sm text-[#0a1628] dark:border-white/10 dark:bg-white/5 dark:text-white"
              value={capacityBucket}
              onChange={(event) => onCapacityBucketChange(event.target.value)}
            >
              <option value="">All capacities</option>
              <option value="under_30">Under 30</option>
              <option value="30_60">30–60</option>
              <option value="60_100">60–100</option>
              <option value="100_200">100–200</option>
              <option value="200_plus">200+</option>
            </select>
            <select
              className="rounded-2xl border border-[#d8e3f5] bg-white px-4 py-3 text-sm text-[#0a1628] dark:border-white/10 dark:bg-white/5 dark:text-white"
              onChange={(event) => onNeighborhoodChange(event.target.value)}
              value={neighborhood}
            >
              <option value="">All neighborhoods</option>
              {neighborhoodOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onToggleReservations}
              className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                acceptsReservations ? "border-[#0a1628] bg-[#0a1628] text-white" : "border-[#d8e3f5] bg-white text-[#0a1628] dark:border-white/10 dark:bg-white/5 dark:text-white"
              }`}
            >
              Reservations available
            </button>
            <button
              type="button"
              onClick={onToggleFamilyFriendly}
              className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                familyFriendly ? "border-[#0a1628] bg-[#0a1628] text-white" : "border-[#d8e3f5] bg-white text-[#0a1628] dark:border-white/10 dark:bg-white/5 dark:text-white"
              }`}
            >
              Family friendly
            </button>
            <button
              type="button"
              onClick={onToggleOutdoorSeating}
              className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                outdoorSeating ? "border-[#0a1628] bg-[#0a1628] text-white" : "border-[#d8e3f5] bg-white text-[#0a1628] dark:border-white/10 dark:bg-white/5 dark:text-white"
              }`}
            >
              Outdoor seating
            </button>
            <button
              type="button"
              onClick={onClearAll}
              className="rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-4 py-2 text-sm font-semibold text-[#0a1628] transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Clear all
            </button>
            {canToggleShowAllMapVenues ? (
              <button
                type="button"
                onClick={onToggleShowAllMapVenues}
                className="rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-4 py-2 text-sm font-semibold text-[#0a1628] transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                {showAllMapVenues ? "Show fewer spots" : `Show all spots · ${totalVenueCount}`}
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
