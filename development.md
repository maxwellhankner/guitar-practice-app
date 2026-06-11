# Development roadmap

A living doc for where the guitar practice app is headed. Update this as features ship or priorities change.

## Product vision

A **minimal practice companion** for guitar — not a full DAW, not a tab archive. The focus is:

- See chords and scales clearly on the fretboard
- Understand **keys**, **progressions**, and how they connect
- **Practice** with timing (metronome + chord changes)
- Learn from a small **song library** that reuses the same key/progression model

The app should stay fast, readable, and single-page. New features should compose with what already exists (keys, progressions, fretboard rendering) rather than bolt on separate modes.

---

## Current state (shipped)

| Area | What works today |
|------|------------------|
| **Fretboard** | 4–21 frets, fixed diagram height, width scales with fret count, note names on/off, barre shapes, auto `startFret` scroll for barre shapes |
| **Chords** | 24 presets (12 major + 12 minor, sharp spellings), finger numbers, O/X markers |
| **Key** | 12 major + 12 minor keys (sharp spellings); filters chords to diatonic set with Roman numerals |
| **Progression** | 8 common Roman-numeral patterns; reduces chord row to 3–4 chords in order (requires key) |
| **Known chords** | Per-chord playability toggles; KNOWN filter for keys/progressions; persisted via JSON Server |
| **Display prefs** | Notes on/off and fret count persisted via JSON Server |
| **Scale** | Toggle Pentatonic / Hexatonic / Full Scale (key-linked, persisted; none selected = off) |
| **Layout** | Options panel (scrollable) + diagram panel (35vh), NOTES/FRETS/KNOWN row at top |

### Core modules

- `src/components/Fretboard/Fretboard.tsx` — SVG diagram
- `src/components/Fretboard/chords.ts` — chord fingerings
- `src/components/Fretboard/keys.ts` — key theory, Roman numerals, diatonic chords
- `src/components/Fretboard/progressions.ts` — progression definitions → chord lists
- `src/components/Fretboard/scales.ts` — scale positions + key-linked patterns
- `src/components/Fretboard/viewport.ts` — fret window / auto-scroll
- `src/pages/HomePage.tsx` — all UI state and controls
- `src/db/userSettingsRepository.ts` — user settings CRUD
- `src/api.ts` — fetch helpers for JSON Server
- `db/db.json` — persisted dev data

---

## Dev API (JSON Server)

User settings (known chords, KNOWN filter, display notes, fret count, scale selection) persist in a file-backed mock REST API during development.

| Piece | Location |
|-------|----------|
| **Data file** | `db/db.json` — `userSettings` collection |
| **API** | `npm run dev:api` → JSON Server on **http://localhost:3001** |
| **Frontend** | `src/api.ts` + `src/db/userSettingsRepository.ts` |
| **Dev** | `npm run dev` runs API + Vite together via `concurrently` |

Endpoints:

- `GET/PATCH http://localhost:3001/userSettings/default`

JSON Server writes changes back to `db/db.json`, so edits survive dev restarts. One-time migration from the old `localStorage` fake DB runs on first fetch if needed.

Override API URL with `VITE_API_BASE` in `.env` if needed.

---

## Planned features

### 1. Metronome + progression practice mode

**Goal:** Turn Key + Progression into something you can *play along with*, not just read.

**UX**

- Appears when both a **key** and **progression** are selected (or when a **song** is loaded — see §2).
- Transport: **Play / Pause**, **Reset**, optional **Loop**.
- **BPM** control (e.g. 40–200) with tap-tempo later.
- **Time signature** default 4/4; beats per chord configurable (e.g. 4 beats per chord, or 2 for half-time feel).
- **Active chord** highlighted in the chord row; fretboard updates to that chord on each change.
- Visual beat indicator (pulse on downbeat or subtle flash on the active chord button).
- Audio: Web Audio API click (low latency, no extra dependencies). Optional accent on beat 1.

**Behavior**

- Advance progression index on schedule: chord 1 → 2 → 3 → 4 → loop.
- Selecting a chord manually while playing could pause or override until next advance (decide during implementation).
- Roman numerals stay visible under chords during playback.

**Technical notes**

- New state: `isPlaying`, `bpm`, `beatsPerChord`, `activeProgressionIndex`, `beatPhase`.
- `requestAnimationFrame` or `AudioContext` scheduling for stable timing.
- Reuse `chordsForProgression(key, progressionId)` for the chord sequence.
- Consider a small `useMetronome` hook and a `PracticeTransport` UI block under Progression.

**Open questions**

- Count-in (1 bar before first chord)?
- Mute metronome but keep chord changes?
- Show “bar 2 of 4” for the current chord?

---

### 2. Song library

**Goal:** Curated songs that drive the same UI as manual key + progression selection — key, chords, and practice playback in one tap.

**UX**

- New **Songs** section (placement TBD — likely above or below Progression).
- Each song: title, artist (optional), **key**, **progression** (Roman numerals or degree list), and **chord sequence** resolved for that key.
- Selecting a song:
  - Sets `selectedKey`
  - Sets `selectedProgression` (or a song-specific degree list if it doesn’t match a preset pattern)
  - Optionally sets suggested **BPM** and **capo** (once capo exists)
  - Shows short metadata: “Key: G · Progression: 1 · 5 · 6 · 4 · Chords: G · D · Em · C”

**Data shape (draft)**

```ts
type SongEntry = {
  id: string
  title: string
  artist?: string
  key: KeyId
  /** Preset progression id or explicit degree list */
  progression: ProgressionId | { degrees: number[] }
  bpm?: number
  capo?: number
  notes?: string
}
```

**Starter library ideas**

