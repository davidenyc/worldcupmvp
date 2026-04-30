"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "Do I need to make a reservation?",
    answer: "Only some venues take reservations. We flag those clearly, and everything else is best handled by showing up early."
  },
  {
    question: "Can I bring my dog, kid, or partner?",
    answer: "Many venues are family-friendly, some have outdoor space, and some are built for louder fan crowds. The vibe filters help you choose fast."
  },
  {
    question: "What if my country isn't here yet?",
    answer: "Start with your city, then browse by vibe or tonight's matches. The map still helps you find the best room even before every country crowd is seeded."
  },
  {
    question: "Are venues paying you to be ranked?",
    answer: "No. Match-night fit, fan signals, and venue quality drive the order. Paid promos live in their own lane."
  },
  {
    question: "When does the World Cup start?",
    answer: "World Cup 2026 starts on June 11, and we're using the schedule now so you can line up your room before kickoff week gets hectic."
  }
] as const;

export function HomeFAQ() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(FAQ_ITEMS[0].question);

  return (
    <section className="surface px-5 py-5 sm:px-6">
      <div className="text-[11px] uppercase tracking-[0.2em] text-mist">Common questions</div>
      <div className="mt-4 divide-y divide-line">
        {FAQ_ITEMS.map((item) => {
          const open = openQuestion === item.question;

          return (
            <button
              key={item.question}
              type="button"
              onClick={() => setOpenQuestion(open ? null : item.question)}
              className="w-full py-4 text-left"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-semibold text-deep">{item.question}</span>
                <span className="text-mist">{open ? "−" : "+"}</span>
              </div>
              {open ? <p className="mt-3 text-sm leading-7 text-[color:var(--fg-secondary)]">{item.answer}</p> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
