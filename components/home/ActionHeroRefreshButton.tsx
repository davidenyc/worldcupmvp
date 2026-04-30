"use client";

import { useRouter } from "next/navigation";

interface ActionHeroRefreshButtonProps {
  className?: string;
  children: React.ReactNode;
}

export function ActionHeroRefreshButton({ className, children }: ActionHeroRefreshButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className={className}
    >
      {children}
    </button>
  );
}
