export { Fretboard, type FretboardScalePattern } from './Fretboard'
export {
  scalePatternForKey,
  scalePositionsInRange,
  SCALE_SELECTIONS,
  sanitizeScaleSelection,
  type ScaleSelection,
  type ScalePosition,
} from './scales'
export {
  scalePitchClassesForKey,
  scaleNameForKey,
  type ScaleVariant,
} from './keys'
export type {
  ChordFingering,
  FingerNumber,
  FretboardOrientation,
  StringFret,
} from './types'
export {
  CHORD_PRESETS,
  CHORD_PRESET_IDS,
  CHORD_MAJOR_IDS,
  CHORD_MINOR_IDS,
  ROOT_NAMES,
  chordIdsForRoot,
  chordPitchClasses,
  isDiminishedChord,
  parseChordPresetId,
  resolveChord,
  type ChordPresetId,
  type ChordQuality,
  type RootName,
} from './chords'
export {
  KEY_DEFS,
  KEY_MAJOR_IDS,
  KEY_MINOR_IDS,
  chordsInKeyOrder,
  chordIdForScaleDegree,
  diatonicSlotsInKey,
  isChordInKey,
  chordRomanNumeral,
  romanLabelForChordInKey,
  chordIdToScaleKey,
  diatonicChordIdsOnScale,
  scaleDegreesInVariant,
  romanNumeralForScaleDegree,
  chordRomanNumeralOnScale,
  type KeyId,
  type KeyDef,
  type DiatonicSlot,
} from './keys'
export {
  colorAlternativesForDegree,
  isSelectableChordInKey,
  type ResolvedColorChord,
} from './chordColors'
export {
  PROGRESSIONS,
  PROGRESSION_IDS,
  BASIC_PROGRESSION_IDS,
  COLORED_PROGRESSION_IDS,
  chordsForProgression,
  allowedChordsForProgression,
  isProgressionResolvableInKey,
  type ProgressionId,
  type BasicProgressionId,
  type ColoredProgressionId,
  type ProgressionCategory,
  type ProgressionDef,
  type ProgressionStepDef,
} from './progressions'
export {
  MIN_PROGRESSION_STEPS,
  MAX_PROGRESSION_STEPS,
  romanLabelForProgressionStep,
  degreeForRootInKey,
  diatonicRootNamesInKey,
  isRootInKey,
  seedProgressionFromPreset,
  allowedChordsForBuiltProgression,
  progressionHighlightedTriadsInKey,
  swapAdjacentProgressionSteps,
  deleteProgressionStep,
  insertProgressionStep,
  progressionAltOptions,
  type ProgressionAltOption,
  triadIdForStep,
  transposeChordBetweenKeys,
  transposeProgressionToKey,
} from './progressionBuilder'
export {
  isChordPlayable,
  unplayableChordsIn,
  isProgressionPlayableInKey,
  isKeyPlayable,
} from './playability'
export {
  rankKeysForChords,
  findKeyMatchBrightness,
  type KeyMatchRank,
} from './findKey'
export {
  NOTE_NAMES_SHARP,
  OPEN_STRING_PITCH_CLASS,
  noteAtFret,
} from './tuning'
export {
  FRET_COUNT_OPTIONS,
  FRET_COUNT_MIN,
  FRET_COUNT_MAX,
  sanitizeFretCount,
  startFretForFingering,
} from './viewport'
