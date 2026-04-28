import { getAllPromos } from "@/lib/data/promos";

function sortPromos<T extends { featured: boolean; sponsorshipTier?: number; startsAt: string }>(promos: T[]) {
  return [...promos].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if ((a.sponsorshipTier ?? 99) !== (b.sponsorshipTier ?? 99)) {
      return (a.sponsorshipTier ?? 99) - (b.sponsorshipTier ?? 99);
    }
    return Date.parse(a.startsAt) - Date.parse(b.startsAt);
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const country = searchParams.get("country");
  const matchId = searchParams.get("matchId");

  const promos = sortPromos(
    getAllPromos().filter((promo) => {
      if (city && promo.cityKey !== city) return false;
      if (country && !promo.countrySlugs.includes(country)) return false;
      if (matchId && !(promo.matchIds ?? []).includes(matchId)) return false;
      return true;
    })
  );

  return Response.json({ promos });
}
