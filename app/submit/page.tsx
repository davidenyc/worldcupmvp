import { buildMetadata } from "@/lib/seo/metadata";
import { SubmitForm } from "@/components/submit/submit-form";

export const metadata = buildMetadata({
  title: "Submit a venue",
  description:
    "Submit a World Cup watch venue, supporter bar, or neighborhood room so more fans can find the right spot before match day.",
  path: "/submit"
});

export default function SubmitPage() {
  return (
    <div className="container-shell py-6 text-deep sm:py-10">
      <section className="mb-6 max-w-3xl sm:mb-8">
        <div className="text-sm uppercase tracking-[0.2em] text-mist">Community sourcing</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-deep sm:text-4xl">Submit a venue</h1>
        <p className="mt-3 text-sm leading-7 text-mist sm:mt-4 sm:text-base">
          Share the essentials and we&apos;ll review within 48 hours so more fans can find the right room fast.
        </p>
      </section>
      <SubmitForm />
    </div>
  );
}
