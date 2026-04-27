import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "GameDay Map — World Cup 2026 Fan Venue Finder",
  description:
    "Find the best bars and restaurants to watch World Cup 2026 with fans from your country. 17 US host cities, 48 nations, every watch party."
};

export default function LegacyMapPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  redirect(`/nyc/map${query ? `?${query}` : ""}`);
}
