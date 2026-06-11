import type { ChordFingering } from './types'

function c(
  strings: ChordFingering['strings'],
  name: string,
  fingers?: NonNullable<ChordFingering['fingers']>,
): ChordFingering {
  return fingers != null ? { name, strings, fingers } : { name, strings }
}

/**
 * Diminished triads — root on A string (x, r, r+1, r+2, r+1, x) except G#dim
 * (E-string shape at fret 4 to stay in a comfortable range).
 */
const DIM_CHORD_PRESETS = {
  Adim: c(
    ['x', 0, 1, 2, 1, 'x'],
    'A diminished',
    [null, 1, 1, 2, 3, null],
  ),
  'A#dim': c(
    ['x', 1, 2, 3, 2, 'x'],
    'A# diminished',
    [null, 1, 1, 2, 3, null],
  ),
  Bdim: c(
    ['x', 2, 3, 4, 3, 'x'],
    'B diminished',
    [null, 1, 1, 2, 3, null],
  ),
  Cdim: c(
    ['x', 3, 4, 5, 4, 'x'],
    'C diminished',
    [null, 1, 1, 2, 3, null],
  ),
  'C#dim': c(
    ['x', 4, 5, 6, 5, 'x'],
    'C# diminished',
    [null, 1, 1, 2, 3, null],
  ),
  Ddim: c(
    ['x', 5, 6, 7, 6, 'x'],
    'D diminished',
    [null, 1, 1, 2, 3, null],
  ),
  'D#dim': c(
    ['x', 6, 7, 8, 7, 'x'],
    'D# diminished',
    [null, 1, 1, 2, 3, null],
  ),
  Edim: c(
    ['x', 7, 8, 9, 8, 'x'],
    'E diminished',
    [null, 1, 1, 2, 3, null],
  ),
  Fdim: c(
    ['x', 8, 9, 10, 9, 'x'],
    'F diminished',
    [null, 1, 1, 2, 3, null],
  ),
  'F#dim': c(
    ['x', 9, 10, 11, 10, 'x'],
    'F# diminished',
    [null, 1, 1, 2, 3, null],
  ),
  Gdim: c(
    ['x', 10, 11, 12, 11, 'x'],
    'G diminished',
    [null, 1, 1, 2, 3, null],
  ),
  'G#dim': c(
    [4, 5, 4, 5, 'x', 'x'],
    'G# diminished',
    [1, 2, 1, 3, null, null],
  ),
} as const satisfies Record<string, ChordFingering>

const ROOT_NAMES = [
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
] as const

/** Open and barre shapes — sharp spellings only (A# not Bb, etc.). */
const MAJOR_MINOR_CHORD_PRESETS = {
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

export const CHORD_PRESETS = {
  ...MAJOR_MINOR_CHORD_PRESETS,
  ...DIM_CHORD_PRESETS,
} as const satisfies Record<string, ChordFingering>

export type ChordPresetId = keyof typeof CHORD_PRESETS

export type ChordQuality = 'major' | 'minor' | 'diminished'

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

export const CHORD_DIM_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}dim`,
) as readonly `${(typeof ROOT_NAMES)[number]}dim`[] & readonly ChordPresetId[]

/** Major + minor only — used for the full chord picker when no key is selected. */
export const CHORD_SELECTABLE_IDS = [
  ...CHORD_MAJOR_IDS,
  ...CHORD_MINOR_IDS,
] as const satisfies readonly ChordPresetId[]

export const CHORD_PRESET_IDS = [
  ...CHORD_SELECTABLE_IDS,
  ...CHORD_DIM_IDS,
] as const satisfies readonly ChordPresetId[]

const ROOT_PC: Record<string, number> = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11,
}

export function isDiminishedChord(chordId: ChordPresetId): boolean {
  return chordId.endsWith('dim')
}

/** Diminished chords can be viewed on the diagram but are excluded from KNOWN. */
export function isChordPracticeable(chordId: ChordPresetId): boolean {
  return !isDiminishedChord(chordId)
}

export function parseChordPresetId(
  chordId: ChordPresetId,
): { rootName: string; rootPc: number; quality: ChordQuality } {
  if (isDiminishedChord(chordId)) {
    const rootName = chordId.slice(0, -3)
    const rootPc = ROOT_PC[rootName]
    if (rootPc == null) {
      throw new Error(`Unknown chord root: ${rootName}`)
    }
    return { rootName, rootPc, quality: 'diminished' }
  }
  const isMinor = chordId.endsWith('m')
  const rootName = isMinor ? chordId.slice(0, -1) : chordId
  const rootPc = ROOT_PC[rootName]
  if (rootPc == null) {
    throw new Error(`Unknown chord root: ${rootName}`)
  }
  return { rootName, rootPc, quality: isMinor ? 'minor' : 'major' }
}

/** Major: M3+P5. Minor: m3+P5. Diminished: m3+d5. */
export function triadPitchClasses(
  rootPc: number,
  quality: ChordQuality,
): readonly number[] {
  if (quality === 'diminished') {
    return [rootPc, (rootPc + 3) % 12, (rootPc + 6) % 12]
  }
  const third = quality === 'major' ? 4 : 3
  return [rootPc, (rootPc + third) % 12, (rootPc + 7) % 12]
}

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
