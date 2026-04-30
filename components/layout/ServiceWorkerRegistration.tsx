"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
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
