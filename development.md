# Development roadmap

See [README](README.md) for setup and deploy.

## Current

- Keys, diatonic chords, roman numerals, 192 voicing presets
- Progression builder (8 steps), preset seeds, alt voicings, transpose on key change
- Find key from selected chords
- Known-chords filter and editor
- Fretboard: scales, note names, fret count, portrait/landscape, barre shapes
- Split-panel layout, accent color, mobile-responsive UI
- Dev settings API + cross-tab sync; baked defaults for production
- PWA manifest and app icon (no service worker / offline yet)

---

## Mobile

- Further layout polish (progression alts, touch targets)
- PWA offline via service worker

---

## Play-along

- Step-through progression with highlight
- Play / pause, loop, BPM or metronome
- Guitar audio on chord change
- Auto-advance at tempo

---

## Songs & progressions

- Full song structure (verse, chorus, bridge, …)
- Song library — browse, save, open
- Shareable links (URL-encoded before backend)

---

## Chord diagrams

- Multiple fingerings per chord; pick per step
- Higher-neck positions; capo display

---

## Find key

- Clearer top-match UI
- Capo / shape-chord mode
- Tests for scoring, transpose, roman numerals

---

## Settings & appearance

- Central settings menu
- Full theme / fretboard color picker (light, dark, system)
- Export / import settings JSON
- Left-handed flip; more defaults-on-open options

---

## State & backend

**Today:** GitHub Pages loads baked `siteState.json`. Dev persists to `db/db.json`. Live visitors get full in-session UI; refresh resets to baked defaults.

**Goals:** optional auth, REST API for songs/settings, synced storage across devices.

---

## Suggested order

1. PWA offline + mobile polish
2. Settings menu + full color picker
3. Play-along (highlight → audio → tempo)
4. Find-key UX + capo
5. Alternative fingerings / positions
6. Song model + save in dev DB / site snapshot
7. Backend + library + sync
