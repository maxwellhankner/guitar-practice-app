import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  ArrowLeftRight,
  ArrowUpDown,
  Columns2,
  ListChecks,
  Minus,
  Music,
  Plus,
  RotateCcw,
  Rows2,
  RotateCcwSquare,
  Search,
  Trash2,
} from 'lucide-react'
import { ChordPlayabilityCell } from '../components/ChordPlayabilityCell'
import { Tooltip } from '../components/Tooltip'
import {
  CHORD_PRESETS,
  ROOT_NAMES,
  chordIdsForRoot,
  isChordPracticeable,
  parseChordPresetId,
  Fretboard,
  chordsForProgression,
  diatonicSlotsInKey,
  isProgressionResolvableInKey,
  isSelectableChordInKey,
  isChordPlayable,
  isKeyPlayable,
  isProgressionPlayableInKey,
  keysMatchingChords,
  chordRomanNumeral,
  unplayableChordsIn,
  seedProgressionFromPreset,
  allowedChordsForBuiltProgression,
  progressionStepRoots,
  swapAdjacentProgressionSteps,
  deleteProgressionStep,
  insertProgressionStep,
  progressionAltOptionIds,
  triadIdForStep,
  isRootInKey,
  MAX_PROGRESSION_STEPS,
  KEY_DEFS,
  KEY_MAJOR_IDS,
  KEY_MINOR_IDS,
  PROGRESSIONS,
  PROGRESSION_IDS,
  resolveChord,
  chordRomanNumeralOnScale,
  scalePatternForKey,
  startFretForFingering,
  FRET_COUNT_MIN,
  FRET_COUNT_MAX,
  type ChordPresetId,
  type KeyId,
  type ProgressionId,
  type RootName,
  type ScaleSelection,
} from '../components/Fretboard'
import { useUserSettings } from '../hooks/useUserSettings'
import {
  PANEL_SPLIT_MAX,
  PANEL_SPLIT_MIN,
} from '../db/userSettingsRepository'

const FRET_COUNT_OPTIONS = Array.from(
  { length: FRET_COUNT_MAX - FRET_COUNT_MIN + 1 },
  (_, i) => i + FRET_COUNT_MIN,
)

type BoardSelection = { kind: 'chord'; id: ChordPresetId }

function clampPanelSplit(ratio: number): number {
  return Math.min(PANEL_SPLIT_MAX, Math.max(PANEL_SPLIT_MIN, ratio))
}

