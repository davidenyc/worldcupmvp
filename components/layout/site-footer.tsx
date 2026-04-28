import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="pb-safe mt-auto border-t border-[color:var(--border-subtle)] bg-[var(--bg-surface)] py-8">
      <div className="container-shell">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gold text-sm font-black text-[color:var(--fg-on-accent)]">
                GM
            </div>
            <div>
              <div className="font-semibold text-[color:var(--fg-primary)]">GameDay Map</div>
              <div className="text-sm text-[color:var(--fg-muted)]">World Cup 2026 watch parties</div>
            </div>
          </div>

          <nav className="flex flex-col gap-3 text-sm text-[color:var(--fg-secondary)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-6">
            <Link href="/submit" className="hover:text-[color:var(--fg-primary)]">Add a venue</Link>
            <Link href="/about" className="hover:text-[color:var(--fg-primary)]">About</Link>
            <Link href="/privacy" className="hover:text-[color:var(--fg-primary)]">Privacy</Link>
            <Link href="/contact" className="hover:text-[color:var(--fg-primary)]">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
