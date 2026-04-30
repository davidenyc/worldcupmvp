import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Contact the GameDay Map team about venue listings, supporter-group updates, partnerships, or help finding the right World Cup room.",
  path: "/contact"
});

export default function ContactPage() {
  return (
    <main className="bg-bg text-deep">
      <section className="container-shell py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] p-8 shadow-card">
          <div className="text-small uppercase tracking-[0.18em] text-ink-55">Contact</div>
          <h1 className="mt-3 text-h1 text-[color:var(--fg-primary)]">Talk to the GameDay Map team</h1>
          <p className="mt-4 text-body text-[color:var(--fg-secondary)]">
            Need help with a venue listing, partner deal, or match-day recommendation? Email us and we&apos;ll get back to you.
          </p>
          <div className="mt-6 rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-5">
            <div className="text-small uppercase tracking-[0.18em] text-ink-55">Email</div>
            <a href="mailto:hello@gamedaymap.com" className="mt-2 inline-flex text-lg font-semibold text-[color:var(--fg-primary)] hover:text-gold">
              hello@gamedaymap.com
            </a>
            <p className="mt-3 text-sm text-[color:var(--fg-secondary)]">
              Venue owners can also use the submit form to send a new watch spot for review.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
