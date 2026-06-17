# Guitar Practice App

Interactive fretboard for exploring keys, chord progressions, and voicings.

**Live demo:** https://maxwellhankner.github.io/guitar-practice-app/

## Development

```bash
npm install
npm run dev
```

`npm run dev` starts the Vite app and a local json-server for user settings. Copy `db/db.example.json` to `db/db.json` before the first run (or let `npm run dev` create it).

**Deploying authored defaults:** edit settings locally in dev (saved to `db/db.json`). On `npm run build` or push to `main`, settings are copied into `src/data/siteState.json` automatically. Commit `db/db.json` when you want those changes on the live site. Visitors get full in-session functionality; changes reset on refresh.

See [development.md](development.md) for the roadmap.

## Scripts

- `npm run dev` — app + local settings API
- `npm run publish-state` — copy `db/db.json` (or example) → `src/data/siteState.json`
- `npm run build` — publish state, then production build
- `npm run lint` — ESLint

## Deploy

Pushes to `main` deploy via GitHub Actions (see `.github/workflows/deploy-pages.yml`).

In repo **Settings → Pages**, set source to **GitHub Actions** (not “Deploy from a branch / root”).
