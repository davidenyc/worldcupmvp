// Client redirect gate for the root route that sends signed-in or onboarded users into /app.
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/lib/hooks/useSession";
import { useUser } from "@/lib/store/user";

export function HomeEntryGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useSession();
  const localUser = useUser();
  const shouldRedirect = Boolean(user || localUser.welcomeSeenAt);

  useEffect(() => {
    if (loading || !shouldRedirect) return;
    router.replace("/app");
  }, [loading, router, shouldRedirect]);

  if (loading) {
    return (
      <main className="min-h-[60vh] bg-bg">
        <div className="container-shell py-10">
          <div className="surface p-8 text-sm text-mist">Loading your Cup…</div>
        </div>
      </main>
    );
  }

  if (shouldRedirect) {
    return null;
  }

  return <>{children}</>;
}
