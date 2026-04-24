import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#d8e3f5] bg-white py-10 dark:border-white/8 dark:bg-[#0d1117]">
      <div className="container-shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f4b942] text-sm font-black text-[#0a1628]">
                GM
              </div>
              <span className="font-semibold text-[#0a1628] dark:text-white">GameDay Map</span>
            </div>
            <p className="mt-3 text-sm text-[#0a1628]/60 dark:text-white/55">
              World Cup 2026 fan experience across 17 host cities. Find bars, restaurants, and supporter hubs for all 48 nations.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#0a1628]/70 dark:text-white/60">
            <Link href="/" className="hover:text-[#0a1628] dark:hover:text-white">Home</Link>
            <Link href="/map" className="hover:text-[#0a1628] dark:hover:text-white">Explore map</Link>
            <Link href="/matches" className="hover:text-[#0a1628] dark:hover:text-white">Matches</Link>
            <Link href="/submit" className="hover:text-[#0a1628] dark:hover:text-white">Submit a venue</Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#eef4ff] pt-6 text-xs text-[#0a1628]/40 dark:border-white/6 dark:text-white/30">
          <span>© 2026 GameDay Map. Built for discovery, not scraping.</span>
          <span>Curated supporter spots across World Cup 2026 host cities.</span>
        </div>
      </div>
    </footer>
  );
}
