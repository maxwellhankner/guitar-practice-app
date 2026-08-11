import { useId } from 'react'
import { Link } from 'react-router-dom'
import { Mic, MicOff } from 'lucide-react'
import {
  AUDIBLE_MAX_HZ,
  AUDIBLE_MIN_HZ,
  audibleRangePosition,
  centsOffTarget,
  formatFrequency,
  STANDARD_GUITAR_STRINGS,
} from '../audio/pitchDetect'
import { useTunerMic } from '../hooks/useTunerMic'

/** Matches the flat/sharp dial span (±50 cents). */
const CENTS_HIGHLIGHT_RANGE = 50

function clampCents(cents: number): number {
  return Math.max(-CENTS_HIGHLIGHT_RANGE, Math.min(CENTS_HIGHLIGHT_RANGE, cents))
}

const RANGE_MARKS = [
  { hz: 70, label: '70' },
  { hz: 110, label: '110' },
  { hz: 220, label: '220' },
  { hz: 440, label: '440' },
  { hz: 880, label: '880' },
  { hz: 1500, label: '1.5k' },
] as const

export function TunerPage() {
  const baseId = useId()
  const { status, errorMessage, reading, start, stop } = useTunerMic()

  const listening = status === 'listening'
  const cents = reading ? clampCents(reading.cents) : 0
  const inTune = reading != null && Math.abs(reading.cents) <= 5
  const needlePct = ((cents + CENTS_HIGHLIGHT_RANGE) / (CENTS_HIGHLIGHT_RANGE * 2)) * 100
  const rangePct = reading
    ? audibleRangePosition(reading.pitch.frequency)
    : null
  const liveHz = reading?.pitch.frequency ?? null

  return (
    <main className="app-page app-page--tuner">
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
                {RANGE_MARKS.map((mark) => (
                  <span
                    key={mark.hz}
                    className="tuner__range-gridline"
                    style={{ left: `${audibleRangePosition(mark.hz)}%` }}
                    aria-hidden
                  />
                ))}
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

            <div className="tuner__strings">
              <p className="diagram-label" id={`${baseId}-strings-label`}>
                Guitar strings
              </p>
              <div
                className="tuner__string-grid"
                role="list"
                aria-labelledby={`${baseId}-strings-label`}
              >
                {STANDARD_GUITAR_STRINGS.map((s) => {
                  const inRange =
                    liveHz != null &&
                    Math.abs(centsOffTarget(liveHz, s.frequency)) <=
                      CENTS_HIGHLIGHT_RANGE
                  return (
                    <div
                      key={s.id}
                      role="listitem"
                      className={
                        inRange
                          ? 'tuner__string-btn tuner__string-btn--active'
                          : 'tuner__string-btn'
                      }
                      aria-current={inRange ? 'true' : undefined}
                    >
                      <span className="tuner__string-btn-label">{s.label}</span>
                      <span className="tuner__string-btn-hz">
                        {formatFrequency(s.frequency)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="tuner__note-meter">
              <p className="diagram-label">Note meter</p>
              <div
                className={
                  inTune
                    ? 'tuner__display tuner__display--in-tune'
                    : 'tuner__display'
                }
                aria-live="polite"
              >
                <p className="tuner__note">
                  {reading ? `${reading.pitch.noteName}` : '—'}
                  {reading ? (
                    <span className="tuner__octave">{reading.pitch.octave}</span>
                  ) : null}
                </p>
                <p className="tuner__freq-primary">
                  {reading
                    ? formatFrequency(reading.pitch.frequency)
                    : listening
                      ? 'Listening…'
                      : 'Mic off'}
                </p>
                <p className="tuner__target">
                  {reading
                    ? `Target ${reading.target.noteName}${reading.target.octave} · ${formatFrequency(reading.target.frequency)}`
                    : listening
                      ? 'Play a note…'
                      : null}
                </p>
                <p className="tuner__cents">
                  {reading
                    ? `${reading.cents >= 0 ? '+' : ''}${reading.cents.toFixed(0)} cents`
                    : '±0 cents'}
                </p>

                <div
                  className="tuner__meter"
                  role="meter"
                  aria-valuemin={-CENTS_HIGHLIGHT_RANGE}
                  aria-valuemax={CENTS_HIGHLIGHT_RANGE}
                  aria-valuenow={reading ? Math.round(reading.cents) : 0}
                  aria-label="Cents sharp or flat"
                >
                  <div className="tuner__meter-track">
                    <span className="tuner__meter-mark tuner__meter-mark--left">
                      ♭
                    </span>
                    <span className="tuner__meter-center" aria-hidden />
                    <span className="tuner__meter-mark tuner__meter-mark--right">
                      ♯
                    </span>
                    <span
                      className={
                        inTune
                          ? 'tuner__needle tuner__needle--in-tune'
                          : 'tuner__needle'
                      }
                      style={{ left: `${needlePct}%` }}
                    />
                  </div>
                </div>
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
                  {status === 'requesting'
                    ? 'Waiting for permission…'
                    : 'Enable microphone'}
                </button>
              )}
              <Link
                to="/"
                className="tuner__exit-btn"
                onClick={() => stop()}
              >
                Exit
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
