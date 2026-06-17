# Guitar Practice App

Interactive fretboard for exploring keys, chord progressions, and voicings.

**Live demo:** https://maxwellhankner.github.io/guitar-practice-app/

## Development

```bash
npm install
npm run dev
```

`npm run dev` starts the Vite app and a local json-server for user settings. Copy `db/db.example.json` to `db/db.json` before the first run (or let `npm run dev` create it).

**Deploying authored defaults:** edit settings locally in dev (saved to `db/db.json`), then run `npm run publish-state` to copy them into `src/data/siteState.json`, commit, and push. The live site loads that baked snapshot; visitors get full in-session functionality but changes reset on refresh.

See [development.md](development.md) for the roadmap.

## Scripts

- `npm run dev` — app + local settings API
- `npm run publish-state` — copy `db/db.json` → `src/data/siteState.json` for deploy
- `npm run build` — production build
- `npm run lint` — ESLint

## Deploy

Pushes to `main` deploy via GitHub Actions (see `.github/workflows/deploy-pages.yml`).

In repo **Settings → Pages**, set source to **GitHub Actions** (not “Deploy from a branch / root”).
