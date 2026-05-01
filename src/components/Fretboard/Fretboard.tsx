import { useMemo } from 'react'
import type { ChordFingering } from './types'
import { resolveChord, type ChordPresetId } from './chords'
import { noteAtFret } from './tuning'
import styles from './Fretboard.module.css'

const STRINGS = 6

/** Single dot inlays at these fret numbers (when visible in the window). */
const SIDE_INLAY_FRETS = new Set([3, 5, 7])

/** Standard tuning: index 0 = low E (6th) … 5 = high E (1st) */
const OPEN_STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'E'] as const

type FretboardProps = {
  fretCount?: number
  /** First column is this fret number (default 1 = nut + open position). */
  startFret?: number
  /** When true, show chromatic note names in each fret cell (standard tuning, sharp names). */
  displayNotes?: boolean
  /** When `null`, only the blank fretboard is shown (no fingering dots or O/X). */
  chord: ChordFingering | ChordPresetId | null
  className?: string
}

function layoutGeometry(
  fretCount: number,
  startFret: number,
  fingering: ChordFingering | null,
  displayNotes: boolean,
) {
  /** Far left: O / X; next: open-string names (E A D G B E) */
  const openMarkerColW = 22
  const noteColW = 16
  const markerW = openMarkerColW + noteColW
  const openMarkerX = openMarkerColW / 2
  const noteLabelX = openMarkerColW + noteColW - 2
  /** Start after O/X column so indicators stay clear; still run under open-string names. */
  const stringStartX = openMarkerColW
  const leadIn = startFret === 1 ? 8 : 12
  const gridLeft = markerW + leadIn
  const cellW = 40
  const rightPad = 12
  const topPad = 18
  const innerH = 92
  /** Room below the string area for fret number labels (gap above viewBox bottom). */
  const bottomPad = 30

  const gridW = fretCount * cellW
  const vbW = gridLeft + gridW + rightPad
  const vbH = topPad + innerH + bottomPad

  const stringYs = Array.from({ length: STRINGS }, (_, i) => {
    const t = i / (STRINGS - 1)
    return topPad + t * innerH
  })

  /**
   * String line Y and shared row center for text (open names, O/X, fret-cell notes use
   * this Y with dominant-baseline central).
   */
  const yForString = (stringIndex: number) =>
    stringYs[STRINGS - 1 - stringIndex]!

  const boardX = gridLeft
  const boardW = gridW + 4

  const openNoteLabels = Array.from({ length: STRINGS }, (_, stringIndex) => ({
    key: `note-${stringIndex}`,
    x: noteLabelX,
    y: yForString(stringIndex),
    text: OPEN_STRING_NAMES[stringIndex]!,
  }))

  const dots: { cx: number; cy: number; key: string }[] = []
  const fingerLabels: { cx: number; cy: number; text: string; key: string }[] =
    []

  const markers: {
    x: number
    y: number
    kind: 'open' | 'mute'
    key: string
  }[] = []

  if (fingering) {
    fingering.strings.forEach((state, stringIndex) => {
      if (typeof state !== 'number' || state < 1) {
        return
      }
      const col = state - startFret
      if (col < 0 || col >= fretCount) {
        return
      }
      const cx = gridLeft + (col + 0.5) * cellW
      const cy = yForString(stringIndex)
      dots.push({ cx, cy, key: `s${stringIndex}-f${state}` })

      if (!displayNotes && fingering.fingers != null) {
        const f = fingering.fingers[stringIndex]
        if (f != null) {
          fingerLabels.push({
            cx,
            cy,
            text: String(f),
            key: `finger-${stringIndex}-f${state}`,
          })
        }
      }
    })

    fingering.strings.forEach((state, stringIndex) => {
      const y = yForString(stringIndex)
      if (state === 'x') {
        markers.push({ x: openMarkerX, y, kind: 'mute', key: `m${stringIndex}` })
      } else if (state === 0) {
        markers.push({ x: openMarkerX, y, kind: 'open', key: `o${stringIndex}` })
      }
    })
  }

  const fretLabels = Array.from({ length: fretCount }, (_, i) => ({
    x: gridLeft + (i + 0.5) * cellW,
    y: vbH - 8,
    n: startFret + i,
  }))

  const dotR = Math.min(cellW, innerH / (STRINGS - 1)) * 0.34

  const fretWireXs = Array.from({ length: fretCount }, (_, j) => gridLeft + (j + 1) * cellW)

  const inlayR = 3.15
  const inlayCy = topPad + innerH / 2
  const fretInlays: { cx: number; cy: number; key: string }[] = []
  for (let col = 0; col < fretCount; col++) {
    const absoluteFret = startFret + col
    if (SIDE_INLAY_FRETS.has(absoluteFret)) {
      fretInlays.push({
        cx: gridLeft + (col + 0.5) * cellW,
        cy: inlayCy,
        key: `inlay-fret-${absoluteFret}`,
      })
    }
  }

  const fretCellNotes: { cx: number; cy: number; text: string; key: string }[] =
    []
  if (displayNotes) {
    for (let stringIndex = 0; stringIndex < STRINGS; stringIndex++) {
      for (let col = 0; col < fretCount; col++) {
        const absoluteFret = startFret + col
        fretCellNotes.push({
          key: `cell-${stringIndex}-${col}`,
          cx: gridLeft + (col + 0.5) * cellW,
          cy: yForString(stringIndex),
          text: noteAtFret(stringIndex, absoluteFret),
        })
      }
    }
  }

  return {
    vbW,
    vbH,
    markerW,
    gridLeft,
    cellW,
    topPad,
    innerH,
    stringYs,
    boardX,
    boardW,
    dots,
    fingerLabels,
    markers,
    openNoteLabels,
    fretCellNotes,
    fretLabels,
    fretWireXs,
    fretInlays,
    inlayR,
    dotR,
    startFret,
    stringStartX,
  }
}

