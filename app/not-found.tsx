import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl">🏟️</div>
      <h1 className="mt-6 text-4xl font-semibold text-[#0a1628] dark:text-white">Page not found</h1>
      <p className="mt-3 max-w-sm text-sm text-[#0a1628]/55 dark:text-white/55">
        This page doesn&apos;t exist or was moved. Head back to find your watch spot.
      </p>
      <Link href="/" className="mt-6 rounded-full bg-[#f4b942] px-5 py-2.5 text-sm font-semibold text-[#0a1628]">
        Back to home
      </Link>
    </main>
  );
}
