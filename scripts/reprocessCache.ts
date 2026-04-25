import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname } from "node:path";

import { placesCacheDir } from "../lib/cache/places/index.js";
import { HOST_CITIES } from "../lib/data/hostCities.js";
import { Venue } from "../lib/types.js";
import { classifyCachedVenueForCountry } from "../lib/venues/googleClassification.js";

function parseCacheFile(entry: string) {
  const stem = basename(entry, extname(entry));
  const cityKey = HOST_CITIES.map((city) => city.key)
    .sort((a, b) => b.length - a.length)
    .find((key) => stem.startsWith(`${key}-`));

  if (!cityKey) return null;

  return {
    cityKey,
    countrySlug: stem.slice(cityKey.length + 1)
  };
}

async function main() {
  const entries = (await readdir(placesCacheDir))
    .filter((entry) => entry.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  for (const entry of entries) {
    const parsed = parseCacheFile(entry);
    if (!parsed) continue;

    const content = await readFile(`${placesCacheDir}/${entry}`, "utf8");
    const venues = JSON.parse(content) as Venue[];
    let keptCountryTag = 0;
    let strippedToNoFlag = 0;

    const updatedVenues = venues.map((venue) => {
      const searchCountry = parsed.countrySlug === "sportsbars" ? null : parsed.countrySlug;
      const classification = classifyCachedVenueForCountry(venue, searchCountry);
      if (classification.likelySupporterCountry) {
        keptCountryTag += 1;
      } else {
        strippedToNoFlag += 1;
      }

      return {
        ...venue,
        likelySupporterCountry: classification.likelySupporterCountry,
        associatedCountries: classification.associatedCountries,
        venueIntent: classification.venueIntent,
        showsSoccer: classification.showsSoccer,
        updatedAt: new Date().toISOString()
      } satisfies Venue;
    });

    await writeFile(`${placesCacheDir}/${entry}`, JSON.stringify(updatedVenues, null, 2), "utf8");
    console.log(`${entry}: ${updatedVenues.length} venues, ${keptCountryTag} kept country tag, ${strippedToNoFlag} stripped to no-flag`);
  }
}

main().catch((error) => {
  console.error("reprocess:cache failed:", error);
  process.exitCode = 1;
});
