import type { Metadata } from "next";
import type { ReactNode } from "react";

import "leaflet/dist/leaflet.css";
import "@/app/globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "GameDay Map",
  description: "Find NYC restaurants, bars, cafes, and supporter hubs for every 2026 World Cup country."
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
