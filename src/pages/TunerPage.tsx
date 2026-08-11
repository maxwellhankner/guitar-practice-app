import { useId, useState } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { AppNav } from '../components/AppNav'
import {
  AUDIBLE_MAX_HZ,
  AUDIBLE_MIN_HZ,
  audibleRangePosition,
  formatFrequency,
  STANDARD_GUITAR_STRINGS,
} from '../audio/pitchDetect'
import { useTunerMic } from '../hooks/useTunerMic'

function clampCents(cents: number): number {
  return Math.max(-50, Math.min(50, cents))
}

const RANGE_MARKS = [
  { hz: 20, label: '20' },
  { hz: 100, label: '100' },
  { hz: 440, label: '440' },
  { hz: 1000, label: '1k' },
  { hz: 5000, label: '5k' },
  { hz: 20000, label: '20k' },
] as const

export function TunerPage() {
  const baseId = useId()
  const [lockedStringId, setLockedStringId] = useState<string | null>(null)
  const { status, errorMessage, reading, start, stop } = useTunerMic({
    lockedStringId,
  })

  const listening = status === 'listening'
  const cents = reading ? clampCents(reading.cents) : 0
  const inTune = reading != null && Math.abs(reading.cents) <= 5
  const needlePct = ((cents + 50) / 100) * 100
  const rangePct = reading
    ? audibleRangePosition(reading.pitch.frequency)
    : null

  return (
    <main className="app-page app-page--tuner">
      <section
        className="app-page__options app-page__options--tuner"
        aria-labelledby={`${baseId}-heading`}
      >
        <div className="app-page__inner">
          <AppNav />
          <div className="tuner__header">
            <h1 className="app-page__title" id={`${baseId}-heading`}>
              Tuner
            </h1>
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
            </div>
          </div>

          <div className="tuner">
            {errorMessage ? (
              <p className="tuner__error" role="alert">
                {errorMessage}
              </p>
            ) : null}

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
                    : `${AUDIBLE_MIN_HZ} Hz – ${formatFrequency(AUDIBLE_MAX_HZ)}`}
              </p>
              <p className="tuner__cents">
                {reading
                  ? `${reading.cents >= 0 ? '+' : ''}${reading.cents.toFixed(0)} cents`
                  : '±0 cents'}
              </p>
            </div>

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
              aria-label="Frequency in the human audible range"
            >
              <div className="tuner__range-label-row">
                <p className="diagram-label">Audible range</p>
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

            <div
              className="tuner__meter"
              role="meter"
              aria-valuemin={-50}
              aria-valuemax={50}
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

            <div className="tuner__strings">
              <p className="diagram-label" id={`${baseId}-strings-label`}>
                Guitar string lock
              </p>
              <div
                className="tuner__string-grid"
                role="group"
                aria-labelledby={`${baseId}-strings-label`}
              >
                <button
                  type="button"
                  className={
                    lockedStringId == null
                      ? 'tuner__string-btn tuner__string-btn--active'
                      : 'tuner__string-btn'
                  }
                  aria-pressed={lockedStringId == null}
                  onClick={() => setLockedStringId(null)}
                >
                  Auto
                </button>
                {STANDARD_GUITAR_STRINGS.map((s) => {
                  const active = lockedStringId === s.id
                  const detected =
                    reading != null &&
                    reading.target.kind === 'string' &&
                    reading.target.id === s.id
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={
                        active
                          ? 'tuner__string-btn tuner__string-btn--active'
                          : detected
                            ? 'tuner__string-btn tuner__string-btn--detected'
                            : 'tuner__string-btn'
                      }
                      aria-pressed={active}
                      onClick={() =>
                        setLockedStringId((prev) =>
                          prev === s.id ? null : s.id,
                        )
                      }
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
