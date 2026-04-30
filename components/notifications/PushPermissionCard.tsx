"use client";

import { BellRing } from "lucide-react";
import { useEffect, useState } from "react";

import { useSession } from "@/lib/hooks/useSession";
import { useOnboardingActions } from "@/lib/store/user";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function syncSubscription(subscription: PushSubscription) {
  const rawJson = subscription.toJSON();
  const keys = rawJson.keys ?? {};

  await fetch("/api/notifications/push/subscribe", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      provider: "web",
      endpoint: subscription.endpoint,
      p256dh: keys.p256dh ?? null,
      authKey: keys.auth ?? null,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null
    })
  });
}

export function PushPermissionCard() {
  const { user } = useSession();
  const { setNotificationPermission, setPromoOptIns } = useOnboardingActions();
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (typeof window === "undefined") return;

    let cancelled = false;

    const inspectSupport = async () => {
      const canNotify =
        "Notification" in window &&
        "serviceWorker" in navigator &&
        "PushManager" in window;

      if (!canNotify) {
        if (cancelled) return;
        setSupported(false);
        setPermission("unsupported");
        setNotificationPermission("unsupported");
        return;
      }

      if (cancelled) return;
      setSupported(true);
      setPermission(Notification.permission);
      setNotificationPermission(Notification.permission);

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (cancelled) return;

        const hasSubscription = Boolean(subscription);
        setSubscribed(hasSubscription);

        if (subscription) {
          await syncSubscription(subscription);
        }
      } catch {
        if (!cancelled) {
          setError("Push alerts are not ready yet on this browser.");
        }
      }
    };

    void inspectSupport();
    return () => {
      cancelled = true;
    };
  }, [setNotificationPermission, user]);

  if (!user || subscribed) return null;

  async function enableAlerts() {
    if (typeof window === "undefined") return;
    if (!supported || !("Notification" in window) || !("serviceWorker" in navigator)) return;

    setBusy(true);
    setError(null);

    try {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        throw new Error("Missing VAPID public key.");
      }

      const nextPermission = await Notification.requestPermission();
      setPermission(nextPermission);
      setNotificationPermission(nextPermission);

      if (nextPermission !== "granted") {
        throw new Error("Notifications were not granted.");
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });
      }

      await syncSubscription(subscription);
      setSubscribed(true);
      setPromoOptIns({
        push: true
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to turn on alerts.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-soft-bg)] text-[color:var(--accent-soft-fg)]">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm uppercase tracking-[0.18em] text-mist">Match alerts</div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-deep">
              Get a heads-up 30 min before kickoff.
            </h2>
            <div className="mt-2 text-sm leading-6 text-mist">
              Turn on browser alerts so tonight&apos;s match plan reaches you before the room starts filling up.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void enableAlerts()}
          disabled={busy || !supported}
          className="inline-flex min-h-11 items-center rounded-full bg-gold px-5 text-sm font-semibold text-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Turning on..." : "Turn on alerts"}
        </button>
      </div>

      {permission === "denied" ? (
        <div className="mt-4 rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm text-mist">
          Alerts are blocked in this browser right now. Re-enable notifications in browser settings, then try again.
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm text-mist">
          {error}
        </div>
      ) : null}
    </section>
  );
}
