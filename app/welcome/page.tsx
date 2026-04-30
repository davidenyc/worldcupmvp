import type { Metadata } from "next";

import { WelcomeFlow } from "@/components/welcome/WelcomeFlow";

export const metadata: Metadata = {
  title: "Personalize your Cup · GameDay Map",
  description: "Choose your city, your nation, and your default watch-party setup for World Cup 2026.",
  openGraph: {
    images: ["/api/og?type=welcome"]
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?type=welcome"]
  }
};

export default function WelcomePage() {
  return (
    <main className="flex justify-center">
      <WelcomeFlow />
    </main>
  );
}
