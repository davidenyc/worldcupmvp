import { NextResponse } from "next/server";

import { getHostCity } from "@/lib/data/hostCities";
import { getMapPageData } from "@/lib/data/repository";

export async function GET(
  _request: Request,
  { params }: { params: { city: string } }
) {
  const city = getHostCity(params.city);

  if (!city) {
    return NextResponse.json({ error: "City not found" }, { status: 404 });
  }

  const data = await getMapPageData(city.key);

  return NextResponse.json({
    cityKey: city.key,
    cityLabel: city.label,
    venues: data.venues.slice(0, 8).map((venue) => ({
      slug: venue.slug,
      name: venue.name,
      neighborhood: venue.neighborhood,
      supporterCountry: venue.likelySupporterCountry || null
    }))
  });
}
