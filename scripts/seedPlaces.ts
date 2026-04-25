import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { demoCountries } from "../lib/data/demo.js";
import { HOST_CITIES } from "../lib/data/hostCities.js";
import { isFreshPlacesCache, readPlacesCache } from "../lib/cache/places/index.js";
import { searchGooglePlacesVenues } from "../lib/providers/googlePlaces.js";

const COUNTRIES = demoCountries.map((country) => country.slug);

const CULTURAL_SEARCH_TERMS: Record<string, string> = {
  "france": "French restaurant bistro brasserie French cafe",
  "england": "British pub English pub gastropub",
  "scotland": "Scottish pub whisky bar",
  "germany": "German restaurant biergarten German pub",
  "mexico": "Mexican restaurant taqueria cantina Mexican bar",
  "brazil": "Brazilian restaurant churrascaria Brazilian bar",
  "argentina": "Argentine restaurant parrilla steakhouse",
  "spain": "Spanish tapas bar Spanish restaurant",
  "portugal": "Portuguese restaurant tasca",
  "japan": "Japanese restaurant ramen sushi izakaya",
  "korea-republic": "Korean restaurant Korean BBQ soju bar",
  "morocco": "Moroccan restaurant tagine North African",
  "colombia": "Colombian restaurant arepa Latin bar",
  "senegal": "Senegalese restaurant West African",
  "ghana": "Ghanaian restaurant West African",
  "egypt": "Egyptian restaurant Middle Eastern",
  "ir-iran": "Persian restaurant Iranian",
  "t-rkiye": "Turkish restaurant kebab",
  "netherlands": "Dutch restaurant Belgian beer bar",
  "belgium": "Belgian bar craft beer mussels",
  "austria": "Austrian restaurant Viennese cafe",
  "czechia": "Czech restaurant beer garden",
  "croatia": "Croatian restaurant Balkan",
  "bosnia-and-herzegovina": "Bosnian restaurant Balkan cevapi",
  "uruguay": "Uruguayan restaurant South American",
  "paraguay": "Paraguayan restaurant South American",
  "ecuador": "Ecuadorian restaurant Latin",
  "canada": "Canadian restaurant poutine",
  "australia": "Australian cafe brunch",
  "new-zealand": "New Zealand cafe",
  "saudi-arabia": "Middle Eastern restaurant Arabic",
  "iraq": "Iraqi restaurant Middle Eastern",
  "jordan": "Jordanian restaurant Levantine",
  "algeria": "North African restaurant Algerian",
  "tunisia": "North African restaurant Tunisian",
  "haiti": "Haitian restaurant Caribbean",
  "cura-ao": "Caribbean restaurant Dutch Caribbean",
  "panama": "Panamanian restaurant Latin American",
  "cabo-verde": "Cape Verdean restaurant Portuguese African",
  "congo-dr": "Congolese restaurant African",
  "c-te-d-ivoire": "Ivorian restaurant West African",
  "south-africa": "South African restaurant",
  "uzbekistan": "Central Asian restaurant Uzbek plov",
  "norway": "Scandinavian restaurant Nordic",
  "sweden": "Swedish restaurant Scandinavian",
  "switzerland": "Swiss restaurant fondue",
  "usa": "American sports bar grill"
};

function getCulturalSearchTerms(countrySlug: string) {
  const preset = CULTURAL_SEARCH_TERMS[countrySlug];
  if (preset) return preset;
  const countryName = demoCountries.find((country) => country.slug === countrySlug)?.name ?? countrySlug;
  return `${countryName} restaurant cultural dining`;
}

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
    if (await isFreshPlacesCache(city.key, "sportsbars")) {
      const cached = await readPlacesCache(city.key, "sportsbars");
      console.log(`✓ ${city.key} + sportsbars → ${cached?.length ?? 0} venues cached`);
      await sleep(200);
    } else {
      const sportsBars = await searchGooglePlacesVenues({
        city: city.key,
        cacheKey: "sportsbars",
        queryOverrides: [`soccer bar World Cup watch party sports bar ${city.label}`],
        searchCountrySlug: null,
        cityLat: city.lat,
        cityLng: city.lng
      });
      console.log(`✓ ${city.key} + sportsbars → ${sportsBars.length} venues cached`);
      await sleep(200);
    }

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
        cacheKey: countrySlug,
        queryOverrides: [`${getCulturalSearchTerms(countrySlug)} ${city.label}`],
        searchCountrySlug: countrySlug,
        verifiedCountryOnly: true,
        cityLat: city.lat,
        cityLng: city.lng
      });
      const taggedCount = venues.filter((venue) => venue.likelySupporterCountry).length;
      console.log(`✓ ${city.key} + ${countrySlug} → ${venues.length} venues cached (${taggedCount} with verified country tags)`);
      await sleep(200);
    }
  }
}

main().catch((error) => {
  console.error("seed:places failed:", error);
  process.exitCode = 1;
});
