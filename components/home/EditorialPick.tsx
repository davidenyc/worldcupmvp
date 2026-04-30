import Link from "next/link";

interface EditorialPickProps {
  eyebrow: string;
  venueName: string;
  neighborhood: string;
  quote: string;
  venueHref: string;
}

export function EditorialPick({ eyebrow, venueName, neighborhood, quote, venueHref }: EditorialPickProps) {
  return (
    <section className="surface border-l-2 border-l-gold px-5 py-5 sm:px-6">
      <div className="text-[11px] uppercase tracking-[0.2em] text-mist">{eyebrow}</div>
      <div className="mt-3">
        <h2 className="text-2xl font-bold tracking-tight text-deep">{venueName}</h2>
        <p className="mt-1 text-sm text-[color:var(--fg-secondary)]">{neighborhood}</p>
      </div>
      <blockquote className="mt-4 text-lg italic leading-8 text-[color:var(--fg-primary)]">
        “{quote}”
      </blockquote>
      <p className="mt-4 text-sm text-[color:var(--fg-secondary)]">— GameDay editorial team</p>
      <Link
        href={venueHref}
        className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-[color:var(--fg-on-accent)]"
      >
        Take me there →
      </Link>
    </section>
  );
}
