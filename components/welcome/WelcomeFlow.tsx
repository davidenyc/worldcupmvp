// Six-step onboarding shell for /welcome with progress dots and a sticky footer navigator.
"use client";

import { useState } from "react";

const STEPS = [
  {
    eyebrow: "Step 1 of 6",
    title: "Tell us your name and home city.",
    body: "We’ll use this to personalize your Cup across the map, promos, and saved venues."
  },
  {
    eyebrow: "Step 2 of 6",
    title: "Pick the country you’re backing most.",
    body: "This becomes the headline nation we rank bars and promos around."
  },
  {
    eyebrow: "Step 3 of 6",
    title: "Follow any other nations you care about.",
    body: "You can always skip and add more later."
  },
  {
    eyebrow: "Step 4 of 6",
    title: "Set your default match-day filters.",
    body: "These become your map defaults when you jump into a city."
  },
  {
    eyebrow: "Step 5 of 6",
    title: "Choose your plan for the demo.",
    body: "Fan Pass and Elite unlock perks instantly here, with no payment flow yet."
  },
  {
    eyebrow: "Step 6 of 6",
    title: "Decide how you want promos and alerts.",
    body: "These are preference flags only for now, so you can change them anytime."
  }
] as const;

export function WelcomeFlow() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-[35rem] flex-col px-4 pb-28 pt-8 sm:px-6">
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((_, index) => (
          <span
            key={index}
            className={`h-2.5 w-2.5 rounded-full transition ${index <= stepIndex ? "bg-gold" : "bg-[color:var(--border-subtle)]"}`}
          />
        ))}
      </div>

      <section className="mt-8 rounded-[2rem] border border-line bg-[radial-gradient(circle_at_top_left,rgba(244,185,66,0.16),transparent_36%),linear-gradient(145deg,var(--bg-surface),var(--bg-surface-elevated))] p-6 sm:p-8">
        <div className="text-[10px] uppercase tracking-[0.18em] text-mist">{step.eyebrow}</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-deep sm:text-4xl">{step.title}</h1>
        <p className="mt-3 text-sm leading-7 text-mist sm:text-base">{step.body}</p>

        <div className="mt-8 rounded-[1.5rem] border border-dashed border-line bg-surface px-5 py-10 text-center text-sm text-mist">
          Step content lands here in the next commits.
        </div>
      </section>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[var(--bg-page)]/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="pointer-events-auto mx-auto flex w-full max-w-[35rem] items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
            disabled={isFirst}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setStepIndex((current) => Math.min(STEPS.length - 1, current + 1))}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={() => setStepIndex((current) => Math.min(STEPS.length - 1, current + 1))}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-deep"
          >
            {isLast ? "Finish →" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
