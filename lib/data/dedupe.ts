import { Venue } from "@/lib/types";

const EARTH_METERS = 111_000;
const VENUE_INTENT_PRIORITY: Record<Venue["venueIntent"], number> = {
  sports_bar: 5,
  fan_fest: 4,
  bar_with_tv: 3,
  cultural_bar: 2,
  cultural_restaurant: 1
};

function normalized(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getGeoBucketKey(venue: Venue, radiusMeters: number) {
  const latBucketSize = radiusMeters / EARTH_METERS;
  const lngMeters = EARTH_METERS * Math.cos((venue.lat * Math.PI) / 180);
  const lngBucketSize = radiusMeters / Math.max(lngMeters, 1);
  const latBucket = Math.round(venue.lat / latBucketSize);
  const lngBucket = Math.round(venue.lng / lngBucketSize);
  return { latBucket, lngBucket };
}

function toTimestamp(value?: string) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function uniqueValues<T>(values: T[]) {
  return Array.from(new Set(values));
}

function pickPreferredVenue(a: Venue, b: Venue) {
  const score = (venue: Venue) =>
    (venue.associatedCountries.length > 0 ? 30 : 0) +
    (venue.likelySupporterCountry ? 12 : 0) +
    (venue.showsSoccer ? 10 : 0) +
    venue.numberOfScreens * 2 +
    (venue.acceptsReservations ? 4 : 0) +
    (venue.goodForGroups ? 3 : 0) +
    (VENUE_INTENT_PRIORITY[venue.venueIntent] ?? 0) * 2 +
    (venue.sourceConfidence ?? 0) +
    ((venue.reviewCount ?? 0) / 1000) +
    (venue.rating ?? 0);

  return score(a) >= score(b) ? [a, b] as const : [b, a] as const;
}

function mergeVenues(existing: Venue, incoming: Venue): Venue {
  const [preferred, secondary] = pickPreferredVenue(existing, incoming);
  const associatedCountries = uniqueValues([
    ...preferred.associatedCountries,
    ...secondary.associatedCountries
  ]);
  const likelyCountries = uniqueValues(
    [preferred.likelySupporterCountry, secondary.likelySupporterCountry].filter(
      (value): value is string => Boolean(value)
    )
  );
  const createdAt = [preferred.createdAt, secondary.createdAt]
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => (toTimestamp(a) ?? Infinity) - (toTimestamp(b) ?? Infinity))[0];
  const updatedAt = [preferred.updatedAt, secondary.updatedAt]
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => (toTimestamp(b) ?? -Infinity) - (toTimestamp(a) ?? -Infinity))[0];

  return {
    ...preferred,
    venueTypes: uniqueValues([...preferred.venueTypes, ...secondary.venueTypes]),
    associatedCountries,
    likelySupporterCountry:
      likelyCountries.length === 1 ? likelyCountries[0] : preferred.likelySupporterCountry ?? secondary.likelySupporterCountry ?? null,
    cuisineTags: uniqueValues([...preferred.cuisineTags, ...secondary.cuisineTags]),
    atmosphereTags: uniqueValues([...preferred.atmosphereTags, ...secondary.atmosphereTags]),
    showsSoccer: preferred.showsSoccer || secondary.showsSoccer,
    openNow: preferred.openNow || secondary.openNow,
    priceLevel: Math.max(preferred.priceLevel ?? 0, secondary.priceLevel ?? 0) || undefined,
    rating: Math.max(preferred.rating ?? 0, secondary.rating ?? 0) || undefined,
    reviewCount: Math.max(preferred.reviewCount ?? 0, secondary.reviewCount ?? 0) || undefined,
    numberOfScreens: Math.max(preferred.numberOfScreens, secondary.numberOfScreens),
    hasProjector: preferred.hasProjector || secondary.hasProjector,
    hasOutdoorViewing: preferred.hasOutdoorViewing || secondary.hasOutdoorViewing,
    familyFriendly: preferred.familyFriendly || secondary.familyFriendly,
    standingRoomFriendly: preferred.standingRoomFriendly || secondary.standingRoomFriendly,
    privateEventsAvailable: preferred.privateEventsAvailable || secondary.privateEventsAvailable,
    goodForGroups: preferred.goodForGroups || secondary.goodForGroups,
    acceptsReservations: preferred.acceptsReservations || secondary.acceptsReservations,
    reservationType:
      preferred.acceptsReservations || !secondary.acceptsReservations
        ? preferred.reservationType
        : secondary.reservationType,
    reservationUrl: preferred.reservationUrl ?? secondary.reservationUrl,
    reservationPhone: preferred.reservationPhone ?? secondary.reservationPhone,
    approximateCapacity:
      Math.max(preferred.approximateCapacity ?? 0, secondary.approximateCapacity ?? 0) || undefined,
    sourceExternalId: preferred.sourceExternalId ?? secondary.sourceExternalId,
    sourceConfidence: Math.max(preferred.sourceConfidence, secondary.sourceConfidence),
    sourceNote: preferred.sourceNote ?? secondary.sourceNote ?? null,
    isRealVenue: preferred.isRealVenue || secondary.isRealVenue,
    isFeatured: preferred.isFeatured || secondary.isFeatured,
    isOfficialFanHub: preferred.isOfficialFanHub || secondary.isOfficialFanHub,
    gameDayScore: Math.max(preferred.gameDayScore, secondary.gameDayScore),
    fanLikelihoodScore: Math.max(preferred.fanLikelihoodScore, secondary.fanLikelihoodScore),
    editorialBoost: Math.max(preferred.editorialBoost, secondary.editorialBoost),
    editorialNotes: preferred.editorialNotes ?? secondary.editorialNotes,
    matchdayNotes: preferred.matchdayNotes ?? secondary.matchdayNotes,
    supporterNotes: preferred.supporterNotes ?? secondary.supporterNotes,
    imageUrls: uniqueValues([...preferred.imageUrls, ...secondary.imageUrls]),
    createdAt: createdAt ?? preferred.createdAt,
    updatedAt: updatedAt ?? preferred.updatedAt
  };
}

