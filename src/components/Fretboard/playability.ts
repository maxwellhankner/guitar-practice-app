import { isChordPracticeable, type ChordPresetId } from './chords'
import { chordsInKeyOrder, type KeyId } from './keys'
import {
  PROGRESSION_IDS,
  chordsForProgression,
  isProgressionResolvableInKey,
  type ProgressionId,
} from './progressions'

export function isChordPlayable(
  chordId: ChordPresetId,
  disabled: ReadonlySet<ChordPresetId>,
): boolean {
  return !disabled.has(chordId)
}

export function allChordsPlayable(
  chordIds: readonly ChordPresetId[],
  disabled: ReadonlySet<ChordPresetId>,
): boolean {
  return chordIds
    .filter((id) => isChordPracticeable(id))
    .every((id) => isChordPlayable(id, disabled))
}

export function unplayableChordsIn(
  chordIds: readonly ChordPresetId[],
  disabled: ReadonlySet<ChordPresetId>,
): ChordPresetId[] {
  return chordIds.filter((id) => !isChordPlayable(id, disabled))
}

export function isProgressionPlayableInKey(
  keyId: KeyId,
  progressionId: ProgressionId,
  disabled: ReadonlySet<ChordPresetId>,
): boolean {
  if (!isProgressionResolvableInKey(keyId, progressionId)) {
    return false
  }
  return allChordsPlayable(
    chordsForProgression(keyId, progressionId),
    disabled,
  )
}

/** At least one progression in this key uses only playable chords. */
export function isKeyPlayable(
  keyId: KeyId,
  disabled: ReadonlySet<ChordPresetId>,
): boolean {
  return PROGRESSION_IDS.some((progressionId) =>
    isProgressionPlayableInKey(keyId, progressionId, disabled),
  )
}

export function playableProgressionsInKey(
  keyId: KeyId,
  disabled: ReadonlySet<ChordPresetId>,
): ProgressionId[] {
  return PROGRESSION_IDS.filter((progressionId) =>
    isProgressionPlayableInKey(keyId, progressionId, disabled),
  )
}

export function playableChordsInKey(
  keyId: KeyId,
  disabled: ReadonlySet<ChordPresetId>,
): ChordPresetId[] {
  return chordsInKeyOrder(keyId).filter((id) => isChordPlayable(id, disabled))
}
