import { useMemo } from 'react'
import {
  AUDIBLE_MAX_HZ,
  AUDIBLE_MIN_HZ,
  audibleRangePosition,
  centsOffTarget,
  formatFrequency,
  STANDARD_GUITAR_STRINGS,
} from '../audio/pitchDetect'
import { DiagramDivider } from '../components/DiagramDivider'
import { Fretboard } from '../components/Fretboard'
import { NoteMeter } from '../components/NoteMeter'
import { useDiagramPanel } from '../hooks/useDiagramPanel'
import { useTunerMic } from '../hooks/useTunerMic'

/** Matches the flat/sharp dial span (±50 cents). */
const CENTS_HIGHLIGHT_RANGE = 50

const RANGE_MARKS = [
  { hz: 70, label: '70' },
  { hz: 110, label: '110' },
  { hz: 220, label: '220' },
  { hz: 440, label: '440' },
  { hz: 880, label: '880' },
  { hz: 1500, label: '1.5k' },
] as const

export function TunerPage() {
  const { status, errorMessage, reading, start, stop } = useTunerMic()
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
  const inTune = reading != null && Math.abs(reading.cents) <= 5
  const rangePct = reading
    ? audibleRangePosition(reading.pitch.frequency)
    : null
  const liveHz = reading?.pitch.frequency ?? null
  const activeStrings = useMemo(
    () =>
      STANDARD_GUITAR_STRINGS.flatMap((string, index) =>
        liveHz != null &&
        Math.abs(centsOffTarget(liveHz, string.frequency)) <=
          CENTS_HIGHLIGHT_RANGE
          ? [index]
          : [],
      ),
    [liveHz],
  )
  const activeString =
    activeStrings.length === 1
      ? STANDARD_GUITAR_STRINGS[activeStrings[0]!]
      : null

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
    <main ref={mainRef} className={shellClassName} style={gridStyle}>
      <section
        className="app-page__options app-page__options--tuner"
        aria-label="Tuner"
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
              reading={
                reading
                  ? {
                      noteName: reading.pitch.noteName,
                      octave: reading.pitch.octave,
                      frequency: reading.pitch.frequency,
                      cents: reading.cents,
                      targetNoteName: reading.target.noteName,
                      targetOctave: reading.target.octave,
                      targetFrequency: reading.target.frequency,
                    }
                  : null
              }
            />

            <div
              className="tuner__range"
              role="meter"
              aria-valuemin={AUDIBLE_MIN_HZ}
              aria-valuemax={AUDIBLE_MAX_HZ}
              aria-valuenow={
                reading ? Math.round(reading.pitch.frequency) : undefined
              }
              aria-valuetext={
                reading
                  ? formatFrequency(reading.pitch.frequency)
                  : 'No pitch detected'
              }
              aria-label="Frequency in the guitar tuning range"
            >
              <div className="tuner__range-label-row">
                <p className="diagram-label">Frequency range</p>
                <p className="tuner__range-span">
                  {AUDIBLE_MIN_HZ} Hz – {formatFrequency(AUDIBLE_MAX_HZ)}
                </p>
              </div>
              <div className="tuner__range-track">
                {STANDARD_GUITAR_STRINGS.map((s) => (
                  <span
                    key={`tick-${s.id}`}
                    className="tuner__range-string-tick"
                    style={{ left: `${audibleRangePosition(s.frequency)}%` }}
                    title={`${s.label} · ${formatFrequency(s.frequency)}`}
                    aria-hidden
                  />
                ))}
                {rangePct != null ? (
                  <span
                    className={
                      inTune
                        ? 'tuner__range-needle tuner__range-needle--in-tune'
                        : 'tuner__range-needle'
                    }
                    style={{ left: `${rangePct}%` }}
                  />
                ) : null}
              </div>
              <div className="tuner__range-marks" aria-hidden>
                {RANGE_MARKS.map((mark) => (
                  <span
                    key={mark.hz}
                    className="tuner__range-mark"
                    style={{ left: `${audibleRangePosition(mark.hz)}%` }}
                  >
                    {mark.label}
                  </span>
                ))}
              </div>
            </div>
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
                title={
                  activeString
                    ? `${activeString.noteName}${activeString.octave}`
                    : 'Fretboard'
                }
                activeStrings={activeStrings}
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
