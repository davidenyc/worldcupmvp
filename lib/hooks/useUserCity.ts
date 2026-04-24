"use client";

import { useEffect, useMemo, useState } from "react";

import { getHostCity } from "@/lib/data/hostCities";

const STORAGE_KEY = "userCity";
const MANUAL_STORAGE_KEY = "userCityManual";

export function useUserCity() {
  const [userCity, setUserCityState] = useState<string | null>(null);
  const [hasChosenCity, setHasChosenCity] = useState(false);
  const [suggestedCity, setSuggestedCity] = useState<string | null>(null);
  const [geolocationAttempted, setGeolocationAttempted] = useState(false);

  useEffect(() => {
    // NOTE: To test IP detection locally, run:
    //   localStorage.removeItem("userCity")
    // in your browser console, then refresh.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const storedWasManual = window.localStorage.getItem(MANUAL_STORAGE_KEY) === "1";

    if (stored && storedWasManual) {
      setUserCityState(stored);
      setHasChosenCity(true);
      setGeolocationAttempted(true);
      return;
    }

    if (stored && !storedWasManual) {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    fetch("/api/detect-city")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.cityKey) {
          setSuggestedCity(data.cityKey);
        }
      })
      .catch(() => {
        // Silently ignore — user can pick city manually.
      })
      .finally(() => {
        setGeolocationAttempted(true);
      });
  }, []);

  const currentCity = useMemo(() => {
    if (userCity) return getHostCity(userCity)?.key ?? userCity;
    return null;
  }, [userCity]);

  function setUserCity(cityKey: string) {
    window.localStorage.setItem(STORAGE_KEY, cityKey);
    window.localStorage.setItem(MANUAL_STORAGE_KEY, "1");
    setUserCityState(cityKey);
    setHasChosenCity(true);
  }

  return {
    userCity: currentCity,
    hasChosenCity,
    suggestedCity,
    geolocationAttempted,
    setUserCity
  };
}
