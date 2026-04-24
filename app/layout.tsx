import type { Metadata } from "next";
import type { ReactNode } from "react";

import "leaflet/dist/leaflet.css";
import "@/app/globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "GameDay Map · World Cup 2026 Fan Experience",
  description:
    "Find restaurants, bars, cafes, and supporter hubs across the 2026 World Cup host cities for every nation."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
