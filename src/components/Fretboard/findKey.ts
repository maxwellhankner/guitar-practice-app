import {
  parseChordPresetId,
  type ChordPresetId,
  type ChordQuality,
  type RootName,
} from './chords'
import { degreeForRootInKey, diatonicRootNamesInKey } from './progressionBuilder'
import { KEY_MAJOR_IDS, KEY_MINOR_IDS, type KeyId } from './keys'

const ALL_KEY_IDS = [...KEY_MAJOR_IDS, ...KEY_MINOR_IDS] as const

export type KeyMatchRank = {
  keyId: KeyId
  /** 0–100 match strength after diatonic fit, borrow forgiveness, and tonic hints. */
  score: number
}

/** Opacity 0–1 for key buttons; `null` when score ≤ 65 (full dim / not selectable). */
export function findKeyMatchBrightness(score: number): number | null {
  if (score <= 65) {
    return null
  }
  return Math.min(1, (score - 65) / 35)
}

/** Occurrence-weighted diatonic root fit (0–70). */
const DIATONIC_MAX = 70
/** Major/minor quality balance across the progression (0–10). */
const TONALITY_MAX = 10
const TONIC_FIRST_BONUS = 4
/** Extra when the first chord is clearly i/I (degree 1 with matching quality). */
const TONIC_FIRST_DEGREE_BONUS = 14
const SECOND_CHORD_TONIC_BONUS = 10
const MINOR_TONIC_START_BONUS = 4
const TONIC_LAST_ROOT_BONUS = 10
const TONIC_LAST_QUALITY_BONUS = 6
const CADENCE_FULL_BONUS = 12
const CADENCE_PLAGAL_BONUS = 8
const HALF_CADENCE_BONUS = 8
const MINOR_VII_ENDING_BONUS = 8
const DOMINANT_V_BONUS = 5
/** Borrowed roots (bIII, bVI, bVII) count partially toward diatonic fit. */
const BORROW_MATCH_WEIGHT = 0.65

function tonicRootName(keyId: KeyId): RootName {
  return (keyId.endsWith('m') ? keyId.slice(0, -1) : keyId) as RootName
}

function isMinorKey(keyId: KeyId): boolean {
  return keyId.endsWith('m')
}

/** Common modal-interchange roots forgiven for major keys (bIII, bVI, bVII). */
function forgivenBorrowPcsForMajorKey(tonicPc: number): Set<number> {
  return new Set([
    (tonicPc + 3) % 12,
    (tonicPc + 8) % 12,
    (tonicPc + 10) % 12,
  ])
}

function rootPc(rootName: RootName): number {
  return parseChordPresetId(rootName as ChordPresetId).rootPc
}

function isMinorQuality(quality: ChordQuality): boolean {
  return (
    quality === 'minor' ||
    quality === 'min7' ||
    quality === 'min6' ||
    quality === 'min9' ||
    quality === 'diminished' ||
    quality === 'dim7'
  )
}

function isMajorQuality(quality: ChordQuality): boolean {
  return !isMinorQuality(quality)
}

function isDominantQuality(quality: ChordQuality): boolean {
  return quality === 'dom7' || quality === 'dom9' || quality === 'dom7sus4'
}

function rootMatchWeight(
  keyId: KeyId,
  rootName: RootName,
  keyRoots: Set<RootName>,
): number {
  if (keyRoots.has(rootName)) {
    return 1
  }
  const pc = rootPc(rootName)
  if (isMinorKey(keyId)) {
    return 0
  }
  if (
    forgivenBorrowPcsForMajorKey(
      parseChordPresetId(keyId as ChordPresetId).rootPc,
    ).has(pc)
  ) {
    return BORROW_MATCH_WEIGHT
  }
  return 0
}

function diatonicMatchRatio(
  keyId: KeyId,
  chordIds: readonly ChordPresetId[],
): number {
  if (chordIds.length === 0) {
    return 0
  }
  const keyRoots = diatonicRootNamesInKey(keyId)
  let matched = 0
  for (const chordId of chordIds) {
    const rootName = parseChordPresetId(chordId).rootName as RootName
    matched += rootMatchWeight(keyId, rootName, keyRoots)
  }
  return matched / chordIds.length
}

function strictDiatonicMatchRatio(
  keyId: KeyId,
  chordIds: readonly ChordPresetId[],
): number {
  if (chordIds.length === 0) {
    return 0
  }
  const keyRoots = diatonicRootNamesInKey(keyId)
  let matched = 0
  for (const chordId of chordIds) {
    const rootName = parseChordPresetId(chordId).rootName as RootName
    if (keyRoots.has(rootName)) {
      matched += 1
    }
  }
  return matched / chordIds.length
}

