import {
  chordIdForRootVariant,
  parseChordPresetId,
  type ChordPresetId,
  type ChordVariant,
  type RootName,
} from './chords'
import {
  KEY_DEFS,
  chordIdForScaleDegree,
  diatonicSlotsInKey,
  type KeyId,
} from './keys'

export type ColorChordSlot = {
  variant: ChordVariant
  /** Short button label, e.g. "add9" or "7". */
  label: string
}

/** Curated color chords per scale degree (same root as the diatonic triad). */
const MAJOR_COLOR_BY_DEGREE: Record<number, readonly ColorChordSlot[]> = {
  1: [
    { variant: 'add9', label: 'add9' },
    { variant: 'maj7', label: 'maj7' },
    { variant: 'maj6', label: '6' },
    { variant: 'sus2', label: 'sus2' },
    { variant: 'maj9', label: 'maj9' },
  ],
  2: [
    { variant: 'min7', label: 'm7' },
    { variant: 'add9', label: 'add9' },
    { variant: 'sus2', label: 'sus2' },
    { variant: 'min9', label: 'm9' },
  ],
  3: [
    { variant: 'min7', label: 'm7' },
    { variant: 'add9', label: 'add9' },
    { variant: 'sus2', label: 'sus2' },
    { variant: 'min9', label: 'm9' },
  ],
  4: [
    { variant: 'add9', label: 'add9' },
    { variant: 'sus4', label: 'sus4' },
    { variant: 'maj7', label: 'maj7' },
    { variant: 'maj6', label: '6' },
  ],
  5: [
    { variant: 'dom7sus4', label: '7sus4' },
    { variant: 'dom7', label: '7' },
    { variant: 'sus4', label: 'sus4' },
    { variant: 'add9', label: 'add9' },
    { variant: 'dom9', label: '9' },
  ],
  6: [
    { variant: 'min7', label: 'm7' },
    { variant: 'add9', label: 'add9' },
    { variant: 'sus2', label: 'sus2' },
    { variant: 'min6', label: 'm6' },
    { variant: 'min9', label: 'm9' },
  ],
  7: [{ variant: 'dim7', label: 'dim7' }],
}

const MINOR_COLOR_BY_DEGREE: Record<number, readonly ColorChordSlot[]> = {
  1: [
    { variant: 'min7', label: 'm7' },
    { variant: 'add9', label: 'add9' },
    { variant: 'sus2', label: 'sus2' },
    { variant: 'min6', label: 'm6' },
  ],
  2: [],
  3: [
    { variant: 'add9', label: 'add9' },
    { variant: 'maj7', label: 'maj7' },
    { variant: 'maj6', label: '6' },
    { variant: 'maj9', label: 'maj9' },
  ],
  4: [
    { variant: 'min7', label: 'm7' },
    { variant: 'add9', label: 'add9' },
    { variant: 'sus2', label: 'sus2' },
    { variant: 'sus4', label: 'sus4' },
    { variant: 'min9', label: 'm9' },
  ],
  5: [
    { variant: 'dom7sus4', label: '7sus4' },
    { variant: 'dom7', label: '7' },
    { variant: 'sus4', label: 'sus4' },
    { variant: 'dom9', label: '9' },
  ],
  6: [
    { variant: 'add9', label: 'add9' },
    { variant: 'maj7', label: 'maj7' },
    { variant: 'maj6', label: '6' },
    { variant: 'maj9', label: 'maj9' },
  ],
  7: [
    { variant: 'dom7sus4', label: '7sus4' },
    { variant: 'dom7', label: '7' },
    { variant: 'sus4', label: 'sus4' },
    { variant: 'dom9', label: '9' },
  ],
}

export type ResolvedColorChord = ColorChordSlot & { chordId: ChordPresetId }

function colorSlotsForDegree(
  keyId: KeyId,
  degree: number,
): readonly ColorChordSlot[] {
  const map = keyId.endsWith('m')
    ? MINOR_COLOR_BY_DEGREE
    : MAJOR_COLOR_BY_DEGREE
  return map[degree] ?? []
}

function rootNameForDegree(keyId: KeyId, degree: number): RootName | null {
  const chordId = chordIdForScaleDegree(keyId, degree)
  if (chordId == null) {
    return null
  }
  return parseChordPresetId(chordId).rootName as RootName
}

/** Color-chord presets for a diatonic degree in the given key. */
export function colorAlternativesForDegree(
  keyId: KeyId,
  degree: number,
): ResolvedColorChord[] {
  const rootName = rootNameForDegree(keyId, degree)
  if (rootName == null) {
    return []
  }
  return colorSlotsForDegree(keyId, degree).map((slot) => ({
    ...slot,
    chordId: chordIdForRootVariant(rootName, slot.variant),
  }))
}

/** Diatonic triad or curated color alternative for the same scale degree. */
export function isSelectableChordInKey(
  keyId: KeyId,
  chordId: ChordPresetId,
): boolean {
  if (KEY_DEFS[keyId].chords.includes(chordId)) {
    return true
  }

  const { rootName } = parseChordPresetId(chordId)
  for (const slot of diatonicSlotsInKey(keyId)) {
    if (slot.chordId == null) {
      continue
    }
    if (parseChordPresetId(slot.chordId).rootName !== rootName) {
      continue
    }
    return colorAlternativesForDegree(keyId, slot.degree).some(
      (color) => color.chordId === chordId,
    )
  }

  return false
}

function assertColorChords(): void {
  for (const keyId of Object.keys(KEY_DEFS) as KeyId[]) {
    for (let degree = 1; degree <= 7; degree++) {
      colorAlternativesForDegree(keyId, degree)
    }
  }
}

assertColorChords()
