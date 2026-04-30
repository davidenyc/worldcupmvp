"use client";

import { useEffect, useMemo, useState } from "react";

import { getHostCity } from "@/lib/data/hostCities";
import { useUserStore } from "@/lib/store/user";

const STORAGE_KEY = "userCity";
const MANUAL_STORAGE_KEY = "userCityManual";

export function useUserCity() {
  const profileHomeCity = useUserStore((state) => state.profile.homeCity);
  const [activeCityState, setActiveCityState] = useState<string | null>(null);
  const [isExplicit, setIsExplicit] = useState(false);
  const [suggestedCity, setSuggestedCity] = useState<string | null>(null);
  const [geolocationAttempted, setGeolocationAttempted] = useState(false);

  useEffect(() => {
    if (profileHomeCity) {
      const resolved = getHostCity(profileHomeCity)?.key ?? profileHomeCity;
      setActiveCityState(resolved);
      setIsExplicit(true);
      setGeolocationAttempted(true);
      return;
    }

    // NOTE: To test IP detection locally, run:
    //   localStorage.removeItem("userCity")
    // in your browser console, then refresh.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const storedWasManual = window.localStorage.getItem(MANUAL_STORAGE_KEY) === "1";

    if (stored && storedWasManual) {
      setActiveCityState(stored);
      setIsExplicit(true);
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
          setActiveCityState(data.cityKey);
          return;
        }

        setActiveCityState("nyc");
      })
      .catch(() => {
        // Silently ignore — user can pick city manually.
        setActiveCityState("nyc");
      })
      .finally(() => {
        setGeolocationAttempted(true);
      });
  }, [profileHomeCity]);

  const activeCity = useMemo(() => {
    if (activeCityState) return getHostCity(activeCityState)?.key ?? activeCityState;
    return "nyc";
  }, [activeCityState]);

  function setUserCity(cityKey: string) {
    window.localStorage.setItem(STORAGE_KEY, cityKey);
    window.localStorage.setItem(MANUAL_STORAGE_KEY, "1");
    useUserStore.getState().setHomeCity(cityKey);
    setActiveCityState(cityKey);
    setIsExplicit(true);
  }

  return {
    activeCity,
    userCity: activeCity,
    hasChosenCity: isExplicit,
    isExplicit,
    suggestedCity,
    geolocationAttempted,
    setUserCity
  };
}
