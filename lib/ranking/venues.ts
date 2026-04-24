import { CountrySortKey, RankedVenue, Venue } from "@/lib/types";

export interface RankingContext {
  countrySlug: string;
  neighborhood?: string;
  userLat?: number;
  userLng?: number;
}

function distanceBoost(venue: Venue, context: RankingContext) {
  if (typeof context.userLat !== "number" || typeof context.userLng !== "number") {
    return 0.4;
  }

  const latDiff = venue.lat - context.userLat;
  const lngDiff = venue.lng - context.userLng;
  const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  return Math.max(0, 1 - distance * 10);
}

function ratingConfidence(venue: Venue) {
  if (!venue.rating || !venue.reviewCount) return 0.25;
  return Math.min(1, venue.reviewCount / 350) * (venue.rating / 5);
}

function verificationBoost(venue: Venue) {
  if (venue.verificationStatus === "verified") return 1;
  if (venue.verificationStatus === "imported") return 0.65;
  return 0.35;
}

function capacitySignal(venue: Venue) {
  return Math.min(1, (venue.approximateCapacity ?? 40) / 180);
}

function intentSignal(venue: Venue) {
  if (venue.venueIntent === "watch_party") return 1.3;
  if (venue.venueIntent === "sports_bar") return 1.1;
  if (venue.venueIntent === "both") return 1.0;
  return 0.25;
}

export function rankVenues(venues: Venue[], context: RankingContext): RankedVenue[] {
  const countrySlug = context.countrySlug || "";
  const countryLabel = countrySlug.replace(/-/g, " ");

  return venues
    .map((venue) => {
      const reasons: string[] = [];
      const associatedCountries = venue.associatedCountries || [];
      const cuisineTags = venue.cuisineTags || [];
      const countryStrength = associatedCountries.includes(countrySlug) ? 1.85 : 0.35;
      const cuisineStrength = cuisineTags.some((tag) =>
        tag.toLowerCase().includes(countryLabel)
      )
        ? 0.9
        : 0.35;
      const supporterStrength = venue.likelySupporterCountry === countrySlug ? 1 : 0.25;
      const soccerStrength =
        intentSignal(venue) +
        (venue.numberOfScreens >= 6 ? 0.45 : 0) +
        (venue.hasProjector ? 0.35 : 0) +
        (venue.showsSoccer ? 0.1 : 0);
      const reservationStrength = venue.acceptsReservations ? 0.8 : 0.1;
      const largeGroupStrength = capacitySignal(venue);
      const ratingSignal = ratingConfidence(venue);
      const verificationSignal = verificationBoost(venue);
      const editorialSignal = venue.editorialBoost;
      const distanceSignal = distanceBoost(venue, context);
      if (countryStrength > 1.5 && countryLabel) reasons.push(`Strong ${countryLabel} match`);
      if (largeGroupStrength > 0.6) reasons.push("Good for large watch parties");
      if (venue.acceptsReservations) reasons.push("Takes reservations");
      if (venue.venueIntent === "cultural_dining") reasons.push("Authentic dining");
      if (venue.venueIntent === "watch_party" || venue.venueIntent === "sports_bar") {
        reasons.push("Showing games");
      }
      if (verificationSignal >= 1) reasons.push("Editor-verified soccer venue");
      if (reasons.length < 3 && venue.gameDayScore >= 8.8) reasons.push("Strong game-day atmosphere");

      const rankScore =
        countryStrength * 2.4 +
        cuisineStrength * 1.1 +
        supporterStrength * 1.3 +
        soccerStrength * 1.6 +
        reservationStrength * 0.9 +
        largeGroupStrength * 1.05 +
        ratingSignal * 1.1 +
        verificationSignal * 1 +
        editorialSignal * 1.2 +
        distanceSignal * 0.7 +
        venue.fanLikelihoodScore / 10 +
        venue.gameDayScore / 10;

      return {
        ...venue,
        rankScore: rankScore * (venue.isRealVenue === true ? 3 : 0.1),
        rankingReasons: reasons.slice(0, 4)
      };
    })
    .sort((a, b) => b.rankScore - a.rankScore);
}

export function sortRankedVenues(
  venues: RankedVenue[],
  sortKey: CountrySortKey,
  neighborhood?: string
) {
  const list = [...venues];

  if (sortKey === "rating") {
    return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }

  if (sortKey === "capacity") {
    return list.sort((a, b) => (b.approximateCapacity ?? 0) - (a.approximateCapacity ?? 0));
  }

  if (sortKey === "reservations") {
    return list.sort((a, b) => Number(b.acceptsReservations) - Number(a.acceptsReservations));
  }

  if (sortKey === "neighborhood" && neighborhood) {
    return list.sort((a, b) => {
      const aScore = Number(a.neighborhood === neighborhood);
      const bScore = Number(b.neighborhood === neighborhood);
      return bScore - aScore || b.rankScore - a.rankScore;
    });
  }

  return list.sort((a, b) => b.rankScore - a.rankScore);
}
