import { type ChordPresetId, type ChordVariant } from './chords'
import { colorAlternativesForDegree } from './chordColors'
import {
  KEY_MAJOR_IDS,
  KEY_MINOR_IDS,
  chordIdForScaleDegree,
  type KeyId,
} from './keys'

export const BASIC_PROGRESSION_IDS = [
  'b1',
  'b2',
  'b3',
  'b4',
  'b5',
  'b6',
  'b7',
  'b8',
  'b9',
  'b10',
  'b11',
  'b12',
  'b13',
  'b14',
  'b15',
  'b16',
] as const

export const COLORED_PROGRESSION_IDS = [
  'c1',
  'c2',
  'c3',
  'c4',
  'c5',
  'c6',
  'c7',
  'c8',
] as const

export const PROGRESSION_IDS = [
  ...BASIC_PROGRESSION_IDS,
  ...COLORED_PROGRESSION_IDS,
] as const

export type BasicProgressionId = (typeof BASIC_PROGRESSION_IDS)[number]
export type ColoredProgressionId = (typeof COLORED_PROGRESSION_IDS)[number]
export type ProgressionId = (typeof PROGRESSION_IDS)[number]

export type ProgressionCategory = 'basic' | 'colored'

export type ProgressionStepDef = {
  /** Scale degree 1–7 in the selected key. */
  degree: number
  /** Omit for the diatonic triad; otherwise a curated color voicing on that degree. */
  variant?: ChordVariant
}

export type ProgressionDef = {
  id: ProgressionId
  category: ProgressionCategory
  /** Button label, e.g. "1 · 5 · 6 · 4". */
  label: string
  steps: readonly ProgressionStepDef[]
}

const VARIANT_STEP_SUFFIX: Partial<Record<ChordVariant, string>> = {
  maj6: '·6',
  sus2: 'sus2',
  sus4: 'sus4',
  add9: 'add9',
  maj7: 'maj7',
  min7: 'm7',
  dom7: '7',
  dom7sus4: '7sus4',
  dom9: '9',
  min9: 'm9',
  maj9: 'maj9',
  min6: 'm6',
}

function stepLabel({ degree, variant }: ProgressionStepDef): string {
  if (variant == null) {
    return String(degree)
  }
  const suffix = VARIANT_STEP_SUFFIX[variant]
  return suffix != null ? `${degree}${suffix}` : `${degree}·${variant}`
}

function buildLabel(steps: readonly ProgressionStepDef[]): string {
  return steps.map(stepLabel).join(' · ')
}

function triadSteps(degrees: readonly number[]): ProgressionStepDef[] {
  return degrees.map((degree) => ({ degree }))
}

function basicDef(
  id: BasicProgressionId,
  degrees: readonly number[],
): ProgressionDef {
  const steps = triadSteps(degrees)
  return { id, category: 'basic', label: buildLabel(steps), steps }
}

function coloredDef(
  id: ColoredProgressionId,
  steps: readonly ProgressionStepDef[],
): ProgressionDef {
  return { id, category: 'colored', label: buildLabel(steps), steps }
}

