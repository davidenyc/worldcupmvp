export default function PromosLoading() {
  return (
    <main className="container-shell space-y-8 py-6 sm:py-10">
      <section className="space-y-4 animate-pulse">
        <div className="h-4 w-32 rounded-full bg-surface-2" />
        <div className="h-12 w-80 rounded-full bg-surface-2" />
        <div className="h-6 w-full max-w-3xl rounded-full bg-surface-2" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-11 w-28 rounded-full bg-surface-2" />
          ))}
        </div>
      </section>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="surface animate-pulse p-4">
            <div className="h-6 w-20 rounded-full bg-surface-2" />
            <div className="mt-4 h-8 w-2/3 rounded-full bg-surface-2" />
            <div className="mt-3 h-5 w-1/2 rounded-full bg-surface-2" />
            <div className="mt-4 h-20 rounded-2xl bg-surface-2" />
          </div>
        ))}
      </div>
    </main>
  );
}
