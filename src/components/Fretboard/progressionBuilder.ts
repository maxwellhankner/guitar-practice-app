import {
  CHORD_VARIANT_ORDER,
  chordIdForRootVariant,
  chordIdsForRoot,
  parseChordPresetId,
  type ChordPresetId,
  type ChordVariant,
  type RootName,
} from './chords'
import { colorAlternativesForDegree } from './chordColors'
import {
  chordIdForScaleDegree,
  diatonicSlotsInKey,
  majorBorrowKindForRootPc,
  romanLabelForChordInKey,
  rootNameForPc,
  rootPcForMajorBorrowInKey,
  type KeyId,
  type RomanLabelForChord,
} from './keys'
import { chordsForProgression, type ProgressionId } from './progressions'

export const MIN_PROGRESSION_STEPS = 0
export const MAX_PROGRESSION_STEPS = 8

/** Roman label for a progression step; falls back to the step triad when the voicing is foreign. */
export function romanLabelForProgressionStep(
  keyId: KeyId,
  chordId: ChordPresetId,
  triadId: ChordPresetId,
): RomanLabelForChord {
  const primary = romanLabelForChordInKey(keyId, chordId)
  if (primary.kind !== 'foreign') {
    return primary
  }
  const fallback = romanLabelForChordInKey(keyId, triadId)
  if (fallback.kind !== 'foreign') {
    return fallback
  }
  return primary
}

/** Scale degree 1–7 whose diatonic triad shares this root, if any. */
export function degreeForRootInKey(
  keyId: KeyId,
  chordId: ChordPresetId,
): number | null {
  const { rootName } = parseChordPresetId(chordId)
  for (const slot of diatonicSlotsInKey(keyId)) {
    if (slot.chordId == null) {
      continue
    }
    if (parseChordPresetId(slot.chordId).rootName === rootName) {
      return slot.degree
    }
  }
  return null
}

export function diatonicRootNamesInKey(keyId: KeyId): Set<RootName> {
  const roots = new Set<RootName>()
  for (const slot of diatonicSlotsInKey(keyId)) {
    if (slot.chordId == null) {
      continue
    }
    roots.add(parseChordPresetId(slot.chordId).rootName as RootName)
  }
  return roots
}

export function isRootInKey(keyId: KeyId, rootName: RootName): boolean {
  return diatonicRootNamesInKey(keyId).has(rootName)
}

export function seedProgressionFromPreset(
  keyId: KeyId,
  progressionId: ProgressionId,
): ChordPresetId[] {
  return [...chordsForProgression(keyId, progressionId)]
}

export function allowedChordsForBuiltProgression(
  _keyId: KeyId,
  steps: readonly ChordPresetId[],
): ReadonlySet<ChordPresetId> {
  const allowed = new Set<ChordPresetId>()
  for (const chordId of steps) {
    allowed.add(chordId)
    const { rootName } = parseChordPresetId(chordId)
    for (const id of chordIdsForRoot(rootName as RootName)) {
      allowed.add(id)
    }
  }
  return allowed
}

/** Diatonic triads to highlight in the key row — one per scale degree present in the progression (any voicing). */
export function progressionHighlightedTriadsInKey(
  keyId: KeyId,
  steps: readonly ChordPresetId[],
): Set<ChordPresetId> {
  const highlighted = new Set<ChordPresetId>()
  for (const stepId of steps) {
    const degree = degreeForRootInKey(keyId, stepId)
    if (degree == null) {
      continue
    }
    const triadId = chordIdForScaleDegree(keyId, degree)
    if (triadId != null) {
      highlighted.add(triadId)
    }
  }
  return highlighted
}

export function swapAdjacentProgressionSteps(
  steps: readonly ChordPresetId[],
  leftIndex: number,
): ChordPresetId[] {
  if (leftIndex < 0 || leftIndex >= steps.length - 1) {
    return [...steps]
  }
  const next = [...steps]
  ;[next[leftIndex], next[leftIndex + 1]] = [
    next[leftIndex + 1]!,
    next[leftIndex]!,
  ]
  return next
}

export function deleteProgressionStep(
  steps: readonly ChordPresetId[],
  index: number,
): ChordPresetId[] | null {
  if (index < 0 || index >= steps.length) {
    return steps.length === 0 ? null : [...steps]
  }
  const next = steps.filter((_, i) => i !== index)
  return next.length === 0 ? null : next
}

export function insertProgressionStep(
  steps: readonly ChordPresetId[],
  afterIndex: number,
  chordId: ChordPresetId,
): ChordPresetId[] {
  if (steps.length >= MAX_PROGRESSION_STEPS) {
    return [...steps]
  }
  const next = [...steps]
  next.splice(afterIndex + 1, 0, chordId)
  return next
}

