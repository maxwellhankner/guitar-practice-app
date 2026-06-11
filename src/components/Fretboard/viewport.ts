import type { ChordFingering } from './types'

export const FRET_COUNT_MIN = 4
export const FRET_COUNT_MAX = 21

export function sanitizeFretCount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return FRET_COUNT_MIN
  }
  return Math.min(FRET_COUNT_MAX, Math.max(FRET_COUNT_MIN, value))
}

/**
 * First fret column for the diagram window. Shows `fretCount` consecutive frets
 * starting here (inclusive). Picks the smallest startFret ≥ 1 that fits all
 * fretted notes, so barre shapes scroll only as far as needed.
 */
export function startFretForFingering(
  fingering: ChordFingering | null,
  fretCount: number,
): number {
  if (fingering == null || fretCount < 1) {
    return 1
  }

  let minFret = Infinity
  let maxFret = -Infinity
  for (const state of fingering.strings) {
    if (typeof state === 'number' && state >= 1) {
      minFret = Math.min(minFret, state)
      maxFret = Math.max(maxFret, state)
    }
  }

  if (maxFret < 1) {
    return 1
  }

  if (minFret >= 1 && maxFret <= fretCount) {
    return 1
  }

  return Math.max(1, maxFret - fretCount + 1)
}
