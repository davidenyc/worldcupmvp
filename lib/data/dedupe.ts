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

function buildIdentitySuffix(venue: Venue) {
  const raw =
    venue.sourceExternalId ??
    `${venue.address}-${venue.lat.toFixed(4)}-${venue.lng.toFixed(4)}`;
  const compact = normalized(raw);
  return compact.slice(-10) || "alt";
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

export function ensureUniqueVenueIdentity<T extends Venue>(venues: T[]): T[] {
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  return venues.map((venue) => {
    if (!seenIds.has(venue.id) && !seenSlugs.has(venue.slug)) {
      seenIds.add(venue.id);
      seenSlugs.add(venue.slug);
      return venue;
    }

    const suffix = buildIdentitySuffix(venue);
    let attempt = 0;
    let nextId = `${venue.id}-${suffix}`;
    let nextSlug = `${venue.slug}-${suffix}`;

    while (seenIds.has(nextId) || seenSlugs.has(nextSlug)) {
      attempt += 1;
      nextId = `${venue.id}-${suffix}-${attempt}`;
      nextSlug = `${venue.slug}-${suffix}-${attempt}`;
    }

    seenIds.add(nextId);
    seenSlugs.add(nextSlug);

    return {
      ...venue,
      id: nextId,
      slug: nextSlug
    };
  });
}

export function dedupeVenueIdentities<T extends Venue>(venues: T[]): T[] {
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  return venues.filter((venue) => {
    if (seenIds.has(venue.id) || seenSlugs.has(venue.slug)) {
      return false;
    }

    seenIds.add(venue.id);
    seenSlugs.add(venue.slug);
    return true;
  });
}
