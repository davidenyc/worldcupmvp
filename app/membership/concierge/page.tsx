import { ConciergePageClient } from "@/components/membership/ConciergePageClient";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Venue Concierge",
  description:
    "Send an Elite concierge request for a tailored World Cup venue shortlist based on your city, crew size, vibe, and supporter mix.",
  path: "/membership/concierge"
});

export default function ConciergePage() {
  return <ConciergePageClient />;
}
