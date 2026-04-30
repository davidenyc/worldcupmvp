// Client redirect gate for the root route that sends signed-in or onboarded users into /app.
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/lib/hooks/useSession";
import { useUser } from "@/lib/store/user";

export function HomeEntryGate() {
  const router = useRouter();
  const { user, loading } = useSession();
  const localUser = useUser();
  const shouldRedirect = Boolean(user || localUser.welcomeSeenAt);

  useEffect(() => {
    if (loading || !shouldRedirect) return;
    router.replace("/app");
  }, [loading, router, shouldRedirect]);
  return null;
}
