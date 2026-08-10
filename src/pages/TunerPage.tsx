import { useId, useState } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { AppNav } from '../components/AppNav'
import { STANDARD_GUITAR_STRINGS } from '../audio/pitchDetect'
import { useTunerMic } from '../hooks/useTunerMic'

function formatHz(hz: number): string {
  return `${hz.toFixed(1)} Hz`
}

function clampCents(cents: number): number {
  return Math.max(-50, Math.min(50, cents))
}

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

  return (
    <main className="app-page app-page--tuner">
      <section
        className="app-page__options app-page__options--tuner"
        aria-labelledby={`${baseId}-heading`}
      >
        <div className="app-page__inner">
          <AppNav />
          <h1 className="app-page__title" id={`${baseId}-heading`}>
            Tuner
          </h1>

          <div className="tuner">
            <p className="tuner__hint">
              Standard tuning · allow microphone access, then play a single
              open string.
            </p>

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
                {reading
                  ? `${reading.pitch.noteName}`
                  : listening
                    ? '—'
                    : '—'}
                {reading ? (
                  <span className="tuner__octave">{reading.pitch.octave}</span>
                ) : null}
              </p>
              <p className="tuner__target">
                {reading
                  ? `Target ${reading.target.noteName}${reading.target.octave} · ${formatHz(reading.target.frequency)}`
                  : listening
                    ? 'Play a string…'
                    : 'Mic off'}
              </p>
              <p className="tuner__cents">
                {reading
                  ? `${reading.cents >= 0 ? '+' : ''}${reading.cents.toFixed(0)} cents`
                  : '±0 cents'}
              </p>
              {reading ? (
                <p className="tuner__freq">{formatHz(reading.pitch.frequency)}</p>
              ) : null}
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
                String
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
                    reading != null && reading.target.id === s.id
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
