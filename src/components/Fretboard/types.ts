export type FretboardOrientation = 'landscape' | 'portrait'

/**
 * Per-string state: low E (index 0) → high E (index 5).
 * Diagram renders top → bottom as high E, B, G, D, A, low E (tab / chord-chart style).
 * `0` = open, positive integer = fret, `'x'` = muted / do not play.
 */
export type StringFret = 'x' | number

/** Left-hand finger: 1 index … 4 pinky. Use `null` where no number is shown. */
export type FingerNumber = 1 | 2 | 3 | 4

export type ChordFingering = {
  /** Optional label for captions / accessibility */
  name?: string
  strings: readonly [
    StringFret,
    StringFret,
    StringFret,
    StringFret,
    StringFret,
    StringFret,
  ]
  /**
   * Optional suggested fingering per string (low E → high E), only on fretted strings.
   * Shown on dots when note names are hidden; hidden when “display notes” is on.
   */
  fingers?: readonly [
    FingerNumber | null,
    FingerNumber | null,
    FingerNumber | null,
    FingerNumber | null,
    FingerNumber | null,
    FingerNumber | null,
  ]
}
