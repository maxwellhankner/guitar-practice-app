export type ProgressionDiagramArrangement = 'row' | 'column' | 'grid'

/**
 * Progression fretboard layout from panel split and fret orientation.
 * Viewport width must not change arrangement (same as large-screen layout).
 *
 * | Panel      | Frets      | Arrangement |
 * |------------|------------|-------------|
 * | horizontal | horizontal | row         |
 * | horizontal | vertical   | row         |
 * | vertical   | horizontal | column      |
 * | vertical   | vertical   | grid        |
 */
export function progressionDiagramArrangement(
  panelVertical: boolean,
  fretsPortrait: boolean,
): ProgressionDiagramArrangement {
  if (!panelVertical) {
    return 'row'
  }
  return fretsPortrait ? 'grid' : 'column'
}

/** Max height cap for horizontal fretboards in grid (% of the board's grid cell). */
export function progressionBoardMaxHeight(
  stepCount: number,
  arrangement: ProgressionDiagramArrangement,
): string | undefined {
  if (arrangement !== 'grid') {
    return undefined
  }
  const stageCap = stepCount === 3 ? 33 : 25
  const rows = Math.ceil(stepCount / 2)
  return `${stageCap * rows}%`
}
