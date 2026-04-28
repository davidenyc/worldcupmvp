import { TodayPageClient } from "@/components/tonight/TonightPageClient";
import { HOST_CITIES } from "@/lib/data/hostCities";
import { worldCup2026Matches } from "@/lib/data/matches";
import { getMatchHostCityKey } from "@/lib/data/matchLocations";
import { getPromosByCity } from "@/lib/data/promos";
import { getAllCountries, getMapPageData } from "@/lib/data/repository";

export default async function TonightPage() {
  const now = Date.now();
  const upcoming = worldCup2026Matches
    .filter((match) => Date.parse(match.startsAt) >= now)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

  const [countries, cityVenueEntries] = await Promise.all([
    getAllCountries(),
    Promise.all(
      HOST_CITIES.map(async (city) => {
        const cityData = await getMapPageData(city.key);
        return [
          city.key,
          {
            venues: cityData.venues,
            promos: getPromosByCity(city.key, cityData.venues),
            matches: upcoming.filter((match) => getMatchHostCityKey(match) === city.key)
          }
        ] as const;
      })
    )
  ]);

  const cityDataByKey = Object.fromEntries(cityVenueEntries);

  return (
    <TodayPageClient
      countries={countries}
      cityDataByKey={cityDataByKey}
      allMatches={upcoming}
    />
  );
}
