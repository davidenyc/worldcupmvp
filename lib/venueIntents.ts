import { VenueIntentKey } from "./types";

export type LegacyVenueIntentKey =
  | VenueIntentKey
  | "watch_party"
  | "cultural_dining"
  | "both";

export const DEFAULT_GAMES_FOCUSED_VENUE_INTENTS: VenueIntentKey[] = [
  "sports_bar",
  "bar_with_tv",
  "cultural_bar",
  "fan_fest"
];

export function normalizeVenueIntent(value: string | null | undefined): VenueIntentKey {
  switch (value) {
    case "sports_bar":
      return "sports_bar";
    case "bar_with_tv":
      return "bar_with_tv";
    case "fan_fest":
    case "watch_party":
      return "fan_fest";
    case "cultural_bar":
    case "both":
      return "cultural_bar";
    case "cultural_restaurant":
    case "cultural_dining":
      return "cultural_restaurant";
    default:
      return "cultural_restaurant";
  }
}

export function isGamesFocusedVenueIntent(intent: VenueIntentKey) {
  return intent === "sports_bar" || intent === "bar_with_tv" || intent === "cultural_bar" || intent === "fan_fest";
}

export function getVenueIntentMeta(intent: VenueIntentKey, countryName?: string | null) {
  switch (intent) {
    case "sports_bar":
      return {
        label: "⚽ Sports Bar",
        className:
          "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300"
      };
    case "bar_with_tv":
      return {
        label: "📺 Bar with TVs",
        className:
          "border border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/20 dark:text-cyan-300"
      };
    case "cultural_restaurant":
      return {
        label: `🍽️ ${countryName ? `${countryName} Cuisine` : "Cultural Restaurant"}`,
        className:
          "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300"
      };
    case "cultural_bar":
      return {
        label: `🍺 ${countryName ? `${countryName} Bar` : "Cultural Bar"}`,
        className:
          "border border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/20 dark:text-purple-300"
      };
    case "fan_fest":
      return {
        label: "🏆 Fan Fest",
        className:
          "border border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-300"
      };
    default:
      return {
        label: "⚽ Sports Bar",
        className:
          "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300"
      };
  }
}
