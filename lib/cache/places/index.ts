import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { slugify } from "../../utils";
import type { Venue } from "../../types";

export const placesCacheDir = join(process.cwd(), "lib/cache/places");
export const placesCacheMaxAgeMs = 7 * 24 * 60 * 60 * 1000;

export function getPlacesCachePath(city: string, countrySlug: string) {
  return join(placesCacheDir, `${slugify(city)}-${slugify(countrySlug)}.json`);
}

export async function isFreshPlacesCache(city: string, countrySlug: string, maxAgeMs = placesCacheMaxAgeMs) {
  try {
    const fileStats = await stat(getPlacesCachePath(city, countrySlug));
    return Date.now() - fileStats.mtimeMs <= maxAgeMs;
  } catch {
    return false;
  }
}

export async function readPlacesCache(city: string, countrySlug: string): Promise<Venue[] | null> {
  try {
    const content = await readFile(getPlacesCachePath(city, countrySlug), "utf8");
    const parsed = JSON.parse(content) as unknown;
    return Array.isArray(parsed) ? (parsed as Venue[]) : null;
  } catch {
    return null;
  }
}

export async function readPlacesCacheForCity(city: string): Promise<Venue[]> {
  return readPlacesCacheByPrefix(`${slugify(city)}-`);
}

export async function readAllPlacesCache(): Promise<Venue[]> {
  return readPlacesCacheByPrefix("");
}

async function readPlacesCacheByPrefix(prefix: string): Promise<Venue[]> {
  try {
    await mkdir(placesCacheDir, { recursive: true });
    const entries = await readdir(placesCacheDir);
    const venueGroups = await Promise.all(
      entries
        .filter((entry) => entry.startsWith(prefix) && entry.endsWith(".json"))
        .map(async (entry) => {
          try {
            const content = await readFile(join(placesCacheDir, entry), "utf8");
            const parsed = JSON.parse(content) as unknown;
            return Array.isArray(parsed) ? (parsed as Venue[]) : [];
          } catch {
            return [];
          }
        })
    );
    return venueGroups.flat();
  } catch {
    return [];
  }
}

export async function findPlacesVenueBySlug(slug: string): Promise<Venue | null> {
  try {
    await mkdir(placesCacheDir, { recursive: true });
    const entries = await readdir(placesCacheDir);

    for (const entry of entries) {
      if (!entry.endsWith(".json")) continue;

      try {
        const content = await readFile(join(placesCacheDir, entry), "utf8");
        const parsed = JSON.parse(content) as unknown;
        if (!Array.isArray(parsed)) continue;

        const match = (parsed as Venue[]).find((venue) => venue.slug === slug);
        if (match) return match;
      } catch {
        continue;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export async function writePlacesCache(city: string, countrySlug: string, venues: Venue[]) {
  await mkdir(placesCacheDir, { recursive: true });
  await writeFile(getPlacesCachePath(city, countrySlug), JSON.stringify(venues, null, 2), "utf8");
}
