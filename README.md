# Guitar Practice App

Interactive fretboard for exploring keys, chord progressions, and voicings.

**Live demo:** https://maxwellhankner.github.io/guitar-practice-app/

## Features

- **Keys & chords** — 24 keys; diatonic triads with roman numerals; 192 preset voicings
- **Progressions** — build up to 8 steps, seed from presets, swap/delete/add, alt voicings per step
- **Find key** — multiselect chords to rank matching keys
- **Known chords** — mark what you know; filter keys and progressions to playable options
- **Fretboard** — chord diagrams with barres, scale overlay (pentatonic / hexatonic / full), note names, adjustable fret count and orientation
- **Layout** — resizable split panels (horizontal or vertical), hide diagram, accent color
- **Mobile** — responsive key/chord grids and progression UI
- **PWA** — web manifest and app icon (`practice-guitar-icon.png`); add-to-home-screen ready (offline not yet)

Settings persist in dev (`db/db.json`) and in-session on the live site (baked defaults in `src/data/siteState.json`).

## Development

```bash
npm install
npm run dev
```

`npm run dev` starts Vite and a local settings API. Copy `db/db.example.json` to `db/db.json` before the first run (or let dev create it). Settings go through `/api` (proxied to `db/db.json`), so you can open the **Network** URL on your phone. Open tabs sync via SSE (`/api/events`).

**Deploying authored defaults:** edit settings in dev, then `npm run build` or push to `main` copies `db/db.json` → `src/data/siteState.json`. Commit `db/db.json` when you want those defaults live.

See [development.md](development.md) for the roadmap.

## Scripts

- `npm run dev` — app + local settings API
- `npm run publish-state` — copy `db/db.json` (or example) → `src/data/siteState.json`
- `npm run build` — publish state, then production build
- `npm run lint` — ESLint

## Deploy

Pushes to `main` deploy via GitHub Actions (see `.github/workflows/deploy-pages.yml`).

In repo **Settings → Pages**, set source to **GitHub Actions** (not “Deploy from a branch / root”).
