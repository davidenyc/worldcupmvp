export default function OfflinePage() {
  return (
    <main className="flex min-h-[calc(100svh-88px)] items-center justify-center bg-deep px-6 py-16 text-[color:var(--fg-on-strong)]">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 px-8 py-10 text-center shadow-2xl backdrop-blur">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gold text-2xl font-black text-deep">
          GM
        </div>
        <div className="mt-5 text-xs font-semibold uppercase tracking-[0.35em] text-gold">
          GameDay Map
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">You&apos;re offline.</h1>
        <p className="mt-3 max-w-md text-sm leading-7 text-[color:var(--fg-on-strong)]/72">
          Connect to find watch parties near you.
        </p>
      </div>
    </main>
  );
}
