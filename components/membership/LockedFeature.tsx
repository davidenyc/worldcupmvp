"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { UpgradeModal } from "@/components/membership/UpgradeModal";
import { TIER_META, type PremiumFeature } from "@/lib/store/membership";
import { usePremiumGate } from "@/lib/hooks/usePremiumGate";

type LockedFeatureProps = {
  feature: PremiumFeature;
  children: ReactNode;
  lockStyle?: "blur" | "overlay" | "replace";
  mode?: "blur" | "replace";
  label?: string;
  compact?: boolean;
};

export function LockedFeature({
  feature,
  children,
  lockStyle = "blur",
  mode,
  compact = false
}: LockedFeatureProps) {
  const { hasAccess, requiredTier, showModal, setShowModal } = usePremiumGate(feature);
  const resolvedLockStyle = mode ?? lockStyle;
  const pathname = usePathname() ?? "/";
  const membershipHref = `/membership?feature=${feature}&return=${encodeURIComponent(pathname)}`;

  if (hasAccess) {
    return <>{children}</>;
  }

  const tierLabel = TIER_META[requiredTier].label;
  const overlayCard = (
    <div className={`rounded-2xl bg-white/90 px-4 py-3 text-center shadow-lg ${compact ? "max-w-[10rem]" : "max-w-[12rem]"}`}>
      <div className="text-xl">🔒</div>
      <div className="mt-1 text-xs font-bold text-deep">{tierLabel} Feature</div>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="mt-2 text-xs font-bold text-gold underline"
      >
        Preview
      </button>
      <Link href={membershipHref} className="mt-2 block text-xs font-bold text-deep underline">
        Upgrade
      </Link>
    </div>
  );

  let content: ReactNode;

  if (resolvedLockStyle === "replace") {
    content = (
      <div className="rounded-2xl border border-gold/40 bg-[var(--accent-soft-bg)] p-5 text-center">
        <div className="text-2xl">🔒</div>
        <div className="mt-2 text-base font-bold text-deep">{tierLabel} required</div>
        <p className="mx-auto mt-2 max-w-xs text-sm text-[color:var(--fg-secondary)]">
          Upgrade to {tierLabel} to unlock this feature and the rest of the premium matchday toolkit.
        </p>
        <Link
          href={membershipHref}
          className="mt-4 inline-flex rounded-full bg-gold px-4 py-2 text-sm font-bold text-deep"
        >
          Upgrade
        </Link>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="mt-3 block w-full text-center text-sm font-semibold text-[color:var(--fg-secondary)] underline"
        >
          Preview instant demo upgrade
        </button>
      </div>
    );
  } else if (resolvedLockStyle === "overlay") {
    content = (
      <div className="relative">
        <div className="pointer-events-none opacity-60">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/76">
          {overlayCard}
        </div>
      </div>
    );
  } else {
    content = (
      <div className="relative select-none">
        <div className="pointer-events-none blur-sm opacity-50">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">{overlayCard}</div>
      </div>
    );
  }

  return (
    <>
      {content}
      {showModal ? (
        <UpgradeModal
          feature={feature}
          requiredTier={requiredTier}
          onClose={() => setShowModal(false)}
          returnPath={pathname}
        />
      ) : null}
    </>
  );
}
