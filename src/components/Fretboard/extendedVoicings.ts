import type { ChordFingering } from './types'

export type ExtendedVoicing = {
  strings: ChordFingering['strings']
  fingers: NonNullable<ChordFingering['fingers']>
}

export const EXTENDED_VOICINGS = {
  'A#7': {
    strings: ['x', 1, 3, 1, 3, 1],
    fingers: [null, 1, 3, 1, 4, 1],
  },
  'A#dim': {
    strings: ['x', 1, 2, 3, 2, 'x'],
    fingers: [null, 1, 2, 4, 3, null],
  },
  'A#m7': {
    strings: ['x', 1, 3, 1, 2, 1],
    fingers: [null, 1, 3, 1, 2, 1],
  },
  'A#maj7': {
    strings: ['x', 1, 3, 2, 3, 1],
    fingers: [null, 1, 3, 2, 4, 1],
  },
  'A#sus2': {
    strings: ['x', 1, 3, 3, 1, 1],
    fingers: [null, 1, 3, 4, 1, 1],
  },
  'A#sus4': {
    strings: ['x', 1, 3, 3, 4, 'x'],
    fingers: [null, 1, 3, 3, 4, null],
  },
  'A7': {
    strings: ['x', 0, 2, 0, 2, 3],
    fingers: [null, null, 1, null, 2, 3],
  },
  'Adim': {
    strings: ['x', 0, 1, 2, 1, 'x'],
    fingers: [null, null, 1, 3, 2, null],
  },
  'Am7': {
    strings: ['x', 0, 2, 0, 1, 0],
    fingers: [null, null, 2, null, 1, null],
  },
  'Amaj7': {
    strings: ['x', 0, 2, 1, 2, 0],
    fingers: [null, null, 2, 1, 3, null],
  },
  'Asus2': {
    strings: ['x', 0, 2, 2, 0, 0],
    fingers: [null, null, 1, 2, null, null],
  },
  'Asus4': {
    strings: ['x', 0, 2, 2, 3, 0],
    fingers: [null, null, 1, 2, 4, null],
  },
  'B7': {
    strings: ['x', 2, 1, 2, 0, 2],
    fingers: [null, 2, 1, 3, null, 4],
  },
  'Bdim': {
    strings: ['x', 2, 3, 4, 3, 'x'],
    fingers: [null, 1, 2, 4, 3, null],
  },
  'Bm7': {
    strings: ['x', 2, 0, 2, 0, 2],
    fingers: [null, 1, null, 2, null, 3],
  },
  'Bmaj7': {
    strings: ['x', 2, 1, 3, 0, 2],
    fingers: [null, 2, 1, 4, null, 3],
  },
  'Bsus2': {
    strings: ['x', 2, 4, 4, 2, 2],
    fingers: [null, 1, 3, 4, 1, 1],
  },
  'Bsus4': {
    strings: ['x', 2, 4, 4, 5, 'x'],
    fingers: [null, 1, 3, 3, 4, null],
  },
  'C#7': {
    strings: ['x', 4, 3, 4, 'x', 4],
    fingers: [null, 2, 1, 3, null, 4],
  },
  'C#dim': {
    strings: ['x', 4, 5, 6, 5, 'x'],
    fingers: [null, 1, 2, 4, 3, null],
  },
  'C#m7': {
    strings: ['x', 4, 2, 4, 'x', 4],
    fingers: [null, 2, 1, 3, null, 4],
  },
  'C#maj7': {
    strings: ['x', 4, 3, 1, 1, 1],
    fingers: [null, 4, 3, 1, 1, 1],
  },
  'C#sus2': {
    strings: ['x', 4, 1, 1, 2, 'x'],
    fingers: [null, 4, 1, 1, 2, null],
  },
  'C#sus4': {
    strings: ['x', 4, 4, 'x', 4, 4],
    fingers: [null, 1, 2, null, 3, 4],
  },
  'C7': {
    strings: ['x', 3, 2, 3, 1, 0],
    fingers: [null, 3, 2, 4, 1, null],
  },
  'Cdim': {
    strings: ['x', 3, 4, 5, 4, 'x'],
    fingers: [null, 1, 2, 3, 4, null],
  },
  'Cm7': {
    strings: ['x', 3, 5, 3, 4, 3],
    fingers: [null, 1, 3, 1, 2, 1],
  },
  'Cmaj7': {
    strings: ['x', 3, 2, 0, 0, 0],
    fingers: [null, 3, 2, null, null, null],
  },
  'Csus2': {
    strings: ['x', 3, 0, 0, 1, 'x'],
    fingers: [null, 3, null, null, 1, null],
  },
  'Csus4': {
    strings: ['x', 3, 3, 0, 1, 'x'],
    fingers: [null, 3, 4, null, 1, null],
  },
  'D#7': {
    strings: ['x', 'x', 1, 3, 2, 3],
    fingers: [null, null, 1, 3, 2, 4],
  },
  'D#dim': {
    strings: ['x', 6, 7, 8, 7, 'x'],
    fingers: [null, 1, 2, 4, 3, null],
  },
  'D#m7': {
    strings: ['x', 'x', 1, 3, 2, 2],
    fingers: [null, null, 1, 4, 2, 3],
  },
  'D#maj7': {
    strings: ['x', 'x', 1, 0, 3, 3],
    fingers: [null, null, 1, null, 3, 4],
  },
  'D#sus2': {
    strings: ['x', 'x', 1, 3, 4, 1],
    fingers: [null, null, 1, 3, 4, 1],
  },
  'D#sus4': {
    strings: ['x', 'x', 1, 3, 4, 4],
    fingers: [null, null, 1, 3, 4, 4],
  },
  'D7': {
    strings: ['x', 'x', 0, 2, 1, 2],
    fingers: [null, null, null, 2, 1, 3],
  },
  'Ddim': {
    strings: ['x', 5, 6, 7, 6, 'x'],
    fingers: [null, 1, 2, 4, 3, null],
  },
  'Dm7': {
    strings: ['x', 'x', 0, 2, 1, 1],
    fingers: [null, null, null, 2, 1, 1],
  },
  'Dmaj7': {
    strings: ['x', 'x', 0, 2, 2, 2],
    fingers: [null, null, null, 1, 1, 1],
  },
  'Dsus2': {
    strings: ['x', 'x', 0, 2, 3, 0],
    fingers: [null, null, null, 1, 3, null],
  },
  'Dsus4': {
    strings: ['x', 'x', 0, 2, 3, 3],
    fingers: [null, null, null, 1, 3, 4],
  },
  'E7': {
    strings: [0, 2, 2, 1, 3, 0],
    fingers: [null, 2, 3, 1, 4, null],
  },
  'Edim': {
    strings: ['x', 7, 8, 9, 8, 'x'],
    fingers: [null, 1, 2, 4, 3, null],
  },
  'Em7': {
    strings: [0, 2, 2, 0, 3, 0],
    fingers: [null, 1, 2, null, 3, null],
  },
  'Emaj7': {
    strings: [0, 2, 1, 1, 0, 0],
    fingers: [null, 3, 1, 2, null, null],
  },
  'Esus2': {
    strings: [0, 2, 4, 4, 0, 0],
    fingers: [null, 1, 3, 4, null, null],
  },
  'Esus4': {
    strings: [0, 2, 2, 2, 0, 0],
    fingers: [null, 1, 2, 3, null, null],
  },
  'F#7': {
    strings: [2, 4, 2, 3, 5, 2],
    fingers: [1, 3, 1, 2, 4, 1],
  },
  'F#dim': {
    strings: ['x', 9, 10, 11, 10, 'x'],
    fingers: [null, 1, 2, 4, 3, null],
  },
  'F#m7': {
    strings: [2, 4, 2, 2, 2, 2],
    fingers: [1, 3, 1, 1, 1, 1],
  },
  'F#maj7': {
    strings: [2, 4, 3, 3, 2, 2],
    fingers: [1, 4, 2, 3, 1, 1],
  },
  'F#sus2': {
    strings: [2, 4, 4, 'x', 2, 4],
    fingers: [1, 2, 3, null, 1, 4],
  },
  'F#sus4': {
    strings: [2, 2, 4, 4, 2, 2],
    fingers: [1, 1, 3, 4, 1, 1],
  },
  'F7': {
    strings: [1, 3, 1, 2, 4, 1],
    fingers: [1, 3, 1, 2, 4, 1],
  },
  'Fdim': {
    strings: ['x', 8, 9, 10, 9, 'x'],
    fingers: [null, 1, 2, 4, 3, null],
  },
  'Fm7': {
    strings: [1, 3, 1, 1, 1, 1],
    fingers: [1, 3, 1, 1, 1, 1],
  },
  'Fmaj7': {
    strings: [1, 3, 2, 2, 1, 1],
    fingers: [1, 4, 2, 3, 1, 1],
  },
  'Fsus2': {
    strings: [1, 3, 3, 0, 'x', 'x'],
    fingers: [1, 3, 4, null, null, null],
  },
  'Fsus4': {
    strings: [1, 1, 3, 3, 1, 1],
    fingers: [1, 1, 3, 4, 1, 1],
  },
  'G#7': {
    strings: ['x', 'x', 'x', 1, 1, 2],
    fingers: [null, null, null, 1, 1, 2],
  },
  'G#dim': {
    strings: ['x', 11, 12, 13, 12, 'x'],
    fingers: [null, 1, 2, 4, 3, null],
  },
  'G#m7': {
    strings: ['x', 'x', 'x', 1, 0, 2],
    fingers: [null, null, null, 1, null, 3],
  },
  'G#maj7': {
    strings: ['x', 'x', 'x', 1, 1, 3],
    fingers: [null, null, null, 1, 1, 3],
  },
  'G#sus2': {
    strings: [4, 1, 1, 1, 'x', 'x'],
    fingers: [4, 1, 1, 1, null, null],
  },
  'G#sus4': {
    strings: [4, 4, 6, 6, 4, 4],
    fingers: [1, 1, 3, 4, 1, 1],
  },
  'G7': {
    strings: [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, null, null, null, 1],
  },
  'Gdim': {
    strings: ['x', 10, 11, 12, 11, 'x'],
    fingers: [null, 1, 2, 4, 3, null],
  },
  'Gm7': {
    strings: [3, 5, 3, 3, 3, 3],
    fingers: [1, 3, 1, 1, 1, 1],
  },
  'Gmaj7': {
    strings: [3, 5, 4, 4, 3, 3],
    fingers: [1, 4, 2, 3, 1, 1],
  },
  'Gsus2': {
    strings: [3, 0, 0, 0, 3, 3],
    fingers: [2, null, null, null, 3, 4],
  },
  'Gsus4': {
    strings: [3, 3, 0, 0, 3, 3],
    fingers: [1, 2, null, null, 3, 4],
  },
} as const satisfies Record<string, ExtendedVoicing>

export type ExtendedVoicingId = keyof typeof EXTENDED_VOICINGS
