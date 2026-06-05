import type { ChordFingering } from './types'

function c(
  strings: ChordFingering['strings'],
  name: string,
  fingers?: NonNullable<ChordFingering['fingers']>,
): ChordFingering {
  return fingers != null ? { name, strings, fingers } : { name, strings }
}

/** Open and barre shapes — sharp spellings only (A# not Bb, etc.). */
export const CHORD_PRESETS = {
  A: c(['x', 0, 2, 2, 2, 0], 'A major', [null, null, 1, 2, 3, null]),
  'A#': c(['x', 1, 3, 3, 3, 1], 'A# major', [null, 1, 3, 4, 3, 1]),
  B: c(['x', 2, 4, 4, 4, 2], 'B major', [null, 1, 3, 4, 3, 1]),
  C: c(['x', 3, 2, 0, 1, 0], 'C major', [null, 3, 2, null, 1, null]),
  'C#': c(['x', 4, 6, 6, 6, 4], 'C# major', [null, 1, 3, 4, 3, 1]),
  D: c(['x', 'x', 0, 2, 3, 2], 'D major', [null, null, null, 1, 3, 2]),
  'D#': c(['x', 6, 8, 8, 8, 6], 'D# major', [null, 1, 3, 4, 3, 1]),
  E: c([0, 2, 2, 1, 0, 0], 'E major', [null, 2, 3, 1, null, null]),
  F: c([1, 3, 3, 2, 1, 1], 'F major', [1, 3, 4, 2, 1, 1]),
  'F#': c([2, 4, 4, 3, 2, 2], 'F# major', [1, 3, 4, 2, 1, 1]),
  G: c([3, 2, 0, 0, 0, 3], 'G major', [3, 2, null, null, null, 4]),
  'G#': c([4, 6, 6, 5, 4, 4], 'G# major', [1, 3, 4, 2, 1, 1]),
  Am: c(['x', 0, 2, 2, 1, 0], 'A minor', [null, null, 3, 2, 1, null]),
  'A#m': c(['x', 1, 3, 3, 1, 1], 'A# minor', [null, 1, 3, 4, 2, 1]),
  Bm: c(['x', 2, 4, 4, 3, 2], 'B minor', [null, 1, 3, 4, 2, 1]),
  Cm: c(['x', 3, 5, 5, 4, 3], 'C minor', [null, 1, 3, 4, 2, 1]),
  'C#m': c(['x', 4, 6, 6, 4, 4], 'C# minor', [null, 1, 3, 4, 2, 1]),
  Dm: c(['x', 'x', 0, 2, 3, 1], 'D minor', [null, null, null, 2, 3, 1]),
  'D#m': c(['x', 6, 8, 8, 6, 6], 'D# minor', [null, 1, 3, 4, 2, 1]),
  Em: c([0, 2, 2, 0, 0, 0], 'E minor', [null, 2, 3, null, null, null]),
  Fm: c([1, 3, 3, 1, 1, 1], 'F minor', [1, 3, 4, 1, 1, 1]),
  'F#m': c(['x', 2, 4, 4, 2, 2], 'F# minor', [null, 1, 3, 4, 2, 1]),
  Gm: c([3, 5, 5, 3, 3, 3], 'G minor', [1, 3, 4, 1, 1, 1]),
  'G#m': c(['x', 4, 6, 6, 4, 4], 'G# minor', [null, 1, 3, 4, 2, 1]),
} as const satisfies Record<string, ChordFingering>

export type ChordPresetId = keyof typeof CHORD_PRESETS

export const CHORD_MAJOR_IDS = [
  'A',
  'A#',
  'B',
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
] as const satisfies readonly ChordPresetId[]

export const CHORD_MINOR_IDS = [
  'Am',
  'A#m',
  'Bm',
  'Cm',
  'C#m',
  'Dm',
  'D#m',
  'Em',
  'Fm',
  'F#m',
  'Gm',
  'G#m',
] as const satisfies readonly ChordPresetId[]

export const CHORD_PRESET_IDS = [
  ...CHORD_MAJOR_IDS,
  ...CHORD_MINOR_IDS,
] as const satisfies readonly ChordPresetId[]

export function resolveChord(
  chord: ChordFingering | ChordPresetId,
): ChordFingering {
  if (typeof chord === 'string') {
    const preset = CHORD_PRESETS[chord]
    if (!preset) {
      throw new Error(`Unknown chord preset: ${chord}`)
    }
    return preset
  }
  return chord
}
