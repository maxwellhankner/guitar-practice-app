export type ProgressionDiagramArrangement = 'row' | 'column' | 'grid'

/**
 * Progression fretboard layout from device, panel split, and fret orientation.
 *
 * | Device  | Panel      | Frets      | Arrangement |
 * |---------|------------|------------|-------------|
 * | Desktop | horizontal | horizontal | row         |
 * | Desktop | horizontal | vertical   | row         |
 * | Desktop | vertical   | horizontal | column      |
 * | Desktop | vertical   | vertical   | grid        |
 * | Mobile  | horizontal | horizontal | column      |
 * | Mobile  | horizontal | vertical   | grid        |
 * | Mobile  | vertical   | horizontal | grid        |
 * | Mobile  | vertical   | vertical   | row         |
 */
export function progressionDiagramArrangement(
  isMobile: boolean,
  panelVertical: boolean,
  fretsPortrait: boolean,
): ProgressionDiagramArrangement {
  if (!isMobile) {
    if (!panelVertical) {
      return 'row'
    }
    return fretsPortrait ? 'grid' : 'column'
  }
  if (!panelVertical) {
    return fretsPortrait ? 'grid' : 'column'
  }
  return fretsPortrait ? 'row' : 'grid'
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
