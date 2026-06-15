import {
  CHORD_VARIANT_ORDER,
  chordIdForRootVariant,
  chordIdsForRoot,
  parseChordPresetId,
  type ChordPresetId,
  type ChordQuality,
  type ChordVariant,
  type RootName,
} from './chords'
import { colorAlternativesForDegree } from './chordColors'
import {
  chordRomanNumeral,
  chordIdForScaleDegree,
  diatonicSlotsInKey,
  type KeyId,
} from './keys'
import { chordsForProgression, type ProgressionId } from './progressions'

export const MIN_PROGRESSION_STEPS = 0
export const MAX_PROGRESSION_STEPS = 4

/** Short quality label for the progression summary chip. */
export function qualityChipLabel(quality: ChordQuality): string {
  if (quality === 'major' || quality === 'minor') {
    return quality
  }
  return quality
}

export function progressionChipSegment(
  keyId: KeyId | null,
  chordId: ChordPresetId,
): string {
  const { rootName, quality } = parseChordPresetId(chordId)
  const roman = keyId != null ? chordRomanNumeral(keyId, chordId) : null
  const parts: string[] = []
  if (roman != null) {
    parts.push(roman)
  }
  parts.push(rootName, qualityChipLabel(quality))
  return parts.join(', ')
}

export function progressionChipText(
  keyId: KeyId | null,
  steps: readonly ChordPresetId[],
): string {
  return steps.map((id) => progressionChipSegment(keyId, id)).join(' · ')
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
  keyId: KeyId,
  steps: readonly ChordPresetId[],
): ReadonlySet<ChordPresetId> {
  const allowed = new Set<ChordPresetId>()
  for (const chordId of steps) {
    allowed.add(chordId)
    const degree = degreeForRootInKey(keyId, chordId)
    if (degree != null) {
      const triadId = diatonicSlotsInKey(keyId).find(
        (s) => s.degree === degree,
      )?.chordId
      if (triadId != null) {
        allowed.add(triadId)
      }
      for (const color of colorAlternativesForDegree(keyId, degree)) {
        allowed.add(color.chordId)
      }
    } else {
      for (const id of chordIdsForRoot(
        parseChordPresetId(chordId).rootName as RootName,
      )) {
        allowed.add(id)
      }
    }
  }
  return allowed
}

export function progressionStepRoots(
  steps: readonly ChordPresetId[],
): Set<RootName> {
  return new Set(
    steps.map((id) => parseChordPresetId(id).rootName as RootName),
  )
}

export function moveProgressionStep(
  steps: readonly ChordPresetId[],
  index: number,
  direction: -1 | 1,
): ChordPresetId[] {
  const target = index + direction
  if (target < 0 || target >= steps.length) {
    return [...steps]
  }
  return swapAdjacentProgressionSteps(steps, Math.min(index, target))
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

export function alternateChordIdsForStep(
  keyId: KeyId,
  chordId: ChordPresetId,
): ChordPresetId[] {
  const degree = degreeForRootInKey(keyId, chordId)
  if (degree != null) {
    return colorAlternativesForDegree(keyId, degree).map((c) => c.chordId)
  }
  const { rootName } = parseChordPresetId(chordId)
  const triad = triadIdForStep(keyId, chordId)
  return chordIdsForRoot(rootName as RootName).filter((id) => id !== triad)
}

/** Triad first (when not the active voicing), then other alts — never includes `activeChordId`. */
export function progressionAltOptionIds(
  keyId: KeyId,
  activeChordId: ChordPresetId,
): ChordPresetId[] {
  const triadId = triadIdForStep(keyId, activeChordId)
  const colorIds = alternateChordIdsForStep(keyId, activeChordId)
  const options: ChordPresetId[] = []
  if (activeChordId !== triadId) {
    options.push(triadId)
  }
  for (const id of colorIds) {
    if (id !== activeChordId && id !== triadId) {
      options.push(id)
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