- Songs that map cleanly to existing progressions (e.g. 1·5·6·4, 6·4·1·5, 1·4·5).
- Start with ~10–20 well-known examples; expand from user interest.
- Store in `src/data/songs.ts` (static) first; JSON + admin later if needed.

**Legal / content**

- No copyrighted lyrics in the app.
- Song entries are **educational metadata** (key, chord functions, progression). Titles/artists are factual references.

**Integration with metronome**

- “Practice this song” = load song → start transport at song BPM.
- Same highlight + fretboard advance as §1.

---

### 3. Capo

**Goal:** Show **sounding key** vs **shapes played** when a capo is on a fret.

**UX**

- **Capo** control: fret 0 (off) through e.g. 7 or 12.
- When capo > 0:
  - Diagram shows fingerings **as played** (unchanged shapes, but nut position shifts — or annotate “play shape X, sounds Y”).
  - Label: “Capo 3 · Sounds: G · Shapes: E” (transpose down by capo fret count for sounding pitch).

**Behavior options (pick one for v1)**

1. **Sounding-key mode (recommended):** User picks sounding key G + capo 3 → app selects **E** shapes (chords transposed −3). Fretboard shows shapes; header shows both.
2. **Shape-key mode:** User picks shape key E + capo 3 → sounds as G. Clearer for players who think in shapes.

**Technical notes**

- Transpose `KeyId` / `ChordPresetId` by capo semitones (reuse `ROOT_PC` / pitch-class math from `keys.ts`).
- Fretboard may need `capoFret` prop: visual marker at capo fret (like a secondary nut), open strings become capo’d strings.
- Song library: `capo` field per song pre-fills this.

**Open questions**

- Auto-suggest capo for songs (e.g. “play G with capo 2 using F shapes”)?
- Capo + barre chords high on neck — tie into auto `startFret` scrolling (future polish).

---

### 4. Full pentatonic coverage

**Goal:** Today there are **5 pentatonic key buttons** (relative major/minor pairs). Expand so users can access **pentatonic for any practical key**, aligned with the main **Key** selector.

**Current**

- `PENTATONIC_KEYS`: `Am/C`, `Em/G`, `Dm/F`, `Bm/D`, `Gm/A#`
- Positions computed from pitch classes across visible frets

**Target**

- **12 major + 12 minor** pentatonic roots (or follow selected **Key** directly).
- Option A: Replace 5 buttons with key-linked pentatonic (when Key = Am, pentatonic = A minor).
- Option B: Keep quick presets *and* add “Pentatonic: follow key” toggle.
- Show all five box positions or **all scale tones in range** (current approach — keep this).

**Technical notes**

- Pentatonic pitch classes: `{0,2,4,7,9}` major, `{0,3,5,7,10}` minor (relative to root).
- `pentatonicPatternForWindow(rootPc, fretCount)` generalizes from fixed presets.
- Minor vs major pentatonic follows major/minor key selection.

**Nice additions**

- Highlight root notes differently from other scale tones.
- Optional “position boxes” (CAGED-style regions) as overlay toggle.

---

### 5. Full key scale on fretboard (all diatonic notes)

**Goal:** Like pentatonic dots, but show **every note in the selected key** across the visible fretboard — major or natural minor scale.

**UX**

- New display mode: **Scale: Off | Pentatonic | Key** (or separate toggle under Key).
- When **Key** scale is on:
  - All scale degrees appear as dots (or lighter markers) on the fretboard.
  - Works with **Notes on/off** (letter names vs dots only).
  - Root degree emphasized (larger dot or accent color).

**Technical notes**

- Reuse `MAJOR_SCALE_STEPS` / `MINOR_SCALE_STEPS` from `keys.ts`.
- Same position-generation pattern as `pentatonicPositionsInRange`.
- Mutually exclusive with chord fingering dots *or* layered (chord on top of scale) — **layered** is more useful for practice.

**Relation to pentatonic**

- Pentatonic = subset of key scale. UI should make it clear: pentatonic hides 2nd and 6th (major) etc.
- Long term: one **Scale** section with type: None · Major · Minor · Pentatonic major · Pentatonic minor · Modes (Phrygian, …) later.

---

## Suggested implementation order

| Phase | Feature | Why this order |
|-------|---------|----------------|
| **1** | Metronome + progression practice | Completes the progression feature; immediate practice value |
| **2** | Full key scale on fretboard | Reuses pentatonic rendering; pairs with key selector |
| **3** | Pentatonic for all keys | Small extension once scale infra exists |
| **4** | Capo | Needed for realistic song shapes; composes with library |
| **5** | Song library | Depends on stable progression practice + capo + key display |

Phases 2 and 3 could be swapped or done together as one **Scale** refactor.

---

## Other ideas (backlog)

- **Custom progressions** — user-defined degree lists, saved in `localStorage`.
- **Alternate voicings** — multiple chord shapes per `ChordPresetId`.
- **7th / sus chords** — extend chord library for richer songs.
- **Export diagram** as PNG/SVG.
- **Left-handed** string order toggle.
- **Ear training** — hear progression, pick the numerals.

---

## Principles for new work

1. **Compose, don’t fork** — Songs, capo, and practice mode should all feed the same `selectedKey`, chord list, and `Fretboard` props.
2. **Theory in data** — Keep Roman numerals, degrees, and pitch classes in `.ts` modules with build-time validation (like `progressions.ts` today).
3. **Diagram legibility** — Fixed diagram height; width grows with frets; avoid clutter when layering scale + chord.
4. **No scope creep in audio** — Metronome click only for now; no backing tracks or full mixer.

---

## Changelog

| Date | Note |
|------|------|
| 2026-06-11 | JSON Server mock API for user settings (`db/db.json`, port 3001) |
| 2026-06-05 | Initial roadmap: metronome + progressions, song library, capo, full pentatonic, full key scale |
