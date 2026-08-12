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

## Pitch & ear

- Hum or sing into the mic; app identifies the notes just hummed (melody capture / note readout)
- Build on existing tuner pitch detection

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

## Guitar learning concepts

Reference map of how guitar curricula are usually organized — language, charts, and techniques to keep in mind when designing features. Not a build checklist; product context.

### The three hats

Almost every roadmap treats guitar as **harmony + melody + rhythm**:

- **Harmony** — chords, progressions, keys
- **Melody** — single notes, scales, riffs, solos
- **Rhythm** — strumming, timing, groove

This app is strong on harmony and has some melody (fretboard / scales). Rhythm is starting (strum arrows) but is usually its own learning track.

### Typical learning stages

1. **Setup & mechanics** — tuning, holding the guitar, clean fretting, chord switches
2. **Open chords + songs** — G C D A E Em Am Dm; play real tunes ASAP
3. **Rhythm** — downstrokes → down-up → common patterns (e.g. DDUUDU); muting; dynamics
4. **Progressions in a key** — I–IV–V, I–V–vi–IV, vi–IV–I–V; think in **numbers**, not only letter names
5. **Barre / movable shapes** — F, Bm, then any major/minor anywhere
6. **Color / embellishments** — 7, maj7, m7, sus2/sus4, add9, power chords (5)
7. **Melody on the neck** — pentatonic boxes → major/minor scales → connecting shapes
8. **Fretboard systems** — CAGED, chord tones, arpeggios
9. **Ear & style** — play by ear, blues/rock/folk feels, basic improvisation
10. **Deeper harmony** — modes, secondary dominants, slash chords, key changes

JustinGuitar-style grades roughly mirror this: Grade 1 songs + open chords; Grade 2 F / 7ths / power / fingerpicking; Grade 3 rhythm + ear + theory readiness.

### Charts and visual systems

- **Circle of fifths** — the round wheel. Adjacent keys are closely related; clockwise = +1 sharp, counterclockwise = +1 flat; outer = major, often inner = relative minor. Used for keys, transposition, “what chords fit,” and modulation.
- **Diatonic chord chart** — in any major key: I ii iii IV V vi vii° (already core to the app).
- **Nashville Number System** — same idea as Roman numerals but with `1 4 5 6-` for gig charts; built for fast transposition.
- **CAGED** — five open shapes (C A G E D) moved up the neck; maps chords ↔ scales ↔ arpeggios by position. Big intermediate concept.
- **Pentatonic box chart** — five connected “boxes” for soloing (often the first lead framework people learn).
- **Fretboard note map** — especially open strings + 3/5/7/12 fret landmarks.
- **Chord formula charts** — major = 1–3–5, minor = 1–♭3–5, 7 = 1–3–5–♭7, etc.
- **Capo chart** — same shapes, different sounding key (huge for singers).
- **12-bar blues form** — I–I–I–I / IV–IV–I–I / V–IV–I–V (structure, not just chords).

### Language and terms

**Pitch & neck:** chromatic, enharmonic (F♯/G♭), octave, interval (3rd, 5th, octave), root, open string, fret, barre, capo, voicing, inversion, slash chord (G/B).

**Scales & keys:** major / natural minor, relative major/minor, parallel minor, key signature, whole step / half step, tonic, pentatonic, blues scale, mode (Ionian, Dorian, Mixolydian…), accidental (♯ ♭ ♮).

**Chords:** triad, quality (maj/min/dim/aug), extension (7, 9, 11, 13), alteration (♭9, ♯11), sus, add, power chord (5), diatonic vs non-diatonic (“out of key”), secondary dominant (V of V), borrowed chord.

**Progressions / form:** Roman numerals / Nashville numbers, cadence (authentic V→I, plagal IV→I), turnaround, verse/chorus/bridge, bar/measure, time signature (4/4, 3/4, 6/8), pickup.

**Rhythm guitar:** downstroke/upstroke, alternate strumming, syncopation, ghost strum / missed stroke, palm mute, accent, BPM, metronome subdivisions (quarters, eighths, sixteenths), swing vs straight.

**Lead ideas:** chord tones / target tones, arpeggio, lick, phrase, bend, hammer-on, pull-off, slide, vibrato, position playing.

**Practice language:** muscle memory, economy of motion, tempo ladders, isolation practice, ear training, transcription.

### Technique modules

Open chords · chord changes · strumming · fingerpicking / Travis picking · barre chords · power chords · riffs · pentatonic soloing · hybrid picking · basic improvisation over a vamp · playing with a metronome / backing track.

### Gaps relative to this app

Already covered a lot of **harmony UI**: keys, diatonic slots, Romans, progressions, songs, some color chords, scale overlays, known-chords, tuner.

Big roadmap areas that are thin or missing as product ideas:

1. **Rhythm as a first-class skill** (timing, subdivisions, metronome, feel)
2. **Circle of fifths** as a learner mental model (and possibly a UI)
3. **Capo / singer-key** workflow
4. **Barre / CAGED movable shapes** (neck geography beyond open shapes)
5. **Chord tones vs scale tones** (why solos sound “in”)
6. **Ear training** (hear I–IV–V, major vs minor)
7. **Song form** (verse/chorus, 12-bar) not just a chord loop
8. **Technique vocabulary** (hammer-ons, muting, etc.) even without animation
9. **Nashville numbers** as the working-musician twin of Romans
10. **Practice pedagogy** (slow → accurate → tempo up) as an explicit mode

Shared mental model across most beginner→intermediate roadmaps: **numbers + keys + rhythm + a map of the neck (CAGED / circle of fifths)**.

---

## Suggested order

1. PWA offline + mobile polish
2. Settings menu + full color picker
3. Play-along (highlight → audio → tempo)
4. Find-key UX + capo
5. Alternative fingerings / positions
6. Song model + save in dev DB / site snapshot
7. Backend + library + sync
