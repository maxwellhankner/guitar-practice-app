import { useMemo, type ReactNode } from 'react'
import type { ChordFingering, FretboardOrientation } from './types'
import { resolveChord, type ChordPresetId } from './chords'
import { noteAtFret } from './tuning'
import styles from './Fretboard.module.css'

const STRINGS = 6

type BarreSegment = {
  fret: number
  stringMin: number
  stringMax: number
  key: string
}

/** Index finger (1) on multiple strings at one fret → barre shape for the diagram. */
function barreSegments(fingering: ChordFingering): BarreSegment[] {
  const fingerOneByFret = new Map<number, number[]>()

  fingering.strings.forEach((state, stringIndex) => {
    if (typeof state !== 'number' || state < 1) {
      return
    }
    if (fingering.fingers?.[stringIndex] !== 1) {
      return
    }
    const list = fingerOneByFret.get(state) ?? []
    list.push(stringIndex)
    fingerOneByFret.set(state, list)
  })

  const segments: BarreSegment[] = []
  for (const [fret, fingerOneStrings] of fingerOneByFret) {
    if (fingerOneStrings.length < 2) {
      continue
    }
    const stringMin = Math.min(...fingerOneStrings)
    let stringMax = Math.max(...fingerOneStrings)

    // Index barre also covers treble strings fretted above the barre (e.g. Fm9 high E, G#7sus4 B/E).
    for (let s = stringMax + 1; s < STRINGS; s++) {
      const state = fingering.strings[s]
      if (state === 'x' || state === 0) {
        break
      }
      if (typeof state === 'number' && state >= fret) {
        stringMax = s
      } else {
        break
      }
    }

    segments.push({
      fret,
      stringMin,
      stringMax,
      key: `bar-f${fret}-s${stringMin}-${stringMax}`,
    })
  }

  return segments.sort((a, b) => a.fret - b.fret)
}

function isOnBarre(
  stringIndex: number,
  fret: number,
  barres: readonly BarreSegment[],
): boolean {
  return barres.some(
    (b) =>
      b.fret === fret &&
      stringIndex >= b.stringMin &&
      stringIndex <= b.stringMax,
  )
}

/** Standard side dots: 3, 5, 7, 9; double dots at 12, 24, … (repeats every octave). */
function fretInlayKind(absoluteFret: number): 'single' | 'double' | null {
  const pos = absoluteFret % 12
  if (pos === 0) {
    return 'double'
  }
  if (pos === 3 || pos === 5 || pos === 7 || pos === 9) {
    return 'single'
  }
  return null
}

/** Standard tuning: index 0 = low E (6th) … 5 = high E (1st) */
const OPEN_STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'E'] as const

export type FretboardScalePattern = {
  name: string
  /** 0 = low E … 5 = high E; fret 0 = open string */
  positions: readonly { stringIndex: number; fret: number }[]
}

type FretboardProps = {
  fretCount?: number
  /** First column is this fret number (default 1 = nut + open position). */
  startFret?: number
  /** When true, show chromatic note names in each fret cell (standard tuning, sharp names). */
  displayNotes?: boolean
  /** When `null`, only the blank fretboard is shown (no chord fingering dots). */
  chord: ChordFingering | ChordPresetId | null
  /**
   * When set, draws faint scale dots behind chord fingering (layers with `chord`).
   */
  scalePattern?: FretboardScalePattern | null
  /** Caption shown above the diagram. Defaults from chord or “Select a chord”. */
  title?: string
  className?: string
  /** Shrink to fit a flex column (e.g. progression row). */
  fitContainer?: boolean
  /** Landscape = nut on the left; portrait = nut at top, headstock up. */
  orientation?: FretboardOrientation
}

function rotate90Point(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
): { x: number; y: number } {
  return {
    x: centerX - (y - centerY),
    y: centerY + (x - centerX),
  }
}

function portraitTextPosition(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  portrait: boolean,
): { x: number; y: number } {
  if (!portrait) {
    return { x, y }
  }
  return rotate90Point(x, y, centerX, centerY)
}

