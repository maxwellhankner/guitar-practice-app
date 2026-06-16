# Development roadmap

Forward-looking goals for the guitar practice app. See [README](README.md) for setup and deploy.

---

## Mobile

- Responsive layout polish (progression builder, alt options, split panels)
- Touch-friendly controls for progression edit (add, swap, delete)
- PWA: installable, usable offline on phone

---

## Play-along

- Step-through mode: highlight each chord in a progression in order
- Play / pause, loop, optional BPM or metronome
- **Guitar audio** when a chord is active (Web Audio or samples — strum on step change)
- Auto-advance through steps at tempo

---

## Songs & progressions

- **Full song structure** — verse, chorus, bridge, etc., not just one 8-step loop
- **Song library** — browse and open saved songs in one tap
- **Save songs** — name, key, sections, BPM, capo, voicing choices per step
- Shareable links (URL encodes song or progression before backend exists)

---

## Chord diagrams

- **Alternative fingerings** — multiple voicings per chord; pick per progression step
- **Positions** — same chord higher on the neck; sensible defaults per voicing
- Capo display — sounding key vs fretboard shapes; capo marker on diagram

---

## Find key

- Clearer top-match UI (rank, score, visual emphasis)
- Capo / shape-chord mode for real-song input
- Tune scorer on real song fixtures; tighten weak-match cutoff
- Tests for scoring, transpose, and roman-numeral edge cases

---

## Settings & appearance

Central **settings menu** (gear or similar) for prefs that aren’t everyday controls.

**Color picker**

- Theme: page background, card, accent, text/muted
- Fretboard: board wood, frets, strings, finger dots, scale dots, nut
- Chords: selected / in-progression / disabled / foreign-roman highlight
- Light, dark, and system; reset to defaults

**Other settings**

- Defaults on open: fret count, diagram layout, orientation, filter-playable-only
- Fretboard: show note names, scale overlay default, left-handed flip
- Play-along (when built): volume, strum style, metronome click volume
- Export / import settings JSON (backup before backend)

Persist with user state (localStorage → API).

---

## State & backend

**Today:** GitHub Pages static deploy; dev-only json-server for settings (`db/db.json`).

**Goals:**

- Persist **user state** in production — known chords, layout, prefs (localStorage first, then API)
- **Backend** — auth optional at first; REST or similar for songs, settings, library
- **Hosting** — app + API (e.g. Railway, Fly, Render, or VPS); keep static frontend option if useful
- Migrate song library and saves from local-only to synced storage when backend lands

---

## Suggested order

1. Mobile polish + localStorage for settings on the live site  
2. Settings menu + color picker (CSS vars → saved prefs)  
3. Play-along (step highlight → audio → tempo/loop)  
4. Better find-key UX + capo  
5. Alternative fingerings / positions  
6. Full-song progression model + save locally  
7. Backend + song library + sync  
