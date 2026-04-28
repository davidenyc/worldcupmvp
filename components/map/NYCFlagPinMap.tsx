"use client";

import { useEffect, useState } from "react";

import type { ComponentType } from "react";
import type { NYCFlagPinMapProps } from "@/components/map/NYCFlagPinMap.client";

export function NYCFlagPinMap(props: NYCFlagPinMapProps) {
  const [LoadedMap, setLoadedMap] = useState<ComponentType<NYCFlagPinMapProps> | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let isActive = true;

    import("@/components/map/NYCFlagPinMap.client")
      .then((module) => {
        if (!isActive) return;
        setLoadedMap(() => module.NYCFlagPinMapClient);
      })
      .catch((error) => {
        console.error("Failed to load city map", error);
        if (!isActive) return;
        setLoadFailed(true);
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (LoadedMap) {
    return <LoadedMap {...props} />;
  }

  if (loadFailed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#eef4ff] px-6 text-center text-sm font-medium text-[#0a1628] dark:bg-[#0d1117] dark:text-white">
        The city map is refreshing. Reload once to retry.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#eef4ff] px-6 text-center text-sm font-medium text-[#0a1628] dark:bg-[#0d1117] dark:text-white">
      Loading city map…
    </div>
  );
}

export type { NYCFlagPinMapProps } from "@/components/map/NYCFlagPinMap.client";
