export { Fretboard, type FretboardScalePattern } from './Fretboard'
export {
  PENTATONIC_KEYS,
  PENTATONIC_KEY_IDS,
  pentatonicPatternForWindow,
  type PentatonicKeyId,
  type PentatonicKeyDef,
  type PentatonicPosition,
} from './pentatonicShapes'
export type {
  ChordFingering,
  FingerNumber,
  StringFret,
} from './types'
export {
  CHORD_PRESETS,
  CHORD_PRESET_IDS,
  CHORD_MAJOR_IDS,
  CHORD_MINOR_IDS,
  resolveChord,
  type ChordPresetId,
} from './chords'
export {
  KEY_DEFS,
  KEY_MAJOR_IDS,
  KEY_MINOR_IDS,
  chordsInKeyOrder,
  isChordInKey,
  chordLabelInKey,
  chordRomanNumeral,
  type KeyId,
  type KeyDef,
} from './keys'
export {
  PROGRESSIONS,
  PROGRESSION_IDS,
  chordsForProgression,
  type ProgressionId,
  type ProgressionDef,
} from './progressions'
export {
  NOTE_NAMES_SHARP,
  OPEN_STRING_PITCH_CLASS,
  noteAtFret,
} from './tuning'
