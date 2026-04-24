import { redirect } from "next/navigation";

export default function LegacyCityVenuePage({
  params
}: {
  params: { city: string; slug: string };
}) {
  redirect(`/venue/${params.slug}`);
}
