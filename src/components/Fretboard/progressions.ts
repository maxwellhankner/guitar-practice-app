import { type ChordPresetId, type ChordVariant } from './chords'
import { colorAlternativesForDegree } from './chordColors'
import {
  KEY_MAJOR_IDS,
  KEY_MINOR_IDS,
  chordIdForScaleDegree,
  type KeyId,
} from './keys'

/** Major-key triad seeds (pop / rock / country staples). */
export const MAJOR_BASIC_PROGRESSION_IDS = [
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

/** Minor-key triad seeds (natural-minor song loops; avoids ii°). */
export const MINOR_BASIC_PROGRESSION_IDS = [
  'm1',
  'm2',
  'm3',
  'm4',
  'm5',
  'm6',
  'm7',
  'm8',
  'm9',
  'm10',
  'm11',
  'm12',
  'm13',
  'm14',
  'm15',
  'm16',
] as const

/** Major-key color-voicing seeds. */
export const MAJOR_COLORED_PROGRESSION_IDS = [
  'c1',
  'c2',
  'c3',
  'c4',
  'c5',
  'c6',
  'c7',
  'c8',
] as const

/** Minor-key color-voicing seeds. */
export const MINOR_COLORED_PROGRESSION_IDS = [
  'k1',
  'k2',
  'k3',
  'k4',
  'k5',
  'k6',
  'k7',
  'k8',
] as const

export const BASIC_PROGRESSION_IDS = [
  ...MAJOR_BASIC_PROGRESSION_IDS,
  ...MINOR_BASIC_PROGRESSION_IDS,
] as const

export const COLORED_PROGRESSION_IDS = [
  ...MAJOR_COLORED_PROGRESSION_IDS,
  ...MINOR_COLORED_PROGRESSION_IDS,
] as const

export const PROGRESSION_IDS = [
  ...BASIC_PROGRESSION_IDS,
  ...COLORED_PROGRESSION_IDS,
] as const

export type MajorBasicProgressionId =
  (typeof MAJOR_BASIC_PROGRESSION_IDS)[number]
export type MinorBasicProgressionId =
  (typeof MINOR_BASIC_PROGRESSION_IDS)[number]
export type MajorColoredProgressionId =
  (typeof MAJOR_COLORED_PROGRESSION_IDS)[number]
export type MinorColoredProgressionId =
  (typeof MINOR_COLORED_PROGRESSION_IDS)[number]
export type BasicProgressionId = (typeof BASIC_PROGRESSION_IDS)[number]
export type ColoredProgressionId = (typeof COLORED_PROGRESSION_IDS)[number]
export type ProgressionId = (typeof PROGRESSION_IDS)[number]

export type ProgressionCategory = 'basic' | 'colored'
export type ProgressionMode = 'major' | 'minor'

export type ProgressionStepDef = {
  /** Scale degree 1–7 in the selected key. */
  degree: number
  /** Omit for the diatonic triad; otherwise a curated color voicing on that degree. */
  variant?: ChordVariant
}

export type ProgressionDef = {
  id: ProgressionId
  category: ProgressionCategory
  /** Which key type this seed is curated for. */
  mode: ProgressionMode
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
  mode: ProgressionMode,
  degrees: readonly number[],
): ProgressionDef {
  const steps = triadSteps(degrees)
  return { id, category: 'basic', mode, label: buildLabel(steps), steps }
}

function coloredDef(
  id: ColoredProgressionId,
  mode: ProgressionMode,
  steps: readonly ProgressionStepDef[],
): ProgressionDef {
  return { id, category: 'colored', mode, label: buildLabel(steps), steps }
}

export function isMinorKeyId(keyId: KeyId): boolean {
  return keyId.endsWith('m')
}

export function progressionModeForKey(keyId: KeyId): ProgressionMode {
  return isMinorKeyId(keyId) ? 'minor' : 'major'
}

export function basicProgressionIdsForKey(
  keyId: KeyId,
): readonly BasicProgressionId[] {
  return isMinorKeyId(keyId)
    ? MINOR_BASIC_PROGRESSION_IDS
    : MAJOR_BASIC_PROGRESSION_IDS
}

export function coloredProgressionIdsForKey(
  keyId: KeyId,
): readonly ColoredProgressionId[] {
  return isMinorKeyId(keyId)
    ? MINOR_COLORED_PROGRESSION_IDS
    : MAJOR_COLORED_PROGRESSION_IDS
}

export function progressionIdsForKey(keyId: KeyId): readonly ProgressionId[] {
  return [...basicProgressionIdsForKey(keyId), ...coloredProgressionIdsForKey(keyId)]
}

/**
 * Curated seeds for great-sounding practice loops.
 * Major: Axis / 50s / I–IV–V family (includes diatonic ii as minor).
 * Minor: i–VI–III–VII family and relatives (no ii° holds).
 */
export const PROGRESSIONS: Record<ProgressionId, ProgressionDef> = {
  // —— Major triad seeds ——
  b1: basicDef('b1', 'major', [1, 5, 6, 4]), // Axis / four-chord pop
  b2: basicDef('b2', 'major', [6, 4, 1, 5]), // vi–IV–I–V
  b3: basicDef('b3', 'major', [1, 6, 4, 5]), // 50s doo-wop
  b4: basicDef('b4', 'major', [1, 4, 5, 1]), // I–IV–V home
  b5: basicDef('b5', 'major', [1, 5, 4, 1]), // I–V–IV home
  b6: basicDef('b6', 'major', [1, 4, 6, 5]), // I–IV–vi–V
  b7: basicDef('b7', 'major', [6, 1, 4, 5]), // vi–I–IV–V
  b8: basicDef('b8', 'major', [4, 5, 1, 6]), // IV–V–I–vi
  b9: basicDef('b9', 'major', [1, 6, 2, 5]), // I–vi–ii–V turnaround
  b10: basicDef('b10', 'major', [2, 5, 1, 1]), // ii–V–I
  b11: basicDef('b11', 'major', [4, 1, 5, 6]), // IV–I–V–vi
  b12: basicDef('b12', 'major', [1, 4, 2, 5]), // I–IV–ii–V
  b13: basicDef('b13', 'major', [6, 5, 4, 1]), // vi–V–IV–I descent
  b14: basicDef('b14', 'major', [1, 5, 2, 5]), // I–V–ii–V
  b15: basicDef('b15', 'major', [2, 5, 4, 1]), // ii–V–IV–I
  b16: basicDef('b16', 'major', [4, 1, 6, 5]), // IV–I–vi–V

  // —— Minor triad seeds (natural minor; skip ii°) ——
  m1: basicDef('m1', 'minor', [1, 6, 3, 7]), // i–VI–III–VII pop minor
  m2: basicDef('m2', 'minor', [1, 7, 6, 7]), // i–VII–VI–VII rock
  m3: basicDef('m3', 'minor', [1, 7, 6, 4]), // i–VII–VI–iv
  m4: basicDef('m4', 'minor', [1, 4, 5, 1]), // i–iv–v home
  m5: basicDef('m5', 'minor', [1, 6, 4, 7]), // i–VI–iv–VII
  m6: basicDef('m6', 'minor', [1, 6, 4, 5]), // i–VI–iv–v
  m7: basicDef('m7', 'minor', [1, 3, 7, 6]), // i–III–VII–VI
  m8: basicDef('m8', 'minor', [1, 4, 7, 3]), // i–iv–VII–III
  m9: basicDef('m9', 'minor', [1, 5, 6, 4]), // i–v–VI–iv
  m10: basicDef('m10', 'minor', [1, 7, 6, 5]), // descending minor / Andalusian shape
  m11: basicDef('m11', 'minor', [6, 7, 1, 1]), // VI–VII–i
  m12: basicDef('m12', 'minor', [1, 6, 7, 3]), // i–VI–VII–III
  m13: basicDef('m13', 'minor', [1, 3, 4, 7]), // i–III–iv–VII
  m14: basicDef('m14', 'minor', [6, 1, 7, 3]), // VI–i–VII–III
  m15: basicDef('m15', 'minor', [1, 4, 6, 5]), // i–iv–VI–v
  m16: basicDef('m16', 'minor', [7, 6, 1, 5]), // VII–VI–i–v

  // —— Major color seeds (variants from major color map) ——
  c1: coloredDef('c1', 'major', [
    { degree: 1, variant: 'add9' },
    { degree: 5 },
    { degree: 6, variant: 'min7' },
    { degree: 4, variant: 'add9' },
  ]),
  c2: coloredDef('c2', 'major', [
    { degree: 1, variant: 'maj7' },
    { degree: 5 },
    { degree: 6, variant: 'min7' },
    { degree: 4 },
  ]),
  c3: coloredDef('c3', 'major', [
    { degree: 6, variant: 'min7' },
    { degree: 4, variant: 'add9' },
    { degree: 1 },
    { degree: 5 },
  ]),
  c4: coloredDef('c4', 'major', [
    { degree: 2, variant: 'min7' },
    { degree: 5, variant: 'dom7' },
    { degree: 1, variant: 'maj7' },
    { degree: 1 },
  ]),
  c5: coloredDef('c5', 'major', [
    { degree: 1, variant: 'maj7' },
    { degree: 6, variant: 'min7' },
    { degree: 2, variant: 'min7' },
    { degree: 5, variant: 'dom7' },
  ]),
  c6: coloredDef('c6', 'major', [
    { degree: 1, variant: 'maj7' },
    { degree: 6, variant: 'min7' },
    { degree: 4, variant: 'maj7' },
    { degree: 5, variant: 'dom7' },
  ]),
  c7: coloredDef('c7', 'major', [
    { degree: 4, variant: 'add9' },
    { degree: 1, variant: 'maj7' },
    { degree: 5 },
    { degree: 6, variant: 'min7' },
  ]),
  c8: coloredDef('c8', 'major', [
    { degree: 1, variant: 'maj6' },
    { degree: 5 },
    { degree: 6, variant: 'sus2' },
    { degree: 4 },
  ]),

  // —— Minor color seeds (variants from minor color map only) ——
  k1: coloredDef('k1', 'minor', [
    { degree: 1, variant: 'min7' },
    { degree: 6 },
    { degree: 3 },
    { degree: 7 },
  ]),
  k2: coloredDef('k2', 'minor', [
    { degree: 1, variant: 'add9' },
    { degree: 6, variant: 'maj7' },
    { degree: 3 },
    { degree: 7 },
  ]),
  k3: coloredDef('k3', 'minor', [
    { degree: 1 },
    { degree: 7 },
    { degree: 6, variant: 'add9' },
    { degree: 4, variant: 'min7' },
  ]),
  k4: coloredDef('k4', 'minor', [
    { degree: 1, variant: 'min7' },
    { degree: 6 },
    { degree: 4, variant: 'add9' },
    { degree: 7 },
  ]),
  k5: coloredDef('k5', 'minor', [
    { degree: 1, variant: 'add9' },
    { degree: 4, variant: 'min7' },
    { degree: 5, variant: 'dom7' },
    { degree: 1 },
  ]),
  k6: coloredDef('k6', 'minor', [
    { degree: 1 },
    { degree: 7 },
    { degree: 6 },
    { degree: 5, variant: 'dom7' }, // Andalusian-style pull with V7
  ]),
  k7: coloredDef('k7', 'minor', [
    { degree: 1, variant: 'min7' },
    { degree: 3, variant: 'maj7' },
    { degree: 7 },
    { degree: 6 },
  ]),
  k8: coloredDef('k8', 'minor', [
    { degree: 6, variant: 'maj7' },
    { degree: 7 },
    { degree: 1, variant: 'min7' },
    { degree: 1 },
  ]),
}

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
  return colorMatch?.chordId ?? null
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
  const def = PROGRESSIONS[progressionId]
  if (def.mode !== progressionModeForKey(keyId)) {
    return false
  }
  return def.steps.every((step) => chordForStep(keyId, step) != null)
}

function assertProgressions(): void {
  for (const progressionId of PROGRESSION_IDS) {
    const def = PROGRESSIONS[progressionId]
    if (def.steps.length !== 4) {
      throw new Error(
        `Progression ${progressionId} has ${def.steps.length} steps, expected 4`,
      )
    }
    const keyIds = def.mode === 'minor' ? KEY_MINOR_IDS : KEY_MAJOR_IDS
    for (const keyId of keyIds) {
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

/** Chords for arbitrary degree/color steps in the given key, in order. */
export function chordsForSteps(
  keyId: KeyId,
  steps: readonly ProgressionStepDef[],
): ChordPresetId[] {
  return steps.map((step) => {
    const chordId = chordForStep(keyId, step)
    if (chordId == null) {
      throw new Error(
        `Key ${keyId}: no chord for progression step degree ${step.degree}` +
          (step.variant != null ? ` variant ${step.variant}` : ''),
      )
    }
    return chordId
  })
}

/** Chords for a progression in the given key, in progression order. */
export function chordsForProgression(
  keyId: KeyId,
  progressionId: ProgressionId,
): ChordPresetId[] {
  return chordsForSteps(keyId, PROGRESSIONS[progressionId].steps)
}

assertProgressions()
