import { readdir, readFile } from "node:fs/promises";
import { basename, extname } from "node:path";

import { placesCacheDir } from "../lib/cache/places/index.js";
import { demoCountries } from "../lib/data/demo.js";
import { HOST_CITIES } from "../lib/data/hostCities.js";
import { Venue } from "../lib/types.js";
import { formatCountryAuditLine } from "../lib/venues/googleClassification.js";

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
    console.log(`${entry} (${venues.length} venues)`);
    if (parsed.countrySlug !== "sportsbars" && !demoCountries.find((item) => item.slug === parsed.countrySlug)) {
      console.log("  ⚠ Unknown country slug\n");
      continue;
    }

    for (const venue of venues) {
      const { line } = formatCountryAuditLine(venue, parsed.countrySlug === "sportsbars" ? "" : parsed.countrySlug);
      console.log(line);
    }

    console.log("");
  }
}

main().catch((error) => {
  console.error("audit:venues failed:", error);
  process.exitCode = 1;
});
