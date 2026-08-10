# AGENTS.md

## Cursor Cloud specific instructions

This is a single-product Vite + React 19 + TypeScript app (`guitar-practice-app`), an interactive guitar fretboard/chord-progression tool. It is a static SPA with an optional local dev settings API. There is no database, container, or external service. Standard commands live in `package.json` and `README.md`; only non-obvious notes are captured here.

### Services

- Web app (Vite dev server) — REQUIRED. The actual product UI.
- Settings API (local `json-server` via `scripts/dev-api.mjs`) — OPTIONAL. Persists settings to `db/db.json` and pushes cross-tab sync over SSE (`/api/events`). The app degrades gracefully to in-code `DEFAULT_SETTINGS` if it is unreachable, so the UI works without it.

### Run / lint / build

- `npm run dev` — starts BOTH web + api together (via `concurrently`). Web serves at `http://localhost:5173/guitar-practice-app/` (note the `/guitar-practice-app/` base path — the bare root returns 404). The Vite dev server proxies `/api` → `http://127.0.0.1:3001`. Run individually with `npm run dev:web` and `npm run dev:api`.
- `npm run lint` — ESLint.
- `npm run build` — production build (`publish-state` + `tsc -b` + `vite build`).

### Git / deploy (Cloud Agents)

This project deploys to GitHub Pages from `main`. The owner often prompts from mobile and uses the live Pages site as the preview.

**In Cursor Cloud Agents only:** commit and push every completed change directly to `main` (no feature branch / PR workflow unless the user asks otherwise). Prefer small, frequent commits so Pages updates as work progresses.

**In the local IDE:** do not push to `main` just for preview — use the Vite dev server. Follow normal local git habits unless the user asks to commit/push.

### Non-obvious gotchas

- The base path is `/guitar-practice-app/`. Always open `http://localhost:5173/guitar-practice-app/`, not `http://localhost:5173/`.
- Vite is configured with `server.open: true`, so `npm run dev` tries to auto-open a browser; harmless in headless CI.
- `npm run build` runs `publish-state`, which regenerates `src/data/siteState.json` from `db/db.json`. This can dirty the git tree; only commit that file when you intend to change the baked-in production defaults.
- `scripts/dev-api.mjs` auto-creates `db/db.json` from `db/db.example.json` on first run, so no manual DB setup is needed.
