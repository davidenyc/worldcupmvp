export default function TermsPage() {
  return (
    <main className="min-h-[100dvh] bg-[#f7fafc] px-4 py-10 sm:px-6 lg:px-8">
      <div className="container-shell max-w-3xl rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-[#d8e3f5]">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0a1628]/45">
          Terms of Service
        </div>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#0a1628]">GameDay Map Terms</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-[#0a1628]/72">
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
