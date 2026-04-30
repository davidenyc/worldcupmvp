# GameDay Map

GameDay Map is a polished World Cup 2026 fan experience built on compliant ingestion architecture: demo data first, then CSV imports, manual curation, user submissions, and isolated official provider connectors.

## Current scope

- Full current 48-country 2026 World Cup participant catalog
- Light pastel-blue visual system
- Interactive world map hero plus mobile-friendly flag picker
- Flagship `/map` page powered by Leaflet with flag markers, clustering, service areas, and synced results
- Host-city venue map with client-side clustering and marker mini-cards
- Expanded venue model with reservations, capacity, amenities, verification, and source tracking
- Admin scaffolding for imports, moderation, duplicate review, and featured controls

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- PostgreSQL + Prisma
- Zustand-ready client store slot
- Provider abstraction for mock, CSV, manual, Yelp, and Google Places

## Routes

- `/`
- `/map`
- `/country/[slug]`
- `/venue/[slug]`
- `/submit`
- `/admin`
- `/about`

## Local setup

### Fast start with mock data

This is the easiest path for local preview and the recommended first deploy path on Vercel.

1. Install dependencies

```bash
pnpm install
```

2. Copy envs

```bash
cp .env.example .env.local
```

3. Confirm mock mode in `.env.local`

```dotenv
DATA_PROVIDER="mock"
```

4. Run the app

```bash
pnpm dev
```

5. Open the app

```text
http://localhost:3000/
```

### Local Supabase auth + database mode

Use this when you want real Supabase Auth, Prisma migrations, and a Postgres-backed profile/favorites/watchlist flow locally.

1. Fill these values in `.env.local`

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. Generate Prisma client and run the current migrations

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

3. Seed the database

```bash
pnpm seed
```

4. Start the app

```bash
pnpm dev
```

5. In Supabase Auth settings, allow these redirect URLs

```text
http://localhost:3000/auth/callback
gameday://auth/callback
```

## Vercel deploy

This app can be deployed without a database on day one, but the auth/database branch expects a real Supabase project before merge.

Use these environment variables in Vercel:

```dotenv
DATA_PROVIDER=mock
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_MAP_PROVIDER=mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=
GOOGLE_PLACES_API_KEY=
GOOGLE_PLACES_TEXT_SEARCH_URL=https://places.googleapis.com/v1/places:searchText
RESEND_API_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:hello@gamedaymap.com
CRON_SECRET=
```

Notes:

- `postinstall` runs `prisma generate` automatically so the Prisma client is available during Vercel builds.
- Keeping `DATA_PROVIDER=mock` means the public app does not need a live database for the first deploy.
- `DATABASE_URL` and `DIRECT_URL` come from Supabase Postgres.
- After deploy, update `NEXT_PUBLIC_APP_URL` to the final production domain.

## Web push / notifications

Generate VAPID keys once, then store them in `.env.local`:

```bash
npx web-push generate-vapid-keys
```

Required envs:

```dotenv
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:hello@gamedaymap.com
CRON_SECRET=
```

Notes:

- `VAPID_PRIVATE_KEY` must stay server-only and must not be `NEXT_PUBLIC_` prefixed.
- `CRON_SECRET` protects `/api/cron/*` routes from public hits.

## Security setup (required before production deploy)

Generate fresh values for these env vars and set them in Vercel:

- `ELITE_ACCESS_SECRET` — `openssl rand -hex 32`
- `CRON_SECRET` — `openssl rand -hex 32`
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase Dashboard -> Settings -> API -> reset
- `STRIPE_WEBHOOK_SECRET` — Stripe Dashboard -> Webhooks -> reveal

Rotate these annually or if anyone outside the team has read access to env logs.

Required env vars (will throw at startup if missing in production):

- `ELITE_ACCESS_SECRET`
- `CRON_SECRET`
- `DATABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Where real credentials go

- `NEXT_PUBLIC_MAPBOX_TOKEN`: optional map imagery/token if you replace the demo 2D panel with Mapbox-backed rendering
- `GOOGLE_PLACES_API_KEY`: future official Google Places provider
- `DATA_PROVIDER`: choose active provider, default `mock`
- `CSV_IMPORT_PATH`: local import path for CSV provider wiring

## Provider architecture

- `lib/providers/types.ts`: normalized provider interface
- `lib/providers/mock.ts`: multi-hundred-venue demo provider
- `lib/providers/csv.ts`: CSV ingestion scaffold
- `lib/providers/manual.ts`: manual/admin curation provider
- `lib/providers/yelp.ts`: Yelp Fusion stub
- `lib/providers/googlePlaces.ts`: official Google Places stub

## Data notes

- No brittle scraping of Google Maps, Apple Maps, or Yelp webpages
- Demo venues are clearly demo/imported/editorial in source metadata
- Reservation, capacity, and verification fields are modeled throughout the stack

## Tournament catalog note

The 48-country seed catalog reflects the current 2026 participant field as verified from official FIFA qualification coverage during this update pass.

## Real integration TODO

See [TODO.md](./TODO.md).