function geoDistanceMeters(a: Venue, b: Venue) {
  const lat = (a.lat - b.lat) * EARTH_METERS;
  const lng = (a.lng - b.lng) * EARTH_METERS * Math.cos(((a.lat + b.lat) / 2) * (Math.PI / 180));
  return Math.sqrt(lat * lat + lng * lng);
}

export function dedupeVenues(venues: Venue[], radiusMeters = 120): Venue[] {
  const accepted: Venue[] = [];
  const sourceIdIndex = new Map<string, number>();
  const nameAddressIndex = new Map<string, number>();
  const nameGeoBuckets = new Map<string, number[]>();

  for (const venue of venues) {
    let dupeIndex = -1;

    if (venue.sourceExternalId) {
      dupeIndex = sourceIdIndex.get(venue.sourceExternalId) ?? -1;
    }

    if (dupeIndex === -1) {
      const nameKey = normalized(venue.name);
      const nameAddressKey = `${nameKey}:${normalized(venue.address)}`;
      dupeIndex = nameAddressIndex.get(nameAddressKey) ?? -1;

      if (dupeIndex === -1) {
        const { latBucket, lngBucket } = getGeoBucketKey(venue, radiusMeters);

        for (let latOffset = -1; latOffset <= 1 && dupeIndex === -1; latOffset += 1) {
          for (let lngOffset = -1; lngOffset <= 1; lngOffset += 1) {
            const bucketKey = `${nameKey}:${latBucket + latOffset}:${lngBucket + lngOffset}`;
            const candidateIndexes = nameGeoBuckets.get(bucketKey) ?? [];
            const match = candidateIndexes.find((candidateIndex) => {
              const existing = accepted[candidateIndex];
              return geoDistanceMeters(existing, venue) <= radiusMeters;
            });

            if (typeof match === "number") {
              dupeIndex = match;
              break;
            }
          }
        }
      }
    }

    if (dupeIndex === -1) {
      const acceptedIndex = accepted.push(venue) - 1;
      const nameKey = normalized(venue.name);
      const nameAddressKey = `${nameKey}:${normalized(venue.address)}`;
      const { latBucket, lngBucket } = getGeoBucketKey(venue, radiusMeters);

      if (venue.sourceExternalId) {
        sourceIdIndex.set(venue.sourceExternalId, acceptedIndex);
      }

      nameAddressIndex.set(nameAddressKey, acceptedIndex);

      const bucketKey = `${nameKey}:${latBucket}:${lngBucket}`;
      nameGeoBuckets.set(bucketKey, [...(nameGeoBuckets.get(bucketKey) ?? []), acceptedIndex]);
      continue;
    }

    const merged = mergeVenues(accepted[dupeIndex], venue);
    accepted[dupeIndex] = merged;

    if (merged.sourceExternalId) {
      sourceIdIndex.set(merged.sourceExternalId, dupeIndex);
    }

    const mergedNameKey = normalized(merged.name);
    nameAddressIndex.set(`${mergedNameKey}:${normalized(merged.address)}`, dupeIndex);
  }

  return accepted;
}
