import { MembershipPageClient } from "@/components/membership/MembershipPageClient";

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
