"use client";

import { useEffect } from "react";

export function PushNotificationBridge() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    async function initPush() {
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications");
        const { Capacitor } = await import("@capacitor/core");

        if (!Capacitor.isNativePlatform()) return;

        const result = await PushNotifications.requestPermissions();
        if (result.receive === "granted") {
          await PushNotifications.register();
        }

        PushNotifications.addListener("registration", (token) => {
          localStorage.setItem("push_token", token.value);
          console.log("Push token:", token.value);
        });

        PushNotifications.addListener("registrationError", (error) => {
          console.error("Push registration error:", error);
        });

        PushNotifications.addListener("pushNotificationReceived", (notification) => {
          console.log("Push received:", notification);
        });

        PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
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
  }, []);

  return null;
}
