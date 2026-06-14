import { useEffect, useId, useMemo, useState } from 'react'
import { ChordPlayabilityCell } from '../components/ChordPlayabilityCell'
import {
  CHORD_PRESETS,
  CHORD_SELECTABLE_IDS,
  ROOT_NAMES,
  chordIdsForRoot,
  isChordPracticeable,
  parseChordPresetId,
  Fretboard,
  chordsInKeyOrder,
  chordsForProgression,
  progressionStepsInKey,
  allowedChordsForProgression,
  diatonicSlotsInKey,
  isProgressionResolvableInKey,
  isSelectableChordInKey,
  colorAlternativesForDegree,
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
  chordIdToScaleKey,
  diatonicChordIdsOnScale,
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
  const [progressionVoicings, setProgressionVoicings] = useState<
    ChordPresetId[] | null
  >(null)
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
      setProgressionVoicings(null)
    }
  }, [selectedKey])

  useEffect(() => {
    if (selectedKey == null || selectedProgression == null) {
      setProgressionVoicings(null)
      return
    }
    setProgressionVoicings(
      chordsForProgression(selectedKey, selectedProgression),
    )
  }, [selectedKey, selectedProgression])

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
      isSelectableChordInKey(selectedKey, selection.id)
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
      selection?.kind !== 'chord'
    ) {
      return
    }
    const allowed = allowedChordsForProgression(
      selectedKey,
      selectedProgression,
    )
    if (!allowed.has(selection.id)) {
      setSelection(null)
    }
  }, [selectedKey, selectedProgression, selection])

  const scaleKey = useMemo((): KeyId | null => {
    if (selectedKey != null) {
      return selectedKey
    }
    if (selection?.kind === 'chord') {
      return chordIdToScaleKey(selection.id)
    }
    return null
  }, [selectedKey, selection])

  const startFret = useMemo(() => {
    if (selection?.kind !== 'chord') {
      return 1
    }
    return startFretForFingering(resolveChord(selection.id), fretCount)
  }, [selection, fretCount])

  const scalePattern = useMemo(() => {
    if (scaleKey == null || scaleSelection == null) {
      return null
    }
    return scalePatternForKey(
      scaleKey,
      scaleSelection,
      fretCount,
      startFret,
    )
  }, [scaleKey, scaleSelection, fretCount, startFret])

  const scaleContextName =
    scaleKey != null ? KEY_DEFS[scaleKey].name : null

  const scaleModeTitle = (label: string) =>
    scaleContextName != null
      ? `${label} scale in ${scaleContextName}`
      : 'Select a key or chord to show scale on the fretboard'

  const toggleScaleSelection = (mode: Exclude<ScaleSelection, null>) => {
    void setScaleSelection(scaleSelection === mode ? null : mode)
  }

  const isScaleSelected = (mode: Exclude<ScaleSelection, null>) =>
    scaleSelection === mode

  const showDiagram =
    selectedKey != null ||
    (selection?.kind === 'chord' && selection.id != null)

  const scaleToneChordIds = useMemo((): ReadonlySet<ChordPresetId> | null => {
    if (selectedKey == null || scaleSelection == null) {
      return null
    }
    return new Set(diatonicChordIdsOnScale(selectedKey, scaleSelection))
  }, [selectedKey, scaleSelection])

  const diatonicSlots = useMemo(() => {
    if (selectedKey == null || selectedProgression != null) {
      return null
    }
    return diatonicSlotsInKey(selectedKey)
  }, [selectedKey, selectedProgression])

  const progressionSteps = useMemo(() => {
    if (selectedKey == null || selectedProgression == null) {
      return null
    }
    return progressionStepsInKey(selectedKey, selectedProgression)
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

  const selectProgressionStep = (stepIndex: number, chordId: ChordPresetId) => {
    setProgressionVoicings((cur) => {
      if (cur == null) {
        return cur
      }
      const next = [...cur]
      next[stepIndex] = chordId
      return next
    })
  }

  const renderChordCell = (
    id: ChordPresetId,
    options?: {
      keyId?: KeyId
      compact?: boolean
      label?: string
      roman?: string
      inProgression?: boolean
      selectable?: boolean
      selected?: boolean
      onSelect?: () => void
    },
  ) => {
    const { quality } = parseChordPresetId(id)
    const storedPlayable = isChordPlayable(id, disabledChords)
    const selected =
      options?.selected ??
      (selection?.kind === 'chord' && selection.id === id)
    const title =
      options?.keyId != null
        ? `${CHORD_PRESETS[id].name}${options.roman != null ? ` · ${options.roman}` : chordRomanNumeral(options.keyId, id) != null ? ` · ${chordRomanNumeral(options.keyId, id)}` : ''} in ${KEY_DEFS[options.keyId].name}`
        : CHORD_PRESETS[id].name
    const popupPlacement =
      quality === 'minor' || quality === 'min7' ? 'below' : 'above'
    const scaleTone =
      options?.keyId != null &&
      scaleToneChordIds != null &&
      (scaleToneChordIds.has(id) ||
        [...scaleToneChordIds].some(
          (triadId) =>
            parseChordPresetId(triadId).rootName ===
            parseChordPresetId(id).rootName,
        ))

    return (
      <ChordPlayabilityCell
        key={id}
        chordId={id}
        playable={storedPlayable}
        selected={selected}
        title={title}
        label={options?.label}
        compact={options?.compact}
        scaleTone={scaleTone}
        inProgression={options?.inProgression}
        selectable={options?.selectable}
        onSelect={
          options?.onSelect ??
          (() =>
            setSelection((cur) =>
              cur?.kind === 'chord' && cur.id === id
                ? null
                : { kind: 'chord', id },
            ))
        }
        onPlayableChange={(next) => void setChordPlayable(id, next)}
        showPlayabilityPopup={filterPlayableOnly && isChordPracticeable(id)}
        popupPlacement={popupPlacement}
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
                  title={scaleModeTitle('Pentatonic')}
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
                  title={scaleModeTitle('Hexatonic')}
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
                  title={scaleModeTitle('Full')}
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
                diatonicSlots != null ? (
                  <div
                    className="diagram-chord-in-key diagram-chord-in-key--columns"
                    style={{
                      gridTemplateColumns: `repeat(${diatonicSlots.length}, 1fr)`,
                    }}
                    role="group"
                    aria-labelledby={`${baseId}-chord-label`}
                  >
                    {diatonicSlots.map((slot) => (
                      <div
                        key={`degree-${slot.degree}`}
                        className="diagram-chord-in-key__column"
                      >
                        {slot.chordId != null ? (
                          <>
                            {renderChordCell(slot.chordId, {
                              keyId: selectedKey,
                              roman: slot.roman,
                            })}
                            <span
                              className="diagram-chord-roman"
                              aria-hidden
                            >
                              {slot.roman}
                            </span>
                            {colorAlternativesForDegree(
                              selectedKey,
                              slot.degree,
                            ).map((color) =>
                              renderChordCell(color.chordId, {
                                keyId: selectedKey,
                                compact: true,
                                roman: `${slot.roman} · ${color.chordId}`,
                              }),
                            )}
                          </>
                        ) : (
                          <>
                            <div
                              className="diagram-chord-slot diagram-chord-slot--empty"
                              aria-hidden
                            />
                            <span
                              className="diagram-chord-roman diagram-chord-roman--missing"
                              aria-hidden
                            >
                              {slot.roman}
                            </span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : progressionSteps != null && progressionVoicings != null ? (
                  <div
                    className="diagram-chord-in-key diagram-chord-in-key--columns"
                    style={{
                      gridTemplateColumns: `repeat(${progressionSteps.length}, minmax(min-content, 1fr))`,
                    }}
                    role="group"
                    aria-labelledby={`${baseId}-chord-label`}
                  >
                    {progressionSteps.map((step) => {
                      const voicingId =
                        progressionVoicings[step.stepIndex] ?? step.triadId
                      const roman =
                        chordRomanNumeral(selectedKey, step.triadId) ??
                        String(step.degree)
                      return (
                        <div
                          key={`progression-step-${step.stepIndex}`}
                          className="diagram-chord-in-key__column"
                        >
                          {renderChordCell(voicingId, {
                            keyId: selectedKey,
                            roman,
                            inProgression: true,
                            selectable: false,
                          })}
                          <span
                            className="diagram-chord-roman"
                            aria-hidden
                          >
                            {roman}
                          </span>
                          {colorAlternativesForDegree(
                            selectedKey,
                            step.degree,
                          ).map((color) =>
                            renderChordCell(color.chordId, {
                              keyId: selectedKey,
                              compact: true,
                              roman: `${roman} · ${color.chordId}`,
                              selected: voicingId === color.chordId,
                              onSelect: () => {
                                if (voicingId === color.chordId) {
                                  selectProgressionStep(
                                    step.stepIndex,
                                    step.triadId,
                                  )
                                } else {
                                  selectProgressionStep(
                                    step.stepIndex,
                                    color.chordId,
                                  )
                                }
                              },
                            }),
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
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
                )
              ) : (
                <div
                  className="diagram-chord-select-grid diagram-chord-select-grid--by-root"
                  role="group"
                  aria-labelledby={`${baseId}-chord-label`}
                >
                  {ROOT_NAMES.map((root) => (
                    <div
                      key={root}
                      className="diagram-chord-root-column"
                      aria-label={`${root} chords`}
                    >
                      {chordIdsForRoot(root).map((id) => renderChordCell(id))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        className={
          progressionVoicings != null
            ? 'app-page__diagram app-page__diagram--progression'
            : 'app-page__diagram'
        }
        aria-label="Fretboard preview"
      >
        {!showDiagram ? (
          <p className="app-page__diagram-empty">
            Select a key or chord to show the fretboard
          </p>
        ) : progressionVoicings != null && progressionSteps != null ? (
          <div className="app-page__diagram-stage app-page__diagram-stage--progression">
            {progressionVoicings.map((chordId, stepIndex) => {
              const step = progressionSteps[stepIndex]
              const boardStartFret = startFretForFingering(
                resolveChord(chordId),
                fretCount,
              )
              const boardScalePattern =
                scaleKey != null && scaleSelection != null
                  ? scalePatternForKey(
                      scaleKey,
                      scaleSelection,
                      fretCount,
                      boardStartFret,
                    )
                  : null
              const roman =
                step != null
                  ? (chordRomanNumeral(selectedKey!, step.triadId) ??
                    String(step.degree))
                  : null
              return (
                <div
                  key={`progression-board-${stepIndex}-${chordId}`}
                  className="diagram-progression-board"
                >
                  <div className="diagram-progression-board__fret">
                    <Fretboard
                      chord={chordId}
                      scalePattern={boardScalePattern}
                      fretCount={fretCount}
                      startFret={boardStartFret}
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
