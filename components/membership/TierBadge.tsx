"use client";

import type { KeyboardEvent } from "react";

import { MembershipTier, useMembership } from "@/lib/store/membership";

type TierBadgeProps = {
  tier?: MembershipTier;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs",
  lg: "px-4 py-1.5 text-sm"
} as const;

export function TierBadge({ tier, size = "sm", onClick }: TierBadgeProps) {
  const storeTier = useMembership((state) => state.tier);
  const resolvedTier = tier ?? storeTier;
  const commonProps = onClick
    ? {
        onClick,
        role: "button" as const,
        tabIndex: 0,
        onKeyDown: (event: KeyboardEvent<HTMLSpanElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
          }
        }
      }
    : {};

  if (resolvedTier === "fan") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-gold font-bold text-deep ${sizeClasses[size]} ${onClick ? "cursor-pointer" : ""}`}
        {...commonProps}
      >
        ⭐ Fan Pass
      </span>
    );
  }

  if (resolvedTier === "elite") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border-2 border-gold bg-deep font-bold text-gold ${sizeClasses[size]} ${onClick ? "cursor-pointer" : ""}`}
        {...commonProps}
      >
        👑 Elite
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border border-gray-200 bg-gray-50 font-semibold text-gray-500 ${sizeClasses[size]} ${onClick ? "cursor-pointer" : ""}`}
      {...commonProps}
    >
      Free
    </span>
  );
}
