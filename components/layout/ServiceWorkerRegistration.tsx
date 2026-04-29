"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const isLocalhost =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1";

        if (isLocalhost || process.env.NODE_ENV !== "production") {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));

          if ("caches" in window) {
            const cacheKeys = await caches.keys();
            await Promise.all(cacheKeys.map((key) => caches.delete(key)));
          }
          return;
        }

        const registration = await navigator.serviceWorker.register("/sw.js");
        const userCity = window.localStorage.getItem("userCity") ?? "nyc";

        const sendCityContext = () => {
          registration.active?.postMessage({
            type: "CACHE_CITY_CONTEXT",
            cityKey: userCity
          });
        };

        if (registration.active) {
          sendCityContext();
        } else {
          navigator.serviceWorker.ready.then(sendCityContext).catch(() => undefined);
        }
      } catch (error) {
        console.error("Service worker registration failed", error);
      }
    };

    register();
  }, []);

  return null;
}
