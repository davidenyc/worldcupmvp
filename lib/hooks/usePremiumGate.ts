"use client";

import { useCallback, useState } from "react";

import { FEATURE_GATES, PremiumFeature, useMembership } from "@/lib/store/membership";

export function usePremiumGate(feature: PremiumFeature) {
  const { hasFeature, tier } = useMembership();
  const [showModal, setShowModal] = useState(false);
  const hasAccess = hasFeature(feature);
  const requiredTier = FEATURE_GATES[feature].includes("fan") ? "fan" : "elite";

  const requirePremium = useCallback(
    (callback: () => void) => {
      if (hasAccess) {
        callback();
      } else {
        setShowModal(true);
      }
    },
    [hasAccess]
  );

  return {
    hasAccess,
    tier,
    showModal,
    setShowModal,
    requirePremium,
    requiredTier: requiredTier as "fan" | "elite"
  };
}
