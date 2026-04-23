# GameDay Map

GameDay Map is a polished NYC-first World Cup fan discovery platform built on compliant ingestion architecture: demo data first, then CSV imports, manual curation, user submissions, and isolated official provider connectors.

## Current scope

- Full current 48-country 2026 World Cup participant catalog
- Light pastel-blue visual system
- Interactive world map hero plus mobile-friendly flag picker
- Flagship `/map` page powered by Leaflet with flag markers, clustering, service areas, and synced results
- NYC venue map with client-side clustering and marker mini-cards
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
npm install
```

2. Copy envs

```bash
cp .env.example .env
```

3. Confirm mock mode in `.env`

```dotenv
DATA_PROVIDER="mock"
```

4. Run the app

```bash
npm run dev
```

5. Open the app

```text
http://localhost:3000/
```

### Local database mode

Use this only when you want Prisma migrations, seeds, and a real Postgres-backed workflow locally.

1. Set a working `DATABASE_URL` in `.env`
2. Generate the Prisma client and run migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

3. Seed the database

```bash
npm run seed
```

## Vercel deploy

This app can be deployed without a database on day one.

Use these environment variables in Vercel:

```dotenv
DATA_PROVIDER=mock
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_MAP_PROVIDER=mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=
GOOGLE_PLACES_API_KEY=
YELP_API_KEY=
GOOGLE_PLACES_TEXT_SEARCH_URL=https://places.googleapis.com/v1/places:searchText
YELP_API_BASE_URL=https://api.yelp.com/v3
CLERK_SECRET_KEY=
NEXTAUTH_SECRET=
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gameday_map?schema=public
```

Notes:

- `postinstall` runs `prisma generate` automatically so the Prisma client is available during Vercel builds.
- Keeping `DATA_PROVIDER=mock` means the public app does not need a live database for the first deploy.
- `DATABASE_URL` can stay as a placeholder value while you are in mock mode because Prisma client generation still expects it to exist.
- After deploy, update `NEXT_PUBLIC_APP_URL` to the final production domain.

## Where real credentials go

- `NEXT_PUBLIC_MAPBOX_TOKEN`: optional map imagery/token if you replace the demo 2D panel with Mapbox-backed rendering
- `GOOGLE_PLACES_API_KEY`: future official Google Places provider
- `YELP_API_KEY`: future Yelp Fusion provider
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
