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

/** Conventional human hearing band used for the tuner range display. */
export const AUDIBLE_MIN_HZ = 20
export const AUDIBLE_MAX_HZ = 20_000

/**
 * Returns fundamental frequency in Hz, or -1 if no clear pitch.
 * Based on the classic Web Audio autocorrelation approach.
 * `minHz` / `maxHz` clamp the search (defaults cover the audible band,
 * capped by Nyquist).
 */
export function detectFrequency(
  buffer: Float32Array,
  sampleRate: number,
  minHz: number = AUDIBLE_MIN_HZ,
  maxHz: number = AUDIBLE_MAX_HZ,
): number {
  const size = buffer.length
  if (size < 32 || sampleRate <= 0) {
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
  // Ignore silence / noise floor
  if (rms < 0.01) {
    return -1
  }

  // Find signal start / end (skip near-silent edges)
  let r1 = 0
  let r2 = size - 1
  const threshold = 0.2
  for (let i = 0; i < size / 2; i++) {
    if (Math.abs(buffer[i]!) > threshold) {
      r1 = i
      break
    }
  }
  for (let i = 1; i < size / 2; i++) {
    if (Math.abs(buffer[size - i]!) > threshold) {
      r2 = size - i
      break
    }
  }

  const trimmed = buffer.subarray(r1, r2)
  const n = trimmed.length
  if (n < 32) {
    return -1
  }

  const maxSamples = Math.min(Math.floor(sampleRate / lo), Math.floor(n / 2))
  const minSamples = Math.max(2, Math.floor(sampleRate / hi))
  if (maxSamples <= minSamples) {
    return -1
  }

  const correlations = new Float32Array(maxSamples)
  for (let offset = minSamples; offset < maxSamples; offset++) {
    let sum = 0
    // Stride slightly on long windows to keep mobile frames cheap.
    const step = n - offset > 4096 ? 2 : 1
    for (let i = 0; i < n - offset; i += step) {
      sum += trimmed[i]! * trimmed[i + offset]!
    }
    correlations[offset] = sum
  }

  // Find first dip then climb to peak (skip lag-0 lobe)
  let d = minSamples
  while (d + 1 < maxSamples && correlations[d]! > correlations[d + 1]!) {
    d++
  }

  let maxCorr = -1
  let maxOffset = -1
  for (let i = d; i < maxSamples; i++) {
    const corr = correlations[i]!
    if (corr > maxCorr) {
      maxCorr = corr
      maxOffset = i
    }
  }

  if (maxOffset <= 0 || maxCorr < 0.01) {
    return -1
  }

  // Parabolic interpolation around the peak for sub-sample accuracy
  const y0 = correlations[maxOffset - 1] ?? maxCorr
  const y1 = maxCorr
  const y2 = correlations[maxOffset + 1] ?? maxCorr
  const denom = 2 * (2 * y1 - y0 - y2)
  const shift = denom === 0 ? 0 : (y2 - y0) / denom
  const betterOffset = maxOffset + shift
  if (betterOffset <= 0) {
    return -1
  }

  const frequency = sampleRate / betterOffset
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
