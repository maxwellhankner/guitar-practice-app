import { useUserSettings } from '../hooks/useUserSettings'
import { ACCENT_COLOR_OPTIONS } from '../theme/accentColors'

export function SettingsPage() {
  const { ready, accentColorId, setAccentColorId } = useUserSettings()

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
                Theme
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
          </div>
        </div>
      </section>
    </main>
  )
}
