"use client";

import {
  NYCFlagPinMapClient,
  type NYCFlagPinMapProps
} from "@/components/map/NYCFlagPinMap.client";

export function NYCFlagPinMap(props: NYCFlagPinMapProps) {
  return <NYCFlagPinMapClient {...props} />;
}

export type { NYCFlagPinMapProps } from "@/components/map/NYCFlagPinMap.client";
