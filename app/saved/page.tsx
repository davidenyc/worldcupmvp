import { SavedVenuesClient } from "@/components/venue/SavedVenuesClient";
import { getMapPageData } from "@/lib/data/repository";

export default async function SavedPage() {
  const data = await getMapPageData("nyc");

  return (
    <div className="container-shell py-10">
      <SavedVenuesClient venues={data.venues} />
    </div>
  );
}