function diagramBoundsPoints(
  geo: ReturnType<typeof layoutGeometry>,
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [
    { x: geo.boardX, y: geo.topPad - 6 },
    { x: geo.boardX + geo.boardW, y: geo.topPad - 6 },
    { x: geo.boardX, y: geo.topPad + geo.innerH + 6 },
    { x: geo.boardX + geo.boardW, y: geo.topPad + geo.innerH + 6 },
    { x: geo.stringStartX, y: geo.stringYs[0]! },
    { x: geo.vbW - 12, y: geo.stringYs[0]! },
    { x: geo.stringStartX, y: geo.stringYs[STRINGS - 1]! },
    { x: geo.vbW - 12, y: geo.stringYs[STRINGS - 1]! },
  ]

  for (const n of geo.openNoteLabels) {
    points.push({ x: n.x, y: n.y })
  }
  for (const fl of geo.fretLabels) {
    points.push({ x: fl.x, y: fl.y })
  }
  for (const d of geo.dots) {
    points.push({ x: d.cx, y: d.cy })
  }
  for (const d of geo.scaleDots) {
    points.push({ x: d.cx, y: d.cy })
  }
  for (const r of geo.openStringRings) {
    points.push({ x: r.cx, y: r.cy })
  }
  for (const m of geo.openStringMutes) {
    points.push({ x: m.cx, y: m.cy })
  }
  for (const fl of geo.fingerLabels) {
    points.push({ x: fl.cx, y: fl.cy })
  }
  for (const fn of geo.fretCellNotes) {
    points.push({ x: fn.cx, y: fn.cy })
  }
  for (const sn of geo.scaleCellNotes) {
    points.push({ x: sn.cx, y: sn.cy })
  }
  for (const b of geo.barres) {
    points.push({ x: b.x, y: b.y })
    points.push({ x: b.x + b.width, y: b.y + b.height })
  }
  if (geo.openPositionLabel != null) {
    points.push({
      x: geo.openPositionLabel.x,
      y: geo.openPositionLabel.y,
    })
  }
  if (geo.nutScrollEllipsis != null) {
    points.push({
      x: geo.nutScrollEllipsis.x,
      y: geo.nutScrollEllipsis.y,
    })
  }

  return points
}

function rotatedBoardXBounds(
  geo: ReturnType<typeof layoutGeometry>,
  centerX: number,
  centerY: number,
) {
  const boardXs = [
    { x: geo.boardX, y: geo.topPad - 6 },
    { x: geo.boardX + geo.boardW, y: geo.topPad - 6 },
    { x: geo.boardX, y: geo.topPad + geo.innerH + 6 },
    { x: geo.boardX + geo.boardW, y: geo.topPad + geo.innerH + 6 },
  ].map((p) => rotate90Point(p.x, p.y, centerX, centerY).x)

  return {
    minX: Math.min(...boardXs),
    maxX: Math.max(...boardXs),
  }
}

/** Mirror left-side fret-label gutter onto the right in portrait. */
function portraitBalancedXExtent(
  geo: ReturnType<typeof layoutGeometry>,
  centerX: number,
  centerY: number,
  contentMinX: number,
  contentMaxX: number,
) {
  const board = rotatedBoardXBounds(geo, centerX, centerY)
  const leftGutter = board.minX - contentMinX
  const balancedMaxX = board.maxX + leftGutter

  return {
    minX: contentMinX,
    maxX: Math.max(contentMaxX, balancedMaxX),
  }
}

function portraitCaptionPosition(
  geo: ReturnType<typeof layoutGeometry>,
  centerX: number,
  centerY: number,
): { x: number; y: number; text: string } | null {
  if (geo.captionLabel == null) {
    return null
  }

  const rotated = diagramBoundsPoints(geo).map((p) =>
    rotate90Point(p.x, p.y, centerX, centerY),
  )
  const contentMinX = Math.min(...rotated.map((p) => p.x))
  const contentMaxX = Math.max(...rotated.map((p) => p.x))
  const balanced = portraitBalancedXExtent(
    geo,
    centerX,
    centerY,
    contentMinX,
    contentMaxX,
  )

  const letterPositions = geo.openNoteLabels.map((n) =>
    rotate90Point(n.x, n.y, centerX, centerY),
  )
  const minY = Math.min(...letterPositions.map((p) => p.y))
  const portraitCaptionGap = 8 + geo.dotR + 8

  return {
    x: (balanced.minX + balanced.maxX) / 2,
    y: minY - portraitCaptionGap,
    text: geo.captionLabel.text,
  }
}

