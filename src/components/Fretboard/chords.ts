import type { ChordFingering } from './types'

function c(
  strings: ChordFingering['strings'],
  name: string,
  fingers?: NonNullable<ChordFingering['fingers']>,
): ChordFingering {
  return fingers != null ? { name, strings, fingers } : { name, strings }
}

/** Common open / movable shapes — extend as needed */
export const CHORD_PRESETS = {
  C: c(['x', 3, 2, 0, 1, 0], 'C major', [null, 3, 2, null, 1, null]),
  G: c([3, 2, 0, 0, 0, 3], 'G major', [3, 2, null, null, null, 4]),
  D: c(['x', 'x', 0, 2, 3, 2], 'D major', [null, null, null, 1, 3, 2]),
  Dm: c(['x', 'x', 0, 2, 3, 1], 'D minor', [null, null, null, 2, 3, 1]),
  Am: c(['x', 0, 2, 2, 1, 0], 'A minor', [null, null, 3, 2, 1, null]),
  Em: c([0, 2, 2, 0, 0, 0], 'E minor', [null, 2, 3, null, null, null]),
  E: c([0, 2, 2, 1, 0, 0], 'E major', [null, 2, 3, 1, null, null]),
  A: c(['x', 0, 2, 2, 2, 0], 'A major', [null, null, 1, 2, 3, null]),
} as const satisfies Record<string, ChordFingering>

export type ChordPresetId = keyof typeof CHORD_PRESETS

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
