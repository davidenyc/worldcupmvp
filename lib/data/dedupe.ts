import { Venue } from "@/lib/types";

const EARTH_METERS = 111_000;

function normalized(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function geoDistanceMeters(a: Venue, b: Venue) {
  const lat = (a.lat - b.lat) * EARTH_METERS;
  const lng = (a.lng - b.lng) * EARTH_METERS * Math.cos(((a.lat + b.lat) / 2) * (Math.PI / 180));
  return Math.sqrt(lat * lat + lng * lng);
}

export function dedupeVenues(venues: Venue[], radiusMeters = 120): Venue[] {
  const accepted: Venue[] = [];

  for (const venue of venues) {
    const dupe = accepted.find((existing) => {
      const sameName = normalized(existing.name) === normalized(venue.name);
      const sameAddress = normalized(existing.address) === normalized(venue.address);
      const withinRadius = geoDistanceMeters(existing, venue) <= radiusMeters;
      return (sameName && sameAddress) || (sameName && withinRadius);
    });

    if (!dupe) {
      accepted.push(venue);
    }
  }

  return accepted;
}
