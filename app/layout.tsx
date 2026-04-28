import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "leaflet/dist/leaflet.css";
import "@/app/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { GoogleTranslate } from "@/components/layout/GoogleTranslate";
import { OnboardingGate } from "@/components/layout/OnboardingGate";
import { ServiceWorkerRegistration } from "@/components/layout/ServiceWorkerRegistration";
import { PushNotificationBridge } from "@/components/native/PushNotificationBridge";
import { StatusBarInit } from "@/components/native/StatusBarInit";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  metadataBase: new URL("https://gamedaymap.com"),
  title: "GameDay Map — World Cup 2026 Fan Venue Finder",
  description:
    "Find the best bars and restaurants to watch World Cup 2026 with fans from your country. 17 US host cities, 48 nations, every watch party.",
  keywords: ["world cup 2026", "watch party", "soccer bar", "sports bar", "fan venue"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GameDay Map"
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4b942"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const themeScript = `
    (() => {
      try {
        const stored = localStorage.getItem("gameday-theme");
        const preference = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
        const resolved = preference === "system"
          ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
          : preference;
        document.documentElement.dataset.theme = resolved;
        document.documentElement.classList.toggle("dark", resolved === "dark");
        document.documentElement.style.colorScheme = resolved;
      } catch (error) {
        document.documentElement.dataset.theme = "light";
      }
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="GameDay Map" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#f4b942" />
      </head>
      <body className="min-h-[100dvh] bg-bg text-deep" suppressHydrationWarning>
        <Toaster richColors position="top-center" />
        <OnboardingGate />
        <ServiceWorkerRegistration />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <PushNotificationBridge />
        <StatusBarInit />
        <GoogleTranslate />
        <Analytics />
      </body>
    </html>
  );
}
