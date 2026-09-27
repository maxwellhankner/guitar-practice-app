import type { NumberedPosition } from '../audio/humPlacement'
import styles from './VocalizerBoard.module.css'

const FRETS = 12
const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e'] as const

const LEFT = 36
const TOP = 22
const STRING_GAP = 22
const FRET_W = 34
const NUT_X = LEFT + 28
const BOARD_RIGHT = NUT_X + FRETS * FRET_W
const BOARD_BOTTOM = TOP + 5 * STRING_GAP
const VB_W = BOARD_RIGHT + 16
const VB_H = BOARD_BOTTOM + 22

function stringY(stringIndex: number): number {
  return TOP + (5 - stringIndex) * STRING_GAP
}

function fretLineX(fret: number): number {
  return NUT_X + fret * FRET_W
}

function noteX(fret: number): number {
  if (fret === 0) {
    return NUT_X - 16
  }
  return NUT_X + (fret - 0.5) * FRET_W
}

function inlayFrets(fret: number): 'single' | 'double' | null {
  const pos = fret % 12
  if (pos === 0) {
    return 'double'
  }
  if (pos === 3 || pos === 5 || pos === 7 || pos === 9) {
    return 'single'
  }
  return null
}

type VocalizerBoardProps = {
  label: string
  positions: readonly NumberedPosition[]
  /** Fill the diagram panel under the divider. */
  fit?: boolean
}

export function VocalizerBoard({ label, positions, fit = false }: VocalizerBoardProps) {
  const midY = (stringY(2) + stringY(3)) / 2

  return (
    <figure className={fit ? `${styles.figure} ${styles.figureFit}` : styles.figure}>
      <figcaption className={styles.caption}>{label}</figcaption>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={
          positions.length === 0
            ? `${label}, empty fretboard`
            : `${label}: ${positions
                .map((p) => `${p.orders.join(' and ')} on ${p.noteName}`)
                .join(', ')}`
        }
      >
        <rect
          className={styles.board}
          x={NUT_X}
          y={TOP - 8}
          width={BOARD_RIGHT - NUT_X}
          height={BOARD_BOTTOM - TOP + 16}
          rx={4}
        />

        {Array.from({ length: FRETS }, (_, index) => {
          const fret = index + 1
          const kind = inlayFrets(fret)
          if (!kind) {
            return null
          }
          const cx = noteX(fret)
          if (kind === 'double') {
            return (
              <g key={`inlay-${fret}`}>
                <circle className={styles.inlay} cx={cx} cy={stringY(4)} r={3.2} />
                <circle className={styles.inlay} cx={cx} cy={stringY(1)} r={3.2} />
              </g>
            )
          }
          return (
            <circle
              key={`inlay-${fret}`}
              className={styles.inlay}
              cx={cx}
              cy={midY}
              r={3.2}
            />
          )
        })}

        {Array.from({ length: FRETS }, (_, index) => {
          const fret = index + 1
          return (
            <line
              key={`fret-${fret}`}
              className={styles.fret}
              x1={fretLineX(fret)}
              x2={fretLineX(fret)}
              y1={TOP - 6}
              y2={BOARD_BOTTOM + 6}
            />
          )
        })}

        <line
          className={styles.nut}
          x1={NUT_X}
          x2={NUT_X}
          y1={TOP - 8}
          y2={BOARD_BOTTOM + 8}
        />

        {STRING_LABELS.map((name, stringIndex) => {
          const y = stringY(stringIndex)
          return (
            <g key={name + stringIndex}>
              <text className={styles.stringName} x={8} y={y}>
                {name}
              </text>
              <line
                className={styles.string}
                x1={NUT_X}
                x2={BOARD_RIGHT}
                y1={y}
                y2={y}
              />
            </g>
          )
        })}

        {[0, 3, 5, 7, 9, 12].map((fret) => (
          <text
            key={`label-${fret}`}
            className={styles.fretNum}
            x={fret === 0 ? NUT_X - 16 : noteX(fret)}
            y={VB_H - 4}
          >
            {fret === 0 ? '' : fret}
          </text>
        ))}

        {positions.map((position) => {
          const labelText = position.orders.join(',')
          const cx = noteX(position.fret)
          const cy = stringY(position.stringIndex)
          return (
            <g key={`${position.stringIndex}-${position.fret}`}>
              <circle className={styles.dot} cx={cx} cy={cy} r={labelText.length > 2 ? 9 : 8} />
              <text
                className={styles.order}
                x={cx}
                y={cy}
                fontSize={labelText.length > 2 ? 7 : 9}
              >
                {labelText}
              </text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}
