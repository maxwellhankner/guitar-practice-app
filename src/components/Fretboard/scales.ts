import {
  scaleNameForKey,
  scalePitchClassesForKey,
  type KeyId,
  type ScaleVariant,
} from './keys'
import { OPEN_STRING_PITCH_CLASS } from './tuning'

export type ScaleDisplayMode = 'off' | 'pentatonic' | 'hexatonic' | 'full'

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
  mode: Exclude<ScaleDisplayMode, 'off'>,
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
