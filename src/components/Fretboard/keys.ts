import { CHORD_PRESET_IDS, type ChordPresetId } from './chords'

export type KeyId =
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'A'
  | 'B'
  | 'Am'
  | 'Bm'
  | 'Cm'
  | 'Dm'
  | 'Em'
  | 'Fm'
  | 'Gm'

export type KeyDef = {
  label: KeyId
  name: string
  chords: readonly ChordPresetId[]
}

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

const MAJOR_SCALE_STEPS = [0, 2, 4, 5, 7, 9, 11] as const
const MINOR_SCALE_STEPS = [0, 2, 3, 5, 7, 8, 10] as const

const MAJOR_ROMAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] as const
const MINOR_ROMAN = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'] as const

const KEY_ROOT_PC: Record<KeyId, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
  Am: 9,
  Bm: 11,
  Cm: 0,
  Dm: 2,
  Em: 4,
  Fm: 5,
  Gm: 7,
}

function parseChordId(
  chordId: ChordPresetId,
): { rootPc: number; quality: 'major' | 'minor' } {
  const isMinor = chordId.endsWith('m')
  const rootName = isMinor ? chordId.slice(0, -1) : chordId
  const rootPc = ROOT_PC[rootName]
  if (rootPc == null) {
    throw new Error(`Unknown chord root: ${rootName}`)
  }
  return { rootPc, quality: isMinor ? 'minor' : 'major' }
}

/** Major: root + M3 + P5. Minor: root + m3 + P5. */
function triadPitchClasses(
  rootPc: number,
  quality: 'major' | 'minor',
): readonly number[] {
  const third = quality === 'major' ? 4 : 3
  return [rootPc, (rootPc + third) % 12, (rootPc + 7) % 12]
}

const CHORD_PITCH_CLASSES = Object.fromEntries(
  CHORD_PRESET_IDS.map((chordId) => {
    const { rootPc, quality } = parseChordId(chordId)
    return [chordId, triadPitchClasses(rootPc, quality)]
  }),
) as Record<ChordPresetId, readonly number[]>

function scalePitchClasses(
  rootPc: number,
  steps: readonly number[],
): Set<number> {
  return new Set(steps.map((step) => (rootPc + step) % 12))
}

function chordFitsScale(
  chordId: ChordPresetId,
  scale: Set<number>,
): boolean {
  return CHORD_PITCH_CLASSES[chordId].every((pc) => scale.has(pc))
}

function diatonicChordsForKey(keyId: KeyId): ChordPresetId[] {
  const rootPc = KEY_ROOT_PC[keyId]
  const isMinor = keyId.endsWith('m')
  const scale = scalePitchClasses(
    rootPc,
    isMinor ? MINOR_SCALE_STEPS : MAJOR_SCALE_STEPS,
  )
  return CHORD_PRESET_IDS.filter((chordId) => chordFitsScale(chordId, scale))
}

/** Diatonic chords in Roman-numeral order (I → vii° / i → VII); skips missing degrees. */
export function chordsInKeyOrder(keyId: KeyId): ChordPresetId[] {
  const keyRoot = KEY_ROOT_PC[keyId]
  const isMinorKey = keyId.endsWith('m')
  const steps = isMinorKey ? MINOR_SCALE_STEPS : MAJOR_SCALE_STEPS
  const scale = scalePitchClasses(
    keyRoot,
    isMinorKey ? MINOR_SCALE_STEPS : MAJOR_SCALE_STEPS,
  )
  const result: ChordPresetId[] = []

  for (let degree = 0; degree < 7; degree++) {
    const degreePc = (keyRoot + steps[degree]!) % 12
    const match = CHORD_PRESET_IDS.find(
      (chordId) =>
        parseChordId(chordId).rootPc === degreePc &&
        chordFitsScale(chordId, scale),
    )
    if (match != null) {
      result.push(match)
    }
  }

  return result
}

function keyName(keyId: KeyId): string {
  if (keyId.endsWith('m')) {
    return `${keyId} minor`
  }
  return `${keyId} major`
}

function assertKeyChordMaps(): void {
  for (const keyId of ALL_KEY_IDS) {
    const computed = diatonicChordsForKey(keyId)
    if (computed.length === 0) {
      throw new Error(`Key ${keyId}: no diatonic chords matched`)
    }
    for (const chordId of computed) {
      if (chordRomanNumeral(keyId, chordId) == null) {
        throw new Error(`Key ${keyId}: no Roman numeral for ${chordId}`)
      }
    }
  }
}

