// Client redirect gate for the root route that sends signed-in or onboarded users into /app.
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useSession } from "@/lib/hooks/useSession";
import { useUser } from "@/lib/store/user";

export function HomeEntryGate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useSession();
  const localUser = useUser();
  const forceLanding = searchParams.get("home") === "1";
  const shouldRedirect = Boolean(user || localUser.welcomeSeenAt);

  useEffect(() => {
    if (loading || forceLanding || !shouldRedirect) return;
    router.replace("/app");
  }, [forceLanding, loading, router, shouldRedirect]);
  return null;
}
