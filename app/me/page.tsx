import type { Metadata } from "next";

import { MyWorldCupClient } from "@/components/me/MyWorldCupClient";
import { HOST_CITIES } from "@/lib/data/hostCities";
import { worldCup2026Matches } from "@/lib/data/matches";
import { getAllPromos } from "@/lib/data/promos";
import { getMapPageData } from "@/lib/data/repository";

export const metadata: Metadata = {
  title: "My Cup · GameDay Map",
  description: "Your World Cup 2026 watch parties, saved venues, and team follows in one place.",
  openGraph: {
    images: ["/api/og?type=me"]
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?type=me"]
  }
};

export default async function MyWorldCupPage() {
  const cityResults = await Promise.all(HOST_CITIES.map((city) => getMapPageData(city.key)));
  const venueMap = new Map(
    cityResults.flatMap((result) => result.venues).map((venue) => [venue.slug, venue] as const)
  );
  const rankedVenues = Array.from(venueMap.values()).sort((a, b) => b.rankScore - a.rankScore);

  return (
    <main className="container-shell py-6 sm:py-10">
      <MyWorldCupClient venues={rankedVenues} matches={worldCup2026Matches} promos={getAllPromos()} />
    </main>
  );
}
