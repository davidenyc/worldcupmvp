import { redirect } from "next/navigation";

export default function CityLandingPage({
  params
}: {
  params: { city: string };
}) {
  redirect(`/${params.city}/map`);
}
