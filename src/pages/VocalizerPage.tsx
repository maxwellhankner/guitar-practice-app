import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Mic, MicOff } from 'lucide-react'
import { playWayForPhrase } from '../audio/humPlacement'
import { HumChart } from '../components/HumChart'
import { VocalizerBoard } from '../components/VocalizerBoard'
import { useHumCapture } from '../hooks/useHumCapture'
import styles from './VocalizerPage.module.css'

export function VocalizerPage() {
  const {
    status,
    errorMessage,
    liveNote,
    notes,
    trace,
    marks,
    phraseFull,
    start,
    stop,
    clearNotes,
  } = useHumCapture()

  const listening = status === 'listening'
  const way = useMemo(() => playWayForPhrase(notes), [notes])

  return (
    <main
      className="app-page app-page--vocalizer"
      style={{ gridTemplateRows: 'minmax(0, 0.65fr) auto minmax(0, 0.35fr)' }}
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

            <HumChart points={trace} marks={marks} listening={listening} />

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

            <div className="tuner__note-meter">
              <p className="diagram-label">Hearing</p>
              <div className="tuner__display" aria-live="polite">
                <p className="tuner__note">
                  {liveNote ? liveNote.noteName : '—'}
                  {liveNote ? (
                    <span className="tuner__octave">{liveNote.octave}</span>
                  ) : null}
                </p>
                <p className="tuner__freq-primary">
                  {listening ? 'Listening…' : 'Mic off'}
                </p>
              </div>
            </div>

            <div className="tuner__actions">
              {listening ? (
                <button
                  type="button"
                  className="tuner__mic-btn tuner__mic-btn--stop"
                  onClick={stop}
                >
                  <MicOff aria-hidden size={18} strokeWidth={2} />
                  Stop listening
                </button>
              ) : (
                <button
                  type="button"
                  className="tuner__mic-btn"
                  onClick={() => void start()}
                  disabled={status === 'requesting'}
                >
                  <Mic aria-hidden size={18} strokeWidth={2} />
                  {status === 'requesting' ? 'Waiting for permission…' : 'Hum'}
                </button>
              )}
              <Link to="/" className="tuner__exit-btn" onClick={() => stop()}>
                Exit
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div
        className="app-page__divider app-page__divider--horizontal"
        role="separator"
        aria-orientation="horizontal"
        aria-label="Fretboard"
      />

      <section className="app-page__diagram" aria-label="Fretboard preview">
        <div className="app-page__diagram-wrap">
          <div className="app-page__diagram-stage app-page__diagram-stage--single">
            <VocalizerBoard
              label={way?.label ?? 'Fretboard'}
              positions={way?.positions ?? []}
              fit
            />
          </div>
        </div>
      </section>
    </main>
  )
}
