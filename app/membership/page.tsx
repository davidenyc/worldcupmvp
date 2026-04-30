import { buildMetadata } from "@/lib/seo/metadata";
import { MembershipPageClient } from "@/components/membership/MembershipPageClient";

export const metadata = buildMetadata({
  title: "Membership",
  description:
    "Compare Free, Fan Pass, and Elite to unlock more World Cup countries, saves, alerts, reservations, and concierge perks.",
  path: "/membership"
});

type MembershipPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MembershipPage({ searchParams }: MembershipPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};

  if (resolvedSearchParams["intentional-fail"] === "1") {
    throw new Error("Intentional membership fail route for error boundary verification.");
  }

  const featureValue = resolvedSearchParams.feature;
  const feature = Array.isArray(featureValue) ? featureValue[0] : featureValue;

  return <MembershipPageClient initialFeature={feature ?? null} />;
}
