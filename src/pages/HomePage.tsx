import { useEffect, useId, useMemo, useState } from 'react'
import { ChordPlayabilityCell } from '../components/ChordPlayabilityCell'
import {
  CHORD_PRESETS,
  CHORD_SELECTABLE_IDS,
  isChordPracticeable,
  isDiminishedChord,
  Fretboard,
  chordsInKeyOrder,
  chordsForProgression,
  diatonicSlotsInKey,
  isProgressionResolvableInKey,
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
  resolveChord,
  scalePatternForKey,
  startFretForFingering,
  FRET_COUNT_MIN,
  FRET_COUNT_MAX,
  type ChordPresetId,
  type KeyId,
  type ProgressionId,
  type ScaleSelection,
} from '../components/Fretboard'
import { useUserSettings } from '../hooks/useUserSettings'

const FRET_COUNT_OPTIONS = Array.from(
  { length: FRET_COUNT_MAX - FRET_COUNT_MIN + 1 },
  (_, i) => i + FRET_COUNT_MIN,
)

type BoardSelection = { kind: 'chord'; id: ChordPresetId }

export function HomePage() {
  const baseId = useId()
  const [selection, setSelection] = useState<BoardSelection | null>(null)
  const [selectedKey, setSelectedKey] = useState<KeyId | null>(null)
  const [selectedProgression, setSelectedProgression] =
    useState<ProgressionId | null>(null)
  const {
    ready: settingsReady,
    disabledChords,
    filterPlayableOnly,
    displayNotes,
    fretCount,
    scaleSelection,
    setChordPlayable,
    setFilterPlayableOnly,
    setDisplayNotes,
    setFretCount,
    setScaleSelection,
  } = useUserSettings()

  useEffect(() => {
    if (selectedKey == null) {
      setSelectedProgression(null)
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
      return [...CHORD_SELECTABLE_IDS]
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
    if (selectedKey == null || scaleSelection == null) {
      return null
    }
    return scalePatternForKey(selectedKey, scaleSelection, fretCount)
  }, [selectedKey, scaleSelection, fretCount])

  const toggleScaleSelection = (mode: Exclude<ScaleSelection, null>) => {
    void setScaleSelection(scaleSelection === mode ? null : mode)
  }

  const isScaleSelected = (mode: Exclude<ScaleSelection, null>) =>
    selectedKey != null && scaleSelection === mode

  const startFret = useMemo(() => {
    if (selection?.kind !== 'chord') {
      return 1
    }
    return startFretForFingering(resolveChord(selection.id), fretCount)
  }, [selection, fretCount])

  const progressionChordIds = useMemo(() => {
    if (selectedKey == null || selectedProgression == null) {
      return null
    }
    return chordsForProgression(selectedKey, selectedProgression)
  }, [selectedKey, selectedProgression])

  const diatonicSlots = useMemo(() => {
    if (selectedKey == null || selectedProgression != null) {
      return null
    }
    return diatonicSlotsInKey(selectedKey)
  }, [selectedKey, selectedProgression])

  const progressionDisabledReason = (
    keyId: KeyId,
    progressionId: ProgressionId,
  ): string | null => {
    if (!isProgressionResolvableInKey(keyId, progressionId)) {
      return 'Not available in this key'
    }
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
    const diminished = isDiminishedChord(id)
    const storedPlayable = isChordPlayable(id, disabledChords)
    const selected = selection?.kind === 'chord' && selection.id === id
    const title =
      options?.keyId != null
        ? `${CHORD_PRESETS[id].name} · ${chordRomanNumeral(options.keyId, id) ?? ''} in ${KEY_DEFS[options.keyId].name}`
        : CHORD_PRESETS[id].name

    return (
      <ChordPlayabilityCell
        key={id}
        chordId={id}
        playable={diminished ? false : storedPlayable}
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
        showPlayabilityPopup={filterPlayableOnly && isChordPracticeable(id)}
        popupPlacement={id.endsWith('m') ? 'below' : 'above'}
        diminished={diminished}
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
            Practice Guitar App
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
                        !displayNotes
                          ? 'diagram-chord-btn diagram-chord-btn--selected'
                          : 'diagram-chord-btn'
                      }
                      aria-pressed={!displayNotes}
                      onClick={() => void setDisplayNotes(false)}
                    >
                      Off
                    </button>
                    <button
                      type="button"
                      className={
                        displayNotes
                          ? 'diagram-chord-btn diagram-chord-btn--selected'
                          : 'diagram-chord-btn'
                      }
                      aria-pressed={displayNotes}
                      onClick={() => void setDisplayNotes(true)}
                    >
                      On
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
                          onClick={() => void setFretCount(n)}
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
                    isScaleSelected('pentatonic')
                      ? 'diagram-chord-btn diagram-chord-btn--selected'
                      : 'diagram-chord-btn'
                  }
                  aria-pressed={isScaleSelected('pentatonic')}
                  disabled={selectedKey == null}
                  title={
                    selectedKey == null
                      ? 'Select a key first'
                      : `Pentatonic scale in ${KEY_DEFS[selectedKey]?.name ?? 'key'}`
                  }
                  onClick={() => toggleScaleSelection('pentatonic')}
                >
                  Pentatonic
                </button>
                <button
                  type="button"
                  className={
                    isScaleSelected('hexatonic')
                      ? 'diagram-chord-btn diagram-chord-btn--selected'
                      : 'diagram-chord-btn'
                  }
                  aria-pressed={isScaleSelected('hexatonic')}
                  disabled={selectedKey == null}
                  title={
                    selectedKey == null
                      ? 'Select a key first'
                      : `Hexatonic scale in ${KEY_DEFS[selectedKey]?.name ?? 'key'}`
                  }
                  onClick={() => toggleScaleSelection('hexatonic')}
                >
                  Hexatonic
                </button>
                <button
                  type="button"
                  className={
                    isScaleSelected('full')
                      ? 'diagram-chord-btn diagram-chord-btn--selected'
                      : 'diagram-chord-btn'
                  }
                  aria-pressed={isScaleSelected('full')}
                  disabled={selectedKey == null}
                  title={
                    selectedKey == null
                      ? 'Select a key first'
                      : `Full scale in ${KEY_DEFS[selectedKey]?.name ?? 'key'}`
                  }
                  onClick={() => toggleScaleSelection('full')}
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
                  const unresolved =
                    selectedKey != null &&
                    !isProgressionResolvableInKey(selectedKey, progressionId)
                  const blocked =
                    filterPlayableOnly &&
                    selectedKey != null &&
                    !unresolved &&
                    !isProgressionPlayableInKey(
                      selectedKey,
                      progressionId,
                      disabledChords,
                    )
                  const disabled = noKey || unresolved || blocked
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
                    gridTemplateColumns: `repeat(${
                      diatonicSlots != null
                        ? diatonicSlots.length
                        : visibleChordIds.length
                    }, 1fr)`,
                  }}
                >
                  <div
                    className="diagram-chord-in-key__chords"
                    role="group"
                    aria-labelledby={`${baseId}-chord-label`}
                  >
                    {diatonicSlots != null
                      ? diatonicSlots.map((slot) =>
                          slot.chordId != null ? (
                            renderChordCell(slot.chordId, {
                              keyId: selectedKey,
                            })
                          ) : (
                            <div
                              key={`degree-${slot.degree}`}
                              className="diagram-chord-slot diagram-chord-slot--empty"
                              aria-hidden
                            />
                          ),
                        )
                      : visibleChordIds.map((id) =>
                          renderChordCell(id, { keyId: selectedKey }),
                        )}
                  </div>
                  <div
                    className="diagram-chord-in-key__numerals"
                    aria-hidden
                  >
                    {diatonicSlots != null
                      ? diatonicSlots.map((slot) => (
                          <span
                            key={`degree-${slot.degree}-numeral`}
                            className={
                              slot.chordId == null
                                ? 'diagram-chord-roman diagram-chord-roman--missing'
                                : 'diagram-chord-roman'
                            }
                          >
                            {slot.roman}
                          </span>
                        ))
                      : visibleChordIds.map((id) => (
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

      <section
        className={
          progressionChordIds != null
            ? 'app-page__diagram app-page__diagram--progression'
            : 'app-page__diagram'
        }
        aria-label="Fretboard preview"
      >
        {progressionChordIds != null ? (
          <div className="app-page__diagram-stage app-page__diagram-stage--progression">
            {progressionChordIds.map((chordId) => {
              const selected =
                selection?.kind === 'chord' && selection.id === chordId
              const roman = chordRomanNumeral(selectedKey!, chordId)
              return (
                <div
                  key={chordId}
                  className={[
                    'diagram-progression-board',
                    selected ? 'diagram-progression-board--selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="diagram-progression-board__fret">
                    <Fretboard
                      chord={chordId}
                      scalePattern={scalePattern}
                      fretCount={fretCount}
                      startFret={startFretForFingering(
                        resolveChord(chordId),
                        fretCount,
                      )}
                      displayNotes={displayNotes}
                      fitContainer
                    />
                  </div>
                  <p className="diagram-progression-board__label">
                    {chordId}
                    {roman != null ? ` · ${roman}` : ''}
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="app-page__diagram-stage">
            <Fretboard
              chord={selection?.kind === 'chord' ? selection.id : null}
              scalePattern={scalePattern}
              fretCount={fretCount}
              startFret={startFret}
              displayNotes={displayNotes}
            />
          </div>
        )}
      </section>
    </main>
  )
}
