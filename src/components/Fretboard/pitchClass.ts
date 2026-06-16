/** Pitch class from C (=0) for sharp spellings used as chord roots. */
export const ROOT_PC: Record<string, number> = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11,
}

export function pitchClassForRoot(rootName: string): number | undefined {
  return ROOT_PC[rootName]
}
