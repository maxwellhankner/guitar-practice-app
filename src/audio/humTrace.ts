/** One sample of the hum. `midi` is null across silence so the line breaks. */
export type PitchPoint = {
  /** Milliseconds from the start of this take. */
  t: number
  midi: number | null
}

/** A note that was written into the phrase. */
export type ChartMark = {
  t: number
  midi: number
  label: string
  order: number
}
