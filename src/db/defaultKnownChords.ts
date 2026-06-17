import knownIdsJson from '../data/defaultKnownChordIds.json'
import type { ChordPresetId } from '../components/Fretboard'

/**
 * Chords treated as "known" in the default site snapshot — open/campfire shapes,
 * common 7ths, sus, add9, and a few color voicings used in progression seeds.
 */
export const DEFAULT_KNOWN_CHORD_IDS = knownIdsJson as readonly ChordPresetId[]

export function defaultKnownChords(): ChordPresetId[] {
  return [...DEFAULT_KNOWN_CHORD_IDS]
}
