import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatScore(value: number) {
  return Math.round(value * 10) / 10;
}

export function formatPriceLevel(level?: number | null) {
  if (!level) return "N/A";
  return "$".repeat(level);
}

export function formatBorough(value: string) {
  return value.replace(/_/g, " ");
}

export function toTitleCase(value: string): string {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatCapacityBucket(bucket: string): string {
  switch (bucket) {
    case "under_30":
      return "Under 30";
    case "30_60":
      return "30–60";
    case "60_100":
      return "60–100";
    case "100_200":
      return "100–200";
    case "200_plus":
      return "200+";
    default:
      return toTitleCase(bucket.replace(/_/g, " "));
  }
}

export function getSoccerAtmosphereRating(params: {
  gameDayScore: number;
  fanLikelihoodScore: number;
  numberOfScreens: number;
  showsSoccer: boolean;
}): "High" | "Medium" | "Low" {
  const combinedScore =
    params.gameDayScore * 0.55 +
    params.fanLikelihoodScore * 0.25 +
    Math.min(params.numberOfScreens, 12) * 0.2;

  if (params.showsSoccer && combinedScore >= 6.8) {
    return "High";
  }

  if (params.showsSoccer || combinedScore >= 4.8) {
    return "Medium";
  }

  return "Low";
}
