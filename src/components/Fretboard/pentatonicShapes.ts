import { OPEN_STRING_PITCH_CLASS } from './tuning'

/** Relative minor / major pairs — same five notes on the fretboard */
export type PentatonicKeyId = 'Am/C' | 'Em/G' | 'Dm/F' | 'Bm/D' | 'Gm/A#'

export type PentatonicKeyDef = {
  label: PentatonicKeyId
  name: string
  pitchClasses: readonly number[]
}

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

export const PENTATONIC_KEY_IDS = [
  'Am/C',
  'Em/G',
  'Dm/F',
  'Bm/D',
  'Gm/A#',
] as const satisfies readonly PentatonicKeyId[]

export type PentatonicPosition = {
  /** 0 = low E … 5 = high E */
  stringIndex: number
  /** 0 = open string */
  fret: number
}

const STRINGS = 6

/** All scale tones from the open string through `fretCount` (inclusive). */
export function pentatonicPositionsInRange(
  pitchClasses: readonly number[],
  fretCount: number,
): PentatonicPosition[] {
  const pcs = new Set(pitchClasses)
  const positions: PentatonicPosition[] = []

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

export function pentatonicPatternForWindow(
  keyId: PentatonicKeyId,
  fretCount: number,
): { name: string; positions: PentatonicPosition[] } {
  const key = PENTATONIC_KEYS[keyId]
  return {
    name: key.name,
    positions: pentatonicPositionsInRange(key.pitchClasses, fretCount),
  }
}
