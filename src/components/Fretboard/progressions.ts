import { type ChordPresetId } from './chords'
import { colorAlternativesForDegree } from './chordColors'
import {
  KEY_MAJOR_IDS,
  KEY_MINOR_IDS,
  chordIdForScaleDegree,
  type KeyId,
} from './keys'

export const PROGRESSION_IDS = [
  'p1',
  'p2',
  'p3',
  'p4',
  'p5',
  'p6',
  'p7',
  'p8',
] as const

export type ProgressionId = (typeof PROGRESSION_IDS)[number]

export type ProgressionDef = {
  id: ProgressionId
  /** Button label, e.g. "1 · 5 · 6 · 4" */
  label: string
  /** Diatonic scale degrees (1 = tonic … 7 = leading tone). */
  degrees: readonly number[]
}

export const PROGRESSIONS: Record<ProgressionId, ProgressionDef> = {
  p1: { id: 'p1', label: '1 · 5 · 6 · 4', degrees: [1, 5, 6, 4] },
  p2: { id: 'p2', label: '6 · 4 · 1 · 5', degrees: [6, 4, 1, 5] },
  p3: { id: 'p3', label: '1 · 4 · 5', degrees: [1, 4, 5] },
  p4: { id: 'p4', label: '1 · 4 · 6 · 5', degrees: [1, 4, 6, 5] },
  p5: { id: 'p5', label: '2 · 5 · 1', degrees: [2, 5, 1] },
  p6: { id: 'p6', label: '1 · 6 · 2 · 5', degrees: [1, 6, 2, 5] },
  p7: { id: 'p7', label: '4 · 1 · 5 · 6', degrees: [4, 1, 5, 6] },
  p8: { id: 'p8', label: '1 · 5 · 4', degrees: [1, 5, 4] },
}

const ALL_KEY_IDS = [...KEY_MAJOR_IDS, ...KEY_MINOR_IDS] as const

function chordForDegree(
  keyId: KeyId,
  degree: number,
): ChordPresetId {
  const chordId = chordIdForScaleDegree(keyId, degree)
  if (chordId == null) {
    throw new Error(`Key ${keyId}: no chord for degree ${degree}`)
  }
  return chordId
}

export function isProgressionResolvableInKey(
  keyId: KeyId,
  progressionId: ProgressionId,
): boolean {
  const { degrees } = PROGRESSIONS[progressionId]
  return degrees.every((degree) => chordIdForScaleDegree(keyId, degree) != null)
}

function assertProgressions(): void {
  for (const keyId of ALL_KEY_IDS) {
    for (const progressionId of PROGRESSION_IDS) {
      if (!isProgressionResolvableInKey(keyId, progressionId)) {
        continue
      }
      chordsForProgression(keyId, progressionId)
    }
  }
}

/** All triads and color alternatives for each step in a progression. */
export function allowedChordsForProgression(
  keyId: KeyId,
  progressionId: ProgressionId,
): ReadonlySet<ChordPresetId> {
  const { degrees } = PROGRESSIONS[progressionId]
  const allowed = new Set<ChordPresetId>()
  for (const degree of degrees) {
    const triadId = chordIdForScaleDegree(keyId, degree)
    if (triadId == null) {
      continue
    }
    allowed.add(triadId)
    for (const color of colorAlternativesForDegree(keyId, degree)) {
      allowed.add(color.chordId)
    }
  }
  return allowed
}

export type ProgressionStep = {
  stepIndex: number
  degree: number
  triadId: ChordPresetId
}

/** Ordered progression steps with diatonic triads for the key. */
export function progressionStepsInKey(
  keyId: KeyId,
  progressionId: ProgressionId,
): ProgressionStep[] {
  const { degrees } = PROGRESSIONS[progressionId]
  return degrees.map((degree, stepIndex) => ({
    stepIndex,
    degree,
    triadId: chordForDegree(keyId, degree),
  }))
}

/** Chords for a progression in the given key, in progression order. */
export function chordsForProgression(
  keyId: KeyId,
  progressionId: ProgressionId,
): ChordPresetId[] {
  const { degrees } = PROGRESSIONS[progressionId]
  return degrees.map((degree) => chordForDegree(keyId, degree))
}

assertProgressions()
