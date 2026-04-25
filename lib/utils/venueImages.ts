import { RankedVenue, Venue } from "@/lib/types";

const SPORTS_BAR_IMAGES = [
  "https://images.unsplash.com/photo-1543007630-9710e4a00a20",
  "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b",
  "https://images.unsplash.com/photo-1470337458703-46ad1756a187",
  "https://images.unsplash.com/photo-1544145945-f90425340c7e",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9"
];

const RESTAURANT_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17",
  "https://images.unsplash.com/photo-1560053608-13721e0d69e8"
];

const CAFE_IMAGES = [
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
  "https://images.unsplash.com/photo-1445116572660-236099ec97a0",
  "https://images.unsplash.com/photo-1453614512568-c4024d13c247",
  "https://images.unsplash.com/photo-1521017432531-fbd92d768814",
  "https://images.unsplash.com/photo-1521017432531-fbd92d768814"
];

const LOUNGE_IMAGES = [
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205",
  "https://images.unsplash.com/photo-1579027989536-b7b1f875659b",
  "https://images.unsplash.com/photo-1517502474097-f9b30659dadb",
  "https://images.unsplash.com/photo-1551218808-94e220e084d2",
  "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7"
];

const GENERIC_VENUE_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9",
  "https://images.unsplash.com/photo-1579027989536-b7b1f875659b",
  "https://images.unsplash.com/photo-1560053608-13721e0d69e8",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de",
  "https://images.unsplash.com/photo-1544145945-f90425340c7e",
  "https://images.unsplash.com/photo-1470337458703-46ad1756a187",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
  "https://images.unsplash.com/photo-1525610553991-2bede1a236e2",
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17"
];

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function getVenueImageSet(venue: Pick<Venue, "slug" | "imageUrls"> | Pick<RankedVenue, "slug" | "imageUrls">) {
  if (venue.imageUrls.length) {
    return venue.imageUrls;
  }

  const imagePool = selectVenueImagePool(venue);
  const start = hashString(venue.slug) % imagePool.length;
  const images: string[] = [];

  for (let offset = 0; offset < 3; offset += 1) {
    images.push(imagePool[(start + offset) % imagePool.length]);
  }

  return images;
}

function selectVenueImagePool(
  venue:
    | Pick<Venue, "slug" | "imageUrls"> & Partial<Pick<Venue, "venueTypes" | "venueIntent">>
    | Pick<RankedVenue, "slug" | "imageUrls"> & Partial<Pick<RankedVenue, "venueTypes" | "venueIntent">>
) {
  if (
    venue.venueIntent === "sports_bar" ||
    venue.venueIntent === "bar_with_tv" ||
    venue.venueIntent === "fan_fest"
  ) {
    return SPORTS_BAR_IMAGES;
  }

  if (venue.venueIntent === "cultural_restaurant") {
    return RESTAURANT_IMAGES;
  }

  if (venue.venueTypes?.includes("cafe") || venue.venueTypes?.includes("bakery")) {
    return CAFE_IMAGES;
  }

  if (venue.venueTypes?.includes("lounge") || venue.venueTypes?.includes("supporter_club")) {
    return LOUNGE_IMAGES;
  }

  if (venue.venueTypes?.includes("restaurant")) {
    return RESTAURANT_IMAGES;
  }

  if (venue.venueTypes?.includes("bar")) {
    return SPORTS_BAR_IMAGES;
  }

  return GENERIC_VENUE_IMAGES;
}
