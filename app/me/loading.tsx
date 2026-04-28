export default function MeLoading() {
  return (
    <main className="container-shell space-y-6 py-6 sm:py-10">
      <div className="surface animate-pulse p-6">
        <div className="h-4 w-28 rounded-full bg-surface-2" />
        <div className="mt-4 h-10 w-56 rounded-full bg-surface-2" />
        <div className="mt-4 h-12 w-full rounded-2xl bg-surface-2" />
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="surface animate-pulse p-6">
          <div className="h-4 w-24 rounded-full bg-surface-2" />
          <div className="mt-4 h-8 w-48 rounded-full bg-surface-2" />
          <div className="mt-5 h-24 rounded-2xl bg-surface-2" />
        </div>
      ))}
    </main>
  );
}
