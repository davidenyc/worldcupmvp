// Client-side first-visit gate in the root layout that redirects brand new users into /welcome.
"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useUser } from "@/lib/store/user";

export function OnboardingGate() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useUser();

  useEffect(() => {
    if (pathname === "/welcome") return;
    if (searchParams.get("skip") === "1") return;
    if (user.favoriteCountrySlug || user.welcomeSeenAt) return;
    router.replace("/welcome");
  }, [pathname, router, searchParams, user.favoriteCountrySlug, user.welcomeSeenAt]);

  return null;
}
