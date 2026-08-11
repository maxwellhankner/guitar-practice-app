/** Pitch detection via autocorrelation (monophonic). */

export type DetectedPitch = {
  frequency: number
  noteIndex: number
  noteName: string
  octave: number
  /** Cents off the nearest equal-temperament note. */
  cents: number
  /** Frequency of the nearest equal-temperament note. */
  nearestNoteHz: number
}

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

const A4_HZ = 440

/** Practical standard-electric range (~E2–E6) with a little headroom. */
export const AUDIBLE_MIN_HZ = 70
export const AUDIBLE_MAX_HZ = 1500

const YIN_THRESHOLD = 0.15

function parabolicPeak(values: Float32Array, index: number): number {
  const x0 = values[index - 1] ?? values[index]!
  const x1 = values[index]!
  const x2 = values[index + 1] ?? values[index]!
  const denom = 2 * (2 * x1 - x0 - x2)
  if (denom === 0) {
    return index
  }
  return index + (x2 - x0) / denom
}

/**
 * Returns fundamental frequency in Hz, or -1 if no clear pitch.
 * Uses the YIN cumulative-mean-normalized difference method, which tracks
 * sustained tones much more reliably than plain autocorrelation.
 */
export function detectFrequency(
  buffer: Float32Array,
  sampleRate: number,
  minHz: number = AUDIBLE_MIN_HZ,
  maxHz: number = AUDIBLE_MAX_HZ,
): number {
  const size = buffer.length
  if (size < 64 || sampleRate <= 0) {
    return -1
  }

  const nyquist = sampleRate / 2
  const lo = Math.max(AUDIBLE_MIN_HZ, minHz)
  const hi = Math.min(nyquist * 0.98, maxHz)
  if (!(lo < hi)) {
    return -1
  }

  let rms = 0
  for (let i = 0; i < size; i++) {
    const val = buffer[i]!
    rms += val * val
  }
  rms = Math.sqrt(rms / size)
  // Ignore silence / noise floor (kept low so quiet sustained notes still track)
  if (rms < 0.008) {
    return -1
  }

  // Analyse the most recent half-buffer so continuous tones stay in-window.
  const half = Math.floor(size / 2)
  const start = size - half * 2
  const minTau = Math.max(2, Math.floor(sampleRate / hi))
  const maxTau = Math.min(half - 2, Math.floor(sampleRate / lo))
  if (maxTau <= minTau) {
    return -1
  }

  const yin = new Float32Array(maxTau + 1)

  // Difference function d(tau).
  for (let tau = 1; tau <= maxTau; tau++) {
    let sum = 0
    for (let i = 0; i < half; i++) {
      const delta = buffer[start + i]! - buffer[start + i + tau]!
      sum += delta * delta
    }
    yin[tau] = sum
  }

  // Cumulative mean normalized difference (classic YIN).
  yin[0] = 1
  let runningSum = 0
  for (let tau = 1; tau <= maxTau; tau++) {
    runningSum += yin[tau]!
    yin[tau] = runningSum > 0 ? (yin[tau]! * tau) / runningSum : 1
  }

  // Absolute threshold: first dip under threshold, then local minimum.
  let tauEstimate = -1
  for (let tau = minTau; tau < maxTau; tau++) {
    if (yin[tau]! < YIN_THRESHOLD) {
      while (tau + 1 <= maxTau && yin[tau + 1]! < yin[tau]!) {
        tau++
      }
      tauEstimate = tau
      break
    }
  }

  // Fallback: strongest minimum in-band (still reject very weak periodicity).
  if (tauEstimate < 0) {
    let bestVal = 1
    let bestTau = -1
    for (let tau = minTau; tau <= maxTau; tau++) {
      const value = yin[tau]!
      if (value < bestVal) {
        bestVal = value
        bestTau = tau
      }
    }
    if (bestTau < 0 || bestVal > 0.45) {
      return -1
    }
    tauEstimate = bestTau
  }

  const betterTau = parabolicPeak(yin, tauEstimate)
  if (!(betterTau > 0)) {
    return -1
  }

  const frequency = sampleRate / betterTau
  if (frequency < lo || frequency > hi) {
    return -1
  }
  return frequency
}

export function midiFromFrequency(frequency: number): number {
  return 69 + 12 * Math.log2(frequency / A4_HZ)
}

export function frequencyFromMidi(midi: number): number {
  return A4_HZ * 2 ** ((midi - 69) / 12)
}

export function pitchFromFrequency(frequency: number): DetectedPitch | null {
  if (!(frequency > 0) || !Number.isFinite(frequency)) {
    return null
  }
  const midi = midiFromFrequency(frequency)
  const rounded = Math.round(midi)
  const cents = (midi - rounded) * 100
  const noteIndex = ((rounded % 12) + 12) % 12
  const octave = Math.floor(rounded / 12) - 1
  return {
    frequency,
    noteIndex,
    noteName: NOTE_NAMES[noteIndex]!,
    octave,
    cents,
    nearestNoteHz: frequencyFromMidi(rounded),
  }
}

export type GuitarString = {
  id: string
  label: string
  noteName: string
  octave: number
  frequency: number
}

/** Standard tuning, low → high. */
export const STANDARD_GUITAR_STRINGS: readonly GuitarString[] = [
  { id: 'E2', label: '6 · E', noteName: 'E', octave: 2, frequency: 82.4069 },
  { id: 'A2', label: '5 · A', noteName: 'A', octave: 2, frequency: 110.0 },
  { id: 'D3', label: '4 · D', noteName: 'D', octave: 3, frequency: 146.832 },
  { id: 'G3', label: '3 · G', noteName: 'G', octave: 3, frequency: 196.0 },
  { id: 'B3', label: '2 · B', noteName: 'B', octave: 3, frequency: 246.942 },
  { id: 'E4', label: '1 · E', noteName: 'E', octave: 4, frequency: 329.628 },
]

export function nearestGuitarString(frequency: number): GuitarString {
  let best = STANDARD_GUITAR_STRINGS[0]!
  let bestCents = Infinity
  for (const s of STANDARD_GUITAR_STRINGS) {
    const cents = Math.abs(1200 * Math.log2(frequency / s.frequency))
    if (cents < bestCents) {
      bestCents = cents
      best = s
    }
  }
  return best
}

export function centsOffTarget(frequency: number, targetHz: number): number {
  return 1200 * Math.log2(frequency / targetHz)
}

/** 0–100 position on a log frequency axis spanning the audible band. */
export function audibleRangePosition(frequency: number): number {
  const lo = Math.log(AUDIBLE_MIN_HZ)
  const hi = Math.log(AUDIBLE_MAX_HZ)
  const clamped = Math.min(
    AUDIBLE_MAX_HZ,
    Math.max(AUDIBLE_MIN_HZ, frequency),
  )
  return ((Math.log(clamped) - lo) / (hi - lo)) * 100
}

export function formatFrequency(hz: number): string {
  if (hz >= 1000) {
    const khz = hz / 1000
    return `${khz >= 10 ? khz.toFixed(1) : khz.toFixed(2)} kHz`
  }
  if (hz >= 100) {
    return `${hz.toFixed(1)} Hz`
  }
  return `${hz.toFixed(2)} Hz`
}
