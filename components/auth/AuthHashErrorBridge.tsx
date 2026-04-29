// Client bridge that catches Supabase auth hash errors and redirects them to /auth/sign-in with readable copy.
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function AuthHashErrorBridge() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.location.hash.includes("error=")) return;
    if (pathname === "/auth/sign-in") return;

    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const errorDescription = hashParams.get("error_description");
    const error = hashParams.get("error");

    if (!error && !errorDescription) return;

    const message = errorDescription
      ? decodeURIComponent(errorDescription.replace(/\+/g, " "))
      : error ?? "Magic link could not be completed.";

    const next = pathname === "/auth/callback" ? "/me" : pathname || "/me";
    router.replace(`/auth/sign-in?error=${encodeURIComponent(message)}&next=${encodeURIComponent(next)}`);
  }, [pathname, router]);

  return null;
}
