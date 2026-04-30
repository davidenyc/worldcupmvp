"use client";

import { useRouter } from "next/navigation";

export function MarketingHeroActions() {
  const router = useRouter();

  return (
    <div className="mt-6 flex max-w-md flex-col gap-3 sm:mt-8">
      <button
        type="button"
        onClick={() => router.push("/welcome")}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-[color:var(--fg-on-accent)] transition hover:brightness-95"
      >
        Personalize my Cup →
      </button>
      <button
        type="button"
        onClick={() => router.push("/today?city=nyc")}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/20 px-5 text-sm font-semibold text-[color:var(--fg-on-strong)] transition hover:bg-white/10"
      >
        See tonight&apos;s matches →
      </button>
    </div>
  );
}
