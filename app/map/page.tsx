import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "GameDay Map · World Cup 2026 Fan Experience",
  description:
    "Explore World Cup 2026 supporter spots across the host cities — find bars, restaurants, and supporter clubs for all 48 nations."
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
