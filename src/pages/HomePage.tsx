import { useEffect, useId, useMemo, useState } from 'react'
import { ChordPlayabilityCell } from '../components/ChordPlayabilityCell'
import {
  CHORD_PRESETS,
  CHORD_MAJOR_IDS,
  CHORD_MINOR_IDS,
  Fretboard,
  chordsInKeyOrder,
  chordsForProgression,
  isChordInKey,
  isChordPlayable,
  isKeyPlayable,
  isProgressionPlayableInKey,
  chordRomanNumeral,
  unplayableChordsIn,
  KEY_DEFS,
  KEY_MAJOR_IDS,
  KEY_MINOR_IDS,
  PROGRESSIONS,
  PROGRESSION_IDS,
  scalePatternForKey,
  type ChordPresetId,
  type KeyId,
  type ProgressionId,
  type ScaleDisplayMode,
} from '../components/Fretboard'
import { useUserSettings } from '../hooks/useUserSettings'

const FRET_COUNT_OPTIONS = Array.from({ length: 16 }, (_, i) => i + 6)

type BoardSelection = { kind: 'chord'; id: ChordPresetId }

export function HomePage() {
  const baseId = useId()
  const [fretCount, setFretCount] = useState(6)
  const [selection, setSelection] = useState<BoardSelection | null>({
    kind: 'chord',
    id: 'C',
  })
  const [displayNotes, setDisplayNotes] = useState(true)
  const [selectedKey, setSelectedKey] = useState<KeyId | null>(null)
  const [selectedProgression, setSelectedProgression] =
    useState<ProgressionId | null>(null)
  const [scaleMode, setScaleMode] = useState<ScaleDisplayMode>('off')
  const {
    ready: settingsReady,
    disabledChords,
    filterPlayableOnly,
    setChordPlayable,
    setFilterPlayableOnly,
  } = useUserSettings()

  useEffect(() => {
    if (selectedKey == null) {
      setSelectedProgression(null)
      setScaleMode('off')
    }
  }, [selectedKey])

  useEffect(() => {
    if (!filterPlayableOnly) {
      return
    }
    if (
      selectedKey != null &&
      !isKeyPlayable(selectedKey, disabledChords)
    ) {
      setSelectedKey(null)
    }
  }, [selectedKey, disabledChords, filterPlayableOnly])

  useEffect(() => {
    if (!filterPlayableOnly) {
      return
    }
    if (
      selectedKey == null ||
      selectedProgression == null ||
      isProgressionPlayableInKey(
        selectedKey,
        selectedProgression,
        disabledChords,
      )
    ) {
      return
    }
    setSelectedProgression(null)
  }, [selectedKey, selectedProgression, disabledChords, filterPlayableOnly])

  useEffect(() => {
    if (!filterPlayableOnly) {
      return
    }
    if (
      selection?.kind === 'chord' &&
      !isChordPlayable(selection.id, disabledChords)
    ) {
      setSelection(null)
    }
  }, [selection, disabledChords, filterPlayableOnly])

  useEffect(() => {
    if (
      selectedKey == null ||
      selection?.kind !== 'chord' ||
      isChordInKey(selectedKey, selection.id)
    ) {
      return
    }
    setSelection(null)
  }, [selectedKey, selection])

  const visibleChordIds = useMemo(() => {
    if (selectedKey == null) {
      return [...CHORD_MAJOR_IDS, ...CHORD_MINOR_IDS]
    }
    if (selectedProgression != null) {
      return chordsForProgression(selectedKey, selectedProgression)
    }
    return chordsInKeyOrder(selectedKey)
  }, [selectedKey, selectedProgression])

  useEffect(() => {
    if (
      selectedKey == null ||
      selectedProgression == null ||
      selection?.kind !== 'chord' ||
      visibleChordIds.includes(selection.id)
    ) {
      return
    }
    setSelection(null)
  }, [selectedKey, selectedProgression, selection, visibleChordIds])

  const scalePattern = useMemo(() => {
    if (selectedKey == null || scaleMode === 'off') {
      return null
    }
    return scalePatternForKey(selectedKey, scaleMode, fretCount)
  }, [selectedKey, scaleMode, fretCount])

  const progressionDisabledReason = (
    keyId: KeyId,
    progressionId: ProgressionId,
  ): string | null => {
    if (!filterPlayableOnly) {
      return null
    }
    const missing = unplayableChordsIn(
      chordsForProgression(keyId, progressionId),
      disabledChords,
    )
    if (missing.length === 0) {
      return null
    }
    return `Requires ${missing.join(', ')}`
  }

  const renderChordCell = (
    id: ChordPresetId,
    options?: { keyId?: KeyId },
  ) => {
    const storedPlayable = isChordPlayable(id, disabledChords)
    const effectivePlayable = !filterPlayableOnly || storedPlayable
    const selected = selection?.kind === 'chord' && selection.id === id
    const title =
      options?.keyId != null
        ? `${CHORD_PRESETS[id].name} · ${chordRomanNumeral(options.keyId, id) ?? ''} in ${KEY_DEFS[options.keyId].name}`
        : CHORD_PRESETS[id].name

    return (
      <ChordPlayabilityCell
        key={id}
        chordId={id}
        playable={storedPlayable}
        selectable={effectivePlayable}
        selected={selected}
        title={title}
        onSelect={() =>
          setSelection((cur) =>
            cur?.kind === 'chord' && cur.id === id
              ? null
              : { kind: 'chord', id },
          )
        }
        onPlayableChange={(next) => void setChordPlayable(id, next)}
        showPlayabilityPopup={filterPlayableOnly}
      />
    )
  }

  if (!settingsReady) {
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
    <main className="app-page">
      <section
        className="app-page__options"
        aria-labelledby={`${baseId}-heading`}
      >
        <div className="app-page__inner">
          <h1 className="app-page__title" id={`${baseId}-heading`}>
            Guitar diagram
          </h1>
          <div className="diagram-controls">
            <div className="diagram-field diagram-field--notes-frets">
              <div className="diagram-notes-frets">
                <div className="diagram-notes-frets__notes">
                  <p className="diagram-label" id={`${baseId}-notes-label`}>
                    Notes
                  </p>
                  <div
                    className="diagram-notes-toggle"
                    role="group"
                    aria-labelledby={`${baseId}-notes-label`}
                  >
                    <button
                      type="button"
                      className={
                        displayNotes
                          ? 'diagram-chord-btn diagram-chord-btn--selected'
                          : 'diagram-chord-btn'
                      }
                      aria-pressed={displayNotes}
                      onClick={() => setDisplayNotes(true)}
                    >
                      On
                    </button>
                    <button
                      type="button"
                      className={
                        !displayNotes
                          ? 'diagram-chord-btn diagram-chord-btn--selected'
                          : 'diagram-chord-btn'
                      }
                      aria-pressed={!displayNotes}
                      onClick={() => setDisplayNotes(false)}
                    >
                      Off
                    </button>
                  </div>
                </div>
                <div
                  className="diagram-notes-frets__divider"
                  aria-hidden
                />
                <div className="diagram-notes-frets__known">
                  <p className="diagram-label" id={`${baseId}-known-label`}>
                    Known
                  </p>
                  <div
                    className="diagram-notes-toggle"
                    role="group"
                    aria-labelledby={`${baseId}-known-label`}
                  >
                    <button
                      type="button"
                      className={
                        filterPlayableOnly
                          ? 'diagram-chord-btn diagram-chord-btn--selected'
                          : 'diagram-chord-btn'
                      }
                      aria-pressed={filterPlayableOnly}
                      title="Only show what you can play"
                      onClick={() => void setFilterPlayableOnly(true)}
                    >
                      On
                    </button>
                    <button
                      type="button"
                      className={
                        !filterPlayableOnly
                          ? 'diagram-chord-btn diagram-chord-btn--selected'
                          : 'diagram-chord-btn'
                      }
                      aria-pressed={!filterPlayableOnly}
                      title="Show all keys, progressions, and chords"
                      onClick={() => void setFilterPlayableOnly(false)}
                    >
                      Off
                    </button>
                  </div>
                </div>
                <div
                  className="diagram-notes-frets__divider"
                  aria-hidden
                />
                <div className="diagram-notes-frets__frets">
                  <p className="diagram-label" id={`${baseId}-frets-label`}>
                    Frets
                  </p>
                  <div
                    className="diagram-chord-grid diagram-fret-grid"
                    role="group"
                    aria-labelledby={`${baseId}-frets-label`}
                  >
                    {FRET_COUNT_OPTIONS.map((n) => {
                      const selected = fretCount === n
                      return (
                        <button
                          key={n}
                          type="button"
                          className={
                            selected
                              ? 'diagram-chord-btn diagram-chord-btn--selected'
                              : 'diagram-chord-btn'
                          }
                          aria-pressed={selected}
                          onClick={() => setFretCount(n)}
                        >
                          {n}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="diagram-field">
              <p className="diagram-label" id={`${baseId}-key-label`}>
                Key
              </p>
              <div
                className="diagram-chord-grid diagram-key-select-grid"
                role="group"
                aria-labelledby={`${baseId}-key-label`}
              >
                {[...KEY_MAJOR_IDS, ...KEY_MINOR_IDS].map((keyId) => {
                  const def = KEY_DEFS[keyId]
                  const selected = selectedKey === keyId
                  const disabled =
                    filterPlayableOnly &&
                    !isKeyPlayable(keyId, disabledChords)
                  return (
                    <button
                      key={keyId}
                      type="button"
                      className={
                        selected
                          ? 'diagram-chord-btn diagram-chord-btn--selected'
                          : 'diagram-chord-btn'
                      }
                      aria-pressed={selected}
                      disabled={disabled}
                      title={
                        disabled
                          ? 'No progressions playable with your enabled chords'
                          : def.name
                      }
                      onClick={() =>
                        setSelectedKey((cur) => (cur === keyId ? null : keyId))
                      }
                    >
                      {def.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="diagram-field">
              <p className="diagram-label" id={`${baseId}-scale-label`}>
                Scale
              </p>
              <div
                className="diagram-chord-grid diagram-scale-grid"
                role="group"
                aria-labelledby={`${baseId}-scale-label`}
              >
                <button
                  type="button"
                  className={
                    scaleMode === 'off'
                      ? 'diagram-chord-btn diagram-chord-btn--selected'
                      : 'diagram-chord-btn'
                  }
                  aria-pressed={scaleMode === 'off'}
                  onClick={() => setScaleMode('off')}
                >
                  Off
                </button>
                <button
                  type="button"
                  className={
                    scaleMode === 'pentatonic'
                      ? 'diagram-chord-btn diagram-chord-btn--selected'
                      : 'diagram-chord-btn'
                  }
                  aria-pressed={scaleMode === 'pentatonic'}
                  disabled={selectedKey == null}
                  title={
                    selectedKey == null
                      ? 'Select a key first'
                      : `Pentatonic scale in ${KEY_DEFS[selectedKey]?.name ?? 'key'}`
                  }
                  onClick={() => setScaleMode('pentatonic')}
                >
                  Pentatonic
                </button>
                <button
                  type="button"
                  className={
                    scaleMode === 'hexatonic'
                      ? 'diagram-chord-btn diagram-chord-btn--selected'
                      : 'diagram-chord-btn'
                  }
                  aria-pressed={scaleMode === 'hexatonic'}
                  disabled={selectedKey == null}
                  title={
                    selectedKey == null
                      ? 'Select a key first'
                      : `Hexatonic scale in ${KEY_DEFS[selectedKey]?.name ?? 'key'}`
                  }
                  onClick={() => setScaleMode('hexatonic')}
                >
                  Hexatonic
                </button>
                <button
                  type="button"
                  className={
                    scaleMode === 'full'
                      ? 'diagram-chord-btn diagram-chord-btn--selected'
                      : 'diagram-chord-btn'
                  }
                  aria-pressed={scaleMode === 'full'}
                  disabled={selectedKey == null}
                  title={
                    selectedKey == null
                      ? 'Select a key first'
                      : `Full scale in ${KEY_DEFS[selectedKey]?.name ?? 'key'}`
                  }
                  onClick={() => setScaleMode('full')}
                >
                  Full Scale
                </button>
              </div>
            </div>

            <div className="diagram-field">
              <p className="diagram-label" id={`${baseId}-progression-label`}>
                Progression
              </p>
              <div
                className="diagram-chord-grid diagram-progression-grid"
                role="group"
                aria-labelledby={`${baseId}-progression-label`}
              >
                {PROGRESSION_IDS.map((progressionId) => {
                  const def = PROGRESSIONS[progressionId]
                  const selected = selectedProgression === progressionId
                  const noKey = selectedKey == null
                  const blocked =
                    filterPlayableOnly &&
                    selectedKey != null &&
                    !isProgressionPlayableInKey(
                      selectedKey,
                      progressionId,
                      disabledChords,
                    )
                  const disabled = noKey || blocked
                  const blockedReason =
                    selectedKey != null
                      ? progressionDisabledReason(selectedKey, progressionId)
                      : null
                  return (
                    <button
                      key={progressionId}
                      type="button"
                      className={
                        selected
                          ? 'diagram-chord-btn diagram-chord-btn--selected'
                          : 'diagram-chord-btn'
                      }
                      aria-pressed={selected}
                      disabled={disabled}
                      title={
                        noKey
                          ? 'Select a key first'
                          : blockedReason ??
                            `${def.label} in ${KEY_DEFS[selectedKey].name}`
                      }
                      onClick={() =>
                        setSelectedProgression((cur) =>
                          cur === progressionId ? null : progressionId,
                        )
                      }
                    >
                      {def.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="diagram-field">
              <p className="diagram-label" id={`${baseId}-chord-label`}>
                Chord
              </p>
              {selectedKey != null ? (
                <div
                  className="diagram-chord-in-key"
                  style={{
                    gridTemplateColumns: `repeat(${visibleChordIds.length}, 1fr)`,
                  }}
                >
                  <div
                    className="diagram-chord-in-key__chords"
                    role="group"
                    aria-labelledby={`${baseId}-chord-label`}
                  >
                    {visibleChordIds.map((id) =>
                      renderChordCell(id, { keyId: selectedKey }),
                    )}
                  </div>
                  <div
                    className="diagram-chord-in-key__numerals"
                    aria-hidden
                  >
                    {visibleChordIds.map((id) => (
                      <span
                        key={`${id}-numeral`}
                        className="diagram-chord-roman"
                      >
                        {chordRomanNumeral(selectedKey, id)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className="diagram-chord-grid diagram-chord-select-grid diagram-chord-select-grid--cells"
                  role="group"
                  aria-labelledby={`${baseId}-chord-label`}
                >
                  {visibleChordIds.map((id) => renderChordCell(id))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="app-page__diagram" aria-label="Fretboard preview">
        <div className="app-page__diagram-stage">
          <Fretboard
            chord={selection?.kind === 'chord' ? selection.id : null}
            scalePattern={scalePattern}
            fretCount={fretCount}
            displayNotes={displayNotes}
          />
        </div>
      </section>
    </main>
  )
}
