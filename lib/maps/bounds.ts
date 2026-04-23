import { RankedVenue } from "@/lib/types";

export function boundsForVenues(venues: RankedVenue[]): [[number, number], [number, number]] | null {
  if (!venues.length) return null;

  const lats = venues.map((venue) => venue.lat);
  const lngs = venues.map((venue) => venue.lng);

  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)]
  ];
}
