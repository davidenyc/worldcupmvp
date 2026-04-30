import type { Metadata } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://gamedaymap.com").replace(/\/+$/, "");

type BuildMetadataArgs = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  robots?: Metadata["robots"];
};

export function getSiteUrl() {
  return SITE_URL;
}

export function buildMetadata({
  title,
  description,
  path,
  image = "/api/og?type=home",
  robots
}: BuildMetadataArgs): Metadata {
  const fullTitle = `${title} · GameDay Map`;
  const url = path ? `${SITE_URL}${path}` : SITE_URL;

  return {
    title: fullTitle,
    description,
    ...(path
      ? {
          alternates: {
            canonical: path
          }
        }
      : {}),
    ...(robots ? { robots } : {}),
    openGraph: {
      title: fullTitle,
      description,
      type: "website",
      url,
      siteName: "GameDay Map",
      images: [image]
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image]
    }
  };
}
