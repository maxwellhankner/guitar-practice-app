/** Pitch class from C (=0), standard tuning low E → high E */
export const OPEN_STRING_PITCH_CLASS = [4, 9, 2, 7, 11, 4] as const

/** Sharp spellings for each pitch class */
export const NOTE_NAMES_SHARP = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const

export function noteAtFret(stringIndex: number, absoluteFret: number): string {
  const pc =
    (OPEN_STRING_PITCH_CLASS[stringIndex]! + absoluteFret) % 12
  return NOTE_NAMES_SHARP[pc]!
}
