import Link from "next/link";

import { Button } from "@/components/ui/button";

const nav = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Map" },
  { href: "/about", label: "About" },
  { href: "/submit", label: "Submit Venue" },
  { href: "/admin", label: "Admin" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-sky/70 bg-field/80 backdrop-blur-xl">
      <div className="container-shell flex h-18 items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-lg font-black text-deep shadow-card">
            GM
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight text-deep">GameDay Map</div>
            <div className="text-xs text-mist">NYC-first World Cup fan discovery</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-navy/75 transition hover:text-deep"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/submit">
          <Button>Suggest a Venue</Button>
        </Link>
      </div>
    </header>
  );
}
