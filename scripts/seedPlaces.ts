import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { demoCountries } from "../lib/data/demo.js";
import { HOST_CITIES } from "../lib/data/hostCities.js";
import { isFreshPlacesCache, readPlacesCache } from "../lib/cache/places/index.js";
import { searchGooglePlacesVenues } from "../lib/providers/googlePlaces.js";

const COUNTRIES = demoCountries.map((country) => country.slug);

function loadEnvFile(pathname: string) {
  try {
    const content = readFileSync(pathname, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const equalsIndex = trimmed.indexOf("=");
      if (equalsIndex === -1) continue;

      const key = trimmed.slice(0, equalsIndex).trim();
      const rawValue = trimmed.slice(equalsIndex + 1).trim();
      if (!key || process.env[key]) continue;

      const unquoted =
        rawValue.startsWith('"') && rawValue.endsWith('"')
          ? rawValue.slice(1, -1)
          : rawValue.startsWith("'") && rawValue.endsWith("'")
            ? rawValue.slice(1, -1)
            : rawValue;
      process.env[key] = unquoted;
    }
  } catch {
    // No .env file present; leave process.env as-is.
  }
}

loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), ".env.local"));

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  if (!process.env.GOOGLE_PLACES_API_KEY?.trim()) {
    console.warn("GOOGLE_PLACES_API_KEY is missing. Add it to .env before running seed:places.");
    return;
  }

  for (const city of HOST_CITIES) {
    for (const countrySlug of COUNTRIES) {
      if (await isFreshPlacesCache(city.key, countrySlug)) {
        const cached = await readPlacesCache(city.key, countrySlug);
        console.log(`✓ ${city.key} + ${countrySlug} → ${cached?.length ?? 0} venues cached`);
        await sleep(200);
        continue;
      }

      const venues = await searchGooglePlacesVenues({
        city: city.key,
        countrySlug,
        cityLat: city.lat,
        cityLng: city.lng
      });
      console.log(`✓ ${city.key} + ${countrySlug} → ${venues.length} venues cached`);
      await sleep(200);
    }
  }
}

main().catch((error) => {
  console.error("seed:places failed:", error);
  process.exitCode = 1;
});