export const PROGRESSIONS: Record<ProgressionId, ProgressionDef> = {
  // —— 16 essential triad progressions ——
  b1: basicDef('b1', [1, 5, 6, 4]), // Axis / four-chord song
  b2: basicDef('b2', [6, 4, 1, 5]), // vi rotation
  b3: basicDef('b3', [1, 6, 4, 5]), // 50s doo-wop
  b4: basicDef('b4', [1, 4, 5, 1]), // three-chord rock / blues → home
  b5: basicDef('b5', [2, 5, 1, 1]), // ii–V–I → hold tonic
  b6: basicDef('b6', [1, 5, 4, 1]), // three-chord pop → home
  b7: basicDef('b7', [1, 6, 2, 5]), // I–vi–ii–V turnaround
  b8: basicDef('b8', [4, 1, 5, 6]), // IV-first loop
  b9: basicDef('b9', [1, 4, 6, 5]), // I–IV–vi–V
  b10: basicDef('b10', [6, 1, 4, 5]), // vi–I–IV–V
  b11: basicDef('b11', [4, 5, 1, 6]), // IV–V–I–vi
  b12: basicDef('b12', [2, 5, 4, 1]), // ii–V–IV–I
  b13: basicDef('b13', [6, 5, 4, 1]), // vi–V–IV–I descent
  b14: basicDef('b14', [1, 4, 2, 5]), // I–IV–ii–V
  b15: basicDef('b15', [1, 5, 2, 5]), // I–V–ii–V country
  b16: basicDef('b16', [4, 1, 6, 5]), // IV–I–vi–V plagal start

  // —— 8 color-voicing progressions ——
  c1: coloredDef('c1', [
    { degree: 1, variant: 'maj6' },
    { degree: 5 },
    { degree: 6, variant: 'sus2' },
    { degree: 4 },
  ]),
  c2: coloredDef('c2', [
    { degree: 1, variant: 'add9' },
    { degree: 5 },
    { degree: 6, variant: 'min7' },
    { degree: 4, variant: 'add9' },
  ]),
  c3: coloredDef('c3', [
    { degree: 6, variant: 'min7' },
    { degree: 4, variant: 'add9' },
    { degree: 1 },
    { degree: 5 },
  ]),
  c4: coloredDef('c4', [
    { degree: 2, variant: 'min7' },
    { degree: 5, variant: 'dom7' },
    { degree: 1, variant: 'maj7' },
    { degree: 1 },
  ]),
  c5: coloredDef('c5', [
    { degree: 1, variant: 'maj7' },
    { degree: 6, variant: 'min7' },
    { degree: 2, variant: 'min7' },
    { degree: 5, variant: 'dom7' },
  ]),
  c6: coloredDef('c6', [
    { degree: 1, variant: 'maj7' },
    { degree: 6, variant: 'min7' },
    { degree: 4, variant: 'maj7' },
    { degree: 5, variant: 'dom7' },
  ]),
  c7: coloredDef('c7', [
    { degree: 4, variant: 'add9' },
    { degree: 1, variant: 'maj7' },
    { degree: 5 },
    { degree: 6, variant: 'min7' },
  ]),
  c8: coloredDef('c8', [
    { degree: 1 },
    { degree: 5 },
    { degree: 4, variant: 'sus2' },
    { degree: 4 },
  ]),
}

const ALL_KEY_IDS = [...KEY_MAJOR_IDS, ...KEY_MINOR_IDS] as const

function chordForStep(
  keyId: KeyId,
  step: ProgressionStepDef,
): ChordPresetId | null {
  const triadId = chordIdForScaleDegree(keyId, step.degree)
  if (triadId == null) {
    return null
  }
  if (step.variant == null) {
    return triadId
  }
  const colorMatch = colorAlternativesForDegree(keyId, step.degree).find(
    (color) => color.variant === step.variant,
  )
  if (colorMatch != null) {
    return colorMatch.chordId
  }
  return triadId
}

export function progressionDegrees(
  progressionId: ProgressionId,
): readonly number[] {
  return PROGRESSIONS[progressionId].steps.map((step) => step.degree)
}

export function isProgressionResolvableInKey(
  keyId: KeyId,
  progressionId: ProgressionId,
): boolean {
  const { steps } = PROGRESSIONS[progressionId]
  return steps.every((step) => chordForStep(keyId, step) != null)
}

function assertProgressions(): void {
  for (const keyId of ALL_KEY_IDS) {
    for (const progressionId of PROGRESSION_IDS) {
      const { steps } = PROGRESSIONS[progressionId]
      if (steps.length !== 4) {
        throw new Error(
          `Progression ${progressionId} has ${steps.length} steps, expected 4`,
        )
      }
      if (!isProgressionResolvableInKey(keyId, progressionId)) {
        throw new Error(
          `Progression ${progressionId} not resolvable in key ${keyId}`,
        )
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
  const { steps } = PROGRESSIONS[progressionId]
  const allowed = new Set<ChordPresetId>()
  for (const step of steps) {
    const degree = step.degree
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

/** Chords for a progression in the given key, in progression order. */
export function chordsForProgression(
  keyId: KeyId,
  progressionId: ProgressionId,
): ChordPresetId[] {
  const { steps } = PROGRESSIONS[progressionId]
  return steps.map((step) => {
    const chordId = chordForStep(keyId, step)
    if (chordId == null) {
      throw new Error(
        `Key ${keyId}: no chord for progression step degree ${step.degree}`,
      )
    }
    return chordId
  })
}

assertProgressions()
