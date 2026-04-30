import { buildMetadata } from "@/lib/seo/metadata";
import { OfflineReadinessPanel } from "@/components/offline/OfflineReadinessPanel";

export const metadata = buildMetadata({
  title: "Offline mode",
  description:
    "GameDay Map offline mode keeps your recent city map and near-term World Cup match timing available when your connection drops.",
  path: "/offline"
});

export default function OfflinePage() {
  return (
    <main className="min-h-[calc(100svh-88px)] bg-deep px-6 py-16 text-[color:var(--fg-on-strong)]">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 px-8 py-10 text-center shadow-2xl backdrop-blur">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gold text-2xl font-black text-deep">
            GM
          </div>
          <div className="mt-5 text-xs font-semibold uppercase tracking-[0.35em] text-gold">
            GameDay Map
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">You&apos;re offline.</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[color:var(--fg-on-strong)]/72">
            Here&apos;s what still works: the city map you opened most recently, plus the next 48 hours of match timing so you can keep a plan together until you reconnect.
          </p>
          <OfflineReadinessPanel />
        </div>
      </div>
    </main>
  );
}
