"use client";

import { useRouter } from "next/navigation";

import { trackActionHeroCtaClick } from "@/lib/analytics/track";

export function ActionHeroCta({
  href,
  matchId,
  isUserMatch,
  className,
  children,
  ...buttonProps
}: {
  href: string;
  matchId: string;
  isUserMatch: boolean;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        trackActionHeroCtaClick({ matchId, isUserMatch });
        router.push(href);
      }}
      className={className}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
