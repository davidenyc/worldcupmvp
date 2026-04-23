import { MapPageClient } from "@/components/map/MapPageClient";
import { getMapPageData } from "@/lib/data/repository";

export default async function MapPage() {
  const data = await getMapPageData();
  return <MapPageClient data={data} />;
}
