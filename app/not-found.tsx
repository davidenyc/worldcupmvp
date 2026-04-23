import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-shell flex min-h-[60vh] items-center justify-center py-16">
      <div className="surface-strong max-w-xl p-8 text-center">
        <div className="text-sm uppercase tracking-[0.2em] text-mist">404</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-deep">That match-day page is off the board.</h1>
        <p className="mt-4 text-navy/72">
          Try heading back to the country directory and picking another supporter community.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button>Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
