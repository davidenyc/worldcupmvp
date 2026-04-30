import type { RankedVenue } from "@/lib/types";

export type VibeFilterSlug = "loud" | "quiet" | "family" | "outdoor" | "beer" | "watch_party";

export const vibeFilters: Array<{ slug: VibeFilterSlug; label: string; emoji: string }> = [
  { slug: "loud", label: "Loud", emoji: "🔊" },
  { slug: "quiet", label: "Quiet", emoji: "🎙" },
  { slug: "family", label: "Family", emoji: "👨‍👩‍👧" },
  { slug: "outdoor", label: "Outdoor", emoji: "🌳" },
  { slug: "beer", label: "Beer-focused", emoji: "🍻" },
  { slug: "watch_party", label: "Watch party", emoji: "🎉" }
];

export function isVibeFilterSlug(value: string | null): value is VibeFilterSlug {
  return Boolean(value && vibeFilters.some((filter) => filter.slug === value));
}

export function matchesVibeFilter(venue: RankedVenue, vibe: VibeFilterSlug) {
  switch (vibe) {
    case "loud":
      return venue.atmosphereTags.includes("loud") || venue.numberOfScreens > 4;
    case "quiet":
      return (
        venue.atmosphereTags.includes("family") ||
        (venue.atmosphereTags.includes("casual") && !venue.atmosphereTags.includes("loud"))
      );
    case "family":
      return venue.familyFriendly === true;
    case "outdoor":
      return venue.hasOutdoorViewing === true;
    case "beer":
      return venue.cuisineTags.some((tag) => {
        const lower = tag.toLowerCase();
        return lower.includes("beer") || lower.includes("brewery");
      });
    case "watch_party":
      return venue.goodForGroups === true || venue.atmosphereTags.includes("watch-party");
    default:
      return true;
  }
}
