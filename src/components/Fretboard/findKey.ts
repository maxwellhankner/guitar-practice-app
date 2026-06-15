import { parseChordPresetId, type ChordPresetId, type RootName } from './chords'
import { diatonicRootNamesInKey } from './progressionBuilder'
import { KEY_MAJOR_IDS, KEY_MINOR_IDS, type KeyId } from './keys'

const ALL_KEY_IDS = [...KEY_MAJOR_IDS, ...KEY_MINOR_IDS] as const

/**
 * Keys whose diatonic triads cover every selected chord root (quality ignored).
 * E.g. A + C# match F#m (III + v) even when you picked major C# not C#m.
 */
export function keysMatchingChords(
  chordIds: readonly ChordPresetId[],
): KeyId[] {
  if (chordIds.length === 0) {
    return []
  }
  const selectedRoots = new Set(
    chordIds.map((id) => parseChordPresetId(id).rootName as RootName),
  )
  return ALL_KEY_IDS.filter((keyId) => {
    const keyRoots = diatonicRootNamesInKey(keyId)
    for (const root of selectedRoots) {
      if (!keyRoots.has(root)) {
        return false
      }
    }
    return true
  })
}
