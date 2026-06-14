import {
  scaleNameForKey,
  scalePitchClassesForKey,
  type KeyId,
  type ScaleVariant,
} from './keys'
import { OPEN_STRING_PITCH_CLASS } from './tuning'

export const SCALE_SELECTIONS = [
  'pentatonic',
  'hexatonic',
  'full',
] as const satisfies readonly ScaleVariant[]

export type ScaleSelection = (typeof SCALE_SELECTIONS)[number] | null

export function sanitizeScaleSelection(value: unknown): ScaleSelection {
  if (value == null) {
    return null
  }
  if (
    typeof value === 'string' &&
    (SCALE_SELECTIONS as readonly string[]).includes(value)
  ) {
    return value as ScaleSelection
  }
  return null
}

export type ScalePosition = {
  /** 0 = low E … 5 = high E */
  stringIndex: number
  /** 0 = open string */
  fret: number
}

const STRINGS = 6

/**
 * Scale tones in the visible diagram window: open strings (when `startFret` is 1)
 * plus frets `startFret` … `startFret + fretCount - 1`.
 */
export function scalePositionsInRange(
  pitchClasses: readonly number[],
  fretCount: number,
  startFret = 1,
): ScalePosition[] {
  const pcs = new Set(pitchClasses)
  const positions: ScalePosition[] = []
  const windowStart = Math.max(1, startFret)
  const windowEnd = startFret + fretCount - 1

  for (let stringIndex = 0; stringIndex < STRINGS; stringIndex++) {
    if (startFret <= 1) {
      const openPc = OPEN_STRING_PITCH_CLASS[stringIndex]! % 12
      if (pcs.has(openPc)) {
        positions.push({ stringIndex, fret: 0 })
      }
    }
    for (let fret = windowStart; fret <= windowEnd; fret++) {
      const pc = (OPEN_STRING_PITCH_CLASS[stringIndex]! + fret) % 12
      if (pcs.has(pc)) {
        positions.push({ stringIndex, fret })
      }
    }
  }

  return positions
}

export function scalePatternForKey(
  keyId: KeyId,
  mode: Exclude<ScaleSelection, null>,
  fretCount: number,
  startFret = 1,
): { name: string; positions: ScalePosition[] } {
  const variant: ScaleVariant = mode
  return {
    name: scaleNameForKey(keyId, variant),
    positions: scalePositionsInRange(
      scalePitchClassesForKey(keyId, variant),
      fretCount,
      startFret,
    ),
  }
}
