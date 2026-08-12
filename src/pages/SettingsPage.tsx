import {
  ArrowLeftRight,
  ArrowUpDown,
  Columns2,
  Eye,
  EyeOff,
  ListChecks,
  Music,
  RotateCcwSquare,
  Rows2,
} from 'lucide-react'
import {
  FRET_COUNT_OPTIONS,
  type ScaleSelection,
} from '../components/Fretboard'
import { useUserSettings } from '../hooks/useUserSettings'
import {
  ACCENT_COLOR_OPTIONS,
} from '../theme/accentColors'

const SCALE_OPTIONS: { value: ScaleSelection; label: string }[] = [
  { value: null, label: 'Off' },
  { value: 'pentatonic', label: 'Pentatonic' },
  { value: 'hexatonic', label: 'Hexatonic' },
  { value: 'full', label: 'Full Scale' },
]

export function SettingsPage() {
  const {
    ready,
    diagramHidden,
    diagramLayout,
    panelsSwapped,
    fretboardOrientation,
    fretCount,
    accentColorId,
    scaleSelection,
    filterPlayableOnly,
    displayNotes,
    setDiagramHidden,
    setDiagramLayout,
    setPanelsSwapped,
    setFretboardOrientation,
    setFretCount,
    setAccentColorId,
    setScaleSelection,
    setFilterPlayableOnly,
    setDisplayNotes,
  } = useUserSettings()

  const layoutVertical = diagramLayout === 'vertical'
  const fretboardPortrait = fretboardOrientation === 'portrait'

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

            <section className="diagram-field" aria-labelledby="settings-diagram-label">
              <p className="diagram-label" id="settings-diagram-label">
                Diagram
              </p>
              <button
                type="button"
                className={[
                  'settings-panel__row-btn',
                  !diagramHidden ? 'settings-panel__row-btn--on' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={!diagramHidden}
                onClick={() => void setDiagramHidden(!diagramHidden)}
              >
                {!diagramHidden ? (
                  <Eye size={18} strokeWidth={2.25} aria-hidden />
                ) : (
                  <EyeOff size={18} strokeWidth={2.25} aria-hidden />
                )}
                <span>{diagramHidden ? 'Fretboard hidden' : 'Fretboard visible'}</span>
              </button>
            </section>

            <section className="diagram-field" aria-labelledby="settings-layout-label">
              <p className="diagram-label" id="settings-layout-label">
                Layout
              </p>
              <div className="settings-panel__choice-row" role="group" aria-label="Panel layout">
                <button
                  type="button"
                  className={[
                    'settings-panel__chip',
                    !layoutVertical ? 'settings-panel__chip--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-pressed={!layoutVertical}
                  onClick={() => void setDiagramLayout('horizontal')}
                >
                  <Rows2 size={16} strokeWidth={2.25} aria-hidden />
                  Stacked
                </button>
                <button
                  type="button"
                  className={[
                    'settings-panel__chip',
                    layoutVertical ? 'settings-panel__chip--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-pressed={layoutVertical}
                  onClick={() => void setDiagramLayout('vertical')}
                >
                  <Columns2 size={16} strokeWidth={2.25} aria-hidden />
                  Side by side
                </button>
              </div>
              <button
                type="button"
                className={[
                  'settings-panel__row-btn',
                  panelsSwapped ? 'settings-panel__row-btn--on' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={panelsSwapped}
                onClick={() => void setPanelsSwapped(!panelsSwapped)}
              >
                {layoutVertical ? (
                  <ArrowLeftRight size={18} strokeWidth={2.25} aria-hidden />
                ) : (
                  <ArrowUpDown size={18} strokeWidth={2.25} aria-hidden />
                )}
                <span>
                  {panelsSwapped ? 'Panels swapped' : 'Swap panels'}
                </span>
              </button>
            </section>

            <section className="diagram-field" aria-labelledby="settings-fretboard-label">
              <p className="diagram-label" id="settings-fretboard-label">
                Fretboard
              </p>
              <button
                type="button"
                className={[
                  'settings-panel__row-btn',
                  fretboardPortrait ? 'settings-panel__row-btn--on' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={fretboardPortrait}
                onClick={() =>
                  void setFretboardOrientation(
                    fretboardPortrait ? 'landscape' : 'portrait',
                  )
                }
              >
                <RotateCcwSquare size={18} strokeWidth={2.25} aria-hidden />
                <span>
                  {fretboardPortrait
                    ? 'Vertical orientation'
                    : 'Standard orientation'}
                </span>
              </button>
              <div
                className="settings-panel__choice-row"
                role="group"
                aria-label="Fret count"
              >
                {FRET_COUNT_OPTIONS.map((n) => {
                  const selected = fretCount === n
                  return (
                    <button
                      key={n}
                      type="button"
                      className={[
                        'settings-panel__chip settings-panel__chip--compact',
                        selected ? 'settings-panel__chip--active' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-pressed={selected}
                      onClick={() => void setFretCount(n)}
                    >
                      {n}
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="diagram-field" aria-labelledby="settings-display-label">
              <p className="diagram-label" id="settings-display-label">
                Display
              </p>
              <button
                type="button"
                className={[
                  'settings-panel__row-btn',
                  displayNotes ? 'settings-panel__row-btn--on' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={displayNotes}
                onClick={() => void setDisplayNotes(!displayNotes)}
              >
                <Music size={18} strokeWidth={2.25} aria-hidden />
                <span>{displayNotes ? 'Note names on' : 'Note names off'}</span>
              </button>
              <button
                type="button"
                className={[
                  'settings-panel__row-btn',
                  filterPlayableOnly ? 'settings-panel__row-btn--on' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={filterPlayableOnly}
                onClick={() => {
                  if (filterPlayableOnly) {
                    void setFilterPlayableOnly(false)
                  } else {
                    void setFilterPlayableOnly(true)
                  }
                }}
              >
                <ListChecks size={18} strokeWidth={2.25} aria-hidden />
                <span>
                  {filterPlayableOnly
                    ? 'Known chords mode on'
                    : 'Known chords mode off'}
                </span>
              </button>
              <div
                className="settings-panel__choice-row settings-panel__choice-row--wrap"
                role="group"
                aria-label="Scale overlay"
              >
                {SCALE_OPTIONS.map((option) => {
                  const selected = scaleSelection === option.value
                  return (
                    <button
                      key={option.label}
                      type="button"
                      className={[
                        'settings-panel__chip',
                        selected ? 'settings-panel__chip--active' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-pressed={selected}
                      onClick={() => void setScaleSelection(option.value)}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="diagram-field" aria-labelledby="settings-accent-label">
              <p className="diagram-label" id="settings-accent-label">
                Accent
              </p>
              <div
                className="settings-panel__swatches"
                role="listbox"
                aria-label="Accent color"
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
