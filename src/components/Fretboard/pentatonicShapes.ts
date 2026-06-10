import { scalePositionsInRange } from './scales'

/** @deprecated Use KeyId + scalePatternForKey instead. */
export type PentatonicKeyId = 'Am/C' | 'Em/G' | 'Dm/F' | 'Bm/D' | 'Gm/A#'

/** @deprecated Use KeyId + scalePatternForKey instead. */
export type PentatonicKeyDef = {
  label: PentatonicKeyId
  name: string
  pitchClasses: readonly number[]
}

/** @deprecated Use KeyId + scalePatternForKey instead. */
export const PENTATONIC_KEYS: Record<PentatonicKeyId, PentatonicKeyDef> = {
  'Am/C': {
    label: 'Am/C',
    name: 'A minor / C major pentatonic',
    pitchClasses: [0, 2, 4, 7, 9],
  },
  'Em/G': {
    label: 'Em/G',
    name: 'E minor / G major pentatonic',
    pitchClasses: [2, 4, 7, 9, 11],
  },
  'Dm/F': {
    label: 'Dm/F',
    name: 'D minor / F major pentatonic',
    pitchClasses: [0, 2, 5, 7, 9],
  },
  'Bm/D': {
    label: 'Bm/D',
    name: 'B minor / D major pentatonic',
    pitchClasses: [2, 4, 6, 9, 11],
  },
  'Gm/A#': {
    label: 'Gm/A#',
    name: 'G minor / A# major pentatonic',
    pitchClasses: [0, 2, 5, 7, 10],
  },
}

/** @deprecated Use KeyId + scalePatternForKey instead. */
export const PENTATONIC_KEY_IDS = [
  'Am/C',
  'Em/G',
  'Dm/F',
  'Bm/D',
  'Gm/A#',
] as const satisfies readonly PentatonicKeyId[]

/** @deprecated Use ScalePosition from ./scales instead. */
export type PentatonicPosition = {
  stringIndex: number
  fret: number
}

/** @deprecated Use scalePositionsInRange instead. */
export const pentatonicPositionsInRange = scalePositionsInRange

/** @deprecated Use scalePatternForKey instead. */
export function pentatonicPatternForWindow(
  keyId: PentatonicKeyId,
  fretCount: number,
): { name: string; positions: PentatonicPosition[] } {
  const key = PENTATONIC_KEYS[keyId]
  return {
    name: key.name,
    positions: scalePositionsInRange(key.pitchClasses, fretCount),
  }
}