export function Fretboard({
  fretCount = 5,
  startFret: startFretProp,
  displayNotes = false,
  chord,
  className,
}: FretboardProps) {
  const resolved = chord == null ? null : resolveChord(chord)
  const startFret = Math.max(1, startFretProp ?? 1)

  const geo = useMemo(
    () =>
      layoutGeometry(fretCount, startFret, resolved, displayNotes),
    [fretCount, startFret, resolved, displayNotes],
  )

  const label =
    resolved == null
      ? 'No chord'
      : (resolved.name ??
        (typeof chord === 'string' ? chord : 'Custom chord'))

  const ariaLabel = `Fretboard diagram, ${label}`

  return (
    <figure
      className={[styles.wrap, className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
    >
      <svg
        className={styles.svg}
        viewBox={`0 0 ${geo.vbW} ${geo.vbH}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ aspectRatio: `${geo.vbW} / ${geo.vbH}` }}
      >
        <rect
          x={geo.boardX}
          y={geo.topPad - 6}
          width={geo.boardW}
          height={geo.innerH + 12}
          rx={5}
          className={styles.board}
        />

        {geo.startFret === 1 ? (
          <line
            x1={geo.gridLeft}
            y1={geo.topPad - 4}
            x2={geo.gridLeft}
            y2={geo.topPad + geo.innerH + 4}
            className={styles.nut}
          />
        ) : (
          <>
            <line
              x1={geo.gridLeft}
              y1={geo.topPad - 4}
              x2={geo.gridLeft}
              y2={geo.topPad + geo.innerH + 4}
              className={styles.positionBar}
            />
            <text
              x={geo.gridLeft + 8}
              y={geo.topPad + geo.innerH * 0.55}
              className={styles.positionLabel}
            >
              {geo.startFret}
            </text>
          </>
        )}

        {geo.fretWireXs.map((x, i) => (
          <line
            key={`wire-${i}`}
            x1={x}
            y1={geo.topPad - 4}
            x2={x}
            y2={geo.topPad + geo.innerH + 4}
            className={styles.fretWire}
          />
        ))}

        <g role="presentation" aria-hidden>
          {geo.fretInlays.map((dot) => (
            <circle
              key={dot.key}
              cx={dot.cx}
              cy={dot.cy}
              r={geo.inlayR}
              className={styles.fretInlay}
            />
          ))}
        </g>

        {geo.stringYs.map((y, i) => (
          <line
            key={`str-${i}`}
            x1={geo.stringStartX}
            y1={y}
            x2={geo.vbW - 12}
            y2={y}
            className={styles.string}
          />
        ))}

        {geo.openNoteLabels.map((n) => (
          <text
            key={n.key}
            x={n.x}
            y={n.y}
            className={styles.openNote}
            dominantBaseline="central"
          >
            {n.text}
          </text>
        ))}

        {geo.markers.map((m) =>
          m.kind === 'open' ? (
            <text
              key={m.key}
              x={m.x}
              y={m.y}
              className={styles.marker}
              dominantBaseline="central"
            >
              O
            </text>
          ) : (
            <text
              key={m.key}
              x={m.x}
              y={m.y}
              className={styles.marker}
              dominantBaseline="central"
            >
              X
            </text>
          ),
        )}

        {geo.dots.map((d) => (
          <circle
            key={d.key}
            cx={d.cx}
            cy={d.cy}
            r={geo.dotR}
            className={styles.dot}
          />
        ))}

        {geo.fingerLabels.map((fl) => (
          <text
            key={fl.key}
            x={fl.cx}
            y={fl.cy}
            className={styles.fingerNumber}
            dominantBaseline="central"
          >
            {fl.text}
          </text>
        ))}

        {geo.fretCellNotes.map((fn) => (
          <text
            key={fn.key}
            x={fn.cx}
            y={fn.cy}
            className={styles.fretCellNote}
            dominantBaseline="central"
          >
            {fn.text}
          </text>
        ))}

        {geo.fretLabels.map((fl) => (
          <text key={fl.n} x={fl.x} y={fl.y} className={styles.fretLabel}>
            {fl.n}
          </text>
        ))}
      </svg>
    </figure>
  )
}
