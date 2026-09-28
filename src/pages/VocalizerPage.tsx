import { useMemo } from 'react'
import { playWayForPhrase } from '../audio/humPlacement'
import { DiagramDivider } from '../components/DiagramDivider'
import { Fretboard } from '../components/Fretboard'
import { HumChart } from '../components/HumChart'
import { NoteMeter } from '../components/NoteMeter'
import { useDiagramPanel } from '../hooks/useDiagramPanel'
import { useHumCapture } from '../hooks/useHumCapture'
import styles from './VocalizerPage.module.css'

export function VocalizerPage() {
  const {
    status,
    errorMessage,
    meter,
    notes,
    trace,
    marks,
    phraseFull,
    start,
    stop,
    clearNotes,
  } = useHumCapture()

  const panel = useDiagramPanel()
  const {
    ready,
    mainRef,
    shellClassName,
    gridStyle,
    showDiagramPanel,
    fretCount,
    fretboardOrientation,
    displayNotes,
  } = panel
  const listening = status === 'listening'
  const way = useMemo(() => playWayForPhrase(notes), [notes])

  if (!ready) {
    return (
      <main className="app-page">
        <section className="app-page__options" aria-busy="true">
          <div className="app-page__inner">
            <p className="app-page__loading">Loading…</p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main
      ref={mainRef}
      className={shellClassName}
      style={gridStyle}
    >
      <section
        className="app-page__options app-page__options--tuner"
        aria-label="Vocalizer"
      >
        <div className="app-page__inner">
          <div className="tuner">
            {errorMessage ? (
              <p className="tuner__error" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <NoteMeter
              label="Note meter"
              listening={listening}
              requesting={status === 'requesting'}
              onStart={start}
              onStop={stop}
              reading={meter}
            />

            <div>
              <div className="tuner__range-label-row">
                <p className="diagram-label">Phrase</p>
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={clearNotes}
                  disabled={notes.length === 0 && trace.length === 0}
                >
                  Clear
                </button>
              </div>
              {notes.length === 0 ? (
                <p className={styles.empty}>No notes yet.</p>
              ) : (
                <ol className={styles.phrase}>
                  {notes.map((note, index) => (
                    <li key={`${note.noteName}${note.octave}-${index}`}>
                      <span className={styles.order}>{index + 1}</span>
                      {note.noteName}
                      <span className={styles.octave}>{note.octave}</span>
                    </li>
                  ))}
                </ol>
              )}
              {phraseFull ? (
                <p className={styles.full}>Phrase is full. Clear it to record more.</p>
              ) : null}
            </div>

            <HumChart points={trace} marks={marks} listening={listening} />
          </div>
        </div>
      </section>

      <DiagramDivider panel={panel} />

      {showDiagramPanel ? (
        <section className="app-page__diagram" aria-label="Fretboard preview">
          <div className="app-page__diagram-wrap">
            <div className="app-page__diagram-stage app-page__diagram-stage--single">
              <Fretboard
                chord={null}
                title={way?.label ?? 'Fretboard'}
                markers={(way?.positions ?? []).map((position) => ({
                  stringIndex: position.stringIndex,
                  fret: position.fret,
                  label: position.orders.join(','),
                }))}
                fretCount={fretCount}
                orientation={fretboardOrientation}
                displayNotes={displayNotes}
                fitContainer
              />
            </div>
          </div>
        </section>
      ) : null}
    </main>
  )
}
