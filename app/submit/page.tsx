import { SubmitForm } from "@/components/submit/submit-form";

export default function SubmitPage() {
  return (
    <div className="container-shell py-6 sm:py-10">
      <section className="mb-6 max-w-3xl sm:mb-8">
        <div className="text-sm uppercase tracking-[0.2em] text-mist">Community sourcing</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-deep sm:text-4xl">Submit a venue</h1>
        <p className="mt-3 text-sm leading-7 text-navy/72 sm:mt-4 sm:text-base">
          Add bars, restaurants, cafes, and supporter hubs for review so more fans can find great match-day spots.
        </p>
      </section>
      <SubmitForm />
    </div>
  );
}
