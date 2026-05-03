import { useEffect, useId, useState } from 'react'
import {
  CHORD_PRESETS,
  Fretboard,
  PENTATONIC_SHAPES,
  PENTATONIC_SHAPE_IDS,
  type ChordPresetId,
  type PentatonicShapeId,
} from '../components/Fretboard'

const CHORD_IDS: ChordPresetId[] = [
  'C',
  'A',
  'Am',
  'G',
  'E',
  'Em',
  'D',
  'Dm',
]

const FRET_COUNT_OPTIONS = [3, 4, 5, 6, 7, 8] as const

type BoardSelection =
  | { kind: 'chord'; id: ChordPresetId }
  | { kind: 'pentatonic'; shape: PentatonicShapeId }

export function GuitarDiagramPage() {
  const baseId = useId()
  const [fretCount, setFretCount] =
    useState<(typeof FRET_COUNT_OPTIONS)[number]>(5)
  const [startFret, setStartFret] = useState(1)
  const [selection, setSelection] = useState<BoardSelection | null>({
    kind: 'chord',
    id: 'C',
  })
  const [displayNotes, setDisplayNotes] = useState(true)

  useEffect(() => {
    if (selection?.kind === 'chord') {
      setStartFret(1)
    } else if (selection?.kind === 'pentatonic') {
      setStartFret(PENTATONIC_SHAPES[selection.shape].startFret)
    }
  }, [selection])

  return (
    <main className="page diagram-page">
      <div className="diagram-panel">
        <section
          className="diagram-panel__section diagram-panel__section--controls"
          aria-labelledby={`${baseId}-heading`}
        >
          <h1 className="diagram-panel__title" id={`${baseId}-heading`}>
            Guitar diagram
          </h1>
          <div className="diagram-controls">
            <div className="diagram-field">
              <p className="diagram-label" id={`${baseId}-frets-label`}>
                Frets showing
              </p>
              <div
                className="diagram-chord-grid"
                role="group"
                aria-labelledby={`${baseId}-frets-label`}
              >
                {FRET_COUNT_OPTIONS.map((n) => {
                  const selected = fretCount === n
                  return (
                    <button
                      key={n}
                      type="button"
                      className={
                        selected
                          ? 'diagram-chord-btn diagram-chord-btn--selected'
                          : 'diagram-chord-btn'
                      }
                      aria-pressed={selected}
                      onClick={() => setFretCount(n)}
                    >
                      {n}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="diagram-field">
              <p className="diagram-label" id={`${baseId}-notes-label`}>
                Display notes
              </p>
              <div
                className="diagram-chord-grid"
                role="group"
                aria-labelledby={`${baseId}-notes-label`}
              >
                <button
                  type="button"
                  className={
                    displayNotes
                      ? 'diagram-chord-btn diagram-chord-btn--selected'
                      : 'diagram-chord-btn'
                  }
                  aria-pressed={displayNotes}
                  onClick={() => setDisplayNotes(true)}
                >
                  On
                </button>
                <button
                  type="button"
                  className={
                    !displayNotes
                      ? 'diagram-chord-btn diagram-chord-btn--selected'
                      : 'diagram-chord-btn'
                  }
                  aria-pressed={!displayNotes}
                  onClick={() => setDisplayNotes(false)}
                >
                  Off
                </button>
              </div>
            </div>

            <div className="diagram-field">
              <p className="diagram-label" id={`${baseId}-chord-label`}>
                Chord
              </p>
              <div
                className="diagram-chord-grid"
                role="group"
                aria-labelledby={`${baseId}-chord-label`}
              >
                {CHORD_IDS.map((id) => {
                  const selected =
                    selection?.kind === 'chord' && selection.id === id
                  return (
                    <button
                      key={id}
                      type="button"
                      className={
                        selected
                          ? 'diagram-chord-btn diagram-chord-btn--selected'
                          : 'diagram-chord-btn'
                      }
                      aria-pressed={selected}
                      title={CHORD_PRESETS[id].name}
                      onClick={() =>
                        setSelection((cur) =>
                          cur?.kind === 'chord' && cur.id === id
                            ? null
                            : { kind: 'chord', id },
                        )
                      }
                    >
                      {id}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="diagram-field">
              <p className="diagram-label" id={`${baseId}-pent-label`}>
                Pentatonic shapes
              </p>
              <div
                className="diagram-chord-grid"
                role="group"
                aria-labelledby={`${baseId}-pent-label`}
              >
                {PENTATONIC_SHAPE_IDS.map((shape) => {
                  const def = PENTATONIC_SHAPES[shape]
                  const selected =
                    selection?.kind === 'pentatonic' &&
                    selection.shape === shape
                  return (
                    <button
                      key={shape}
                      type="button"
                      className={
                        selected
                          ? 'diagram-chord-btn diagram-chord-btn--selected'
                          : 'diagram-chord-btn'
                      }
                      aria-pressed={selected}
                      title={def.name}
                      onClick={() =>
                        setSelection((cur) =>
                          cur?.kind === 'pentatonic' && cur.shape === shape
                            ? null
                            : { kind: 'pentatonic', shape },
                        )
                      }
                    >
                      {def.shapeKey}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section
          className="diagram-panel__section diagram-panel__section--board"
          aria-label="Fretboard preview"
        >
          <Fretboard
            chord={
              selection?.kind === 'chord' ? selection.id : null
            }
            scalePattern={
              selection?.kind === 'pentatonic'
                ? PENTATONIC_SHAPES[selection.shape]
                : null
            }
            fretCount={fretCount}
            startFret={startFret}
            displayNotes={displayNotes}
          />
        </section>
      </div>
    </main>
  )
}
