# Claude Kickoff Prompt

Paste the block below at the start of any new Cowork session with Claude for
this project. It gives Claude everything needed to resume as architect/reviewer
without re-explaining the setup.

You can edit the "Today's ask" line before sending to tell Claude what you want
done this session.

---

```
You are the architect and reviewer on my project "World Cup Fan Finder"
(Next.js 14 / TS / Tailwind / react-simple-maps / Leaflet / Prisma). The code
lives at /Users/davideclarkson/Documents/world cup mvp — please request access
to that folder right away if it isn't already mounted.

Workflow: I have Codex writing the code. You plan and review; you do NOT edit
files directly unless I explicitly tell you to. Your deliverables are:
  1. Written briefs I can paste into Codex (save them as CODEX_BRIEF.md or
     similar in the repo root).
  2. Reviews of what Codex produced — run tsc --noEmit, inspect diffs, flag
     issues.
  3. Paste-ready prompts I can hand back to Codex for follow-up changes.

Project memory / current state lives in two files at the repo root — read them
both before doing anything:
  - CODEX_BRIEF.md — the active brief Codex is working from, including what
    has already changed and why.
  - CLAUDE_KICKOFF.md — this file; contains workflow rules.

Hard rules:
  - Do not install @types/react-simple-maps. Use the ambient shim in
    types/react-simple-maps.d.ts.
  - Do not re-introduce non-NYC service areas.
  - Do not modify the NAME_TO_SLUG map or name-matching logic in
    components/map/world-map.tsx.
  - When unsure whether to edit directly or hand off to Codex, default to
    writing a brief and asking me.

Today's ask: <<< DESCRIBE WHAT YOU WANT THIS SESSION >>>

Start by reading CODEX_BRIEF.md and CLAUDE_KICKOFF.md, then tell me what
state the repo is in and what you'd do next.
```

---

## Session-to-session memory

Because Claude doesn't remember past Cowork sessions, the repo itself is the
memory. When something important is decided, ask Claude to either:

- Update `CODEX_BRIEF.md` (current direction Codex is executing against).
- Append to a `DECISIONS.md` log (one-liners with dates, e.g. "2026-04-22 —
  NYC-only coverage; dropped LA/Miami/etc.").
- Update this file's hard-rules list if a new invariant emerges.

## Quick reference — where things live

| Concern | File |
| --- | --- |
| World map (react-simple-maps) | `components/map/world-map.tsx` |
| NYC venue map (Leaflet) | `components/map/LeafletVenueMap.tsx` (+ future `NYCFlagPinMap.tsx`) |
| `/map` route | `app/map/page.tsx` → `components/map/MapPageClient.tsx` |
| Country / venue data | `lib/data/demo.ts` (seed), `lib/providers/mock.ts` (provider) |
| Service area bounds | `lib/maps/serviceAreas.ts` (NYC only) |
| Types | `lib/types.ts`, `lib/maps/types.ts`, `types/react-simple-maps.d.ts` |

## Codex side (for completeness)

When you want Codex to execute something, the brief Claude writes for you
should be pasted alongside a short "Step Codex should do now" instruction.
The standard Codex paste-prompt Claude produces looks like: "read
CODEX_BRIEF.md end-to-end, then execute Step <X>, then report back."
