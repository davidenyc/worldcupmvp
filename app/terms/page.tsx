export default function TermsPage() {
  return (
    <main className="min-h-[100dvh] bg-bg px-4 py-10 sm:px-6 lg:px-8">
      <div className="container-shell max-w-3xl rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-line">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-45)]">
          Terms of Service
        </div>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-deep">GameDay Map Terms</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-[color:var(--fg-secondary)]">
          <p>
            GameDay Map is currently a demo product for discovering World Cup 2026 watch venues. Venue details, reservations, and premium features may change as we move toward launch.
          </p>
          <p>
            Use venue information as guidance, but always confirm hours, reservations, and event details directly with the venue before match day.
          </p>
          <p>
            Final legal terms, billing language, and account agreements will be added before production launch.
          </p>
        </div>
      </div>
    </main>
  );
}
