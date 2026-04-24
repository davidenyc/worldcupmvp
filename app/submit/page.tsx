import { SubmitForm } from "@/components/submit/submit-form";

export default function SubmitPage() {
  return (
    <div className="container-shell py-10">
      <section className="mb-8 max-w-3xl">
        <div className="text-sm uppercase tracking-[0.2em] text-mist">Community sourcing</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-deep">Submit a venue</h1>
        <p className="mt-4 text-navy/72">
          Add bars, restaurants, cafes, and supporter hubs for moderation. This MVP is ready for Prisma-backed queue storage and future authenticated submissions.
        </p>
      </section>
      <SubmitForm />
    </div>
  );
}
