import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminQueue } from "@/lib/data/repository";

export default async function AdminPage() {
  const { submissions, venues, importJobs } = await getAdminQueue();

  return (
    <div className="container-shell py-10">
      <section className="mb-8 max-w-3xl">
        <div className="text-sm uppercase tracking-[0.2em] text-mist">Admin dashboard</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-deep">Moderation, curation, and imports</h1>
        <p className="mt-4 text-navy/72">
          Review user submissions, merge duplicates, tag countries, and stage future CSV or official API imports.
        </p>
      </section>
      <AdminDashboard submissions={submissions} venues={venues} importJobs={importJobs} />
    </div>
  );
}
