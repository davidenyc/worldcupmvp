import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Page not found",
  description:
    "That GameDay Map page doesn’t exist or moved. Head back to find the right World Cup watch spot and keep your match-day plan moving.",
  path: "/404",
  robots: {
    index: false,
    follow: false
  }
});

export default function NotFound() {
  return (
    <main className="container-shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl">🏟️</div>
      <h1 className="mt-6 text-4xl font-semibold text-deep dark:text-[color:var(--fg-on-strong)]">Page not found</h1>
      <p className="mt-3 max-w-sm text-sm text-mist dark:text-[color:var(--fg-muted-on-strong)]">
        This page doesn&apos;t exist or was moved. Head back to find your watch spot.
      </p>
      <Link href="/" className="mt-6 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-deep">
        Back to home
      </Link>
    </main>
  );
}