export function HomePage() {
  const baseId = useId()
  const [selection, setSelection] = useState<BoardSelection | null>(null)
  const [selectedKey, setSelectedKey] = useState<KeyId | null>(null)
  const [builtProgression, setBuiltProgression] = useState<
    ChordPresetId[] | null
  >(null)
  const [pendingAddAfterIndex, setPendingAddAfterIndex] = useState<
    number | null
  >(null)
  const [findKeyMode, setFindKeyMode] = useState(false)
  const [findKeyChords, setFindKeyChords] = useState<ChordPresetId[]>([])
  const [liveSplitRatio, setLiveSplitRatio] = useState<number | null>(null)
  const [fretPickerOpen, setFretPickerOpen] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const fretPickerRef = useRef<HTMLDivElement>(null)
  const {
    ready: settingsReady,
    disabledChords,
    filterPlayableOnly,
    displayNotes,
    fretCount,
    scaleSelection,
    diagramLayout,
    horizontalSplitRatio,
    verticalSplitRatio,
    fretboardOrientation,
    panelsSwapped,
    setChordPlayable,
    setFilterPlayableOnly,
    setDisplayNotes,
    setFretCount,
    setScaleSelection,
    setDiagramLayout,
    setHorizontalSplitRatio,
    setVerticalSplitRatio,
    setFretboardOrientation,
    setPanelsSwapped,
  } = useUserSettings()

  useEffect(() => {
    if (selectedKey == null) {
      setBuiltProgression(null)
      setPendingAddAfterIndex(null)
      void setScaleSelection(null)
      return
    }
    setSelection(null)
    setFindKeyMode(false)
    setFindKeyChords([])
  }, [selectedKey, setScaleSelection])

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
    if (!fretPickerOpen) {
      return
    }
    const onPointerDown = (event: PointerEvent) => {
      if (fretPickerRef.current?.contains(event.target as Node)) {
        return
      }
      setFretPickerOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFretPickerOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [fretPickerOpen])

  useEffect(() => {
    if (
      selectedKey == null ||
      selection?.kind !== 'chord' ||
      isSelectableChordInKey(selectedKey, selection.id)
    ) {
      return
    }
    if (builtProgression != null) {
      const allowed = allowedChordsForBuiltProgression(
        selectedKey,
        builtProgression,
      )
      if (allowed.has(selection.id)) {
        return
      }
    }
    setSelection(null)
  }, [selectedKey, selection, builtProgression])

  const diatonicSlots = useMemo(() => {
    if (selectedKey == null) {
      return null
    }
    return diatonicSlotsInKey(selectedKey)
  }, [selectedKey])

  const progressionRootsInKey = useMemo(() => {
    if (builtProgression == null || builtProgression.length === 0) {
      return null
    }
    return progressionStepRoots(builtProgression)
  }, [builtProgression])

  const hasBuiltProgression =
    builtProgression != null && builtProgression.length > 0

  const diagramLayoutVertical = diagramLayout === 'vertical'
  const fretboardPortrait = fretboardOrientation === 'portrait'
  const fretMenuPlacement = diagramLayoutVertical
    ? panelsSwapped
      ? 'app-page__divider-frets-menu--left'
      : 'app-page__divider-frets-menu--right'
    : panelsSwapped
      ? 'app-page__divider-frets-menu--above'
      : 'app-page__divider-frets-menu--below'
  const dividerTooltipPlacement = diagramLayoutVertical
    ? panelsSwapped
      ? 'left'
      : 'right'
    : panelsSwapped
      ? 'above'
      : 'below'
  const savedPanelSplitRatio = diagramLayoutVertical
    ? verticalSplitRatio
    : horizontalSplitRatio
  const panelSplitRatio = liveSplitRatio ?? savedPanelSplitRatio
  const diagramShare = 1 - panelSplitRatio
  const gridSplitTemplate = panelsSwapped
    ? `${diagramShare}fr auto ${panelSplitRatio}fr`
    : `${panelSplitRatio}fr auto ${diagramShare}fr`

  const handleDividerPointerDown = (
    event: React.PointerEvent<HTMLElement>,
  ) => {
    if ((event.target as HTMLElement).closest('button')) {
      return
    }
    event.preventDefault()
    const main = mainRef.current
    const divider = event.currentTarget.closest('.app-page__divider')
    if (main == null || !(divider instanceof HTMLElement)) {
      return
    }

    const rect = main.getBoundingClientRect()
    const vertical = diagramLayoutVertical
    let currentRatio = savedPanelSplitRatio

    divider.setPointerCapture(event.pointerId)

    const onPointerMove = (moveEvent: PointerEvent) => {
      const raw = vertical
        ? (moveEvent.clientX - rect.left) / rect.width
        : (moveEvent.clientY - rect.top) / rect.height
      const next = panelsSwapped ? 1 - raw : raw
      currentRatio = clampPanelSplit(next)
      setLiveSplitRatio(currentRatio)
    }

    const onPointerUp = (upEvent: PointerEvent) => {
      if (vertical) {
        void setVerticalSplitRatio(currentRatio)
      } else {
        void setHorizontalSplitRatio(currentRatio)
      }
      setLiveSplitRatio(null)
      divider.releasePointerCapture(upEvent.pointerId)
      divider.removeEventListener('pointermove', onPointerMove)
      divider.removeEventListener('pointerup', onPointerUp)
      divider.removeEventListener('pointercancel', onPointerUp)
    }

    divider.addEventListener('pointermove', onPointerMove)
    divider.addEventListener('pointerup', onPointerUp)
    divider.addEventListener('pointercancel', onPointerUp)
  }

  const matchingFindKeys = useMemo((): ReadonlySet<KeyId> => {
    if (!findKeyMode || findKeyChords.length === 0) {
      return new Set()
    }
    return new Set(keysMatchingChords(findKeyChords))
  }, [findKeyMode, findKeyChords])

  const startFret = useMemo(() => {
    if (selection?.kind !== 'chord') {
      return 1
    }
    return startFretForFingering(resolveChord(selection.id), fretCount)
  }, [selection, fretCount])

  const scalePattern = useMemo(() => {
    if (selectedKey == null || scaleSelection == null) {
      return null
    }
    return scalePatternForKey(
      selectedKey,
      scaleSelection,
      fretCount,
      startFret,
    )
  }, [selectedKey, scaleSelection, fretCount, startFret])

  const scaleContextName =
    selectedKey != null ? KEY_DEFS[selectedKey].name : null

  const scaleModeTitle = (label: string) =>
    scaleContextName != null
      ? `${label} scale in ${scaleContextName}`
      : 'Select a key to show scale on the fretboard'

  const toggleScaleSelection = (mode: Exclude<ScaleSelection, null>) => {
    void setScaleSelection(scaleSelection === mode ? null : mode)
  }

  const isScaleSelected = (mode: Exclude<ScaleSelection, null>) =>
    scaleSelection === mode

  const isChordInSelectedScale = (chordId: ChordPresetId): boolean => {
    if (selectedKey == null || scaleSelection == null) {
      return false
    }
    return (
      chordRomanNumeralOnScale(selectedKey, chordId, scaleSelection) != null
    )
  }

  const scaleRomanLabel = (chordId: ChordPresetId, fallback: string): string => {
    if (selectedKey == null || scaleSelection == null) {
      return fallback
    }
    return (
      chordRomanNumeralOnScale(selectedKey, chordId, scaleSelection) ??
      fallback
    )
  }

  const romanClassName = (
    chordId: ChordPresetId | null,
    extra?: string,
  ): string =>
    [
      'diagram-chord-roman',
      extra,
      chordId != null && isChordInSelectedScale(chordId)
        ? 'diagram-chord-roman--scale-tone'
        : '',
    ]
      .filter(Boolean)
      .join(' ')

  const renderRoman = (
    chordId: ChordPresetId | null,
    text: string,
    extra?: string,
  ) => (
    <span className={romanClassName(chordId, extra)} aria-hidden>
      <span className="diagram-chord-roman__label">{text}</span>
    </span>
  )

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

  const seedFromPreset = (progressionId: ProgressionId) => {
    if (selectedKey == null) {
      return
    }
    setBuiltProgression(seedProgressionFromPreset(selectedKey, progressionId))
    setPendingAddAfterIndex(null)
  }

  const toggleFindKeyMode = () => {
    setFindKeyMode((on) => {
      if (on) {
        setFindKeyChords([])
      } else if (selection?.kind === 'chord') {
        setFindKeyChords([selection.id])
        setSelection(null)
      } else {
        setFindKeyChords([])
      }
      return !on
    })
  }

  const toggleFindKeyChord = (chordId: ChordPresetId) => {
    setFindKeyChords((cur) => {
      const index = cur.indexOf(chordId)
      if (index >= 0) {
        return cur.filter((_, i) => i !== index)
      }
      return [...cur, chordId]
    })
  }

  const selectKey = (keyId: KeyId) => {
    if (selectedKey === keyId) {
      setSelectedKey(null)
      return
    }
    const progressionFromFindKey =
      findKeyChords.length > 0
        ? findKeyChords.slice(0, MAX_PROGRESSION_STEPS)
        : null
    setFindKeyMode(false)
    setFindKeyChords([])
    setSelection(null)
    setSelectedKey(keyId)
    if (progressionFromFindKey != null) {
      setBuiltProgression(progressionFromFindKey)
    }
  }

  const clearBuiltProgression = () => {
    setBuiltProgression(null)
    setPendingAddAfterIndex(null)
    setSelection(null)
  }

  const handleKeyRowChordClick = (chordId: ChordPresetId) => {
    const rootName = parseChordPresetId(chordId).rootName as RootName
    setPendingAddAfterIndex(null)

    const stepIndex =
      builtProgression?.findIndex(
        (id) => parseChordPresetId(id).rootName === rootName,
      ) ?? -1

    if (stepIndex >= 0) {
      setBuiltProgression((cur) => {
        if (cur == null) {
          return cur
        }
        const next = cur.filter((_, i) => i !== stepIndex)
        return next.length === 0 ? null : next
      })
      setSelection((sel) =>
        sel?.kind === 'chord' &&
        parseChordPresetId(sel.id).rootName === rootName
          ? null
          : sel,
      )
      return
    }

    if (
      builtProgression != null &&
      builtProgression.length >= MAX_PROGRESSION_STEPS
    ) {
      return
    }

    setBuiltProgression((cur) => (cur == null ? [chordId] : [...cur, chordId]))
    setSelection({ kind: 'chord', id: chordId })
  }

  const updateProgressionStep = (
    stepIndex: number,
    chordId: ChordPresetId,
  ) => {
    setBuiltProgression((cur) => {
      if (cur == null) {
        return cur
      }
      const next = [...cur]
      next[stepIndex] = chordId
      return next
    })
  }

  const handleSwapAdjacentSteps = (leftIndex: number) => {
    setBuiltProgression((cur) =>
      cur == null ? cur : swapAdjacentProgressionSteps(cur, leftIndex),
    )
    setPendingAddAfterIndex(null)
  }

  const handleDeleteStep = (stepIndex: number) => {
    const deletedId = builtProgression?.[stepIndex]
    const willBeEmpty = builtProgression?.length === 1

    setBuiltProgression((cur) =>
      cur == null ? cur : deleteProgressionStep(cur, stepIndex),
    )
    setSelection((sel) => {
      if (sel?.kind !== 'chord') {
        return sel
      }
      if (willBeEmpty) {
        return null
      }
      if (deletedId != null && sel.id === deletedId) {
        return null
      }
      return sel
    })
    setPendingAddAfterIndex(null)
  }

  const handleAddRoot = (afterIndex: number, rootName: RootName) => {
    if (selectedKey == null) {
      return
    }
    if (
      builtProgression != null &&
      builtProgression.length >= MAX_PROGRESSION_STEPS
    ) {
      return
    }
    const chordId = rootName as ChordPresetId
    if (!isRootInKey(selectedKey, rootName)) {
      setSelectedKey(rootName as KeyId)
    }
    setBuiltProgression((cur) => {
      if (cur == null || cur.length >= MAX_PROGRESSION_STEPS) {
        return cur
      }
      return insertProgressionStep(cur, afterIndex, chordId)
    })
    setPendingAddAfterIndex(null)
  }

  const renderProgressionSeeds = (keyId: KeyId) => (
    <div
      className="diagram-chord-grid diagram-progression-grid"
      role="group"
      aria-label="Progression seeds"
    >
      {PROGRESSION_IDS.map((progressionId) => {
        const def = PROGRESSIONS[progressionId]
        const unresolved = !isProgressionResolvableInKey(keyId, progressionId)
        const blocked =
          filterPlayableOnly &&
          !unresolved &&
          !isProgressionPlayableInKey(keyId, progressionId, disabledChords)
        const disabled = unresolved || blocked
        const blockedReason = progressionDisabledReason(keyId, progressionId)
        return (
          <Tooltip
            key={progressionId}
            label={blockedReason ?? `Seed ${def.label} in ${KEY_DEFS[keyId].name}`}
          >
            <button
              type="button"
              className="diagram-chord-btn"
              disabled={disabled}
              onClick={() => seedFromPreset(progressionId)}
            >
              {def.label}
            </button>
          </Tooltip>
        )
      })}
    </div>
  )

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
    const storedPlayable = isChordPlayable(id, disabledChords)
    const selected =
      options?.selected ??
      (selection?.kind === 'chord' && selection.id === id)
    const title =
      options?.keyId != null
        ? `${CHORD_PRESETS[id].name}${options.roman != null ? ` · ${options.roman}` : chordRomanNumeral(options.keyId, id) != null ? ` · ${chordRomanNumeral(options.keyId, id)}` : ''} in ${KEY_DEFS[options.keyId].name}`
        : CHORD_PRESETS[id].name

    return (
      <ChordPlayabilityCell
        key={id}
        chordId={id}
        playable={storedPlayable}
        selected={selected}
        title={title}
        label={options?.label}
        compact={options?.compact}
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
    <main
      ref={mainRef}
      className={[
        diagramLayoutVertical ? 'app-page app-page--split' : 'app-page',
        panelsSwapped ? 'app-page--panels-swapped' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        diagramLayoutVertical
          ? {
              gridTemplateColumns: gridSplitTemplate,
              gridTemplateRows: 'minmax(0, 1fr)',
            }
          : {
              gridTemplateRows: gridSplitTemplate,
              gridTemplateColumns: 'minmax(0, 1fr)',
            }
      }
    >
      <section
        className="app-page__options"
        aria-labelledby={`${baseId}-heading`}
      >
        <div className="app-page__inner">
          <h1 className="app-page__title" id={`${baseId}-heading`}>
            Practice Guitar App
          </h1>
          <div className="diagram-controls">
            <div className="diagram-field">
              <div className="diagram-field__label-row">
                <p className="diagram-label" id={`${baseId}-key-label`}>
                  Key
                </p>
                {selectedKey == null ? (
                  <Tooltip
                    label={
                      findKeyMode
                        ? 'Multiselect chords to find matching keys'
                        : 'Turn on to multiselect chords and find keys'
                    }
                  >
                    <button
                      type="button"
                      className={
                        findKeyMode
                          ? 'diagram-find-key diagram-find-key--active'
                          : 'diagram-find-key'
                      }
                      aria-pressed={findKeyMode}
                      aria-label="Find key from selected chords"
                      onClick={toggleFindKeyMode}
                    >
                      <Search size={12} aria-hidden />
                      find key
                    </button>
                  </Tooltip>
                ) : null}
              </div>
              <div
                className="diagram-chord-grid diagram-key-select-grid"
                role="group"
                aria-labelledby={`${baseId}-key-label`}
              >
                {[...KEY_MAJOR_IDS, ...KEY_MINOR_IDS].map((keyId) => {
                  const def = KEY_DEFS[keyId]
                  const selected = selectedKey === keyId
                  const inFindKeyFlow =
                    selectedKey == null && findKeyMode
                  const playableBlocked =
                    filterPlayableOnly &&
                    !isKeyPlayable(keyId, disabledChords)
                  const findKeyMatch =
                    inFindKeyFlow &&
                    findKeyChords.length > 0 &&
                    matchingFindKeys.has(keyId)
                  const disabled =
                    playableBlocked ||
                    (inFindKeyFlow &&
                      (findKeyChords.length === 0 || !findKeyMatch))
                  const keyTitle =
                    inFindKeyFlow && findKeyChords.length === 0
                      ? 'Select chords below to find matching keys'
                      : inFindKeyFlow && !findKeyMatch
                        ? 'Does not match selected chords'
                        : playableBlocked
                          ? 'No progressions playable with your enabled chords'
                          : def.name
                  return (
                    <Tooltip key={keyId} label={keyTitle}>
                      <button
                        type="button"
                        className={[
                          'diagram-chord-btn',
                          selected ? 'diagram-chord-btn--selected' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        aria-pressed={selected}
                        disabled={disabled}
                        onClick={() => selectKey(keyId)}
                      >
                        {def.label}
                      </button>
                    </Tooltip>
                  )
                })}
              </div>
            </div>

            {selectedKey != null ? (
              <div className="diagram-field">
                <p className="diagram-label" id={`${baseId}-scale-label`}>
                  Scale
                </p>
                <div
                  className="diagram-chord-grid diagram-scale-grid"
                  role="group"
                  aria-labelledby={`${baseId}-scale-label`}
                >
                  <Tooltip label={scaleModeTitle('Pentatonic')}>
                    <button
                      type="button"
                      className={
                        isScaleSelected('pentatonic')
                          ? 'diagram-chord-btn diagram-chord-btn--selected'
                          : 'diagram-chord-btn'
                      }
                      aria-pressed={isScaleSelected('pentatonic')}
                      onClick={() => toggleScaleSelection('pentatonic')}
                    >
                      Pentatonic
                    </button>
                  </Tooltip>
                  <Tooltip label={scaleModeTitle('Hexatonic')}>
                    <button
                      type="button"
                      className={
                        isScaleSelected('hexatonic')
                          ? 'diagram-chord-btn diagram-chord-btn--selected'
                          : 'diagram-chord-btn'
                      }
                      aria-pressed={isScaleSelected('hexatonic')}
                      onClick={() => toggleScaleSelection('hexatonic')}
                    >
                      Hexatonic
                    </button>
                  </Tooltip>
                  <Tooltip label={scaleModeTitle('Full')}>
                    <button
                      type="button"
                      className={
                        isScaleSelected('full')
                          ? 'diagram-chord-btn diagram-chord-btn--selected'
                          : 'diagram-chord-btn'
                      }
                      aria-pressed={isScaleSelected('full')}
                      onClick={() => toggleScaleSelection('full')}
                    >
                      Full Scale
                    </button>
                  </Tooltip>
                </div>
              </div>
            ) : null}

            <div className="diagram-field">
              <p className="diagram-label" id={`${baseId}-chord-label`}>
                Chords
              </p>
              {selectedKey != null && diatonicSlots != null ? (
                <div className="diagram-chords-build">
                  <div
                    className="diagram-chords-build__key-row"
                    role="group"
                    aria-label="Chords in key"
                  >
                    <div
                      className="diagram-chord-in-key diagram-chord-in-key--columns"
                      style={{
                        gridTemplateColumns: `repeat(${diatonicSlots.length}, 1fr)`,
                      }}
                    >
                      {diatonicSlots.map((slot) => {
                        const inProgression =
                          slot.chordId != null &&
                          progressionRootsInKey != null &&
                          progressionRootsInKey.has(
                            parseChordPresetId(slot.chordId).rootName as RootName,
                          )
                        return (
                          <div
                            key={`degree-${slot.degree}`}
                            className="diagram-chord-in-key__column"
                          >
                            {slot.chordId != null ? (
                              <>
                                {renderChordCell(slot.chordId, {
                                  keyId: selectedKey,
                                  roman: slot.roman,
                                  selectable: true,
                                  inProgression,
                                  onSelect: () =>
                                    handleKeyRowChordClick(slot.chordId!),
                                })}
                                {renderRoman(
                                  slot.chordId,
                                  scaleRomanLabel(slot.chordId, slot.roman),
                                )}
                              </>
                            ) : (
                              <>
                                <div
                                  className="diagram-chord-slot diagram-chord-slot--empty"
                                  aria-hidden
                                />
                                {renderRoman(
                                  null,
                                  slot.roman,
                                  'diagram-chord-roman--missing',
                                )}
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div
                    className="diagram-chords-build__progression-row"
                    role="group"
                    aria-labelledby={`${baseId}-progression-label`}
                  >
                    <div className="diagram-chords-build__progression-header">
                      <p
                        className="diagram-chords-build__sub-label"
                        id={`${baseId}-progression-label`}
                      >
                        Progression
                      </p>
                      {hasBuiltProgression ? (
                        <button
                          type="button"
                          className="diagram-chords-build__clear"
                          onClick={clearBuiltProgression}
                        >
                          <RotateCcw size={12} aria-hidden />
                          clear
                        </button>
                      ) : null}
                    </div>
                    {!hasBuiltProgression
                      ? renderProgressionSeeds(selectedKey)
                      : null}
                    {hasBuiltProgression ? (
                      <>
                        <div className="diagram-chord-in-key diagram-chords-build__progression-steps">
                          {builtProgression.map((chordId, stepIndex) => {
                            const triadId = triadIdForStep(selectedKey, chordId)
                            const roman =
                              chordRomanNumeral(selectedKey, chordId) ??
                              chordRomanNumeral(selectedKey, triadId)
                            const altOptionIds = progressionAltOptionIds(
                              selectedKey,
                              chordId,
                            )
                            const canAdd =
                              builtProgression.length < MAX_PROGRESSION_STEPS
                            const canSwapLeft = stepIndex > 0
                            const canSwapRight =
                              stepIndex < builtProgression.length - 1
                            const pickingRoot =
                              pendingAddAfterIndex === stepIndex

                            return (
                              <div
                                key={`progression-step-${stepIndex}-${chordId}`}
                                className="diagram-chord-in-key__column diagram-chord-in-key__column--editable diagram-progression-step"
                              >
                                <div className="diagram-progression-step__chord-wrap">
                                  <div
                                    className="diagram-progression-step__hover-controls diagram-progression-step__hover-controls--left"
                                  >
                                    {canSwapLeft ? (
                                      <Tooltip
                                        label={`Swap with step ${stepIndex}`}
                                      >
                                        <button
                                          type="button"
                                          className="diagram-progression-step__action"
                                          aria-label={`Swap with step ${stepIndex}`}
                                          onClick={() =>
                                            handleSwapAdjacentSteps(stepIndex - 1)
                                          }
                                        >
                                          <ArrowLeftRight
                                            className="diagram-progression-step__action-icon"
                                            strokeWidth={2.5}
                                            aria-hidden
                                          />
                                        </button>
                                      </Tooltip>
                                    ) : null}
                                    <Tooltip label="Remove chord">
                                      <button
                                        type="button"
                                        className="diagram-progression-step__action diagram-progression-step__action--danger"
                                        aria-label={`Remove step ${stepIndex + 1}`}
                                        onClick={() =>
                                          handleDeleteStep(stepIndex)
                                        }
                                      >
                                        <Trash2
                                          className="diagram-progression-step__action-icon"
                                          strokeWidth={2.5}
                                          aria-hidden
                                        />
                                      </button>
                                    </Tooltip>
                                  </div>
                                  {renderChordCell(chordId, {
                                    keyId: selectedKey,
                                    roman: roman ?? undefined,
                                    inProgression: true,
                                    selectable: false,
                                  })}
                                  <div
                                    className="diagram-progression-step__hover-controls diagram-progression-step__hover-controls--right"
                                  >
                                    {canAdd ? (
                                      <Tooltip label="Add chord to the right">
                                        <button
                                          type="button"
                                          className={
                                            pickingRoot
                                              ? 'diagram-progression-step__action diagram-progression-step__action--active'
                                              : 'diagram-progression-step__action'
                                          }
                                          aria-label="Add chord to the right"
                                          aria-expanded={pickingRoot}
                                          onClick={() =>
                                            setPendingAddAfterIndex((cur) =>
                                              cur === stepIndex ? null : stepIndex,
                                            )
                                          }
                                        >
                                          <Plus
                                            className="diagram-progression-step__action-icon"
                                            strokeWidth={2.5}
                                            aria-hidden
                                          />
                                        </button>
                                      </Tooltip>
                                    ) : null}
                                    {canSwapRight ? (
                                      <Tooltip
                                        label={`Swap with step ${stepIndex + 2}`}
                                      >
                                        <button
                                          type="button"
                                          className="diagram-progression-step__action"
                                          aria-label={`Swap with step ${stepIndex + 2}`}
                                          onClick={() =>
                                            handleSwapAdjacentSteps(stepIndex)
                                          }
                                        >
                                          <ArrowLeftRight
                                            className="diagram-progression-step__action-icon"
                                            strokeWidth={2.5}
                                            aria-hidden
                                          />
                                        </button>
                                      </Tooltip>
                                    ) : null}
                                  </div>
                                </div>
                                {renderRoman(
                                  chordId,
                                  scaleRomanLabel(
                                    chordId,
                                    roman ??
                                      parseChordPresetId(chordId).rootName,
                                  ),
                                )}
                                {altOptionIds.length > 0 ? (
                                  <div className="diagram-progression-step__alts">
                                    {altOptionIds.map((altId) =>
                                      renderChordCell(altId, {
                                        keyId: selectedKey,
                                        compact: true,
                                        onSelect: () =>
                                          updateProgressionStep(
                                            stepIndex,
                                            altId,
                                          ),
                                      }),
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            )
                          })}
                        </div>
                        {pendingAddAfterIndex != null ? (
                          <div
                            className="diagram-root-picker diagram-root-picker--progression"
                            role="group"
                            aria-label="Choose root for new chord"
                          >
                            {ROOT_NAMES.map((rootName) => {
                              const inKey = isRootInKey(selectedKey, rootName)
                              return (
                                <button
                                  key={rootName}
                                  type="button"
                                  className={
                                    inKey
                                      ? 'diagram-chord-btn diagram-chord-btn--compact'
                                      : 'diagram-chord-btn diagram-chord-btn--compact diagram-chord-btn--out-of-key'
                                  }
                                  onClick={() =>
                                    handleAddRoot(
                                      pendingAddAfterIndex,
                                      rootName,
                                    )
                                  }
                                >
                                  {rootName}
                                </button>
                              )
                            })}
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </div>
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
                      {chordIdsForRoot(root).map((id) =>
                        renderChordCell(
                          id,
                          findKeyMode
                            ? {
                                selected: findKeyChords.includes(id),
                                onSelect: () => toggleFindKeyChord(id),
                              }
                            : undefined,
                        ),
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div
        className={
          diagramLayoutVertical
            ? 'app-page__divider app-page__divider--vertical'
            : 'app-page__divider app-page__divider--horizontal'
        }
        role="separator"
        aria-orientation={diagramLayoutVertical ? 'vertical' : 'horizontal'}
        aria-valuenow={Math.round(panelSplitRatio * 100)}
        aria-valuemin={Math.round(PANEL_SPLIT_MIN * 100)}
        aria-valuemax={Math.round(PANEL_SPLIT_MAX * 100)}
        aria-label="Resize panels"
        onPointerDown={handleDividerPointerDown}
      >
        <span
          className="app-page__divider-handle"
          aria-hidden
          onPointerDown={handleDividerPointerDown}
        >
          <Minus
            className={
              diagramLayoutVertical
                ? 'app-page__divider-icon app-page__divider-icon--vertical'
                : 'app-page__divider-icon'
            }
            size={14}
            strokeWidth={2.5}
          />
        </span>
        <Tooltip
          placement={dividerTooltipPlacement}
          label={
            diagramLayoutVertical
              ? 'Arrange diagrams in a row'
              : 'Stack diagrams vertically'
          }
        >
          <button
            type="button"
            className="app-page__divider-layout-toggle"
            aria-label={
              diagramLayoutVertical
                ? 'Arrange diagrams in a row'
                : 'Stack diagrams vertically'
            }
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() =>
              void setDiagramLayout(
                diagramLayout === 'horizontal' ? 'vertical' : 'horizontal',
              )
            }
          >
            {diagramLayoutVertical ? (
              <Rows2 size={14} strokeWidth={2.5} aria-hidden />
            ) : (
              <Columns2 size={14} strokeWidth={2.5} aria-hidden />
            )}
          </button>
        </Tooltip>
        <Tooltip
          placement={dividerTooltipPlacement}
          label={
            diagramLayoutVertical
              ? 'Swap left and right panels'
              : 'Swap top and bottom panels'
          }
        >
          <button
            type="button"
            className="app-page__divider-swap-toggle"
            aria-label={
              diagramLayoutVertical
                ? 'Swap left and right panels'
                : 'Swap top and bottom panels'
            }
            aria-pressed={panelsSwapped}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => void setPanelsSwapped(!panelsSwapped)}
          >
            {diagramLayoutVertical ? (
              <ArrowLeftRight size={14} strokeWidth={2.5} aria-hidden />
            ) : (
              <ArrowUpDown size={14} strokeWidth={2.5} aria-hidden />
            )}
          </button>
        </Tooltip>
        <Tooltip
          placement={dividerTooltipPlacement}
          label={
            fretboardPortrait
              ? 'Standard fretboard orientation'
              : 'Rotate fretboard vertically'
          }
        >
          <button
            type="button"
            className="app-page__divider-orientation-toggle"
            aria-label={
              fretboardPortrait
                ? 'Standard fretboard orientation'
                : 'Rotate fretboard vertically'
            }
            aria-pressed={fretboardPortrait}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() =>
              void setFretboardOrientation(
                fretboardPortrait ? 'landscape' : 'portrait',
              )
            }
          >
            <RotateCcwSquare size={14} strokeWidth={2.5} aria-hidden />
          </button>
        </Tooltip>
        <div ref={fretPickerRef} className="app-page__divider-frets">
          <Tooltip
            placement={dividerTooltipPlacement}
            label="Fret count"
            disabled={fretPickerOpen}
          >
            <button
              type="button"
              className="app-page__divider-frets-toggle"
              aria-label={`Fret count: ${fretCount}`}
              aria-expanded={fretPickerOpen}
              aria-haspopup="listbox"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => setFretPickerOpen((open) => !open)}
            >
              <span className="app-page__divider-frets-value" aria-hidden>
                {fretCount}
              </span>
            </button>
          </Tooltip>
          {fretPickerOpen ? (
            <div
              className={`app-page__divider-frets-menu ${fretMenuPlacement}`}
              role="listbox"
              aria-label="Fret count"
            >
              {FRET_COUNT_OPTIONS.map((n) => {
                const selected = fretCount === n
                return (
                  <button
                    key={n}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={[
                      'app-page__divider-frets-option',
                      selected ? 'app-page__divider-frets-option--selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => {
                      void setFretCount(n)
                      setFretPickerOpen(false)
                    }}
                  >
                    {n}
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>
        <Tooltip
          placement={dividerTooltipPlacement}
          label={
            filterPlayableOnly
              ? 'Show all keys, progressions, and chords'
              : 'Only show chords you know'
          }
        >
          <button
            type="button"
            className={[
              'app-page__divider-known-toggle',
              filterPlayableOnly ? 'app-page__divider-tool--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label={
              filterPlayableOnly
                ? 'Show all keys, progressions, and chords'
                : 'Only show chords you know'
            }
            aria-pressed={filterPlayableOnly}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => void setFilterPlayableOnly(!filterPlayableOnly)}
          >
            <ListChecks size={14} strokeWidth={2.5} aria-hidden />
          </button>
        </Tooltip>
        <Tooltip
          placement={dividerTooltipPlacement}
          label={displayNotes ? 'Hide note names' : 'Show note names'}
        >
          <button
            type="button"
            className={[
              'app-page__divider-notes-toggle',
              displayNotes ? 'app-page__divider-tool--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label={displayNotes ? 'Hide note names' : 'Show note names'}
            aria-pressed={displayNotes}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => void setDisplayNotes(!displayNotes)}
          >
            <Music size={14} strokeWidth={2.5} aria-hidden />
          </button>
        </Tooltip>
      </div>

      <section
        className={[
          'app-page__diagram',
          hasBuiltProgression ? 'app-page__diagram--progression' : '',
          diagramLayoutVertical
            ? 'app-page__diagram--layout-vertical'
            : 'app-page__diagram--layout-horizontal',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Fretboard preview"
      >
        <div className="app-page__diagram-wrap">
          {hasBuiltProgression && selectedKey != null ? (
            <div className="app-page__diagram-stage app-page__diagram-stage--progression">
              {builtProgression.map((chordId, stepIndex) => {
                const boardStartFret = startFretForFingering(
                  resolveChord(chordId),
                  fretCount,
                )
                const boardScalePattern =
                  selectedKey != null && scaleSelection != null
                    ? scalePatternForKey(
                        selectedKey,
                        scaleSelection,
                        fretCount,
                        boardStartFret,
                      )
                    : null
                const roman = chordRomanNumeral(selectedKey, chordId)
                const boardTitle =
                  roman != null ? `${chordId} · ${roman}` : chordId
                return (
                  <div
                    key={`progression-board-${stepIndex}-${chordId}`}
                    className="diagram-progression-board"
                  >
                    <Fretboard
                      chord={chordId}
                      scalePattern={boardScalePattern}
                      fretCount={fretCount}
                      startFret={boardStartFret}
                      displayNotes={displayNotes}
                      orientation={fretboardOrientation}
                      title={boardTitle}
                      fitContainer
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="app-page__diagram-stage app-page__diagram-stage--single">
              <Fretboard
                chord={selection?.kind === 'chord' ? selection.id : null}
                scalePattern={scalePattern}
                fretCount={fretCount}
                startFret={startFret}
                displayNotes={displayNotes}
                orientation={fretboardOrientation}
                fitContainer
              />
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
