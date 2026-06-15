import {
  CHORD_MAJOR_IDS,
  CHORD_MINOR_IDS,
  CHORD_PRESET_IDS,
  chordPitchClasses,
  parseChordPresetId,
  type ChordPresetId,
  type ChordQuality,
} from './chords'

const DIATONIC_QUALITIES = new Set<ChordQuality>([
  'major',
  'minor',
  'diminished',
])

export const KEY_MAJOR_IDS = CHORD_MAJOR_IDS
export const KEY_MINOR_IDS = CHORD_MINOR_IDS

export type KeyId =
  | (typeof KEY_MAJOR_IDS)[number]
  | (typeof KEY_MINOR_IDS)[number]

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

function keyRootPc(keyId: KeyId): number {
  const isMinor = keyId.endsWith('m')
  const rootName = isMinor ? keyId.slice(0, -1) : keyId
  const pc = ROOT_PC[rootName]
  if (pc == null) {
    throw new Error(`Unknown key root: ${rootName}`)
  }
  return pc
}

const CHORD_PITCH_CLASSES = Object.fromEntries(
  CHORD_PRESET_IDS.map((chordId) => {
    const { rootPc, quality } = parseChordPresetId(chordId)
    return [chordId, chordPitchClasses(rootPc, quality)]
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

export type DiatonicSlot = {
  /** Scale degree 1–7 */
  degree: number
  roman: string
  chordId: ChordPresetId | null
}

function chordIdOnScaleDegree(
  keyId: KeyId,
  degree: number,
): ChordPresetId | null {
  if (degree < 1 || degree > 7) {
    return null
  }
  const keyRoot = keyRootPc(keyId)
  const isMinorKey = keyId.endsWith('m')
  const steps = isMinorKey ? MINOR_SCALE_STEPS : MAJOR_SCALE_STEPS
  const scale = scalePitchClasses(
    keyRoot,
    isMinorKey ? MINOR_SCALE_STEPS : MAJOR_SCALE_STEPS,
  )
  const degreePc = (keyRoot + steps[degree - 1]!) % 12
  return (
    CHORD_PRESET_IDS.find((chordId) => {
      const { rootPc, quality } = parseChordPresetId(chordId)
      return (
        rootPc === degreePc &&
        DIATONIC_QUALITIES.has(quality) &&
        chordFitsScale(chordId, scale)
      )
    }) ?? null
  )
}

/** All seven scale degrees with Roman labels; `chordId` is null when no preset matches (e.g. ii°). */
export function diatonicSlotsInKey(keyId: KeyId): DiatonicSlot[] {
  const isMinorKey = keyId.endsWith('m')
  const numerals = isMinorKey ? MINOR_ROMAN : MAJOR_ROMAN

  return Array.from({ length: 7 }, (_, index) => {
    const degree = index + 1
    return {
      degree,
      roman: numerals[index]!,
      chordId: chordIdOnScaleDegree(keyId, degree),
    }
  })
}

/** Chord for a Roman scale degree (1 = tonic … 7 = leading tone). */
export function chordIdForScaleDegree(
  keyId: KeyId,
  degree: number,
): ChordPresetId | null {
  return chordIdOnScaleDegree(keyId, degree)
}

/** Diatonic chords in Roman-numeral order (I → vii° / i → VII); omits missing degrees. */
export function chordsInKeyOrder(keyId: KeyId): ChordPresetId[] {
  return diatonicSlotsInKey(keyId)
    .map((slot) => slot.chordId)
    .filter((id): id is ChordPresetId => id != null)
}

function keyName(keyId: KeyId): string {
  if (keyId.endsWith('m')) {
    return `${keyId} minor`
  }
  return `${keyId} major`
}

function assertKeyChordMaps(): void {
  for (const keyId of ALL_KEY_IDS) {
    const slots = diatonicSlotsInKey(keyId)
    for (const slot of slots) {
      if (slot.chordId == null) {
        throw new Error(`Key ${keyId}: no chord for degree ${slot.degree}`)
      }
      if (chordRomanNumeral(keyId, slot.chordId) !== slot.roman) {
        throw new Error(
          `Key ${keyId}: ${slot.chordId} expected ${slot.roman}`,
        )
      }
    }
  }
}

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
  const keyRoot = keyRootPc(keyId)
  const isMinorKey = keyId.endsWith('m')
  const scale = scalePitchClasses(
    keyRoot,
    isMinorKey ? MINOR_SCALE_STEPS : MAJOR_SCALE_STEPS,
  )
  if (!chordFitsScale(chordId, scale)) {
    return null
  }

  const { rootPc } = parseChordPresetId(chordId)
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

/** Implied key for scale overlay when no key is selected (chord root + quality). */
export function chordIdToScaleKey(chordId: ChordPresetId): KeyId {
  const { rootName, quality } = parseChordPresetId(chordId)
  if (quality === 'minor' || quality === 'min7') {
    return `${rootName}m` as KeyId
  }
  return rootName as KeyId
}

const MAJOR_PENTATONIC_STEPS = [0, 2, 4, 7, 9] as const
const MINOR_PENTATONIC_STEPS = [0, 3, 5, 7, 10] as const
/** Major: natural major minus the 7th. Minor: natural minor minus the 6th. */
const MAJOR_HEXATONIC_STEPS = [0, 2, 4, 5, 7, 9] as const
const MINOR_HEXATONIC_STEPS = [0, 2, 3, 5, 7, 10] as const

export type ScaleVariant = 'full' | 'pentatonic' | 'hexatonic'

/** Pitch classes (0–11) for a diatonic scale variant in a key. */
export function scalePitchClassesForKey(
  keyId: KeyId,
  variant: ScaleVariant,
): readonly number[] {
  const root = keyRootPc(keyId)
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

/** Diatonic triads in `keyId` whose scale degree is included in the variant. */
export function diatonicChordIdsOnScale(
  keyId: KeyId,
  variant: ScaleVariant,
): ChordPresetId[] {
  const degrees = new Set(scaleDegreesInVariant(keyId, variant))
  return diatonicSlotsInKey(keyId)
    .filter(
      (slot): slot is DiatonicSlot & { chordId: ChordPresetId } =>
        slot.chordId != null && degrees.has(slot.degree),
    )
    .map((slot) => slot.chordId)
}

/** Scale degrees 1–7 present in a major/minor pentatonic or hexatonic variant. */
export function scaleDegreesInVariant(
  keyId: KeyId,
  variant: ScaleVariant,
): readonly number[] {
  if (variant === 'full') {
    return [1, 2, 3, 4, 5, 6, 7]
  }
  const keyRoot = keyRootPc(keyId)
  const isMinorKey = keyId.endsWith('m')
  const fullSteps = isMinorKey ? MINOR_SCALE_STEPS : MAJOR_SCALE_STEPS
  const variantPcs = new Set(scalePitchClassesForKey(keyId, variant))
  const degrees: number[] = []
  for (let index = 0; index < 7; index++) {
    const pc = (keyRoot + fullSteps[index]!) % 12
    if (variantPcs.has(pc)) {
      degrees.push(index + 1)
    }
  }
  return degrees
}

export function romanNumeralForScaleDegree(
  keyId: KeyId,
  degree: number,
): string | null {
  if (degree < 1 || degree > 7) {
    return null
  }
  const numerals = keyId.endsWith('m') ? MINOR_ROMAN : MAJOR_ROMAN
  return numerals[degree - 1] ?? null
}

/** Roman numeral for a chord root on the selected scale variant (null if root not in variant). */
export function chordRomanNumeralOnScale(
  keyId: KeyId,
  chordId: ChordPresetId,
  variant: ScaleVariant,
): string | null {
  const keyRoot = keyRootPc(keyId)
  const { rootPc } = parseChordPresetId(chordId)
  const isMinorKey = keyId.endsWith('m')
  const fullSteps = isMinorKey ? MINOR_SCALE_STEPS : MAJOR_SCALE_STEPS
  const numerals = isMinorKey ? MINOR_ROMAN : MAJOR_ROMAN
  const variantPcs = new Set(scalePitchClassesForKey(keyId, variant))

  for (let index = 0; index < 7; index++) {
    const pc = (keyRoot + fullSteps[index]!) % 12
    if (pc === rootPc && variantPcs.has(pc)) {
      return numerals[index]!
    }
  }
  return null
}

function scaleRomanList(keyId: KeyId, variant: ScaleVariant): string[] {
  return scaleDegreesInVariant(keyId, variant).map(
    (degree) => romanNumeralForScaleDegree(keyId, degree)!,
  )
}

function assertScaleVariantRomans(): void {
  for (const keyId of ALL_KEY_IDS) {
    const isMinorKey = keyId.endsWith('m')
    const pentatonic = scaleRomanList(keyId, 'pentatonic')
    const hexatonic = scaleRomanList(keyId, 'hexatonic')
    const full = scaleRomanList(keyId, 'full')

    if (pentatonic.length !== 5 || hexatonic.length !== 6 || full.length !== 7) {
      throw new Error(
        `Key ${keyId}: expected 5/6/7 scale Romans, got ${pentatonic.length}/${hexatonic.length}/${full.length}`,
      )
    }

    if (isMinorKey) {
      if (pentatonic.join(',') !== 'i,III,iv,v,VII') {
        throw new Error(
          `Key ${keyId}: minor pentatonic Romans ${pentatonic.join(',')}`,
        )
      }
      if (hexatonic.join(',') !== 'i,ii°,III,iv,v,VII') {
        throw new Error(
          `Key ${keyId}: minor hexatonic Romans ${hexatonic.join(',')}`,
        )
      }
    } else if (pentatonic.join(',') !== 'I,ii,iii,V,vi') {
      throw new Error(
        `Key ${keyId}: major pentatonic Romans ${pentatonic.join(',')}`,
      )
    } else if (hexatonic.join(',') !== 'I,ii,iii,IV,V,vi') {
      throw new Error(
        `Key ${keyId}: major hexatonic Romans ${hexatonic.join(',')}`,
      )
    }
  }
}

assertScaleVariantRomans()
