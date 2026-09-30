import type { KeyId } from '../components/Fretboard/keys'
import type { ChartMark, PitchPoint } from './humTrace'

/** Krumhansl–Kessler probe-tone weights, tonic at index 0. */
const MAJOR_PROFILE = [
  6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88,
] as const

const MINOR_PROFILE = [
  6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17,
] as const

const NOTE_NAMES = [
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

/** Samples farther than this from a semitone are slides, not a held level. */
const LEVEL_CENTS = 0.35
/** A guessed note counts about as much as a short held level. */
const GUESS_WEIGHT = 8

export type HumKeyGuess = {
  keyId: KeyId
  label: string
  /** 0–100 correlation with the key profile. */
  match: number
}

type RankedKey = HumKeyGuess & { sort: number }

function pitchClass(midi: number): number {
  const rounded = Math.round(midi)
  return ((rounded % 12) + 12) % 12
}

function pearson(left: readonly number[], right: readonly number[]): number {
  const count = left.length
  let sumLeft = 0
  let sumRight = 0
  for (let index = 0; index < count; index++) {
    sumLeft += left[index]!
    sumRight += right[index]!
  }
  const meanLeft = sumLeft / count
  const meanRight = sumRight / count
  let numerator = 0
  let leftSquares = 0
  let rightSquares = 0
  for (let index = 0; index < count; index++) {
    const leftDelta = left[index]! - meanLeft
    const rightDelta = right[index]! - meanRight
    numerator += leftDelta * rightDelta
    leftSquares += leftDelta * leftDelta
    rightSquares += rightDelta * rightDelta
  }
  const denominator = Math.sqrt(leftSquares * rightSquares)
  return denominator === 0 ? 0 : numerator / denominator
}

function correlation(
  histogram: readonly number[],
  profile: readonly number[],
  tonic: number,
): number {
  const aligned = profile.map((_, index) => histogram[(tonic + index) % 12]!)
  return pearson(aligned, profile)
}

function keyIdFor(tonic: number, minor: boolean): KeyId {
  const name = NOTE_NAMES[tonic]!
  return (minor ? `${name}m` : name) as KeyId
}

function keyLabel(tonic: number, minor: boolean): string {
  const name = NOTE_NAMES[tonic]!
  return minor ? `${name}m minor` : `${name} major`
}

/**
 * Best keys for a hummed phrase.
 * Uses time spent on pitch levels, plus the chart's note guesses.
 * Empty until the chart has both.
 */
export function detectHumKey(
  points: readonly PitchPoint[],
  marks: readonly ChartMark[],
): HumKeyGuess[] {
  if (marks.length === 0) {
    return []
  }

  const histogram = Array.from({ length: 12 }, () => 0)
  let levelCount = 0
  for (const point of points) {
    if (point.midi == null) {
      continue
    }
    const nearest = Math.round(point.midi)
    if (Math.abs(point.midi - nearest) > LEVEL_CENTS) {
      continue
    }
    histogram[pitchClass(nearest)] += 1
    levelCount += 1
  }
  if (levelCount === 0) {
    return []
  }

  for (const mark of marks) {
    histogram[pitchClass(mark.midi)] += GUESS_WEIGHT
  }

  let loudest = 0
  for (let index = 1; index < histogram.length; index++) {
    if (histogram[index]! > histogram[loudest]!) {
      loudest = index
    }
  }
  const firstGuess = pitchClass(marks[0]!.midi)

  const ranked: RankedKey[] = []
  for (let tonic = 0; tonic < 12; tonic++) {
    const tonicBonus = tonic === loudest ? 0.03 : 0
    const startBonus = tonic === firstGuess ? 0.015 : 0
    for (const minor of [false, true]) {
      const profile = minor ? MINOR_PROFILE : MAJOR_PROFILE
      const score = correlation(histogram, profile, tonic)
      ranked.push({
        keyId: keyIdFor(tonic, minor),
        label: keyLabel(tonic, minor),
        match: Math.round(Math.max(0, score) * 100),
        sort: score + tonicBonus + startBonus,
      })
    }
  }

  ranked.sort((a, b) => b.sort - a.sort)
  const best = ranked[0]!
  const shown = ranked.filter(
    (item, index) =>
      index === 0 || (best.sort - item.sort <= 0.08 && item.match >= 45),
  )
  return shown.slice(0, 3).map(({ keyId, label, match }) => ({
    keyId,
    label,
    match,
  }))
}
