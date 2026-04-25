import { sortRankedVenues } from "@/lib/ranking/venues";
import { CountryFilters, CountrySortKey, RankedVenue } from "@/lib/types";

export function filterAndSortCountryVenues(
  venues: RankedVenue[],
  filters: CountryFilters,
  sortKey: CountrySortKey
) {
  const filtered = venues.filter((venue) => {
    if (filters.borough && venue.borough !== filters.borough) return false;
    if (filters.neighborhood && venue.neighborhood !== filters.neighborhood) return false;
    if (filters.venueType && !venue.venueTypes.includes(filters.venueType)) return false;
    if (filters.openNow && !venue.openNow) return false;
    if (filters.takesReservations && !venue.acceptsReservations) return false;
    if (filters.capacityBucket && venue.capacityBucket !== filters.capacityBucket) return false;
    if (filters.atmosphere && !venue.atmosphereTags.includes(filters.atmosphere)) return false;
    if (filters.minRating && (venue.rating ?? 0) < filters.minRating) return false;
    if (filters.goodForWatchingGames && venue.venueIntent === "cultural_restaurant") return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const haystack = [
        venue.name,
        venue.neighborhood,
        venue.borough,
        ...venue.cuisineTags,
        ...venue.associatedCountries
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return sortRankedVenues(filtered, sortKey, filters.neighborhood);
}
