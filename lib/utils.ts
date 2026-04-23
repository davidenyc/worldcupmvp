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