function portraitViewBounds(
  geo: ReturnType<typeof layoutGeometry>,
  captionPoint?: { x: number; y: number } | null,
) {
  const centerX = geo.vbW / 2
  const centerY = geo.vbH / 2
  const rotated = diagramBoundsPoints(geo).map((p) =>
    rotate90Point(p.x, p.y, centerX, centerY),
  )

  const contentMinX = Math.min(...rotated.map((p) => p.x))
  const contentMaxX = Math.max(...rotated.map((p) => p.x))
  const balanced = portraitBalancedXExtent(
    geo,
    centerX,
    centerY,
    contentMinX,
    contentMaxX,
  )

  if (captionPoint != null) {
    rotated.push(captionPoint)
    const halfW = (geo.captionLabel?.text.length ?? 0) * 3.2
    rotated.push({ x: captionPoint.x - halfW, y: captionPoint.y })
    rotated.push({ x: captionPoint.x + halfW, y: captionPoint.y })
    rotated.push({ x: captionPoint.x, y: captionPoint.y - 8 })
  } else if (geo.captionLabel != null) {
    rotated.push(
      rotate90Point(geo.captionLabel.x, geo.captionLabel.y, centerX, centerY),
    )
  }

  const padX = 5
  const padTop = captionPoint != null ? 12 + geo.dotR : 8 + geo.dotR
  const padBottom = 5
  const minY = Math.min(...rotated.map((p) => p.y)) - padTop
  const maxY = Math.max(...rotated.map((p) => p.y)) + padBottom
  const minX = balanced.minX - padX
  const maxX = balanced.maxX + padX
  return {
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

type UprightTextProps = {
  x: number
  y: number
  portrait: boolean
  centerX: number
  centerY: number
  className?: string
  dominantBaseline?: 'auto' | 'central' | 'middle' | 'alphabetic'
  children: ReactNode
}

function UprightText({
  x,
  y,
  portrait,
  centerX,
  centerY,
  className,
  dominantBaseline,
  children,
}: UprightTextProps) {
  const pos = portraitTextPosition(x, y, centerX, centerY, portrait)
  return (
    <text
      x={pos.x}
      y={pos.y}
      className={className}
      dominantBaseline={dominantBaseline}
    >
      {children}
    </text>
  )
}

function layoutGeometry(
  fretCount: number,
  startFret: number,
  fingering: ChordFingering | null,
  displayNotes: boolean,
  scalePattern: FretboardScalePattern | null,
  caption?: string,
) {
  /** Open-string note names + open/scale rings (merged column). */
  const markerW = 24
  const openNoteCenterX = markerW / 2
  const stringStartX = markerW
  const leadIn = 12
  const gridLeft = markerW + leadIn
  const cellW = 40
  const rightPad = 12
  const boardTopPad = 18
  const innerH = 92
  /** Room below the string area for fret number labels (gap above viewBox bottom). */
  const bottomPad = 30
  const captionPad =
    caption != null && caption.length > 0 ? 16 : 0
  const topPad = captionPad + boardTopPad

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
    x: openNoteCenterX,
    y: yForString(stringIndex),
    text: OPEN_STRING_NAMES[stringIndex]!,
  }))

  const dots: { cx: number; cy: number; key: string }[] = []
  const scaleDots: { cx: number; cy: number; key: string }[] = []
  const fingerLabels: { cx: number; cy: number; text: string; key: string }[] =
    []
  const barres: {
    x: number
    y: number
    width: number
    height: number
    rx: number
    key: string
  }[] = []

  const dotR = Math.min(cellW, innerH / (STRINGS - 1)) * 0.38

  const openStringRings: {
    cx: number
    cy: number
    key: string
    variant: 'chord' | 'scale'
  }[] = []
  const openStringMutes: { cx: number; cy: number; key: string }[] = []

  if (scalePattern != null && scalePattern.positions.length > 0) {
    scalePattern.positions.forEach((p) => {
      const { stringIndex, fret } = p
      if (stringIndex < 0 || stringIndex >= STRINGS || fret < 1) {
        return
      }
      const col = fret - startFret
      if (col < 0 || col >= fretCount) {
        return
      }
      const cx = gridLeft + (col + 0.5) * cellW
      const cy = yForString(stringIndex)
      scaleDots.push({ cx, cy, key: `scale-s${stringIndex}-f${fret}` })
    })
  }

  const scaleOpenStrings = new Set<number>()
  if (scalePattern != null) {
    for (const p of scalePattern.positions) {
      if (p.fret === 0 && p.stringIndex >= 0 && p.stringIndex < STRINGS) {
        scaleOpenStrings.add(p.stringIndex)
      }
    }
  }

  for (let stringIndex = 0; stringIndex < STRINGS; stringIndex++) {
    const state = fingering?.strings[stringIndex]
    const cy = yForString(stringIndex)
    const cx = openNoteCenterX
    const chordOpen = state === 0
    const chordMute = state === 'x'
    const scaleOpen =
      scalePattern != null && scaleOpenStrings.has(stringIndex)

    if (scaleOpen) {
      openStringRings.push({
        cx,
        cy,
        key: `open-ring-scale-${stringIndex}`,
        variant: 'scale',
      })
    }
    if (chordOpen) {
      openStringRings.push({
        cx,
        cy,
        key: `open-ring-chord-${stringIndex}`,
        variant: 'chord',
      })
    }
    if (chordMute) {
      openStringMutes.push({
        cx,
        cy,
        key: `open-mute-${stringIndex}`,
      })
    }
  }

  if (fingering) {
    const barreSegs = barreSegments(fingering)

    fingering.strings.forEach((state, stringIndex) => {
      if (typeof state !== 'number' || state < 1) {
        return
      }
      const col = state - startFret
      if (col < 0 || col >= fretCount) {
        return
      }
      if (isOnBarre(stringIndex, state, barreSegs)) {
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

    const barWidth = dotR * 2
    for (const seg of barreSegs) {
      const col = seg.fret - startFret
      if (col < 0 || col >= fretCount) {
        continue
      }
      const cx = gridLeft + (col + 0.5) * cellW
      const yTop = yForString(seg.stringMax) - dotR
      const yBottom = yForString(seg.stringMin) + dotR
      barres.push({
        x: cx - barWidth / 2,
        y: yTop,
        width: barWidth,
        height: yBottom - yTop,
        rx: barWidth / 2,
        key: seg.key,
      })
      if (!displayNotes && fingering.fingers != null) {
        fingerLabels.push({
          cx,
          cy: (yTop + yBottom) / 2,
          text: '1',
          key: `finger-${seg.key}`,
        })
      }
    }

  }

  const fretLabels = Array.from({ length: fretCount }, (_, i) => ({
    x: gridLeft + (i + 0.5) * cellW,
    y: vbH - 8,
    n: startFret + i,
  }))

  const fretWireXs = Array.from({ length: fretCount }, (_, j) => gridLeft + (j + 1) * cellW)

  const inlayR = 3.15
  const inlayCy = topPad + innerH / 2
  const inlayCyTop = topPad + innerH * 0.33
  const inlayCyBottom = topPad + innerH * 0.67
  const fretInlays: { cx: number; cy: number; key: string }[] = []
  for (let col = 0; col < fretCount; col++) {
    const absoluteFret = startFret + col
    const kind = fretInlayKind(absoluteFret)
    if (kind == null) {
      continue
    }
    const cx = gridLeft + (col + 0.5) * cellW
    if (kind === 'single') {
      fretInlays.push({
        cx,
        cy: inlayCy,
        key: `inlay-fret-${absoluteFret}`,
      })
    } else {
      fretInlays.push({
        cx,
        cy: inlayCyTop,
        key: `inlay-fret-${absoluteFret}-top`,
      })
      fretInlays.push({
        cx,
        cy: inlayCyBottom,
        key: `inlay-fret-${absoluteFret}-bottom`,
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

  const scaleCellNotes: { cx: number; cy: number; text: string; key: string }[] =
    []
  if (scalePattern != null && !displayNotes) {
    const barreSegs =
      fingering != null ? barreSegments(fingering) : ([] as BarreSegment[])
    for (const p of scalePattern.positions) {
      const { stringIndex, fret } = p
      if (stringIndex < 0 || stringIndex >= STRINGS || fret < 1) {
        continue
      }
      const col = fret - startFret
      if (col < 0 || col >= fretCount) {
        continue
      }
      if (fingering != null) {
        if (isOnBarre(stringIndex, fret, barreSegs)) {
          continue
        }
        const state = fingering.strings[stringIndex]
        if (
          typeof state === 'number' &&
          state === fret &&
          fingering.fingers?.[stringIndex] != null
        ) {
          continue
        }
      }
      scaleCellNotes.push({
        key: `scale-note-s${stringIndex}-f${fret}`,
        cx: gridLeft + (col + 0.5) * cellW,
        cy: yForString(stringIndex),
        text: noteAtFret(stringIndex, fret),
      })
    }
  }

  const scrollMarkerY = vbH - 8
  const openPositionLabel =
    startFret > 1
      ? { x: openNoteCenterX, y: scrollMarkerY, text: '0' as const }
      : null
  const nutScrollEllipsis =
    startFret > 1
      ? { x: gridLeft, y: scrollMarkerY, text: '...' as const }
      : null

  const captionLabel =
    captionPad > 0
      ? {
          x: vbW / 2,
          y: captionPad / 2 + 5,
          text: caption!,
        }
      : null

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
    scaleDots,
    fingerLabels,
    barres,
    openStringRings,
    openStringMutes,
    openNoteLabels,
    openPositionLabel,
    nutScrollEllipsis,
    fretCellNotes,
    scaleCellNotes,
    fretLabels,
    fretWireXs,
    fretInlays,
    inlayR,
    dotR,
    startFret,
    stringStartX,
    captionLabel,
    captionPad,
  }
}

export function Fretboard({
  fretCount = 5,
  startFret: startFretProp,
  displayNotes = false,
  chord,
  scalePattern = null,
  title,
  className,
  fitContainer = false,
  orientation = 'landscape',
}: FretboardProps) {
  const resolved = chord == null ? null : resolveChord(chord)
  const startFret = Math.max(1, startFretProp ?? 1)
  const hasScale =
    scalePattern != null && scalePattern.positions.length > 0
  const portrait = orientation === 'portrait'

  const displayTitle = (() => {
    if (title != null && title.length > 0) {
      return title
    }
    if (resolved == null) {
      return 'Select a chord'
    }
    return (
      resolved.name ??
      (typeof chord === 'string' ? chord : 'Custom chord')
    )
  })()

  const geo = useMemo(
    () =>
      layoutGeometry(
        fretCount,
        startFret,
        resolved,
        displayNotes,
        hasScale ? scalePattern : null,
        displayTitle,
      ),
    [
      fretCount,
      startFret,
      resolved,
      displayNotes,
      scalePattern,
      hasScale,
      displayTitle,
    ],
  )

  const ariaLabel = `Fretboard diagram, ${displayTitle}`
  const centerX = geo.vbW / 2
  const centerY = geo.vbH / 2
  const captionPos =
    geo.captionLabel == null
      ? null
      : portrait
        ? portraitCaptionPosition(geo, centerX, centerY)
        : geo.captionLabel
  const boardTransform = portrait ? `rotate(90 ${centerX} ${centerY})` : undefined
  const portraitBounds = portrait
    ? portraitViewBounds(
        geo,
        captionPos != null ? { x: captionPos.x, y: captionPos.y } : null,
      )
    : null
  const viewBox = portraitBounds
    ? `${portraitBounds.minX} ${portraitBounds.minY} ${portraitBounds.width} ${portraitBounds.height}`
    : `0 0 ${geo.vbW} ${geo.vbH}`
  const aspectW = portraitBounds ? portraitBounds.width : geo.vbW
  const aspectH = portraitBounds ? portraitBounds.height : geo.vbH

  return (
    <figure
      className={[
        styles.wrap,
        fitContainer ? styles.wrapFit : '',
        portrait ? styles.wrapPortrait : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
    >
      <svg
        className={styles.svg}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ aspectRatio: `${aspectW} / ${aspectH}` }}
      >
        <g transform={boardTransform}>
          <rect
            x={geo.boardX}
            y={geo.topPad - 6}
            width={geo.boardW}
            height={geo.innerH + 12}
            rx={5}
            className={styles.board}
          />

          <line
            x1={geo.gridLeft}
            y1={geo.topPad - 4}
            x2={geo.gridLeft}
            y2={geo.topPad + geo.innerH + 4}
            className={geo.startFret === 1 ? styles.nut : styles.fretWire}
          />

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

          {geo.stringYs.map((y, i) => {
            const stringIndex = STRINGS - 1 - i
            const isMuted =
              resolved != null && resolved.strings[stringIndex] === 'x'
            return (
              <line
                key={`str-${i}`}
                x1={geo.stringStartX}
                y1={y}
                x2={geo.vbW - 12}
                y2={y}
                className={isMuted ? styles.stringMuted : styles.string}
              />
            )
          })}

          {geo.openStringRings.map((ring) => (
            <circle
              key={ring.key}
              cx={ring.cx}
              cy={ring.cy}
              r={geo.dotR}
              className={
                ring.variant === 'chord'
                  ? styles.openStringRingChord
                  : styles.openStringRingScale
              }
            />
          ))}

          {geo.openStringMutes.map((m) => {
            const arm = geo.dotR * Math.SQRT1_2
            return (
              <g key={m.key} aria-hidden>
                <line
                  x1={m.cx - arm}
                  y1={m.cy - arm}
                  x2={m.cx + arm}
                  y2={m.cy + arm}
                  className={styles.openStringMuteX}
                />
                <line
                  x1={m.cx - arm}
                  y1={m.cy + arm}
                  x2={m.cx + arm}
                  y2={m.cy - arm}
                  className={styles.openStringMuteX}
                />
              </g>
            )
          })}

          {geo.scaleDots.map((d) => (
            <circle
              key={d.key}
              cx={d.cx}
              cy={d.cy}
              r={geo.dotR}
              className={styles.scaleDot}
            />
          ))}

          {geo.barres.map((b) => (
            <rect
              key={b.key}
              x={b.x}
              y={b.y}
              width={b.width}
              height={b.height}
              rx={b.rx}
              className={styles.barre}
            />
          ))}

          {geo.dots.map((d) => (
            <circle
              key={d.key}
              cx={d.cx}
              cy={d.cy}
              r={geo.dotR}
              className={styles.dot}
            />
          ))}
        </g>

        {geo.openNoteLabels.map((n) => (
          <UprightText
            key={n.key}
            x={n.x}
            y={n.y}
            portrait={portrait}
            centerX={centerX}
            centerY={centerY}
            className={styles.openNote}
            dominantBaseline="central"
          >
            {n.text}
          </UprightText>
        ))}

        {geo.openPositionLabel != null ? (
          <UprightText
            x={geo.openPositionLabel.x}
            y={geo.openPositionLabel.y}
            portrait={portrait}
            centerX={centerX}
            centerY={centerY}
            className={styles.fretLabel}
            dominantBaseline="auto"
          >
            {geo.openPositionLabel.text}
          </UprightText>
        ) : null}

        {geo.scaleCellNotes.map((sn) => (
          <UprightText
            key={sn.key}
            x={sn.cx}
            y={sn.cy}
            portrait={portrait}
            centerX={centerX}
            centerY={centerY}
            className={styles.scaleCellNote}
            dominantBaseline="central"
          >
            {sn.text}
          </UprightText>
        ))}

        {geo.fingerLabels.map((fl) => (
          <UprightText
            key={fl.key}
            x={fl.cx}
            y={fl.cy}
            portrait={portrait}
            centerX={centerX}
            centerY={centerY}
            className={styles.fingerNumber}
            dominantBaseline="central"
          >
            {fl.text}
          </UprightText>
        ))}

        {geo.fretCellNotes.map((fn) => (
          <UprightText
            key={fn.key}
            x={fn.cx}
            y={fn.cy}
            portrait={portrait}
            centerX={centerX}
            centerY={centerY}
            className={styles.fretCellNote}
            dominantBaseline="central"
          >
            {fn.text}
          </UprightText>
        ))}

        {geo.fretLabels.map((fl) => (
          <UprightText
            key={fl.n}
            x={fl.x}
            y={fl.y}
            portrait={portrait}
            centerX={centerX}
            centerY={centerY}
            className={styles.fretLabel}
          >
            {fl.n}
          </UprightText>
        ))}

        {captionPos != null ? (
          <UprightText
            x={captionPos.x}
            y={captionPos.y}
            portrait={false}
            centerX={centerX}
            centerY={centerY}
            className={styles.captionTitle}
            dominantBaseline="middle"
          >
            {captionPos.text}
          </UprightText>
        ) : null}

        {geo.nutScrollEllipsis != null ? (
          <UprightText
            x={geo.nutScrollEllipsis.x}
            y={geo.nutScrollEllipsis.y}
            portrait={portrait}
            centerX={centerX}
            centerY={centerY}
            className={styles.fretLabel}
            dominantBaseline="auto"
          >
            {geo.nutScrollEllipsis.text}
          </UprightText>
        ) : null}
      </svg>
    </figure>
  )
}
