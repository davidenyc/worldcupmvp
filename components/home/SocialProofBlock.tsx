"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { socialProofTestimonials } from "@/lib/data/socialProof";

interface SocialProofBlockProps {
  statLabel: string;
  href: string;
  initialIndex: number;
}

export function SocialProofBlock({ statLabel, href, initialIndex }: SocialProofBlockProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex % socialProofTestimonials.length);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % socialProofTestimonials.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  const active = socialProofTestimonials[activeIndex]!;

  return (
    <section className="surface px-5 py-5 sm:px-6">
      <h2 className="text-2xl font-bold tracking-tight text-deep">{statLabel}</h2>
      <blockquote className="mt-4 text-lg leading-8 text-[color:var(--fg-primary)]">“{active.quote}”</blockquote>
      <p className="mt-3 text-sm text-[color:var(--fg-secondary)]">— {active.byline}</p>
      <Link
        href={href}
        className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-[color:var(--fg-on-accent)]"
      >
        See spots →
      </Link>
    </section>
  );
}
