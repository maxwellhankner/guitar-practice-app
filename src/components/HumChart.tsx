import { useMemo } from 'react'
import type { ChartMark, PitchPoint } from '../audio/humTrace'
import styles from './HumChart.module.css'

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

const VB_W = 640
const VB_H = 176
const PAD_L = 44
const PAD_R = 16
const PAD_T = 16
const PAD_B = 16
const PLOT_W = VB_W - PAD_L - PAD_R
const PLOT_H = VB_H - PAD_T - PAD_B

/** While listening, keep the latest stretch of the line in view. */
const FOLLOW_MS = 10000
const EMPTY_LO = 60
const EMPTY_HI = 72

type HumChartProps = {
  points: readonly PitchPoint[]
  marks: readonly ChartMark[]
  listening: boolean
}

function noteLabel(midi: number): string {
  const rounded = Math.round(midi)
  const pc = ((rounded % 12) + 12) % 12
  const octave = Math.floor(rounded / 12) - 1
  return `${NOTE_NAMES[pc]}${octave}`
}

function isNatural(midi: number): boolean {
  const pc = ((midi % 12) + 12) % 12
  return pc === 0 || pc === 2 || pc === 4 || pc === 5 || pc === 7 || pc === 9 || pc === 11
}

type XY = { x: number; y: number }

function withSpacedLabels<T extends { x: number }>(
  marks: readonly T[],
  gap: number,
): (T & { showLabel: boolean })[] {
  const drawn: (T & { showLabel: boolean })[] = []
  let lastLabelX = -999
  for (const mark of marks) {
    const showLabel = mark.x - lastLabelX > gap
    if (showLabel) {
      lastLabelX = mark.x
    }
    drawn.push({ ...mark, showLabel })
  }
  return drawn
}

export function HumChart({ points, marks, listening }: HumChartProps) {
  const geometry = useMemo(() => {
    const lastT = points.length > 0 ? points[points.length - 1]!.t : 0
    let t0 = 0
    let t1 = Math.max(lastT, 4000)
    if (listening) {
      t1 = Math.max(lastT, FOLLOW_MS)
      t0 = Math.max(0, t1 - FOLLOW_MS)
    } else if (lastT > 16000) {
      t0 = lastT - 16000
      t1 = lastT
    }

    const heard = points.flatMap((point) =>
      point.midi != null && point.t >= t0 && point.t <= t1 ? [point.midi] : [],
    )
    for (const mark of marks) {
      if (mark.t >= t0 && mark.t <= t1) {
        heard.push(mark.midi)
      }
    }

    let midiLo = EMPTY_LO
    let midiHi = EMPTY_HI
    if (heard.length > 0) {
      midiLo = Math.floor(Math.min(...heard)) - 1
      midiHi = Math.ceil(Math.max(...heard)) + 1
      if (midiHi - midiLo < 6) {
        const mid = (midiHi + midiLo) / 2
        midiLo = Math.floor(mid - 3)
        midiHi = Math.ceil(mid + 3)
      }
    }

    const spanT = Math.max(1, t1 - t0)
    const spanM = Math.max(1, midiHi - midiLo)
    const xOf = (t: number) => PAD_L + ((t - t0) / spanT) * PLOT_W
    const yOf = (midi: number) => PAD_T + (1 - (midi - midiLo) / spanM) * PLOT_H

    const grid: { midi: number; y: number; label: string | null }[] = []
    const labelAll = midiHi - midiLo <= 12
    for (let midi = midiLo; midi <= midiHi; midi++) {
      const show = labelAll || isNatural(midi)
      grid.push({
        midi,
        y: yOf(midi),
        label: show ? noteLabel(midi) : null,
      })
    }

    const segments: XY[][] = []
    let current: XY[] = []
    for (const point of points) {
      if (point.t < t0 - 80) {
        continue
      }
      if (point.t > t1) {
        break
      }
      if (point.midi == null) {
        if (current.length > 0) {
          segments.push(current)
          current = []
        }
        continue
      }
      current.push({ x: xOf(point.t), y: yOf(point.midi) })
    }
    if (current.length > 0) {
      segments.push(current)
    }

    const visibleMarks = marks
      .filter((mark) => mark.t >= t0 && mark.t <= t1)
      .map((mark) => ({
        ...mark,
        x: xOf(mark.t),
        y: yOf(mark.midi),
      }))
    const drawnMarks = withSpacedLabels(visibleMarks, 46)

    const head = (() => {
      for (let i = points.length - 1; i >= 0; i--) {
        const point = points[i]!
        if (point.t < t0) {
          break
        }
        if (point.midi != null && point.t <= t1) {
          return { x: xOf(point.t), y: yOf(point.midi) }
        }
      }
      return null
    })()

    return { grid, segments, drawnMarks, head, t0, t1 }
  }, [points, marks, listening])

  const summary =
    marks.length === 0
      ? 'Pitch chart. No notes recorded yet.'
      : `Pitch chart. Recorded ${marks.map((mark) => mark.label).join(', ')}.`

  return (
    <figure className={styles.figure}>
      <figcaption className="diagram-label">Pitch over time</figcaption>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={summary}
      >
        <rect className={styles.frame} x={0} y={0} width={VB_W} height={VB_H} rx={10} />
        {geometry.grid.map((row) => (
          <g key={row.midi}>
            <line
              className={styles.grid}
              x1={PAD_L}
              x2={VB_W - PAD_R}
              y1={row.y}
              y2={row.y}
            />
            {row.label ? (
              <text className={styles.noteLabel} x={8} y={row.y}>
                {row.label}
              </text>
            ) : null}
          </g>
        ))}
        {geometry.segments.map((segment, index) =>
          segment.length < 2 ? (
            <circle
              key={`seg-${index}`}
              className={styles.head}
              cx={segment[0]!.x}
              cy={segment[0]!.y}
              r={2.5}
            />
          ) : (
            <path
              key={`seg-${index}`}
              className={styles.line}
              d={segment
                .map((point, pointIndex) =>
                  `${pointIndex === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
                )
                .join(' ')}
            />
          ),
        )}
        {geometry.drawnMarks.map((mark) => (
          <g key={`${mark.order}-${mark.t}`}>
            <circle className={styles.mark} cx={mark.x} cy={mark.y} r={4} />
            {mark.showLabel ? (
              <text className={styles.markLabel} x={mark.x} y={mark.y - 10}>
                {mark.label}
              </text>
            ) : null}
          </g>
        ))}
        {listening && geometry.head ? (
          <circle className={styles.head} cx={geometry.head.x} cy={geometry.head.y} r={4} />
        ) : null}
        {points.length === 0 ? (
          <text className={styles.empty} x={PAD_L + PLOT_W / 2} y={PAD_T + PLOT_H / 2}>
            Hum to draw the line
          </text>
        ) : null}
      </svg>
    </figure>
  )
}
