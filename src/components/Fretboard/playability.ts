import { type ChordPresetId } from './chords'
import { type KeyId } from './keys'
import {
  PROGRESSION_IDS,
  chordsForProgression,
  isProgressionResolvableInKey,
  type ProgressionId,
} from './progressions'

export function isChordKnown(
  chordId: ChordPresetId,
  known: ReadonlySet<ChordPresetId>,
): boolean {
  return known.has(chordId)
}

/** @deprecated Use {@link isChordKnown}. */
export function isChordPlayable(
  chordId: ChordPresetId,
  known: ReadonlySet<ChordPresetId>,
): boolean {
  return isChordKnown(chordId, known)
}

export function allChordsKnown(
  chordIds: readonly ChordPresetId[],
  known: ReadonlySet<ChordPresetId>,
): boolean {
  return chordIds.every((id) => isChordKnown(id, known))
}

export function unknownChordsIn(
  chordIds: readonly ChordPresetId[],
  known: ReadonlySet<ChordPresetId>,
): ChordPresetId[] {
  return chordIds.filter((id) => !isChordKnown(id, known))
}

/** @deprecated Use {@link unknownChordsIn}. */
export function unplayableChordsIn(
  chordIds: readonly ChordPresetId[],
  known: ReadonlySet<ChordPresetId>,
): ChordPresetId[] {
  return unknownChordsIn(chordIds, known)
}

export function isProgressionPlayableInKey(
  keyId: KeyId,
  progressionId: ProgressionId,
  known: ReadonlySet<ChordPresetId>,
): boolean {
  if (!isProgressionResolvableInKey(keyId, progressionId)) {
    return false
  }
  return allChordsKnown(chordsForProgression(keyId, progressionId), known)
}

/** At least one progression in this key uses only known chords. */
export function isKeyPlayable(
  keyId: KeyId,
  known: ReadonlySet<ChordPresetId>,
): boolean {
  return PROGRESSION_IDS.some((progressionId) =>
    isProgressionPlayableInKey(keyId, progressionId, known),
  )
}
