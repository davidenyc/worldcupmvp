export type CrowdSignal = "open" | "filling_up" | "almost_full" | "wait_list";

export interface CrowdSignalResult {
  level: CrowdSignal;
  copy: string;
  pulse: boolean;
}

function getCapacityMultiplier(capacityBucket?: string) {
  if (capacityBucket === "under_30" || capacityBucket === "30_60") {
    return 0.7;
  }

  if (capacityBucket === "200_plus") {
    return 1.3;
  }

  return 1;
}

export function getCrowdSignal(goingCount: number, capacityBucket?: string): CrowdSignalResult {
  const multiplier = getCapacityMultiplier(capacityBucket);
  const fillingUpThreshold = Math.round(12 * multiplier);
  const almostFullThreshold = Math.round(36 * multiplier);
  const waitListThreshold = Math.round(61 * multiplier);

  if (goingCount < fillingUpThreshold) {
    return { level: "open", copy: "Plenty of room", pulse: false };
  }

  if (goingCount < almostFullThreshold) {
    return { level: "filling_up", copy: "Filling up", pulse: true };
  }

  if (goingCount < waitListThreshold) {
    return { level: "almost_full", copy: "Almost full", pulse: true };
  }

  return { level: "wait_list", copy: "Show up early", pulse: true };
}
