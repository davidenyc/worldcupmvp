import { RankedVenue } from "@/lib/types";

export function searchVenues(venues: RankedVenue[], query: string): RankedVenue[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...venues].sort((a, b) => b.rankScore - a.rankScore);

  return venues
    .map((venue) => {
      let totalScore = venue.rankScore;
      if (venue.name.toLowerCase() === q) totalScore += 100;
      if (venue.name.toLowerCase().includes(q)) totalScore += 50;
      if ((venue.likelySupporterCountry ?? "").toLowerCase().includes(q)) totalScore += 40;
      if (venue.neighborhood.toLowerCase().includes(q)) totalScore += 30;
      if (venue.venueIntent.toLowerCase().includes(q)) totalScore += 20;
      if (`${venue.description} ${venue.address}`.toLowerCase().includes(q)) totalScore += 10;
      return { venue, totalScore };
    })
    .filter((item) => item.totalScore > item.venue.rankScore)
    .sort((a, b) => b.totalScore - a.totalScore || b.venue.rankScore - a.venue.rankScore)
    .map((item) => item.venue);
}
