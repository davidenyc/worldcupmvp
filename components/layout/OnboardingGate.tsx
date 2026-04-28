// Client-side first-visit gate in the root layout that redirects brand new users into /welcome.
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useUser } from "@/lib/store/user";

export function OnboardingGate() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUser();

  useEffect(() => {
    if (pathname === "/welcome") return;
    if (typeof window !== "undefined") {
      const skip = new URLSearchParams(window.location.search).get("skip");
      if (skip === "1") return;
    }
    if (user.favoriteCountrySlug || user.welcomeSeenAt) return;
    router.replace("/welcome");
  }, [pathname, router, user.favoriteCountrySlug, user.welcomeSeenAt]);

  return null;
}
