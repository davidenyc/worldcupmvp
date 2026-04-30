import { redirect } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Matches",
  description:
    "Browse the World Cup 2026 match slate and jump into the right city map to find where fans are already gathering.",
  path: "/matches"
});

export default function LegacyMatchesPage() {
  redirect("/nyc/matches");
}
