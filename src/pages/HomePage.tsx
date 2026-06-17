import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  ArrowLeftRight,
  ArrowUpDown,
  Columns2,
  Guitar,
  ListChecks,
  Minus,
  Music,
  Plus,
  SquareX,
  RotateCcw,
  Rows2,
  RotateCcwSquare,
  Search,
  Pencil,
  Trash2,
} from 'lucide-react'
import { ChordPlayabilityCell } from '../components/ChordPlayabilityCell'
import { Tooltip } from '../components/Tooltip'
import {
  CHORD_PRESETS,
  ROOT_NAMES,
  chordIdsForRoot,
  parseChordPresetId,
  Fretboard,
  chordsForProgression,
  diatonicSlotsInKey,
  isProgressionResolvableInKey,
  isSelectableChordInKey,
  isChordKnown,
  isKeyPlayable,
  isProgressionPlayableInKey,
  rankKeysForChords,
  findKeyMatchBrightness,
  romanLabelForChordInKey,
  romanLabelForProgressionStep,
  unknownChordsIn,
  seedProgressionFromPreset,
  allowedChordsForBuiltProgression,
  progressionHighlightedTriadsInKey,
  swapAdjacentProgressionSteps,
  deleteProgressionStep,
  insertProgressionStep,
  progressionAltOptions,
  triadIdForStep,
  transposeProgressionToKey,
  isRootInKey,
  MAX_PROGRESSION_STEPS,
  KEY_DEFS,
  KEY_MAJOR_IDS,
  KEY_MINOR_IDS,
  PROGRESSIONS,
  BASIC_PROGRESSION_IDS,
  COLORED_PROGRESSION_IDS,
  resolveChord,
  chordRomanNumeralOnScale,
  scalePatternForKey,
  startFretForFingering,
  FRET_COUNT_OPTIONS,
  type ChordPresetId,
  type KeyId,
  type ProgressionId,
  type RootName,
  type ScaleSelection,
} from '../components/Fretboard'
import { useUserSettings } from '../hooks/useUserSettings'
import { useMobileDiagramLayout } from '../hooks/useMobileDiagramLayout'
import {
  ACCENT_COLOR_OPTIONS,
  accentColorLabel,
} from '../theme/accentColors'
import {
  PANEL_SPLIT_MAX,
  PANEL_SPLIT_MIN,
  clampSplitRatio,
} from '../db/userSettingsRepository'

