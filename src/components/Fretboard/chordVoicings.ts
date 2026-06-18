import type { ChordFingering } from './types'

/** One strings + fingers shape per chord preset id (low E to high E). */
export type ChordVoicing = {
  strings: ChordFingering['strings']
  fingers: NonNullable<ChordFingering['fingers']>
}

/** Open and barre shapes — sharp spellings only (A# not Bb, etc.). Grouped by root, then variant. */
export const CHORD_VOICINGS = {
  "A": {
    strings: ['x', 0, 2, 2, 2, 0],
    fingers: [null, null, 1, 2, 3, null],
  },
  "Am": {
    strings: ['x', 0, 2, 2, 1, 0],
    fingers: [null, null, 3, 2, 1, null],
  },
  "Adim": {
    strings: ['x', 0, 1, 2, 1, 'x'],
    fingers: [null, null, 1, 3, 2, null],
  },
  "Adim7": {
    strings: ['x', 0, 1, 2, 1, 2],
    fingers: [null, null, 1, 3, 2, 4],
  },
  "Asus2": {
    strings: ['x', 0, 2, 2, 0, 0],
    fingers: [null, null, 1, 2, null, null],
  },
  "Asus4": {
    strings: ['x', 0, 2, 2, 3, 0],
    fingers: [null, null, 1, 2, 4, null],
  },
  "A7": {
    strings: ['x', 0, 2, 0, 2, 3],
    fingers: [null, null, 1, null, 2, 3],
  },
  "A7sus4": {
    strings: ['x', 0, 2, 0, 3, 0],
    fingers: [null, null, 1, null, 2, null],
  },
  "Amaj7": {
    strings: ['x', 0, 2, 1, 2, 0],
    fingers: [null, null, 2, 1, 3, null],
  },
  "Am7": {
    strings: ['x', 0, 2, 0, 1, 0],
    fingers: [null, null, 2, null, 1, null],
  },
  "Aadd9": {
    strings: ['x', 0, 2, 4, 2, 0],
    fingers: [null, null, 2, 4, 1, null],
  },
  "A6": {
    strings: ['x', 0, 2, 2, 2, 2],
    fingers: [null, null, 1, 2, 3, 4],
  },
  "Am6": {
    strings: ['x', 0, 2, 2, 1, 2],
    fingers: [null, null, 1, 3, 2, 4],
  },
  "A9": {
    strings: ['x', 0, 2, 0, 0, 2],
    fingers: [null, null, 1, null, null, 3],
  },
  "Amaj9": {
    strings: ['x', 0, 2, 1, 0, 2],
    fingers: [null, null, 2, 1, null, 3],
  },
  "Am9": {
    strings: ['x', 0, 2, 0, 0, 2],
    fingers: [null, null, 1, null, null, 3],
  },
  "A#": {
    strings: ['x', 1, 3, 3, 3, 1],
    fingers: [null, 1, 3, 4, 3, 1],
  },
  "A#6": {
    strings: ['x', 1, 3, 3, 3, 3],
    fingers: [null, null, 1, 2, 3, 4],
  },
  "A#7": {
    strings: ['x', 1, 3, 1, 3, 1],
    fingers: [null, 1, 3, 1, 4, 1],
  },
  "A#7sus4": {
    strings: ['x', 1, 3, 1, 4, 1],
    fingers: [null, null, 1, null, 2, null],
  },
  "A#9": {
    strings: ['x', 1, 0, 1, 1, 1],
    fingers: [null, 1, null, 2, 3, 4],
  },
  "A#add9": {
    strings: ['x', 1, 0, 3, 1, 1],
    fingers: [null, 1, null, 4, 2, 3],
  },
  "A#dim": {
    strings: ['x', 1, 2, 3, 2, 'x'],
    fingers: [null, 1, 2, 4, 3, null],
  },
  "A#dim7": {
    strings: ['x', 1, 2, 0, 2, 0],
    fingers: [null, 1, 2, null, 3, null],
  },
  "A#m": {
    strings: ['x', 1, 3, 3, 1, 1],
    fingers: [null, 1, 3, 4, 2, 1],
  },
  "A#m6": {
    strings: ['x', 1, 3, 3, 2, 3],
    fingers: [null, null, 1, 3, 2, 4],
  },
  "A#m7": {
    strings: ['x', 1, 3, 1, 2, 1],
    fingers: [null, 1, 3, 1, 2, 1],
  },
  "A#m9": {
    strings: ['x', 1, 3, 1, 1, 3],
    fingers: [null, null, 1, null, null, 3],
  },
  "A#maj7": {
    strings: ['x', 1, 3, 2, 3, 1],
    fingers: [null, 1, 3, 2, 4, 1],
  },
  "A#maj9": {
    strings: ['x', 1, 3, 2, 1, 3],
    fingers: [null, null, 2, 1, null, 3],
  },
  "A#sus2": {
    strings: ['x', 1, 3, 3, 1, 1],
    fingers: [null, 1, 3, 4, 1, 1],
  },
  "A#sus4": {
    strings: ['x', 1, 3, 3, 4, 1],
    fingers: [null, 1, 2, 3, 4, 1],
  },
  "B": {
    strings: ['x', 2, 4, 4, 4, 2],
    fingers: [null, 1, 3, 4, 3, 1],
  },
  "Bm": {
    strings: ['x', 2, 4, 4, 3, 2],
    fingers: [null, 1, 3, 4, 2, 1],
  },
  "Bdim": {
    strings: ['x', 2, 3, 4, 3, 'x'],
    fingers: [null, 1, 2, 4, 3, null],
  },
  "Bdim7": {
    strings: ['x', 2, 3, 1, 3, 'x'],
    fingers: [null, 1, 3, 1, 4, null],
  },
  "Bsus2": {
    strings: ['x', 2, 4, 4, 2, 2],
    fingers: [null, 1, 3, 4, 1, 1],
  },
  "Bsus4": {
    strings: [2, 2, 4, 4, 5, 2],
    fingers: [1, 1, 2, 3, 4, 1],
  },
  "B7": {
    strings: ['x', 2, 1, 2, 0, 2],
    fingers: [null, 2, 1, 3, null, 4],
  },
  "B7sus4": {
    strings: ['x', 2, 2, 2, 0, 0],
    fingers: [null, 1, 2, 3, null, null],
  },
  "Bmaj7": {
    strings: ['x', 2, 1, 3, 0, 2],
    fingers: [null, 2, 1, 4, null, 3],
  },
  "Bm7": {
    strings: ['x', 2, 0, 2, 0, 2],
    fingers: [null, 1, null, 2, null, 3],
  },
  "Badd9": {
    strings: ['x', 2, 1, 'x', 2, 2],
    fingers: [null, 2, 1, null, 3, 4],
  },
  "B6": {
    strings: ['x', 2, 1, 1, 0, 'x'],
    fingers: [null, 3, 1, 2, null, null],
  },
  "Bm6": {
    strings: [2, 2, 0, 1, 0, 2],
    fingers: [2, 3, null, 1, null, 4],
  },
  "B9": {
    strings: ['x', 2, 1, 2, 2, 2],
    fingers: [null, 2, 1, 3, 3, 4],
  },
  "Bmaj9": {
    strings: [2, 2, 1, 3, 2, 'x'],
    fingers: [2, 2, 1, 4, 3, null],
  },
  "Bm9": {
    strings: ['x', 2, 0, 2, 2, 2],
    fingers: [null, 1, null, 2, 3, 4],
  },
  "C": {
    strings: ['x', 3, 2, 0, 1, 0],
    fingers: [null, 3, 2, null, 1, null],
  },
  "Cm": {
    strings: ['x', 3, 1, 0, 1, 3],
    fingers: [null, 3, 2, null, 1, 4],
  },
  "Cdim": {
    strings: ['x', 3, 4, 5, 4, 'x'],
    fingers: [null, 1, 2, 3, 4, null],
  },
  "Cdim7": {
    strings: ['x', 'x', 1, 2, 1, 2],
    fingers: [null, null, 1, 3, 2, 4],
  },
  "Csus2": {
    strings: ['x', 3, 0, 0, 1, 'x'],
    fingers: [null, 3, null, null, 1, null],
  },
  "Csus4": {
    strings: ['x', 3, 3, 0, 1, 'x'],
    fingers: [null, 3, 4, null, 1, null],
  },
  "C7": {
    strings: ['x', 3, 2, 3, 1, 0],
    fingers: [null, 3, 2, 4, 1, null],
  },
  "C7sus4": {
    strings: ['x', 3, 3, 3, 1, 1],
    fingers: [null, 1, 2, 3, 1, 1],
  },
  "Cmaj7": {
    strings: ['x', 3, 2, 0, 0, 0],
    fingers: [null, 3, 2, null, null, null],
  },
  "Cm7": {
    strings: ['x', 3, 5, 3, 4, 3],
    fingers: [null, 1, 3, 1, 2, 1],
  },
  "Cadd9": {
    strings: ['x', 3, 2, 0, 3, 3],
    fingers: [null, 3, 2, null, 1, 4],
  },
  "C6": {
    strings: ['x', 3, 2, 2, 1, 0],
    fingers: [null, 3, 2, 2, 1, null],
  },
  "Cm6": {
    strings: ['x', 3, 2, 2, 1, 3],
    fingers: [null, 3, 2, 2, 1, 4],
  },
  "C9": {
    strings: ['x', 3, 2, 3, 3, 3],
    fingers: [null, 1, 2, 3, 4, 4],
  },
  "Cmaj9": {
    strings: ['x', 3, 0, 0, 0, 0],
    fingers: [null, 3, null, null, null, null],
  },
  "Cm9": {
    strings: ['x', 3, 1, 3, 3, 3],
    fingers: [null, 2, 1, 3, 4, 4],
  },
  "C#": {
    strings: ['x', 4, 3, 1, 2, 1],
    fingers: [null, 4, 3, 1, 2, 1],
  },
  "C#6": {
    strings: ['x', 4, 3, 3, 2, 'x'],
    fingers: [null, 4, 2, 3, 1, null],
  },
  "C#7": {
    strings: ['x', 4, 3, 4, 2, 'x'],
    fingers: [null, 3, 2, 4, 1, null],
  },
  "C#7sus4": {
    strings: ['x', 4, 4, 4, 2, 2],
    fingers: [null, 2, 3, 4, 1, 1],
  },
  "C#9": {
    strings: [4, 4, 3, 4, 4, 4],
    fingers: [2, 2, 1, 3, 3, 4],
  },
  "C#add9": {
    strings: ['x', 4, 3, 1, 4, 4],
    fingers: [null, 4, 3, 1, 2, 1],
  },
  "C#dim": {
    strings: ['x', 4, 5, 6, 5, 'x'],
    fingers: [null, 1, 2, 4, 3, null],
  },
  "C#dim7": {
    strings: ['x', 'x', 2, 3, 2, 3],
    fingers: [null, null, 1, 3, 2, 4],
  },
  "C#m": {
    strings: ['x', 4, 2, 1, 2, 'x'],
    fingers: [null, 4, 2, 1, 3, null],
  },
  "C#m6": {
    strings: ['x', 4, 2, 3, 2, 4],
    fingers: [null, 3, 1, 2, 1, 4],
  },
  "C#m7": {
    strings: ['x', 4, 2, 4, 'x', 4],
    fingers: [null, 2, 1, 3, null, 4],
  },
  "C#m9": {
    strings: ['x', 4, 2, 4, 4, 4],
    fingers: [null, 2, 1, 3, 4, 4],
  },
  "C#maj7": {
    strings: ['x', 4, 3, 1, 1, 1],
    fingers: [null, 4, 3, 1, 1, 1],
  },
  "C#maj9": {
    strings: ['x', 4, 1, 1, 1, 1],
    fingers: [null, 4, 1, 1, 1, 1],
  },
  "C#sus2": {
    strings: ['x', 4, 1, 1, 2, 'x'],
    fingers: [null, 4, 1, 1, 2, null],
  },
  "C#sus4": {
    strings: ['x', 4, 4, 1, 2, 'x'],
    fingers: [null, 3, 4, 1, 2, null],
  },
  "D": {
    strings: ['x', 'x', 0, 2, 3, 2],
    fingers: [null, null, null, 1, 3, 2],
  },
  "Dm": {
    strings: ['x', 'x', 0, 2, 3, 1],
    fingers: [null, null, null, 2, 3, 1],
  },
  "Ddim": {
    strings: ['x', 'x', 0, 1, 3, 1],
    fingers: [null, null, null, 1, 3, 1],
  },
  "Ddim7": {
    strings: ['x', 'x', 0, 1, 0, 1],
    fingers: [null, null, null, 2, null, 3],
  },
  "Dsus2": {
    strings: ['x', 'x', 0, 2, 3, 0],
    fingers: [null, null, null, 1, 3, null],
  },
  "Dsus4": {
    strings: ['x', 'x', 0, 2, 3, 3],
    fingers: [null, null, null, 1, 3, 4],
  },
  "D7": {
    strings: ['x', 'x', 0, 2, 1, 2],
    fingers: [null, null, null, 2, 1, 3],
  },
  "D7sus4": {
    strings: ['x', 'x', 0, 2, 1, 3],
    fingers: [null, null, null, 2, 1, 4],
  },
  "Dmaj7": {
    strings: ['x', 'x', 0, 2, 2, 2],
    fingers: [null, null, null, 1, 1, 1],
  },
  "Dm7": {
    strings: ['x', 'x', 0, 2, 1, 1],
    fingers: [null, null, null, 2, 1, 1],
  },
  "Dadd9": {
    strings: ['x', 'x', 0, 2, 3, 0],
    fingers: [null, null, null, 1, 3, null],
  },
  "D6": {
    strings: ['x', 'x', 0, 2, 0, 2],
    fingers: [null, null, null, 1, null, 2],
  },
  "Dm6": {
    strings: ['x', 'x', 0, 2, 0, 1],
    fingers: [null, null, null, 2, null, 1],
  },
  "D9": {
    strings: ['x', 'x', 0, 2, 1, 0],
    fingers: [null, null, null, 2, 1, null],
  },
  "Dmaj9": {
    strings: ['x', 'x', 0, 2, 2, 0],
    fingers: [null, null, null, 2, 1, null],
  },
  "Dm9": {
    strings: ['x', 'x', 0, 2, 1, 0],
    fingers: [null, null, null, 2, 1, null],
  },
  "D#": {
    strings: ['x', 'x', 1, 3, 4, 3],
    fingers: [null, null, 1, 2, 4, 3],
  },
  "D#6": {
    strings: ['x', 'x', 1, 3, 1, 3],
    fingers: [null, null, 1, 3, 1, 4],
  },
  "D#7": {
    strings: ['x', 'x', 1, 3, 2, 3],
    fingers: [null, null, 1, 3, 2, 4],
  },
  "D#7sus4": {
    strings: ['x', 'x', 1, 3, 2, 4],
    fingers: [null, null, 1, 3, 2, 4],
  },
  "D#9": {
    strings: ['x', 'x', 1, 0, 2, 1],
    fingers: [null, null, 1, null, 3, 2],
  },
  "D#add9": {
    strings: ['x', 'x', 1, 3, 4, 1],
    fingers: [null, null, 1, 3, 4, 1],
  },
  "D#dim": {
    strings: ['x', 6, 4, 'x', 4, 5],
    fingers: [null, 4, 1, null, 2, 3],
  },
  "D#dim7": {
    strings: ['x', 'x', 1, 2, 1, 2],
    fingers: [null, null, 1, 3, 2, 4],
  },
  "D#m": {
    strings: ['x', 'x', 4, 3, 4, 2],
    fingers: [null, null, 3, 2, 4, 1],
  },
  "D#m6": {
    strings: ['x', 1, 1, 3, 1, 2],
    fingers: [null, 1, 1, 3, 1, 2],
  },
  "D#m7": {
    strings: ['x', 'x', 1, 3, 2, 2],
    fingers: [null, null, 1, 4, 2, 3],
  },
  "D#m9": {
    strings: ['x', 6, 4, 6, 6, 6],
    fingers: [null, 2, 1, 3, 4, 4],
  },
  "D#maj7": {
    strings: ['x', 'x', 1, 0, 3, 3],
    fingers: [null, null, 1, null, 3, 4],
  },
  "D#maj9": {
    strings: ['x', 6, 3, 3, 3, 3],
    fingers: [null, 4, 1, 1, 1, 1],
  },
  "D#sus2": {
    strings: [1, 1, 1, 3, 4, 1],
    fingers: [1, 1, 1, 3, 4, 1],
  },
  "D#sus4": {
    strings: ['x', 'x', 1, 3, 4, 4],
    fingers: [null, null, 1, 3, 4, 4],
  },
  "E": {
    strings: [0, 2, 2, 1, 0, 0],
    fingers: [null, 2, 3, 1, null, null],
  },
  "Em": {
    strings: [0, 2, 2, 0, 0, 0],
    fingers: [null, 2, 3, null, null, null],
  },
  "Edim": {
    strings: ['x', 7, 5, 'x', 5, 6],
    fingers: [null, 4, 1, null, 2, 3],
  },
  "Edim7": {
    strings: [0, 1, 2, 0, 2, 0],
    fingers: [null, 1, 2, null, 3, null],
  },
  "Esus2": {
    strings: [0, 2, 4, 4, 0, 0],
    fingers: [null, 1, 3, 4, null, null],
  },
  "Esus4": {
    strings: [0, 2, 2, 2, 0, 0],
    fingers: [null, 1, 2, 3, null, null],
  },
  "E7": {
    strings: [0, 2, 0, 1, 0, 0],
    fingers: [null, 2, null, 1, null, null],
  },
  "E7sus4": {
    strings: [0, 2, 0, 2, 0, 0],
    fingers: [null, 1, null, 2, null, null],
  },
  "Emaj7": {
    strings: [0, 2, 1, 1, 0, 0],
    fingers: [null, 3, 1, 2, null, null],
  },
  "Em7": {
    strings: [0, 2, 2, 0, 3, 0],
    fingers: [null, 1, 2, null, 3, null],
  },
  "Eadd9": {
    strings: [0, 2, 2, 1, 0, 0],
    fingers: [null, 1, 2, 3, null, null],
  },
  "E6": {
    strings: [0, 2, 2, 1, 2, 0],
    fingers: [null, 1, 3, 1, 2, null],
  },
  "Em6": {
    strings: [0, 2, 2, 0, 2, 0],
    fingers: [null, 1, 3, null, 2, null],
  },
  "E9": {
    strings: [0, 2, 0, 1, 0, 2],
    fingers: [null, 1, null, 2, null, 3],
  },
  "Emaj9": {
    strings: [0, 2, 1, 1, 0, 2],
    fingers: [null, 2, 1, 1, null, 3],
  },
  "Em9": {
    strings: [0, 2, 0, 0, 0, 2],
    fingers: [null, 1, null, null, null, 3],
  },
  "F": {
    strings: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
  },
  "Fm": {
    strings: [1, 3, 3, 1, 1, 1],
    fingers: [1, 3, 4, 1, 1, 1],
  },
  "Fdim": {
    strings: ['x', 8, 9, 10, 9, 'x'],
    fingers: [null, 1, 2, 4, 3, null],
  },
  "Fdim7": {
    strings: ['x', 'x', 3, 4, 3, 4],
    fingers: [null, null, 1, 3, 1, 4],
  },
  "Fsus2": {
    strings: [1, 3, 3, 0, 'x', 'x'],
    fingers: [1, 3, 4, null, null, null],
  },
  "Fsus4": {
    strings: [1, 1, 3, 3, 1, 1],
    fingers: [1, 1, 3, 4, 1, 1],
  },
  "F7": {
    strings: [1, 3, 1, 2, 1, 1],
    fingers: [1, 3, 1, 2, 1, 1],
  },
  "F7sus4": {
    strings: ['x', 'x', 3, 3, 1, 1],
    fingers: [null, null, 1, 2, 1, 1],
  },
  "Fmaj7": {
    strings: [1, 3, 2, 2, 1, 1],
    fingers: [1, 4, 2, 3, 1, 1],
  },
  "Fm7": {
    strings: [1, 3, 1, 1, 1, 1],
    fingers: [1, 3, 1, 1, 1, 1],
  },
  "Fadd9": {
    strings: ['x', 'x', 3, 2, 1, 3],
    fingers: [null, null, 3, 2, 1, 4],
  },
  "F6": {
    strings: ['x', 'x', 3, 2, 1, 1],
    fingers: [null, null, 3, 2, 1, 1],
  },
  "Fm6": {
    strings: ['x', 'x', 3, 2, 1, 0],
    fingers: [null, null, 3, 2, 1, null],
  },
  "F9": {
    strings: ['x', 'x', 3, 2, 1, 3],
    fingers: [null, null, 3, 2, 1, 4],
  },
  "Fmaj9": {
    strings: [1, 0, 2, 0, 1, 0],
    fingers: [1, null, 3, null, 2, null],
  },
  "Fm9": {
    strings: [1, 3, 1, 1, 1, 3],
    fingers: [1, 3, 1, 1, 1, 4],
  },
  "F#": {
    strings: [2, 4, 4, 3, 2, 2],
    fingers: [1, 3, 4, 2, 1, 1],
  },
  "F#6": {
    strings: ['x', 4, 4, 6, 4, 6],
    fingers: [null, 1, 1, 3, 1, 4],
  },
  "F#7": {
    strings: [2, 4, 2, 3, 2, 2],
    fingers: [1, 3, 1, 2, 1, 1],
  },
  "F#7sus4": {
    strings: [2, 4, 2, 4, 2, 2],
    fingers: [1, 3, 1, 4, 1, 1],
  },
  "F#9": {
    strings: [2, 4, 2, 3, 2, 4],
    fingers: [1, 3, 1, 2, 1, 4],
  },
  "F#add9": {
    strings: [2, 4, 4, 3, 2, 2],
    fingers: [1, 3, 4, 2, 1, 1],
  },
  "F#dim": {
    strings: [2, 0, 'x', 2, 1, 'x'],
    fingers: [2, null, null, 3, 1, null],
  },
  "F#dim7": {
    strings: [2, 3, 4, 2, 4, 2],
    fingers: [1, 2, 3, 1, 4, 1],
  },
  "F#m": {
    strings: ['x', 2, 4, 4, 2, 2],
    fingers: [null, 1, 3, 4, 2, 1],
  },
  "F#m6": {
    strings: ['x', 4, 4, 6, 4, 5],
    fingers: [null, 1, 1, 3, 1, 2],
  },
  "F#m7": {
    strings: [2, 4, 2, 2, 2, 2],
    fingers: [1, 3, 1, 1, 1, 1],
  },
  "F#m9": {
    strings: [2, 0, 2, 1, 2, 0],
    fingers: [2, null, 3, 1, 4, null],
  },
  "F#maj7": {
    strings: [2, 4, 3, 3, 2, 2],
    fingers: [1, 4, 2, 3, 1, 1],
  },
  "F#maj9": {
    strings: [2, 1, 3, 1, 2, 1],
    fingers: [2, 1, 4, 1, 3, 1],
  },
  "F#sus2": {
    strings: [2, 4, 4, 'x', 2, 4],
    fingers: [1, 2, 3, null, 1, 4],
  },
  "F#sus4": {
    strings: [2, 2, 4, 4, 2, 2],
    fingers: [1, 1, 3, 4, 1, 1],
  },
  "G": {
    strings: [3, 2, 0, 0, 0, 3],
    fingers: [3, 2, null, null, null, 4],
  },
  "Gm": {
    strings: [3, 1, 0, 0, 3, 3],
    fingers: [2, 1, null, null, 3, 4],
  },
  "Gdim": {
    strings: [3, 1, 'x', 3, 2, 'x'],
    fingers: [3, 1, null, 4, 2, null],
  },
  "Gdim7": {
    strings: [3, 4, 5, 3, 5, 3],
    fingers: [1, 2, 3, 1, 4, 1],
  },
  "Gsus2": {
    strings: [3, 0, 0, 0, 3, 3],
    fingers: [2, null, null, null, 3, 4],
  },
  "Gsus4": {
    strings: [3, 'x', 0, 0, 1, 3],
    fingers: [3, null, null, null, 1, 4],
  },
  "G7": {
    strings: [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, null, null, null, 1],
  },
  "G7sus4": {
    strings: [3, 3, 0, 0, 1, 1],
    fingers: [3, 4, null, null, 1, 1],
  },
  "Gmaj7": {
    strings: [3, 2, 0, 0, 0, 2],
    fingers: [3, 2, null, null, null, 1],
  },
  "Gm7": {
    strings: [3, 5, 3, 3, 3, 3],
    fingers: [1, 3, 1, 1, 1, 1],
  },
  "Gadd9": {
    strings: [3, 2, 0, 2, 0, 3],
    fingers: [3, 2, null, 1, null, 4],
  },
  "G6": {
    strings: [3, 2, 0, 0, 0, 0],
    fingers: [2, 1, null, null, null, null],
  },
  "Gm6": {
    strings: [3, 5, 5, 3, 5, 3],
    fingers: [1, 2, 3, 1, 4, 1],
  },
  "G9": {
    strings: [3, 2, 0, 2, 0, 2],
    fingers: [2, 1, null, 3, null, 4],
  },
  "Gmaj9": {
    strings: [3, 2, 0, 2, 0, 2],
    fingers: [3, 2, null, 1, null, 4],
  },
  "Gm9": {
    strings: [3, 0, 0, 3, 3, 1],
    fingers: [2, null, null, 3, 4, 1],
  },
  "G#": {
    strings: [4, 3, 1, 1, 1, 'x'],
    fingers: [3, 2, 1, 1, 1, null],
  },
  "G#6": {
    strings: ['x', 3, 1, 1, 1, 1],
    fingers: [null, 3, 1, 1, 1, 1],
  },
  "G#7": {
    strings: ['x', 'x', 1, 1, 1, 2],
    fingers: [null, null, 1, 1, 1, 2],
  },
  "G#7sus4": {
    strings: ['x', 'x', 1, 1, 2, 2],
    fingers: [null, null, 1, 1, 2, 2],
  },
  "G#9": {
    strings: [4, 3, 4, 3, 4, 'x'],
    fingers: [2, 1, 3, 1, 4, null],
  },
  "G#add9": {
    strings: [4, 3, 1, 3, 1, 4],
    fingers: [4, 3, 1, 2, 1, 4],
  },
  "G#dim": {
    strings: [4, 2, 'x', 4, 3, 'x'],
    fingers: [3, 1, null, 4, 2, null],
  },
  "G#dim7": {
    strings: ['x', 'x', 0, 1, 0, 1],
    fingers: [null, null, null, 1, null, 2],
  },
  "G#m": {
    strings: [4, 6, 6, 4, 4, 4],
    fingers: [1, 3, 4, 1, 1, 1],
  },
  "G#m6": {
    strings: [4, 6, 6, 4, 6, 4],
    fingers: [1, 2, 3, 1, 4, 1],
  },
  "G#m7": {
    strings: [4, 6, 4, 4, 4, 4],
    fingers: [1, 3, 1, 1, 1, 1],
  },
  "G#m9": {
    strings: [4, 1, 1, 1, 0, 2],
    fingers: [4, 1, 1, 2, null, 3],
  },
  "G#maj7": {
    strings: [4, 6, 5, 5, 4, 4],
    fingers: [1, 4, 2, 3, 1, 1],
  },
  "G#maj9": {
    strings: ['x', 1, 1, 1, 1, 3],
    fingers: [null, 1, 1, 1, 1, 4],
  },
  "G#sus2": {
    strings: [4, 1, 1, 1, 'x', 'x'],
    fingers: [4, 1, 1, 1, null, null],
  },
  "G#sus4": {
    strings: ['x', 'x', 1, 1, 2, 4],
    fingers: [null, null, 1, 1, 2, 4],
  }
} as const satisfies Record<string, ChordVoicing>

export type ChordVoicingId = keyof typeof CHORD_VOICINGS
