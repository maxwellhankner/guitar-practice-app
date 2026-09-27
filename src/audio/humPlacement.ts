/** Map a hummed phrase onto a few compact standard-tuning shapes. */

export type HummedNote = {
  noteName: string
  octave: number
  midi: number
}

export type NumberedPosition = {
  /** 0 = low E … 5 = high E */
  stringIndex: number
  fret: number
  /** 1-based pluck order. Several notes can share one spot. */
  orders: number[]
  noteName: string
}

export type PlayWay = {
  id: string
  label: string
  positions: NumberedPosition[]
}

/** Low E → high E, MIDI of the open string. */
const OPEN_MIDI = [40, 45, 50, 55, 59, 64] as const

/** Lowest open string through fret 12 on the high E. */
const GUITAR_LOW = 40
const GUITAR_HIGH = 76
const MAX_FRET = 12

const WINDOWS = [
  { id: 'open', label: 'Near the nut', lo: 0, hi: 4 },
  { id: 'middle', label: 'Middle of the neck', lo: 4, hi: 8 },
  { id: 'upper', label: 'Higher up the neck', lo: 7, hi: 12 },
] as const

/** Shift by octaves until the pitch sits on a guitar in standard tuning. */
export function normalizeMidi(midi: number): number {
  let note = Math.round(midi)
  while (note > GUITAR_HIGH) {
    note -= 12
  }
  while (note < GUITAR_LOW) {
    note += 12
  }
  return note
}

type Candidate = { stringIndex: number; fret: number }

function candidatesFor(midi: number): Candidate[] {
  const note = normalizeMidi(midi)
  const found: Candidate[] = []
  for (let stringIndex = 0; stringIndex < OPEN_MIDI.length; stringIndex++) {
    const fret = note - OPEN_MIDI[stringIndex]!
    if (fret >= 0 && fret <= MAX_FRET) {
      found.push({ stringIndex, fret })
    }
  }
  return found
}

function placeInWindow(
  notes: readonly HummedNote[],
  lo: number,
  hi: number,
): NumberedPosition[] {
  let previous: Candidate | null = null
  const raw: {
    order: number
    stringIndex: number
    fret: number
    noteName: string
  }[] = []

  notes.forEach((note, index) => {
    const options = candidatesFor(note.midi)
    if (options.length === 0) {
      return
    }

    let best = options[0]!
    let bestScore = Infinity
    for (const option of options) {
      const outside =
        option.fret < lo ? lo - option.fret : option.fret > hi ? option.fret - hi : 0
      const fretDist = previous
        ? Math.abs(option.fret - previous.fret)
        : option.fret
      const stringDist = previous
        ? Math.abs(option.stringIndex - previous.stringIndex)
        : 0
      const score = outside * 8 + fretDist * 2 + stringDist * 1.5 + option.fret * 0.05
      if (score < bestScore) {
        bestScore = score
        best = option
      }
    }

    raw.push({
      order: index + 1,
      stringIndex: best.stringIndex,
      fret: best.fret,
      noteName: note.noteName,
    })
    previous = best
  })

  const grouped = new Map<string, NumberedPosition>()
  for (const item of raw) {
    const key = `${item.stringIndex}:${item.fret}`
    const existing = grouped.get(key)
    if (existing) {
      existing.orders.push(item.order)
    } else {
      grouped.set(key, {
        stringIndex: item.stringIndex,
        fret: item.fret,
        orders: [item.order],
        noteName: item.noteName,
      })
    }
  }
  return [...grouped.values()]
}

function signature(positions: readonly NumberedPosition[]): string {
  return positions
    .map((p) => `${p.stringIndex}.${p.fret}:${p.orders.join(',')}`)
    .sort()
    .join('|')
}

/** One fingering, kept near the nut. */
export function playWayForPhrase(notes: readonly HummedNote[]): PlayWay | null {
  if (notes.length === 0) {
    return null
  }
  const window = WINDOWS[0]
  const positions = placeInWindow(notes, window.lo, window.hi)
  if (positions.length === 0) {
    return null
  }
  return { id: window.id, label: window.label, positions }
}

/** Up to three fingerings. Identical shapes are dropped. */
export function playWaysForPhrase(notes: readonly HummedNote[]): PlayWay[] {
  if (notes.length === 0) {
    return []
  }
  const ways: PlayWay[] = []
  const seen = new Set<string>()
  for (const window of WINDOWS) {
    const positions = placeInWindow(notes, window.lo, window.hi)
    const key = signature(positions)
    if (positions.length === 0 || seen.has(key)) {
      continue
    }
    seen.add(key)
    ways.push({ id: window.id, label: window.label, positions })
  }
  return ways
}
