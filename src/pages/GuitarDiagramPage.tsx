import { useId, useState } from 'react'
import {
  CHORD_PRESETS,
  Fretboard,
  type ChordPresetId,
} from '../components/Fretboard'

const CHORD_IDS = (Object.keys(CHORD_PRESETS) as ChordPresetId[]).sort(
  (a, b) => a.localeCompare(b),
)

const FRET_COUNT_OPTIONS = [3, 4, 5, 6, 7, 8] as const

export function GuitarDiagramPage() {
  const baseId = useId()
  const [fretCount, setFretCount] =
    useState<(typeof FRET_COUNT_OPTIONS)[number]>(5)
  const [chordId, setChordId] = useState<ChordPresetId | null>('C')
  const [displayNotes, setDisplayNotes] = useState(false)

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
              <p className="diagram-label" id={`${baseId}-chord-label`}>
                Chord
              </p>
              <div
                className="diagram-chord-grid"
                role="group"
                aria-labelledby={`${baseId}-chord-label`}
              >
                {CHORD_IDS.map((id) => {
                  const selected = chordId === id
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
                        setChordId((cur) => (cur === id ? null : id))
                      }
                    >
                      {id}
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
                    !displayNotes
                      ? 'diagram-chord-btn diagram-chord-btn--selected'
                      : 'diagram-chord-btn'
                  }
                  aria-pressed={!displayNotes}
                  onClick={() => setDisplayNotes(false)}
                >
                  Off
                </button>
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
              </div>
            </div>
          </div>
        </section>

        <section
          className="diagram-panel__section diagram-panel__section--board"
          aria-label="Fretboard preview"
        >
          <Fretboard
            chord={chordId}
            fretCount={fretCount}
            displayNotes={displayNotes}
          />
        </section>
      </div>
    </main>
  )
}