export function triadIdForStep(
  keyId: KeyId,
  chordId: ChordPresetId,
): ChordPresetId {
  const degree = degreeForRootInKey(keyId, chordId)
  if (degree == null) {
    const { rootName, quality } = parseChordPresetId(chordId)
    if (quality === 'minor') {
      return `${rootName}m` as ChordPresetId
    }
    return rootName as ChordPresetId
  }
  const slot = diatonicSlotsInKey(keyId).find((s) => s.degree === degree)
  return slot?.chordId ?? chordId
}

export type ProgressionAltOption = {
  chordId: ChordPresetId
  /** Curated diatonic triad / color voicings — shown first and at full opacity. */
  suggested: boolean
}

/** All same-root voicings except `activeChordId`: suggested first (triad, then colors), then the rest dimmed. */
export function progressionAltOptions(
  keyId: KeyId,
  activeChordId: ChordPresetId,
): ProgressionAltOption[] {
  const { rootName } = parseChordPresetId(activeChordId)
  const triadId = triadIdForStep(keyId, activeChordId)
  const allForRoot = chordIdsForRoot(rootName as RootName).filter(
    (id) => id !== activeChordId,
  )

  const suggestedIds: ChordPresetId[] = []
  if (activeChordId !== triadId) {
    suggestedIds.push(triadId)
  }

  const degree = degreeForRootInKey(keyId, activeChordId)
  if (degree != null) {
    for (const color of colorAlternativesForDegree(keyId, degree)) {
      if (
        color.chordId !== activeChordId &&
        !suggestedIds.includes(color.chordId)
      ) {
        suggestedIds.push(color.chordId)
      }
    }
  }

  const suggestedSet = new Set(suggestedIds)
  const options: ProgressionAltOption[] = suggestedIds.map((chordId) => ({
    chordId,
    suggested: true,
  }))

  for (const chordId of allForRoot) {
    if (!suggestedSet.has(chordId)) {
      options.push({ chordId, suggested: false })
    }
  }

  return options
}

function rootNameForDegree(keyId: KeyId, degree: number): RootName | null {
  const chordId = chordIdForScaleDegree(keyId, degree)
  if (chordId == null) {
    return null
  }
  return parseChordPresetId(chordId).rootName as RootName
}

function chordVariantForPresetId(chordId: ChordPresetId): ChordVariant | null {
  const { rootName, quality } = parseChordPresetId(chordId)
  if (CHORD_VARIANT_ORDER.includes(quality as ChordVariant)) {
    return quality as ChordVariant
  }
  for (const variant of CHORD_VARIANT_ORDER) {
    if (chordIdForRootVariant(rootName as RootName, variant) === chordId) {
      return variant
    }
  }
  return null
}

/** Map a progression step chord from one key to the same scale degree (and color) in another. */
export function transposeChordBetweenKeys(
  fromKey: KeyId,
  toKey: KeyId,
  chordId: ChordPresetId,
): ChordPresetId {
  if (fromKey === toKey) {
    return chordId
  }

  const degree = degreeForRootInKey(fromKey, chordId)
  if (degree == null) {
    const { rootPc } = parseChordPresetId(chordId)
    const borrow = majorBorrowKindForRootPc(fromKey, rootPc)
    if (borrow != null && !toKey.endsWith('m')) {
      const newRoot = rootNameForPc(rootPcForMajorBorrowInKey(toKey, borrow))
      if (newRoot != null) {
        const variant = chordVariantForPresetId(chordId)
        if (variant != null) {
          return chordIdForRootVariant(newRoot, variant)
        }
      }
    }
    return chordId
  }

  const fromTriad = chordIdForScaleDegree(fromKey, degree)
  if (chordId === fromTriad) {
    return chordIdForScaleDegree(toKey, degree) ?? chordId
  }

  const colorMatch = colorAlternativesForDegree(fromKey, degree).find(
    (color) => color.chordId === chordId,
  )
  if (colorMatch != null) {
    const toColor = colorAlternativesForDegree(toKey, degree).find(
      (color) => color.variant === colorMatch.variant,
    )
    if (toColor != null) {
      return toColor.chordId
    }
  }

  const newRoot = rootNameForDegree(toKey, degree)
  if (newRoot == null) {
    return chordId
  }

  const variant = chordVariantForPresetId(chordId)
  if (variant != null) {
    return chordIdForRootVariant(newRoot, variant)
  }

  return chordIdForScaleDegree(toKey, degree) ?? chordId
}

export function transposeProgressionToKey(
  fromKey: KeyId,
  toKey: KeyId,
  steps: readonly ChordPresetId[],
): ChordPresetId[] {
  return steps.map((chordId) =>
    transposeChordBetweenKeys(fromKey, toKey, chordId),
  )
}
