/** One sample of the hum. Silence is left out, so `t` only moves while there is pitch. */
export type PitchPoint = {
  /** Milliseconds of sounded time. Pauses are not included. */
  t: number
  /** Null only breaks the stroke after a pause. It does not add time. */
  midi: number | null
}

export type SoundTrace = {
  points: PitchPoint[]
  /** End of the sounded timeline, in milliseconds. */
  soundMs: number
  /** The next pitch should start a new stroke instead of joining the last one. */
  gapPending: boolean
}

export function createSoundTrace(): SoundTrace {
  return { points: [], soundMs: 0, gapPending: false }
}

/** Append one pitched sample. A pause adds no time; the next pitch follows the last one. */
export function recordSound(
  trace: SoundTrace,
  midi: number,
  sampleMs: number,
): void {
  if (trace.gapPending && trace.points.length > 0) {
    trace.points.push({ t: trace.soundMs, midi: null })
    trace.gapPending = false
  }
  trace.soundMs += sampleMs
  trace.points.push({ t: trace.soundMs, midi })
}

/** Remember that the latest pitch has ended, without moving the timeline. */
export function markPause(trace: SoundTrace): void {
  if (trace.points.length > 0) {
    trace.gapPending = true
  }
}

/** A note that was written into the phrase. */
export type ChartMark = {
  t: number
  midi: number
  label: string
  order: number
}
