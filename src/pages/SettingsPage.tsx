import { useUserSettings } from '../hooks/useUserSettings'
import {
  DEFAULT_HUM_MIC_CUTOFF,
  DEFAULT_TUNER_MIC_CUTOFF,
  MIC_CUTOFF_MAX,
  MIC_CUTOFF_MIN,
} from '../audio/pitchDetect'
import { ACCENT_COLOR_OPTIONS } from '../theme/accentColors'
import { FRETBOARD_COLOR_OPTIONS } from '../theme/fretboardColors'

/** Left of the slider is the least sensitive gate. Right is the most sensitive. */
function sliderFromCutoff(cutoff: number): number {
  const inverted = MIC_CUTOFF_MAX + MIC_CUTOFF_MIN - cutoff
  return Math.round(inverted * 1000) / 1000
}

function sensitivityLabel(cutoff: number): string {
  const span = MIC_CUTOFF_MAX - MIC_CUTOFF_MIN
  const position = span === 0 ? 0 : (cutoff - MIC_CUTOFF_MIN) / span
  if (position <= 0.35) {
    return 'very sensitive'
  }
  if (position <= 0.55) {
    return 'sensitive'
  }
  if (position <= 0.75) {
    return 'moderate'
  }
  return 'low'
}

function MicCutoffSlider({
  id,
  label,
  value,
  defaultValue,
  onChange,
  onReset,
}: {
  id: string
  label: string
  value: number
  defaultValue: number
  onChange: (value: number) => void
  onReset: () => void
}) {
  const atDefault = Math.abs(value - defaultValue) < 0.0005
  return (
    <div className="settings-panel__cutoff">
      <div className="settings-panel__cutoff-row">
        <span className="settings-panel__cutoff-title">
          <label htmlFor={id}>{label}</label>
          <button
            type="button"
            className="settings-panel__cutoff-reset"
            onClick={onReset}
            disabled={atDefault}
          >
            Reset
          </button>
        </span>
        <span>{sensitivityLabel(value)}</span>
      </div>
      <input
        id={id}
        name={id}
        type="range"
        min={MIC_CUTOFF_MIN}
        max={MIC_CUTOFF_MAX}
        step={0.001}
        value={sliderFromCutoff(value)}
        aria-valuetext={sensitivityLabel(value)}
        onChange={(event) => onChange(sliderFromCutoff(Number(event.target.value)))}
      />
    </div>
  )
}

export function SettingsPage() {
  const {
    ready,
    accentColorId,
    setAccentColorId,
    fretboardColorId,
    setFretboardColorId,
    tunerMicCutoff,
    humMicCutoff,
    setTunerMicCutoff,
    setHumMicCutoff,
  } = useUserSettings()

  if (!ready) {
    return (
      <main className="app-page app-page--settings">
        <section className="app-page__options" aria-busy="true">
          <div className="app-page__inner">
            <p className="app-page__loading">Loading…</p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app-page app-page--settings">
      <section className="app-page__options" aria-label="Settings">
        <div className="app-page__inner">
          <div className="diagram-controls settings-panel">
            <h1 className="app-page__title">Settings</h1>

            <section className="diagram-field" aria-labelledby="settings-theme-label">
              <p className="diagram-label" id="settings-theme-label">
                Theme color
              </p>
              <div
                className="settings-panel__swatches"
                role="listbox"
                aria-label="Theme color"
              >
                {ACCENT_COLOR_OPTIONS.map((option) => {
                  const selected = accentColorId === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      aria-label={option.label}
                      title={option.label}
                      className={[
                        'settings-panel__swatch',
                        selected ? 'settings-panel__swatch--active' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => void setAccentColorId(option.id)}
                    >
                      <span
                        className="settings-panel__swatch-fill"
                        style={{ backgroundColor: option.swatch }}
                        aria-hidden
                      />
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="diagram-field" aria-labelledby="settings-fretboard-label">
              <p className="diagram-label" id="settings-fretboard-label">
                Fretboard color
              </p>
              <div
                className="settings-panel__swatches"
                role="listbox"
                aria-label="Fretboard color"
              >
                {FRETBOARD_COLOR_OPTIONS.map((option) => {
                  const selected = fretboardColorId === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      aria-label={option.label}
                      title={option.label}
                      className={[
                        'settings-panel__swatch',
                        selected ? 'settings-panel__swatch--active' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => void setFretboardColorId(option.id)}
                    >
                      <span
                        className="settings-panel__swatch-fill"
                        style={{ backgroundColor: option.swatch }}
                        aria-hidden
                      />
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="diagram-field" aria-labelledby="settings-mic-label">
              <p className="diagram-label" id="settings-mic-label">
                Microphone sensitivity
              </p>
              <div className="settings-panel__cutoffs">
                <MicCutoffSlider
                  id="tuner-mic-cutoff"
                  label="Tuner"
                  value={tunerMicCutoff}
                  defaultValue={DEFAULT_TUNER_MIC_CUTOFF}
                  onChange={setTunerMicCutoff}
                  onReset={() => setTunerMicCutoff(DEFAULT_TUNER_MIC_CUTOFF)}
                />
                <MicCutoffSlider
                  id="hum-mic-cutoff"
                  label="Jam"
                  value={humMicCutoff}
                  defaultValue={DEFAULT_HUM_MIC_CUTOFF}
                  onChange={setHumMicCutoff}
                  onReset={() => setHumMicCutoff(DEFAULT_HUM_MIC_CUTOFF)}
                />
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}
