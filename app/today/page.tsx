import { buildMetadata } from "@/lib/seo/metadata";
import { TodayPageClient } from "@/components/today/TodayPageClient";
import { HOST_CITIES, getHostCity } from "@/lib/data/hostCities";
import { type TodayPageMode } from "@/lib/data/today";
import { getAdminQueue, getAllCountries, getTodayPageData } from "@/lib/data/repository";

type TodayPageSearchParams = {
  mode?: string | string[];
  match?: string | string[];
  city?: string | string[];
};

function getFirstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeMode(value?: string): TodayPageMode {
  if (value === "bar" || value === "restaurant") return value;
  return "all";
}

export const metadata = buildMetadata({
  title: "Today’s matches",
  description:
    "See today’s World Cup match slate, compare venues by city, and move from kickoff timing to the right room in one step.",
  path: "/today"
});

export default async function TodayPage({
  searchParams
}: {
  searchParams?: TodayPageSearchParams;
}) {
  const requestedMode = normalizeMode(getFirstParam(searchParams?.mode));
  const requestedMatchId = getFirstParam(searchParams?.match) ?? null;
  const requestedCityKey = getHostCity(getFirstParam(searchParams?.city))?.key ?? "nyc";

  const [countries, todayData, adminQueue] = await Promise.all([
    getAllCountries(),
    getTodayPageData(requestedCityKey, requestedMode, requestedMatchId ?? undefined, "America/New_York"),
    getAdminQueue()
  ]);

  const totalVenues = adminQueue.venues.length;

  return (
    <TodayPageClient
      countries={countries}
      city={getHostCity(requestedCityKey) ?? HOST_CITIES[0]}
      allMatches={todayData.matches}
      allVenues={todayData.allVenues}
      initialMode={requestedMode}
      initialMatchId={requestedMatchId}
      trustStats={{
        venueCount: totalVenues,
        nationCount: countries.length,
        hostCityCount: HOST_CITIES.length
      }}
    />
  );
}
