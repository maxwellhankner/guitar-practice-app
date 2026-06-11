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

/** All scale tones from the open string through `fretCount` (inclusive). */
export function scalePositionsInRange(
  pitchClasses: readonly number[],
  fretCount: number,
): ScalePosition[] {
  const pcs = new Set(pitchClasses)
  const positions: ScalePosition[] = []

  for (let stringIndex = 0; stringIndex < STRINGS; stringIndex++) {
    for (let fret = 0; fret <= fretCount; fret++) {
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
): { name: string; positions: ScalePosition[] } {
  const variant: ScaleVariant = mode
  return {
    name: scaleNameForKey(keyId, variant),
    positions: scalePositionsInRange(
      scalePitchClassesForKey(keyId, variant),
      fretCount,
    ),
  }
}
