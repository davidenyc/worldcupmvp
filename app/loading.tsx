export default function Loading() {
  return (
    <div className="container-shell py-16">
      <div className="surface-strong animate-pulse p-8">
        <div className="h-6 w-40 rounded-full bg-sky/70" />
        <div className="mt-4 h-12 w-3/4 rounded-3xl bg-sky/70" />
        <div className="mt-3 h-5 w-2/3 rounded-3xl bg-sky/40" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="h-28 rounded-3xl bg-white" />
          <div className="h-28 rounded-3xl bg-white" />
          <div className="h-28 rounded-3xl bg-white" />
        </div>
      </div>
    </div>
  );
}