function diatonicFitPoints(
  keyId: KeyId,
  chordIds: readonly ChordPresetId[],
): number {
  return diatonicMatchRatio(keyId, chordIds) * DIATONIC_MAX
}

function tonalityPoints(
  keyId: KeyId,
  chordIds: readonly ChordPresetId[],
): number {
  let minorCount = 0
  let majorCount = 0
  for (const chordId of chordIds) {
    const { quality } = parseChordPresetId(chordId)
    if (isMinorQuality(quality)) {
      minorCount += 1
    } else if (isMajorQuality(quality)) {
      majorCount += 1
    }
  }
  const tonalChords = minorCount + majorCount
  if (tonalChords === 0) {
    return 0
  }
  const ratio = isMinorKey(keyId)
    ? minorCount / tonalChords
    : majorCount / tonalChords
  return ratio * TONALITY_MAX
}

function cadencePoints(
  keyId: KeyId,
  chordIds: readonly ChordPresetId[],
  strictRatio: number,
): number {
  if (chordIds.length < 2 || strictRatio < 1) {
    return 0
  }

  const first = chordIds[0]!
  const last = chordIds[chordIds.length - 1]!
  const penult = chordIds[chordIds.length - 2]!
  const firstDegree = degreeForRootInKey(keyId, first)
  const lastDegree = degreeForRootInKey(keyId, last)
  const penultDegree = degreeForRootInKey(keyId, penult)

  if (lastDegree === 1 && penultDegree === 5) {
    return CADENCE_FULL_BONUS
  }
  if (lastDegree === 1 && penultDegree === 4) {
    return CADENCE_PLAGAL_BONUS
  }
  // Loop endings on V (e.g. I–IV–vi–V); require starting on I or IV in this key.
  if (
    lastDegree === 5 &&
    (firstDegree === 1 || firstDegree === 4)
  ) {
    return HALF_CADENCE_BONUS
  }

  if (chordIds.length >= 3) {
    const antepenult = chordIds[chordIds.length - 3]!
    const anteDegree = degreeForRootInKey(keyId, antepenult)
    if (lastDegree === 1 && penultDegree === 5 && anteDegree === 2) {
      return CADENCE_FULL_BONUS
    }
  }

  return 0
}

function dominantVPoints(
  keyId: KeyId,
  chordIds: readonly ChordPresetId[],
): number {
  for (const chordId of chordIds) {
    const { quality } = parseChordPresetId(chordId)
    if (!isDominantQuality(quality)) {
      continue
    }
    if (degreeForRootInKey(keyId, chordId) === 5) {
      return DOMINANT_V_BONUS
    }
  }
  return 0
}

function qualifiesForLastTonicBonus(
  keyId: KeyId,
  chordIds: readonly ChordPresetId[],
  strictRatio: number,
  lastRootIsTonic: boolean,
  qualityFitsKey: boolean,
  lastDegree: number | null,
  penultDegree: number | null,
  firstDegree: number | null,
  firstRoot: RootName,
  tonicRoot: RootName,
  firstQuality: ChordQuality,
): boolean {
  if (!lastRootIsTonic || !qualityFitsKey) {
    return false
  }
  if (chordIds.length === 1) {
    return true
  }

  const cadenceConfirmsTonic =
    lastDegree === 1 &&
    (penultDegree === 5 || penultDegree === 4)
  const bookendedTonic =
    chordIds.length >= 2 &&
    firstRoot === tonicRoot &&
    lastRootIsTonic

  if (cadenceConfirmsTonic || bookendedTonic) {
    if (strictRatio < 1) {
      return false
    }
    // Major triad on ii (e.g. F–…–A#–D# misread as D# major) — keep ii–V–I endings.
    if (
      !isMinorKey(keyId) &&
      firstDegree === 2 &&
      isMajorQuality(firstQuality)
    ) {
      return false
    }
    return true
  }

  if (strictRatio < 1) {
    return false
  }

  if (firstDegree === 5 || firstDegree === 4) {
    return false
  }

  if (!isMinorKey(keyId) && firstDegree === 6) {
    return false
  }

  return true
}

type KeyScoreParts = {
  score: number
  lastTonic: boolean
  tonalityRatio: number
}

