export { Fretboard, type FretboardOrientation, type FretboardScalePattern } from './Fretboard'
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
  StringFret,
} from './types'
export {
  CHORD_PRESETS,
  CHORD_PRESET_IDS,
  CHORD_MAJOR_IDS,
  CHORD_MINOR_IDS,
  CHORD_DIM_IDS,
  CHORD_SELECTABLE_IDS,
  ROOT_NAMES,
  chordIdsForRoot,
  chordPitchClasses,
  isChordPracticeable,
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
  chordLabelInKey,
  chordRomanNumeral,
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
  chordsForProgression,
  progressionStepsInKey,
  allowedChordsForProgression,
  isProgressionResolvableInKey,
  type ProgressionId,
  type ProgressionDef,
  type ProgressionStep,
} from './progressions'
export {
  MIN_PROGRESSION_STEPS,
  MAX_PROGRESSION_STEPS,
  progressionChipSegment,
  progressionChipText,
  degreeForRootInKey,
  diatonicRootNamesInKey,
  isRootInKey,
  seedProgressionFromPreset,
  allowedChordsForBuiltProgression,
  progressionStepRoots,
  swapAdjacentProgressionSteps,
  deleteProgressionStep,
  insertProgressionStep,
  alternateChordIdsForStep,
  progressionAltOptionIds,
  triadIdForStep,
  transposeChordBetweenKeys,
  transposeProgressionToKey,
  qualityChipLabel,
} from './progressionBuilder'
export {
  isChordPlayable,
  allChordsPlayable,
  unplayableChordsIn,
  isProgressionPlayableInKey,
  isKeyPlayable,
  playableProgressionsInKey,
  playableChordsInKey,
} from './playability'
export { keysMatchingChords } from './findKey'
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