type BoardSelection = { kind: 'chord'; id: ChordPresetId }

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
  const [editKnownChordsMode, setEditKnownChordsMode] = useState(false)
  const [liveSplitRatio, setLiveSplitRatio] = useState<number | null>(null)
  const [fretPickerOpen, setFretPickerOpen] = useState(false)
  const [accentPickerOpen, setAccentPickerOpen] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const fretPickerRef = useRef<HTMLDivElement>(null)
  const accentPickerRef = useRef<HTMLDivElement>(null)
  const addProgressionPickerRef = useRef<HTMLDivElement>(null)
  const {
    ready: settingsReady,
    knownChords,
    filterPlayableOnly,
    displayNotes,
    fretCount,
    scaleSelection,
    diagramLayout,
    horizontalSplitRatio,
    verticalSplitRatio,
    fretboardOrientation,
    panelsSwapped,
    diagramHidden,
    setChordKnown,
    setFilterPlayableOnly,
    setDisplayNotes,
    setFretCount,
    setScaleSelection,
    setDiagramLayout,
    setHorizontalSplitRatio,
    setVerticalSplitRatio,
    setFretboardOrientation,
    setPanelsSwapped,
    setDiagramHidden,
    accentColorId,
    setAccentColorId,
  } = useUserSettings()

  const activeKey = useMemo(() => {
    if (selectedKey == null) {
      return null
    }
    if (
      filterPlayableOnly &&
      !isKeyPlayable(selectedKey, knownChords)
    ) {
      return null
    }
    return selectedKey
  }, [selectedKey, filterPlayableOnly, knownChords])

  const boardSelection = useMemo((): BoardSelection | null => {
    if (selection?.kind !== 'chord' || activeKey == null) {
      return selection
    }
    if (isSelectableChordInKey(activeKey, selection.id)) {
      return selection
    }
    if (builtProgression != null) {
      const allowed = allowedChordsForBuiltProgression(
        activeKey,
        builtProgression,
      )
      if (allowed.has(selection.id)) {
        return selection
      }
    }
    return null
  }, [selection, activeKey, builtProgression])

  const clearSelectedKey = () => {
    setBuiltProgression(null)
    setPendingAddAfterIndex(null)
    void setScaleSelection(null)
    setSelectedKey(null)
  }

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
    if (!accentPickerOpen) {
      return
    }
    const onPointerDown = (event: PointerEvent) => {
      if (accentPickerRef.current?.contains(event.target as Node)) {
        return
      }
      setAccentPickerOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAccentPickerOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [accentPickerOpen])

  useEffect(() => {
    if (pendingAddAfterIndex == null) {
      return
    }
    const onPointerDown = (event: PointerEvent) => {
      if (addProgressionPickerRef.current?.contains(event.target as Node)) {
        return
      }
      if (
        (event.target as HTMLElement).closest(
          '[aria-label="Add chord to the right"]',
        )
      ) {
        return
      }
      setPendingAddAfterIndex(null)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPendingAddAfterIndex(null)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [pendingAddAfterIndex])

  const diatonicSlots = useMemo(() => {
    if (activeKey == null) {
      return null
    }
    return diatonicSlotsInKey(activeKey)
  }, [activeKey])

  const progressionHighlightedTriads = useMemo(() => {
    if (
      activeKey == null ||
      builtProgression == null ||
      builtProgression.length === 0
    ) {
      return null
    }
    return progressionHighlightedTriadsInKey(activeKey, builtProgression)
  }, [activeKey, builtProgression])

  const hasBuiltProgression =
    builtProgression != null && builtProgression.length > 0

  const effectiveDiagramLayout = useMobileDiagramLayout(diagramLayout)
  const diagramLayoutVertical = effectiveDiagramLayout === 'vertical'
  const fretboardPortrait = fretboardOrientation === 'portrait'
  const fretMenuPlacement = diagramLayoutVertical
    ? panelsSwapped
      ? 'app-page__divider-frets-menu--left'
      : 'app-page__divider-frets-menu--right'
    : panelsSwapped
      ? 'app-page__divider-frets-menu--above'
      : 'app-page__divider-frets-menu--below'
  const accentMenuPlacement = fretMenuPlacement.replace(
    'frets-menu',
    'accent-menu',
  )
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

  const startDividerResize = (
    event: React.PointerEvent<HTMLElement>,
  ) => {
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
      currentRatio = clampSplitRatio(next)
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

  const handleDividerPointerDown = (
    event: React.PointerEvent<HTMLElement>,
  ) => {
    if ((event.target as HTMLElement).closest('button')) {
      return
    }
    startDividerResize(event)
  }

  const handleDividerResizePointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation()
    startDividerResize(event)
  }

  const findKeyRanks = useMemo(() => {
    if (!findKeyMode || findKeyChords.length === 0) {
      return null
    }
    return rankKeysForChords(findKeyChords)
  }, [findKeyMode, findKeyChords])

  const findKeyScoreById = useMemo(() => {
    if (findKeyRanks == null) {
      return null
    }
    return new Map(findKeyRanks.map((rank) => [rank.keyId, rank.score]))
  }, [findKeyRanks])

  const startFret = useMemo(() => {
    if (boardSelection?.kind !== 'chord') {
      return 1
    }
    return startFretForFingering(resolveChord(boardSelection.id), fretCount)
  }, [boardSelection, fretCount])

  const scalePattern = useMemo(() => {
    if (activeKey == null || scaleSelection == null) {
      return null
    }
    return scalePatternForKey(
      activeKey,
      scaleSelection,
      fretCount,
      startFret,
    )
  }, [activeKey, scaleSelection, fretCount, startFret])

  const scaleContextName =
    activeKey != null ? KEY_DEFS[activeKey].name : null

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
    if (activeKey == null || scaleSelection == null) {
      return false
    }
    return (
      chordRomanNumeralOnScale(activeKey, chordId, scaleSelection) != null
    )
  }

  const scaleRomanLabel = (chordId: ChordPresetId, fallback: string): string => {
    if (activeKey == null || scaleSelection == null) {
      return fallback
    }
    return (
      chordRomanNumeralOnScale(activeKey, chordId, scaleSelection) ??
      fallback
    )
  }

  const romanClassName = (extra?: string, active = false): string =>
    ['diagram-chord-roman', extra, active ? 'diagram-chord-roman--active' : '']
      .filter(Boolean)
      .join(' ')

  const renderRoman = (
    _chordId: ChordPresetId | null,
    text: string,
    extra?: string,
    active = false,
  ) => (
    <span className={romanClassName(extra, active)} aria-hidden>
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
    const missing = unknownChordsIn(
      chordsForProgression(keyId, progressionId),
      knownChords,
    )
    if (missing.length === 0) {
      return null
    }
    return `Requires ${missing.join(', ')}`
  }

  const seedFromPreset = (progressionId: ProgressionId) => {
    if (activeKey == null) {
      return
    }
    setBuiltProgression(seedProgressionFromPreset(activeKey, progressionId))
    setPendingAddAfterIndex(null)
  }

  const toggleEditKnownChordsMode = () => {
    setEditKnownChordsMode((on) => {
      if (!on) {
        setSelection(null)
        setFindKeyMode(false)
        setFindKeyChords([])
        setPendingAddAfterIndex(null)
      }
      return !on
    })
  }

  const toggleFindKeyMode = () => {
    setFindKeyMode((on) => {
      if (!on) {
        setEditKnownChordsMode(false)
      }
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
      clearSelectedKey()
      return
    }
    const progressionFromFindKey =
      findKeyChords.length > 0
        ? findKeyChords.slice(0, MAX_PROGRESSION_STEPS)
        : null
    const transposedProgression =
      progressionFromFindKey ??
      (selectedKey != null &&
      builtProgression != null &&
      builtProgression.length > 0
        ? transposeProgressionToKey(selectedKey, keyId, builtProgression)
        : null)
    setFindKeyMode(false)
    setFindKeyChords([])
    setSelection(null)
    setSelectedKey(keyId)
    if (transposedProgression != null) {
      setBuiltProgression(transposedProgression)
    }
  }

  const clearBuiltProgression = () => {
    setBuiltProgression(null)
    setPendingAddAfterIndex(null)
    setSelection(null)
  }

  const handleKeyRowChordClick = (chordId: ChordPresetId) => {
    setPendingAddAfterIndex(null)

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
    let chordId = rootName as ChordPresetId
    if (isRootInKey(selectedKey, rootName)) {
      for (const slot of diatonicSlotsInKey(selectedKey)) {
        if (
          slot.chordId != null &&
          parseChordPresetId(slot.chordId).rootName === rootName
        ) {
          chordId = slot.chordId
          break
        }
      }
    } else {
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

  const renderProgressionSeedButton = (
    keyId: KeyId,
    progressionId: ProgressionId,
    colored = false,
  ) => {
    const def = PROGRESSIONS[progressionId]
    const unresolved = !isProgressionResolvableInKey(keyId, progressionId)
    const blocked =
      filterPlayableOnly &&
      !unresolved &&
      !isProgressionPlayableInKey(keyId, progressionId, knownChords)
    const disabled = unresolved || blocked
    const blockedReason = progressionDisabledReason(keyId, progressionId)
    const seedChords = unresolved
      ? null
      : chordsForProgression(keyId, progressionId)
          .map((id) => CHORD_PRESETS[id].name)
          .join(' · ')
    const tooltipLabel =
      blockedReason ??
      (seedChords != null
        ? `${seedChords} in ${KEY_DEFS[keyId].name}`
        : `Seed ${def.label} in ${KEY_DEFS[keyId].name}`)

    return (
      <Tooltip key={progressionId} label={tooltipLabel}>
        <button
          type="button"
          className={[
            'diagram-chord-btn',
            colored ? 'diagram-progression-seeds__colored' : '',
            blocked ? 'diagram-chord-btn--unplayable' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={disabled}
          aria-disabled={disabled}
          onClick={() => seedFromPreset(progressionId)}
        >
          {def.label}
        </button>
      </Tooltip>
    )
  }

  const renderProgressionSeeds = (keyId: KeyId) => (
    <div
      className="diagram-chord-grid diagram-progression-grid diagram-progression-seeds"
      role="group"
      aria-label="Progression seeds"
    >
      {BASIC_PROGRESSION_IDS.map((progressionId) =>
        renderProgressionSeedButton(keyId, progressionId),
      )}
      {COLORED_PROGRESSION_IDS.map((progressionId) =>
        renderProgressionSeedButton(keyId, progressionId, true),
      )}
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
      dimmed?: boolean
      onSelect?: () => void
    },
  ) => {
    const chordKnown = isChordKnown(id, knownChords)
    const selected =
      editKnownChordsMode
        ? false
        : (options?.selected ??
          (selectedKey == null &&
            selection?.kind === 'chord' &&
            selection.id === id))
    const title =
      options?.keyId != null
        ? `${CHORD_PRESETS[id].name}${options.roman != null ? ` · ${options.roman}` : (() => {
            const { label, kind } = romanLabelForChordInKey(options.keyId, id)
            return kind !== 'foreign' ? ` · ${label}` : ''
          })()} in ${KEY_DEFS[options.keyId].name}`
        : CHORD_PRESETS[id].name

    return (
      <ChordPlayabilityCell
        key={id}
        chordId={id}
        known={chordKnown}
        selected={selected}
        title={title}
        label={options?.label}
        compact={options?.compact}
        dimmed={options?.dimmed}
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
        onKnownToggle={() => void setChordKnown(id, !chordKnown)}
        knownChordsMode={filterPlayableOnly}
        editKnownMode={editKnownChordsMode}
      />
    )
  }

  const showDiagramPanel = !diagramHidden
  const optionsToolbarTooltipPlacement = 'below' as const

  const renderFretCountControl = (
    fretMenuClass: string,
    tooltipPlacement: typeof dividerTooltipPlacement | 'below',
  ) => (
    <div ref={fretPickerRef} className="app-page__divider-frets">
      <Tooltip
        placement={tooltipPlacement}
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
          onClick={() => {
            setAccentPickerOpen(false)
            setFretPickerOpen((open) => !open)
          }}
        >
          <span className="app-page__divider-frets-value" aria-hidden>
            {fretCount}
          </span>
        </button>
      </Tooltip>
      {fretPickerOpen ? (
        <div
          className={`app-page__divider-frets-menu ${fretMenuClass}`}
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
  )

  const renderAccentColorControl = (
    accentMenuClass: string,
    tooltipPlacement: typeof dividerTooltipPlacement | 'below',
  ) => (
    <div ref={accentPickerRef} className="app-page__divider-accent">
      <Tooltip
        placement={tooltipPlacement}
        label="Accent color"
        disabled={accentPickerOpen}
      >
        <button
          type="button"
          className="app-page__divider-accent-toggle"
          aria-label={`Accent color: ${accentColorLabel(accentColorId)}`}
          aria-expanded={accentPickerOpen}
          aria-haspopup="listbox"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => {
            setFretPickerOpen(false)
            setAccentPickerOpen((open) => !open)
          }}
        >
          <span
            className="app-page__divider-accent-swatch"
            style={{ backgroundColor: 'var(--accent-line)' }}
            aria-hidden
          />
        </button>
      </Tooltip>
      {accentPickerOpen ? (
        <div
          className={`app-page__divider-accent-menu ${accentMenuClass}`}
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
                  'app-page__divider-accent-option',
                  selected ? 'app-page__divider-accent-option--selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => {
                  void setAccentColorId(option.id)
                  setAccentPickerOpen(false)
                }}
              >
                <span
                  className="app-page__divider-accent-option-swatch"
                  style={{ backgroundColor: option.swatch }}
                  aria-hidden
                />
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )

  const renderKnownFilterControl = (
    tooltipPlacement: typeof dividerTooltipPlacement | 'below',
  ) => (
    <Tooltip
      placement={tooltipPlacement}
      label={
        filterPlayableOnly
          ? 'Turn off known chords mode'
          : 'Known chords mode — grey unknown chords; filter keys and progressions'
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
            ? 'Turn off known chords mode'
            : 'Known chords mode — grey unknown chords; filter keys and progressions'
        }
        aria-pressed={filterPlayableOnly}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => {
          if (filterPlayableOnly) {
            setEditKnownChordsMode(false)
          }
          void setFilterPlayableOnly(!filterPlayableOnly)
        }}
      >
        <ListChecks size={16} strokeWidth={2.5} aria-hidden />
      </button>
    </Tooltip>
  )

  const renderNotesControl = (
    tooltipPlacement: typeof dividerTooltipPlacement | 'below',
  ) => (
    <Tooltip
      placement={tooltipPlacement}
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
        <Music size={16} strokeWidth={2.5} aria-hidden />
      </button>
    </Tooltip>
  )

  const renderDividerResizeControl = (
    tooltipPlacement: typeof dividerTooltipPlacement | 'below',
  ) => (
    <Tooltip placement={tooltipPlacement} label="Resize panels">
      <button
        type="button"
        className="app-page__divider-handle"
        aria-label="Resize panels"
        onPointerDown={handleDividerResizePointerDown}
      >
        <Minus
          className={
            diagramLayoutVertical
              ? 'app-page__divider-icon app-page__divider-icon--vertical'
              : 'app-page__divider-icon'
          }
          size={16}
          strokeWidth={2.5}
          aria-hidden
        />
      </button>
    </Tooltip>
  )

  const renderHideDiagramControl = (
    tooltipPlacement: typeof dividerTooltipPlacement | 'below',
  ) => (
    <Tooltip placement={tooltipPlacement} label="Hide guitar diagram">
      <button
        type="button"
        className="app-page__divider-diagram-toggle"
        aria-label="Hide guitar diagram"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => {
          setFretPickerOpen(false)
          void setDiagramHidden(true)
        }}
      >
        <SquareX size={16} strokeWidth={2.5} aria-hidden />
      </button>
    </Tooltip>
  )

  const renderShowDiagramControl = (
    tooltipPlacement: typeof dividerTooltipPlacement | 'below',
  ) => (
    <Tooltip placement={tooltipPlacement} label="Show guitar diagram">
      <button
        type="button"
        className="app-page__divider-diagram-toggle"
        aria-label="Show guitar diagram"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => void setDiagramHidden(false)}
      >
        <Guitar size={16} strokeWidth={2.5} aria-hidden />
      </button>
    </Tooltip>
  )

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
        showDiagramPanel && diagramLayoutVertical
          ? 'app-page app-page--split'
          : 'app-page',
        showDiagramPanel && panelsSwapped ? 'app-page--panels-swapped' : '',
        diagramHidden ? 'app-page--diagram-hidden' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        showDiagramPanel
          ? diagramLayoutVertical
            ? {
                gridTemplateColumns: gridSplitTemplate,
                gridTemplateRows: 'minmax(0, 1fr)',
              }
            : {
                gridTemplateRows: gridSplitTemplate,
                gridTemplateColumns: 'minmax(0, 1fr)',
              }
          : undefined
      }
    >
      <section
        className="app-page__options"
        aria-labelledby={`${baseId}-heading`}
      >
        <div className="app-page__inner">
          {diagramHidden ? (
            <div className="app-page__title-row">
              <h1 className="app-page__title" id={`${baseId}-heading`}>
                Practice Guitar App
              </h1>
              <div
                className="app-page__title-toolbar"
                role="toolbar"
                aria-label="Diagram tools"
              >
                {renderKnownFilterControl(optionsToolbarTooltipPlacement)}
                {renderShowDiagramControl(optionsToolbarTooltipPlacement)}
              </div>
            </div>
          ) : (
            <h1 className="app-page__title" id={`${baseId}-heading`}>
              Practice Guitar App
            </h1>
          )}
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
                  const selected = activeKey === keyId
                  const inFindKeyFlow =
                    selectedKey == null && findKeyMode
                  const playableBlocked =
                    filterPlayableOnly &&
                    !isKeyPlayable(keyId, knownChords)
                  const findKeyScore =
                    inFindKeyFlow && findKeyScoreById != null
                      ? findKeyScoreById.get(keyId)
                      : undefined
                  const findKeyBrightness =
                    findKeyScore != null
                      ? findKeyMatchBrightness(findKeyScore)
                      : null
                  const disabled =
                    playableBlocked ||
                    (inFindKeyFlow &&
                      (findKeyChords.length === 0 || findKeyBrightness == null))
                  const keyTitle =
                    inFindKeyFlow && findKeyChords.length === 0
                      ? 'Select chords below to find matching keys'
                      : inFindKeyFlow && findKeyScore != null
                        ? `${def.name} — ${findKeyScore}% match`
                        : inFindKeyFlow && findKeyBrightness == null
                          ? 'Does not match selected chords'
                          : playableBlocked
                            ? 'No progressions playable with your known chords'
                            : def.name
                  return (
                    <Tooltip key={keyId} label={keyTitle}>
                      <button
                        type="button"
                        className={[
                          'diagram-chord-btn',
                          selected ? 'diagram-chord-btn--selected' : '',
                          playableBlocked ? 'diagram-chord-btn--unplayable' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        aria-pressed={selected}
                        disabled={disabled}
                        style={
                          findKeyBrightness != null
                            ? { opacity: findKeyBrightness }
                            : undefined
                        }
                        onClick={() => selectKey(keyId)}
                      >
                        {def.label}
                      </button>
                    </Tooltip>
                  )
                })}
              </div>
            </div>

            {activeKey != null ? (
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
              <div className="diagram-field__label-row">
                <p className="diagram-label" id={`${baseId}-chord-label`}>
                  Chords
                </p>
                {filterPlayableOnly ? (
                  <Tooltip
                    label={
                      editKnownChordsMode
                        ? 'Done editing — click chords to select again'
                        : 'Edit which chords you know'
                    }
                  >
                    <button
                      type="button"
                      className={
                        editKnownChordsMode
                          ? 'diagram-edit-known diagram-edit-known--active'
                          : 'diagram-edit-known'
                      }
                      aria-pressed={editKnownChordsMode}
                      aria-label="Edit known chords"
                      onClick={toggleEditKnownChordsMode}
                    >
                      <Pencil size={12} aria-hidden />
                      edit
                    </button>
                  </Tooltip>
                ) : null}
              </div>
              {activeKey != null && diatonicSlots != null ? (
                <div className="diagram-chords-build">
                  <div
                    className="diagram-chords-build__key-row"
                    role="group"
                    aria-label="Chords in key"
                  >
                    <div
                      className="diagram-chord-in-key diagram-chord-in-key--columns"
                    >
                      {diatonicSlots.map((slot) => {
                        const inProgression =
                          slot.chordId != null &&
                          progressionHighlightedTriads != null &&
                          progressionHighlightedTriads.has(slot.chordId)
                        return (
                          <div
                            key={`degree-${slot.degree}`}
                            className="diagram-chord-in-key__column"
                          >
                            {slot.chordId != null ? (
                              <>
                                {renderChordCell(slot.chordId, {
                                  keyId: activeKey,
                                  roman: slot.roman,
                                  selectable: true,
                                  inProgression,
                                  onSelect: () =>
                                    handleKeyRowChordClick(slot.chordId!),
                                })}
                                {renderRoman(
                                  slot.chordId,
                                  scaleRomanLabel(slot.chordId, slot.roman),
                                  undefined,
                                  isChordInSelectedScale(slot.chordId),
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
                      ? renderProgressionSeeds(activeKey)
                      : null}
                    {hasBuiltProgression ? (
                      <>
                        <div
                          className={[
                            'diagram-chord-in-key diagram-chords-build__progression-steps',
                            builtProgression.length > 6
                              ? 'diagram-chords-build__progression-steps--compact-alts'
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          style={
                            {
                              '--progression-step-count': builtProgression.length,
                            } as React.CSSProperties
                          }
                        >
                          {builtProgression.map((chordId, stepIndex) => {
                            const triadId = triadIdForStep(activeKey, chordId)
                            const romanInfo = romanLabelForProgressionStep(
                              activeKey,
                              chordId,
                              triadId,
                            )
                            const altOptions = progressionAltOptions(
                              activeKey,
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
                                <div
                                  ref={
                                    pickingRoot
                                      ? addProgressionPickerRef
                                      : undefined
                                  }
                                  className={[
                                    'diagram-progression-step__chord-wrap',
                                    pickingRoot
                                      ? 'diagram-progression-step__chord-wrap--add-open'
                                      : '',
                                  ]
                                    .filter(Boolean)
                                    .join(' ')}
                                >
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
                                    keyId: activeKey,
                                    roman:
                                      romanInfo.kind !== 'foreign'
                                        ? romanInfo.label
                                        : undefined,
                                    inProgression: true,
                                    selectable: false,
                                  })}
                                  <div
                                    className="diagram-progression-step__hover-controls diagram-progression-step__hover-controls--right"
                                  >
                                    {canAdd ? (
                                      <Tooltip
                                        label="Add chord to the right"
                                        disabled={pickingRoot}
                                      >
                                        <button
                                          type="button"
                                          className={
                                            pickingRoot
                                              ? 'diagram-progression-step__action diagram-progression-step__action--active'
                                              : 'diagram-progression-step__action'
                                          }
                                          aria-label="Add chord to the right"
                                          aria-expanded={pickingRoot}
                                          aria-haspopup="listbox"
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
                                  {pickingRoot ? (
                                    <div
                                      className="diagram-progression-add-menu"
                                      role="listbox"
                                      aria-label="Choose root for new chord"
                                    >
                                      {ROOT_NAMES.map((rootName) => {
                                        const inKey = isRootInKey(
                                          activeKey,
                                          rootName,
                                        )
                                        return (
                                          <button
                                            key={rootName}
                                            type="button"
                                            role="option"
                                            className={[
                                              'diagram-progression-add-menu__option',
                                              inKey
                                                ? ''
                                                : 'diagram-progression-add-menu__option--out-of-key',
                                            ]
                                              .filter(Boolean)
                                              .join(' ')}
                                            onClick={() =>
                                              handleAddRoot(stepIndex, rootName)
                                            }
                                          >
                                            {rootName}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  ) : null}
                                </div>
                                {renderRoman(
                                  chordId,
                                  scaleRomanLabel(chordId, romanInfo.label),
                                  romanInfo.kind === 'foreign'
                                    ? 'diagram-chord-roman--foreign'
                                    : undefined,
                                  isChordInSelectedScale(chordId),
                                )}
                                {altOptions.length > 0 ? (
                                  <div className="diagram-progression-step__alts">
                                    {altOptions.map(({ chordId: altId, suggested }) =>
                                      renderChordCell(altId, {
                                        keyId: activeKey,
                                        compact: true,
                                        dimmed: !suggested,
                                        selected: altId === chordId,
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

      {showDiagramPanel ? (
        <>
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
                  <Rows2 size={16} strokeWidth={2.5} aria-hidden />
                ) : (
                  <Columns2 size={16} strokeWidth={2.5} aria-hidden />
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
                  <ArrowLeftRight size={16} strokeWidth={2.5} aria-hidden />
                ) : (
                  <ArrowUpDown size={16} strokeWidth={2.5} aria-hidden />
                )}
              </button>
            </Tooltip>
            {renderHideDiagramControl(dividerTooltipPlacement)}
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
                <RotateCcwSquare size={16} strokeWidth={2.5} aria-hidden />
              </button>
            </Tooltip>
            {renderFretCountControl(fretMenuPlacement, dividerTooltipPlacement)}
            {renderAccentColorControl(accentMenuPlacement, dividerTooltipPlacement)}
            {renderKnownFilterControl(dividerTooltipPlacement)}
            {renderNotesControl(dividerTooltipPlacement)}
            {renderDividerResizeControl(dividerTooltipPlacement)}
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
              {hasBuiltProgression && activeKey != null ? (
                <div className="app-page__diagram-stage app-page__diagram-stage--progression">
                  {builtProgression.map((chordId, stepIndex) => {
                    const boardStartFret = startFretForFingering(
                      resolveChord(chordId),
                      fretCount,
                    )
                    const boardScalePattern =
                      activeKey != null && scaleSelection != null
                        ? scalePatternForKey(
                            activeKey,
                            scaleSelection,
                            fretCount,
                            boardStartFret,
                          )
                        : null
                    const stepTriadId = triadIdForStep(activeKey, chordId)
                    const boardRoman = romanLabelForProgressionStep(
                      activeKey,
                      chordId,
                      stepTriadId,
                    )
                    const boardTitle =
                      boardRoman.kind !== 'foreign'
                        ? `${chordId} · ${boardRoman.label}`
                        : chordId
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
                    chord={boardSelection?.kind === 'chord' ? boardSelection.id : null}
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
        </>
      ) : null}
    </main>
  )
}
