import type { RankedVenue } from "@/lib/types";

import { getSeededGoingCount } from "@/lib/social/seededGoingCount";

export function getStrongestCrowdNeighborhood(
  matchId: string,
  cityKey: string,
  countrySlug: string,
  allVenues: RankedVenue[]
) {
  const grouped = new Map<string, { totalGoing: number; venueCount: number }>();

  for (const venue of allVenues) {
    const matchesCountry =
      venue.city === cityKey &&
      (venue.likelySupporterCountry === countrySlug || venue.associatedCountries.includes(countrySlug));

    if (!matchesCountry || !venue.neighborhood) {
      continue;
    }

    const current = grouped.get(venue.neighborhood) ?? { totalGoing: 0, venueCount: 0 };
    current.totalGoing += getSeededGoingCount(matchId, venue.slug, venue);
    current.venueCount += 1;
    grouped.set(venue.neighborhood, current);
  }

  let strongest: { neighborhood: string; venueCount: number; totalGoing: number } | null = null;

  for (const [neighborhood, data] of grouped.entries()) {
    if (data.venueCount < 3) {
      continue;
    }

    if (!strongest || data.totalGoing > strongest.totalGoing) {
      strongest = {
        neighborhood,
        venueCount: data.venueCount,
        totalGoing: data.totalGoing
      };
    }
  }

  if (!strongest) {
    return null;
  }

  return {
    neighborhood: strongest.neighborhood,
    venueCount: strongest.venueCount
  };
}
