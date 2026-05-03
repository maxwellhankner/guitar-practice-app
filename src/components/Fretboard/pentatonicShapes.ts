/**
 * Five minor-pentatonic “boxes” in standard tuning, keyed to A minor pentatonic
 * (root on the 6th string at the 5th fret). Movable to other keys by shifting
 * every fret number equally.
 */
export type PentatonicShapeId = 1 | 2 | 3 | 4 | 5

export type PentatonicPosition = {
  /** 0 = low E … 5 = high E */
  stringIndex: number
  fret: number
}

export type PentatonicShapeDef = {
  name: string
  /** CAGED-style letter shown on the diagram control (minor pentatonic “box”). */
  shapeKey: string
  /** Left edge of the diagram so the box fits in a small fret window. */
  startFret: number
  positions: readonly PentatonicPosition[]
}

export const PENTATONIC_SHAPES: Record<PentatonicShapeId, PentatonicShapeDef> = {
  1: {
    name: 'Minor pentatonic — G shape',
    shapeKey: 'G',
    startFret: 5,
    positions: [
      { stringIndex: 0, fret: 5 },
      { stringIndex: 0, fret: 8 },
      { stringIndex: 1, fret: 5 },
      { stringIndex: 1, fret: 7 },
      { stringIndex: 2, fret: 5 },
      { stringIndex: 2, fret: 7 },
      { stringIndex: 3, fret: 5 },
      { stringIndex: 3, fret: 7 },
      { stringIndex: 4, fret: 5 },
      { stringIndex: 4, fret: 8 },
      { stringIndex: 5, fret: 5 },
      { stringIndex: 5, fret: 8 },
    ],
  },
  2: {
    name: 'Minor pentatonic — E shape',
    shapeKey: 'E',
    startFret: 7,
    positions: [
      { stringIndex: 0, fret: 8 },
      { stringIndex: 0, fret: 10 },
      { stringIndex: 1, fret: 7 },
      { stringIndex: 1, fret: 10 },
      { stringIndex: 2, fret: 7 },
      { stringIndex: 2, fret: 9 },
      { stringIndex: 3, fret: 7 },
      { stringIndex: 3, fret: 9 },
      { stringIndex: 4, fret: 8 },
      { stringIndex: 4, fret: 10 },
      { stringIndex: 5, fret: 8 },
      { stringIndex: 5, fret: 10 },
    ],
  },
  3: {
    name: 'Minor pentatonic — D shape',
    shapeKey: 'D',
    startFret: 9,
    positions: [
      { stringIndex: 0, fret: 10 },
      { stringIndex: 0, fret: 12 },
      { stringIndex: 1, fret: 10 },
      { stringIndex: 1, fret: 12 },
      { stringIndex: 2, fret: 9 },
      { stringIndex: 2, fret: 12 },
      { stringIndex: 3, fret: 9 },
      { stringIndex: 3, fret: 12 },
      { stringIndex: 4, fret: 10 },
      { stringIndex: 4, fret: 12 },
      { stringIndex: 5, fret: 10 },
      { stringIndex: 5, fret: 12 },
    ],
  },
  4: {
    name: 'Minor pentatonic — C shape',
    shapeKey: 'C',
    startFret: 12,
    positions: [
      { stringIndex: 0, fret: 12 },
      { stringIndex: 0, fret: 15 },
      { stringIndex: 1, fret: 12 },
      { stringIndex: 1, fret: 14 },
      { stringIndex: 2, fret: 12 },
      { stringIndex: 2, fret: 14 },
      { stringIndex: 3, fret: 12 },
      { stringIndex: 3, fret: 14 },
      { stringIndex: 4, fret: 12 },
      { stringIndex: 4, fret: 15 },
      { stringIndex: 5, fret: 12 },
      { stringIndex: 5, fret: 15 },
    ],
  },
  5: {
    name: 'Minor pentatonic — A shape',
    shapeKey: 'A',
    startFret: 1,
    positions: [
      { stringIndex: 0, fret: 3 },
      { stringIndex: 0, fret: 5 },
      { stringIndex: 1, fret: 3 },
      { stringIndex: 1, fret: 5 },
      { stringIndex: 2, fret: 2 },
      { stringIndex: 2, fret: 5 },
      { stringIndex: 3, fret: 2 },
      { stringIndex: 3, fret: 5 },
      { stringIndex: 4, fret: 3 },
      { stringIndex: 4, fret: 5 },
      { stringIndex: 5, fret: 3 },
      { stringIndex: 5, fret: 5 },
    ],
  },
}

export const PENTATONIC_SHAPE_IDS = [5, 1, 2, 3, 4] as const satisfies readonly PentatonicShapeId[]
