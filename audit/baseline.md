## Phase 0 Baseline

Date: 2026-04-27
Server: `http://localhost:3001`

### Runtime baseline findings

- Initial local dev server was unstable and serving a broken refresh loop:
  - Visible response body: `missing required error components, refreshing...`
  - Fixed for baseline capture by killing the stale `next-server`, removing `.next`, and restarting `pnpm dev`.
- After clean restart, baseline route checks returned `200` for:
  - `/`
  - `/nyc/map`
  - `/nyc/matches`
  - `/membership`
  - `/country/brazil`

### Visual / UX issues confirmed during baseline

- `/nyc/matches` mobile:
  - severe dark-theme contrast failure
  - large black background areas with light cards and unreadable/incomplete hierarchy
  - match schedule feels overly long and accordion-heavy
- `/` mobile:
  - home host-city map is visible again, but still needs full touch/readability QA
- `/nyc/map`:
  - route compiles and responds after restart, but still needs full cross-theme surface audit

### Screenshot capture status

Completed baseline screenshots saved in `audit/screenshots/phase-0/`:

- `home--desktop-1440.png`
- `home--mobile-390.png`
- `tonight--desktop-1440.png`
- `tonight--tablet-768.png`
- `tonight--mobile-390.png`
- `nyc__map--desktop-1440.png`
- `nyc__map--tablet-768.png`
- `nyc__map--mobile-390.png`
- `la__map--desktop-1440.png`
- `la__map--tablet-768.png`
- `la__map--mobile-390.png`

### Baseline blockers

- Headless Chrome route capture is unstable on some longer runs and intermittently crashes or hangs on certain viewport/route combinations.
- Full Phase 0 screenshot matrix and route-by-route console inventory are not yet complete.
