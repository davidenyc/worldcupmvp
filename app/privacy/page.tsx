export default function PrivacyPage() {
  return (
    <main className="min-h-[100dvh] bg-[#f7fafc] px-4 py-10 sm:px-6 lg:px-8">
      <div className="container-shell max-w-3xl rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-[#d8e3f5]">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0a1628]/45">
          Privacy Policy
        </div>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#0a1628]">GameDay Map Privacy</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-[#0a1628]/72">
          <p>
            GameDay Map stores your preferences locally on your device in demo mode. That includes your favorite city, saved venues, membership tier, language choice, and notification settings.
          </p>
          <p>
            We do not currently process live payments or account authentication. If you enter an email for alerts, it stays local unless and until a real notification backend is launched.
          </p>
          <p>
            Before the 2026 World Cup, this page will be replaced with the full production privacy policy covering analytics, billing, and account security.
          </p>
        </div>
      </div>
    </main>
  );
}
