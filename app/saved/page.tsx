import { buildMetadata } from "@/lib/seo/metadata";
import { SavedVenuesClient } from "@/components/venue/SavedVenuesClient";
import { HOST_CITIES } from "@/lib/data/hostCities";
import { getMapPageData } from "@/lib/data/repository";

export const metadata = buildMetadata({
  title: "Saved venues",
  description:
    "Keep your World Cup watchlist of bars and restaurants in one place so it’s easy to come back to the right room on match day.",
  path: "/saved"
});

export default async function SavedPage() {
  const cityResults = await Promise.all(HOST_CITIES.map((city) => getMapPageData(city.key)));
  const rankedVenueMap = new Map(
    cityResults.flatMap((result) => result.venues).map((venue) => [venue.slug, venue] as const)
  );
  const rankedVenues = Array.from(rankedVenueMap.values()).sort((a, b) => b.rankScore - a.rankScore);

  return (
    <div className="container-shell py-6 sm:py-10">
      <SavedVenuesClient venues={rankedVenues} />
    </div>
  );
}
