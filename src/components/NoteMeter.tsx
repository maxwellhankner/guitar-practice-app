import { Mic, MicOff } from 'lucide-react'
import { formatFrequency } from '../audio/pitchDetect'

/** Matches the flat/sharp dial span (±50 cents). */
const CENTS_HIGHLIGHT_RANGE = 50

function clampCents(cents: number): number {
  return Math.max(-CENTS_HIGHLIGHT_RANGE, Math.min(CENTS_HIGHLIGHT_RANGE, cents))
}

export type NoteMeterReading = {
  noteName: string
  octave: number
  frequency: number
  cents: number
  targetNoteName: string
  targetOctave: number
  targetFrequency: number
}

type NoteMeterProps = {
  label: string
  listening: boolean
  requesting?: boolean
  onStart: () => void
  onStop: () => void
  reading: NoteMeterReading | null
}

export function NoteMeter({
  label,
  listening,
  requesting = false,
  onStart,
  onStop,
  reading,
}: NoteMeterProps) {
  const cents = reading ? clampCents(reading.cents) : 0
  const inTune = reading != null && Math.abs(reading.cents) <= 5
  const needlePct =
    ((cents + CENTS_HIGHLIGHT_RANGE) / (CENTS_HIGHLIGHT_RANGE * 2)) * 100

  return (
    <div className="tuner__note-meter">
      <p className="diagram-label">{label}</p>
      <div
        className={
          inTune ? 'tuner__display tuner__display--in-tune' : 'tuner__display'
        }
        aria-live="polite"
      >
        <p className="tuner__note">
          {reading ? reading.noteName : '—'}
          {reading ? (
            <span className="tuner__octave">{reading.octave}</span>
          ) : null}
        </p>
        <p className="tuner__freq-primary">
          {reading
            ? formatFrequency(reading.frequency)
            : listening
              ? 'Listening…'
              : 'Mic off'}
        </p>
        <p className="tuner__readout">
          {reading ? (
            <span className="tuner__target">
              {`Target ${reading.targetNoteName}${reading.targetOctave} · ${formatFrequency(reading.targetFrequency)}`}
            </span>
          ) : listening ? (
            <span className="tuner__target">Play a note…</span>
          ) : null}
          <span className="tuner__cents">
            {reading
              ? `${reading.cents >= 0 ? '+' : ''}${reading.cents.toFixed(0)} cents`
              : '±0 cents'}
          </span>
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
            <span className="tuner__meter-mark tuner__meter-mark--left">♭</span>
            <span className="tuner__meter-center" aria-hidden />
            <span className="tuner__meter-mark tuner__meter-mark--right">♯</span>
            <span
              className={
                inTune ? 'tuner__needle tuner__needle--in-tune' : 'tuner__needle'
              }
              style={{ left: `${needlePct}%` }}
            />
          </div>
        </div>
        <div className="tuner__display-mic">
          {listening ? (
            <button
              type="button"
              className="tuner__mic-btn tuner__mic-btn--stop"
              onClick={onStop}
            >
              <MicOff aria-hidden size={18} strokeWidth={2} />
              Stop listening
            </button>
          ) : (
            <button
              type="button"
              className="tuner__mic-btn"
              onClick={() => void onStart()}
              disabled={requesting}
            >
              <Mic aria-hidden size={18} strokeWidth={2} />
              {requesting ? 'Waiting for permission…' : 'Enable microphone'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
