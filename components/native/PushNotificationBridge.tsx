"use client";

import { useEffect } from "react";

import { useSession } from "@/lib/hooks/useSession";

export function PushNotificationBridge() {
  const { user } = useSession();

  useEffect(() => {
    if (typeof window === "undefined") return;

    async function syncNativeToken(token: string) {
      if (!user) return;

      await fetch("/api/notifications/push/subscribe", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          provider: "apns",
          endpoint: token,
          p256dh: null,
          authKey: null,
          userAgent: navigator.userAgent
        })
      }).catch(() => undefined);
    }

    async function initPush() {
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications");
        const { Capacitor } = await import("@capacitor/core");

        // TODO(native-ios): replace this generic Capacitor bridge with a deeper APNs handoff flow once the native iOS sprint owns token refresh and notification tap routing.
        if (!Capacitor.isNativePlatform()) return;

        const cachedToken = localStorage.getItem("push_token");
        if (cachedToken) {
          await syncNativeToken(cachedToken);
        }

        const result = await PushNotifications.requestPermissions();
        if (result.receive === "granted") {
          await PushNotifications.register();
        }

        PushNotifications.addListener("registration", (token) => {
          localStorage.setItem("push_token", token.value);
          console.log("Push token:", token.value);
          void syncNativeToken(token.value);
        });

        PushNotifications.addListener("registrationError", (error) => {
          console.error("Push registration error:", error);
        });

        PushNotifications.addListener("pushNotificationReceived", (notification) => {
          console.log("Push received:", notification);
        });

        PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
          // TODO(native-ios): route native push taps through the app router once deep-link restoration is finalized for iOS shells.
          const url = action.notification.data?.url;
          if (typeof url === "string" && url && window.location) {
            window.location.href = url;
          }
        });
      } catch {
        // Native-only feature; ignore on web.
      }
    }

    initPush();
  }, [user]);

  return null;
}