function scoreKeyForChords(
  keyId: KeyId,
  chordIds: readonly ChordPresetId[],
): KeyScoreParts {
  if (chordIds.length === 0) {
    return { score: 0, lastTonic: false, tonalityRatio: 0 }
  }

  const tonicRoot = tonicRootName(keyId)
  const first = chordIds[0]!
  const last = chordIds[chordIds.length - 1]!
  const firstRoot = parseChordPresetId(first).rootName as RootName
  const { quality: firstQuality } = parseChordPresetId(first)
  const { rootName: lastRoot, quality: lastQuality } = parseChordPresetId(last)
  const lastDegree = degreeForRootInKey(keyId, last)
  const penultDegree =
    chordIds.length >= 2
      ? degreeForRootInKey(keyId, chordIds[chordIds.length - 2]!)
      : null
  const firstDegree = degreeForRootInKey(keyId, first)
  const strictRatio = strictDiatonicMatchRatio(keyId, chordIds)

  let score = diatonicFitPoints(keyId, chordIds)
  score += tonalityPoints(keyId, chordIds)
  score += cadencePoints(keyId, chordIds, strictRatio)
  score += dominantVPoints(keyId, chordIds)

  if (firstRoot === tonicRoot) {
    score += TONIC_FIRST_BONUS
    if (
      isMinorKey(keyId) &&
      isMinorQuality(firstQuality)
    ) {
      score += MINOR_TONIC_START_BONUS
    }
  }
  if (
    firstDegree === 1 &&
    (isMinorKey(keyId)
      ? isMinorQuality(firstQuality)
      : isMajorQuality(firstQuality))
  ) {
    const lastEndsOnDominant = lastDegree === 5
    const lastIsRelativeMinor =
      !isMinorKey(keyId) &&
      lastDegree === 6 &&
      isMinorQuality(lastQuality)
    if (!lastEndsOnDominant && !lastIsRelativeMinor) {
      score += TONIC_FIRST_DEGREE_BONUS
    }
  }

  const second = chordIds[1]
  if (second != null && !isMinorKey(keyId)) {
    const secondDegree = degreeForRootInKey(keyId, second)
    const { quality: secondQuality } = parseChordPresetId(second)
    if (
      secondDegree === 1 &&
      isMajorQuality(secondQuality)
    ) {
      score += SECOND_CHORD_TONIC_BONUS
    }
  }

  const lastRootIsTonic = (lastRoot as RootName) === tonicRoot
  const qualityFitsKey = isMinorKey(keyId)
    ? isMinorQuality(lastQuality)
    : isMajorQuality(lastQuality)
  let lastTonic = false
  if (
    qualifiesForLastTonicBonus(
      keyId,
      chordIds,
      strictRatio,
      lastRootIsTonic,
      qualityFitsKey,
      lastDegree,
      penultDegree,
      firstDegree,
      firstRoot,
      tonicRoot,
      firstQuality,
    )
  ) {
    lastTonic = true
    score += TONIC_LAST_ROOT_BONUS
    score += TONIC_LAST_QUALITY_BONUS
  }

  if (isMinorKey(keyId) && lastDegree === 7 && strictRatio >= 1) {
    score += MINOR_VII_ENDING_BONUS
  }

  let minorCount = 0
  let majorCount = 0
  for (const chordId of chordIds) {
    const { quality } = parseChordPresetId(chordId)
    if (isMinorQuality(quality)) {
      minorCount += 1
    } else if (isMajorQuality(quality)) {
      majorCount += 1
    }
  }
  const tonalChords = minorCount + majorCount
  const tonalityRatio =
    tonalChords === 0
      ? 0
      : isMinorKey(keyId)
        ? minorCount / tonalChords
        : majorCount / tonalChords

  return {
    score: Math.round(Math.min(100, score)),
    lastTonic,
    tonalityRatio,
  }
}

/** Rank all keys for a chord selection (best match first). */
export function rankKeysForChords(
  chordIds: readonly ChordPresetId[],
): KeyMatchRank[] {
  if (chordIds.length === 0) {
    return []
  }
  return ALL_KEY_IDS.map((keyId) => {
    const parts = scoreKeyForChords(keyId, chordIds)
    return { keyId, ...parts }
  })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }
      if (a.lastTonic !== b.lastTonic) {
        return a.lastTonic ? -1 : 1
      }
      if (b.tonalityRatio !== a.tonalityRatio) {
        return b.tonalityRatio - a.tonalityRatio
      }
      return 0
    })
    .map(({ keyId, score }) => ({ keyId, score }))
}

/** @deprecated Use {@link rankKeysForChords} — strict 100% diatonic root match only. */
export function keysMatchingChords(
  chordIds: readonly ChordPresetId[],
): KeyId[] {
  return rankKeysForChords(chordIds)
    .filter((rank) => rank.score >= 100)
    .map((rank) => rank.keyId)
}
