import { useMemo, useState } from 'react'
import { detectHumKey } from '../audio/detectHumKey'
import { playWayForPhrase } from '../audio/humPlacement'
import { DiagramDivider } from '../components/DiagramDivider'
import { Fretboard, KEY_DEFS, scalePatternForKey } from '../components/Fretboard'
import { HumChart } from '../components/HumChart'
import { NoteMeter } from '../components/NoteMeter'
import { ScaleOverlayControl } from '../components/ScaleOverlayControl'
import { useDiagramPanel } from '../hooks/useDiagramPanel'
import { useHumCapture } from '../hooks/useHumCapture'
import styles from './VocalizerPage.module.css'

export function VocalizerPage() {
  const panel = useDiagramPanel()
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
  } = useHumCapture(panel.humMicCutoff)
  const {
    ready,
    mainRef,
    shellClassName,
    gridStyle,
    showDiagramPanel,
    fretCount,
    fretboardOrientation,
    displayNotes,
    scaleSelection,
    setScaleSelection,
  } = panel
  const [scaleDismiss, setScaleDismiss] = useState(0)
  const listening = status === 'listening'
  const way = useMemo(() => playWayForPhrase(notes), [notes])
  const keyGuesses = useMemo(
    () => detectHumKey(trace, marks),
    [trace, marks],
  )
  const detectedKeyId = keyGuesses[0]?.keyId ?? null
  const scalePattern = useMemo(() => {
    if (detectedKeyId == null || scaleSelection == null) {
      return null
    }
    return scalePatternForKey(detectedKeyId, scaleSelection, fretCount)
  }, [detectedKeyId, scaleSelection, fretCount])

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

            {keyGuesses.length > 0 ? (
              <section aria-label="Key detection">
                <p className="diagram-label">Key detection</p>
                <ol className={styles.keys}>
                  {keyGuesses.map((guess, index) => (
                    <li
                      key={guess.label}
                      className={index === 0 ? styles.keyLead : undefined}
                    >
                      {guess.label}
                      <span className={styles.keyMatch}>{guess.match}%</span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </div>
        </div>
      </section>

      <DiagramDivider
        panel={panel}
        onCloseExtraPickers={() => setScaleDismiss((count) => count + 1)}
        middleTools={({ closePickers, tooltipPlacement, popupPlacement }) => (
          <ScaleOverlayControl
            scaleSelection={scaleSelection}
            onScaleSelection={(value) => {
              void setScaleSelection(value)
            }}
            keyName={
              detectedKeyId != null ? KEY_DEFS[detectedKeyId].name : null
            }
            tooltipPlacement={tooltipPlacement}
            popupPlacement={popupPlacement}
            onOpen={closePickers}
            closeSignal={scaleDismiss}
          />
        )}
      />

      {showDiagramPanel ? (
        <section className="app-page__diagram" aria-label="Fretboard preview">
          <div className="app-page__diagram-wrap">
            <div className="app-page__diagram-stage app-page__diagram-stage--single">
              <Fretboard
                chord={null}
                title={scalePattern?.name ?? way?.label ?? 'Fretboard'}
                markers={(way?.positions ?? []).map((position) => ({
                  stringIndex: position.stringIndex,
                  fret: position.fret,
                  label: position.orders.join(','),
                }))}
                scalePattern={scalePattern}
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