export const KEY_MAJOR_IDS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
] as const satisfies readonly KeyId[]

export const KEY_MINOR_IDS = [
  'Am',
  'Bm',
  'Cm',
  'Dm',
  'Em',
  'Fm',
  'Gm',
] as const satisfies readonly KeyId[]

const ALL_KEY_IDS = [...KEY_MAJOR_IDS, ...KEY_MINOR_IDS] as const

assertKeyChordMaps()

/** Built from scale theory + preset triads. */
export const KEY_DEFS = ALL_KEY_IDS.reduce<Record<KeyId, KeyDef>>(
  (acc, keyId) => {
    acc[keyId] = {
      label: keyId,
      name: keyName(keyId),
      chords: chordsInKeyOrder(keyId),
    }
    return acc
  },
  {} as Record<KeyId, KeyDef>,
)

export function isChordInKey(
  keyId: KeyId,
  chordId: ChordPresetId,
): boolean {
  return KEY_DEFS[keyId].chords.includes(chordId)
}

export function chordRomanNumeral(
  keyId: KeyId,
  chordId: ChordPresetId,
): string | null {
  const keyRoot = KEY_ROOT_PC[keyId]
  const isMinorKey = keyId.endsWith('m')
  const scale = scalePitchClasses(
    keyRoot,
    isMinorKey ? MINOR_SCALE_STEPS : MAJOR_SCALE_STEPS,
  )
  if (!chordFitsScale(chordId, scale)) {
    return null
  }

  const { rootPc } = parseChordId(chordId)
  const steps = isMinorKey ? MINOR_SCALE_STEPS : MAJOR_SCALE_STEPS
  const numerals = isMinorKey ? MINOR_ROMAN : MAJOR_ROMAN

  for (let degree = 0; degree < 7; degree++) {
    if ((keyRoot + steps[degree]!) % 12 === rootPc) {
      return numerals[degree]!
    }
  }

  return null
}

export function chordLabelInKey(
  keyId: KeyId | null,
  chordId: ChordPresetId,
): string {
  if (keyId == null) {
    return chordId
  }
  const roman = chordRomanNumeral(keyId, chordId)
  return roman != null ? `${chordId} (${roman})` : chordId
}

const MAJOR_PENTATONIC_STEPS = [0, 2, 4, 7, 9] as const
const MINOR_PENTATONIC_STEPS = [0, 3, 5, 7, 10] as const
/** Full major / natural minor with one diatonic degree omitted (6 notes). */
const MAJOR_HEXATONIC_STEPS = [0, 2, 4, 7, 9, 11] as const
const MINOR_HEXATONIC_STEPS = [0, 3, 5, 7, 8, 10] as const

export type ScaleVariant = 'full' | 'pentatonic' | 'hexatonic'

/** Pitch classes (0–11) for a diatonic scale variant in a key. */
export function scalePitchClassesForKey(
  keyId: KeyId,
  variant: ScaleVariant,
): readonly number[] {
  const root = KEY_ROOT_PC[keyId]
  const isMinorKey = keyId.endsWith('m')
  const steps = (() => {
    if (variant === 'full') {
      return isMinorKey ? MINOR_SCALE_STEPS : MAJOR_SCALE_STEPS
    }
    if (variant === 'pentatonic') {
      return isMinorKey ? MINOR_PENTATONIC_STEPS : MAJOR_PENTATONIC_STEPS
    }
    return isMinorKey ? MINOR_HEXATONIC_STEPS : MAJOR_HEXATONIC_STEPS
  })()
  return steps.map((step) => (root + step) % 12)
}

export function scaleNameForKey(
  keyId: KeyId,
  variant: ScaleVariant,
): string {
  const isMinorKey = keyId.endsWith('m')
  if (variant === 'full') {
    return isMinorKey ? `${keyId} natural minor` : `${keyId} major`
  }
  if (variant === 'pentatonic') {
    return isMinorKey
      ? `${keyId} minor pentatonic`
      : `${keyId} major pentatonic`
  }
  return isMinorKey ? `${keyId} minor hexatonic` : `${keyId} major hexatonic`
}
