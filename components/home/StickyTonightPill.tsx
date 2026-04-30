"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface StickyTonightPillProps {
  label: string;
  countdownLabel: string;
  href: string;
}

export function StickyTonightPill({ label, countdownLabel, href }: StickyTonightPillProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("action-hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry?.isIntersecting),
      { threshold: 0.15 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`pointer-events-none sticky top-[5.25rem] z-30 hidden px-4 transition duration-300 sm:block ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
    >
      <Link
        href={href}
        className="pointer-events-auto mx-auto flex h-11 max-w-2xl items-center justify-between gap-3 rounded-full border border-line bg-[color:color-mix(in_srgb,var(--bg-surface)_96%,transparent)] px-4 text-sm font-semibold text-deep shadow-sm backdrop-blur-md"
      >
        <span className="truncate">{label}</span>
        <span className="shrink-0 text-[color:var(--fg-secondary)]">{countdownLabel}</span>
        <span className="shrink-0 text-[color:var(--fg-primary)]">Take me there →</span>
      </Link>
    </div>
  );
}
