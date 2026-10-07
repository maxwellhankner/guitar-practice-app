import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  ListChecks,
  RotateCcw,
  Search,
  Pencil,
  Share2,
  Trash2,
} from 'lucide-react'
import {
  nextChordSound,
  playChordStrum,
  stopChordStrum,
  type ChordSoundId,
} from '../audio/chordStrum'
import { playMetronomeClick } from '../audio/metronome'
import { ChordPlayabilityCell } from '../components/ChordPlayabilityCell'
import { DiagramDivider } from '../components/DiagramDivider'
import { ProgressionPlayBar } from '../components/ProgressionPlayBar'
import { Tooltip, type TooltipPlacement } from '../components/Tooltip'
import { useProgressionPlayer } from '../hooks/useProgressionPlayer'
import {
  CHORD_PRESETS,
  ROOT_NAMES,
  primaryChordIdsForRoot,
  extraChordIdsForRoot,
  Fretboard,
  NOTE_NAMES_SHARP,
  OPEN_STRING_PITCH_CLASS,
  chordIdsForPitchClasses,
  hintPitchClassesForSelection,
  noteAtFret,
  chordsForProgression,
  diatonicSlotsInKey,
  isProgressionResolvableInKey,
  isSelectableChordInKey,
  isChordKnown,
  isKeyPlayable,
  isProgressionPlayableInKey,
  rankKeysForChordAndNoteSelection,
  findKeyMatchBrightness,
  romanLabelForChordInKey,
  romanLabelForProgressionStep,
  unknownChordsIn,
  seedProgressionFromPreset,
  seedProgressionFromSong,
  allowedChordsForBuiltProgression,
  progressionHighlightedTriadsInKey,
  swapProgressionSteps,
  deleteProgressionStep,
  insertProgressionStep,
  progressionAltOptions,
  triadIdForStep,
  transposeProgressionToKey,
  MAX_PROGRESSION_STEPS,
  KEY_DEFS,
  KEY_MAJOR_IDS,
  KEY_MINOR_IDS,
  relativeKeyId,
  PROGRESSIONS,
  basicProgressionIdsForKey,
  coloredProgressionIdsForKey,
  SONGS,
  SONG_IDS,
  chordsForSong,
  isSongResolvableInKey,
  isSongPlayableInKey,
  resolveChord,
  chordRomanNumeralOnScale,
  scalePatternForKey,
  startFretForFingering,
  type ChordPresetId,
  type KeyId,
  type ProgressionId,
  type RootName,
  type ScaleSelection,
  type SongId,
} from '../components/Fretboard'
import { useDiagramPanel } from '../hooks/useDiagramPanel'
import { progressionDiagramArrangement, progressionBoardMaxHeight } from '../hooks/progressionDiagramArrangement'

type BoardSelection = { kind: 'chord'; id: ChordPresetId }

/** A–D / Am–Dm vs D#–G# / D#m–G#m on mobile key grids. */
const KEY_MOBILE_GROUP_SIZE = 6

/** Hold before a progression chord can be dragged to reorder. */
const PROGRESSION_REORDER_HOLD_MS = 320
/** Pointer travel that cancels a pending long-press. */
const PROGRESSION_REORDER_CANCEL_PX = 12

const SCALE_MENU_OPTIONS: {
  value: ScaleSelection
  label: string
}[] = [
  { value: null, label: 'Off' },
  { value: 'pentatonic', label: 'Pentatonic' },
  { value: 'hexatonic', label: 'Hexatonic' },
  { value: 'full', label: 'Full Scale' },
]

function progressionEqual(
  a: ChordPresetId[] | null,
  b: ChordPresetId[] | null,
): boolean {
  if (a === b) {
    return true
  }
  if (a == null || b == null) {
    return false
  }
  if (a.length !== b.length) {
    return false
  }
  return a.every((id, index) => id === b[index])
}

type PracticeSelectionSnapshot = {
  selectedKey: KeyId | null
  selectedChord: ChordPresetId | null
  builtProgression: ChordPresetId[] | null
  selectedSongId: SongId | null
}

function practiceSelectionSnapshot(
  selectedKey: KeyId | null,
  selectedChord: ChordPresetId | null,
  builtProgression: ChordPresetId[] | null,
  selectedSongId: SongId | null,
): PracticeSelectionSnapshot {
  return { selectedKey, selectedChord, builtProgression, selectedSongId }
}

function practiceSelectionsEqual(
  a: PracticeSelectionSnapshot,
  b: PracticeSelectionSnapshot,
): boolean {
  return (
    a.selectedKey === b.selectedKey &&
    a.selectedChord === b.selectedChord &&
    a.selectedSongId === b.selectedSongId &&
    progressionEqual(a.builtProgression, b.builtProgression)
  )
}

export function HomePage() {
  const baseId = useId()
  const [selection, setSelection] = useState<BoardSelection | null>(null)
  const [selectedKey, setSelectedKey] = useState<KeyId | null>(null)
  const [builtProgression, setBuiltProgression] = useState<
    ChordPresetId[] | null
  >(null)
  const [selectedSongId, setSelectedSongId] = useState<SongId | null>(null)
  const [findKeyMode, setFindKeyMode] = useState(false)
  const [findKeyChords, setFindKeyChords] = useState<ChordPresetId[]>([])
  const [findChordMode, setFindChordMode] = useState(false)
  const [findChordPickedId, setFindChordPickedId] = useState<ChordPresetId | null>(
    null,
  )
  const [findChordPositions, setFindChordPositions] = useState<
    { stringIndex: number; fret: number }[]
  >([])
  const [songQuery, setSongQuery] = useState('')
  const [editKnownChordsMode, setEditKnownChordsMode] = useState(false)
  const [chordVariantsOpen, setChordVariantsOpen] = useState(false)
  const [progressionAltsOpen, setProgressionAltsOpen] = useState(false)
  const [progressionDragFrom, setProgressionDragFrom] = useState<number | null>(
    null,
  )
  const [progressionDragOver, setProgressionDragOver] = useState<number | null>(
    null,
  )
  const [selectedProgressionStep, setSelectedProgressionStep] = useState<
    number | null
  >(null)
  const [scalePickerOpen, setScalePickerOpen] = useState(false)
  const scalePickerRef = useRef<HTMLDivElement>(null)
  const panel = useDiagramPanel()
  const progressionReorderRef = useRef<{
    fromIndex: number
    pointerId: number
    startX: number
    startY: number
    holdTimer: ReturnType<typeof setTimeout> | null
    active: boolean
    overIndex: number
  } | null>(null)
  const practiceHydratedRef = useRef(false)
  const lastSyncedPracticeRef = useRef<PracticeSelectionSnapshot | null>(null)
  const pendingPracticePersistRef = useRef<PracticeSelectionSnapshot | null>(
    null,
  )
  const {
    ready: settingsReady,
    knownChords,
    filterPlayableOnly,
    fretCount,
    scaleSelection,
    displayNotes,
    fretboardOrientation,
    isMobileViewport,
    diagramLayoutVertical,
    fretboardPortrait,
    showDiagramPanel,
    setDiagramHidden,
    mainRef,
    shellClassName,
    gridStyle,
    setChordKnown,
    setFilterPlayableOnly,
    setScaleSelection,
    selectedKey: savedSelectedKey,
    selectedChord: savedSelectedChord,
    builtProgression: savedBuiltProgression,
    selectedSongId: savedSelectedSongId,
    setPracticeSelection,
  } = panel

  const builtProgressionRef = useRef(builtProgression)
  const playbackMutedRef = useRef(false)
  const [chordSound, setChordSound] = useState<ChordSoundId>(1)
  const chordSoundRef = useRef(chordSound)

  useEffect(() => {
    builtProgressionRef.current = builtProgression
  }, [builtProgression])

  useEffect(() => {
    chordSoundRef.current = chordSound
  }, [chordSound])
  const showPlaybackStep = (index: number) => {
    const chordId = builtProgressionRef.current?.[index]
    if (chordId == null) {
      return
    }
    setSelectedProgressionStep(index)
    if (!playbackMutedRef.current) {
      playChordStrum(chordId, chordSoundRef.current)
    }
  }
  const barsPerChord =
    selectedSongId != null ? SONGS[selectedSongId].strumBarsPerChord : 1
  const player = useProgressionPlayer(
    builtProgression?.length ?? 0,
    barsPerChord,
    showPlaybackStep,
    playMetronomeClick,
  )
  useEffect(() => {
    playbackMutedRef.current = player.muted
    if (player.muted) {
      stopChordStrum()
    }
  }, [player.muted])

  const wasPlayingRef = useRef(false)
  useEffect(() => {
    if (wasPlayingRef.current && !player.playing) {
      stopChordStrum()
    }
    wasPlayingRef.current = player.playing
  }, [player.playing])

  useEffect(() => () => stopChordStrum(), [])

  useEffect(() => {
    return () => {
      const pending = progressionReorderRef.current
      if (pending?.holdTimer != null) {
        clearTimeout(pending.holdTimer)
      }
    }
  }, [])

  useEffect(() => {
    if (!settingsReady) {
      return
    }

    const selectedChord =
      selection?.kind === 'chord' ? selection.id : null
    const local = practiceSelectionSnapshot(
      selectedKey,
      selectedChord,
      builtProgression,
      selectedSongId,
    )
    const saved = practiceSelectionSnapshot(
      savedSelectedKey,
      savedSelectedChord,
      savedBuiltProgression,
      savedSelectedSongId,
    )

    if (!practiceHydratedRef.current) {
      setSelectedKey(saved.selectedKey)
      setBuiltProgression(saved.builtProgression)
      setSelectedSongId(saved.selectedSongId)
      setSelection(
        saved.selectedChord != null
          ? { kind: 'chord', id: saved.selectedChord }
          : null,
      )
      practiceHydratedRef.current = true
      lastSyncedPracticeRef.current = saved
      return
    }

    const lastSynced = lastSyncedPracticeRef.current
    if (lastSynced == null) {
      lastSyncedPracticeRef.current = saved
      return
    }

    const savedChanged = !practiceSelectionsEqual(saved, lastSynced)
    const localChanged = !practiceSelectionsEqual(local, lastSynced)

    if (savedChanged && !localChanged) {
      if (pendingPracticePersistRef.current != null) {
        return
      }
      setSelectedKey(saved.selectedKey)
      setBuiltProgression(saved.builtProgression)
      setSelectedSongId(saved.selectedSongId)
      setSelection(
        saved.selectedChord != null
          ? { kind: 'chord', id: saved.selectedChord }
          : null,
      )
      lastSyncedPracticeRef.current = saved
      return
    }

    if (localChanged && !practiceSelectionsEqual(local, saved)) {
      lastSyncedPracticeRef.current = local
      pendingPracticePersistRef.current = local
      void setPracticeSelection({
        selectedKey: local.selectedKey,
        selectedChord: local.selectedChord,
        builtProgression: local.builtProgression,
        selectedSongId: local.selectedSongId,
      }).finally(() => {
        if (
          pendingPracticePersistRef.current != null &&
          practiceSelectionsEqual(pendingPracticePersistRef.current, local)
        ) {
          pendingPracticePersistRef.current = null
        }
      })
      return
    }

    if (savedChanged) {
      lastSyncedPracticeRef.current = saved
    }
  }, [
    settingsReady,
    selectedKey,
    selection,
    builtProgression,
    selectedSongId,
    savedSelectedKey,
    savedSelectedChord,
    savedBuiltProgression,
    savedSelectedSongId,
    setPracticeSelection,
  ])

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
    player.pause()
    setBuiltProgression(null)
    setSelectedSongId(null)
    setSelectedProgressionStep(null)
    setSelection(null)
    setSelectedKey(null)
  }

  useEffect(() => {
    if (!scalePickerOpen) {
      return
    }
    const onPointerDown = (event: PointerEvent) => {
      if (scalePickerRef.current?.contains(event.target as Node)) {
        return
      }
      setScalePickerOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setScalePickerOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [scalePickerOpen])

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

  const focusedProgressionStep =
    builtProgression != null &&
    selectedProgressionStep != null &&
    selectedProgressionStep >= 0 &&
    selectedProgressionStep < builtProgression.length
      ? selectedProgressionStep
      : null

  const progressionBoards = useMemo(() => {
    if (!hasBuiltProgression || builtProgression == null) {
      return [] as { chordId: ChordPresetId; stepIndex: number }[]
    }
    if (focusedProgressionStep != null) {
      return [
        {
          chordId: builtProgression[focusedProgressionStep]!,
          stepIndex: focusedProgressionStep,
        },
      ]
    }
    return builtProgression.map((chordId, stepIndex) => ({
      chordId,
      stepIndex,
    }))
  }, [builtProgression, hasBuiltProgression, focusedProgressionStep])

  const progressionArrangement = progressionDiagramArrangement(
    diagramLayoutVertical,
    fretboardPortrait,
  )
  const progressionBoardMaxHeightCss =
    hasBuiltProgression && activeKey != null
      ? progressionBoardMaxHeight(
          progressionBoards.length,
          progressionArrangement,
        )
      : undefined

  const findKeyRanks = useMemo(() => {
    if (!findKeyMode) {
      return null
    }
    if (findKeyChords.length === 0 && findChordPositions.length === 0) {
      return null
    }
    const pitchClasses = findChordPositions.map(
      (position) =>
        (OPEN_STRING_PITCH_CLASS[position.stringIndex]! + position.fret) % 12,
    )
    return rankKeysForChordAndNoteSelection(findKeyChords, pitchClasses)
  }, [findKeyMode, findKeyChords, findChordPositions])

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
    activeKey != null && scaleContextName != null
      ? `${label} scale in ${scaleContextName}`
      : `${label} scale`

  const scaleSelectionLabel = (value: ScaleSelection): string => {
    if (value == null) {
      return 'Off'
    }
    return SCALE_MENU_OPTIONS.find((option) => option.value === value)?.label ?? value
  }

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
    player.pause()
    setSelectedSongId(null)
    setBuiltProgression(seedProgressionFromPreset(activeKey, progressionId))
    setSelectedProgressionStep(null)
  }

  const seedFromSong = (songId: SongId) => {
    if (findKeyMode || findChordMode) {
      return
    }
    player.pause()
    const song = SONGS[songId]
    const keyId = activeKey ?? song.defaultKey
    if (activeKey == null) {
      setSelectedKey(keyId)
    }
    setSelectedSongId(songId)
    setBuiltProgression(seedProgressionFromSong(keyId, songId))
    setSelectedProgressionStep(null)
    setProgressionAltsOpen(false)
    setSelection(null)
  }

  const detachSongAssociation = () => {
    setSelectedSongId(null)
  }

  const toggleEditKnownChordsMode = () => {
    setEditKnownChordsMode((on) => {
      if (!on) {
        setSelection(null)
        setFindKeyMode(false)
        setFindKeyChords([])
        setFindChordMode(false)
        setFindChordPickedId(null)
        setFindChordPositions([])
      }
      return !on
    })
  }

  const toggleFindKeyMode = () => {
    const turningOn = !findKeyMode
    if (turningOn && selectedKey != null) {
      clearSelectedKey()
    }
    setFindKeyMode((on) => {
      if (!on) {
        setEditKnownChordsMode(false)
        setFindChordMode(false)
        setFindChordPickedId(null)
        setFindChordPositions([])
        void setDiagramHidden(false)
      }
      if (on) {
        setFindKeyChords([])
        setFindChordPickedId(null)
        setFindChordPositions([])
      } else if (selection?.kind === 'chord') {
        setFindKeyChords([selection.id])
        setSelection(null)
      } else {
        setFindKeyChords([])
      }
      return !on
    })
  }

  const toggleFindChordMode = () => {
    setFindChordMode((on) => {
      if (!on) {
        setFindKeyMode(false)
        setFindKeyChords([])
        setEditKnownChordsMode(false)
        void setDiagramHidden(false)
        player.pause()
        setSelection(null)
        setSelectedProgressionStep(null)
        setFindChordPickedId(null)
        setFindChordPositions([])
      } else {
        setFindChordPickedId(null)
        setFindChordPositions([])
      }
      return !on
    })
  }

  const fingeringPositions = (id: ChordPresetId) => {
    const positions: { stringIndex: number; fret: number }[] = []
    resolveChord(id).strings.forEach((state, stringIndex) => {
      if (typeof state === 'number') {
        positions.push({ stringIndex, fret: state })
      }
    })
    return positions
  }

  const toggleFindBoardPosition = (position: {
    stringIndex: number
    fret: number
  }) => {
    const seedId =
      findChordPositions.length === 0
        ? findChordMode
          ? findChordPickedId
          : findKeyMode
            ? (findKeyChords[findKeyChords.length - 1] ?? null)
            : null
        : null
    if (seedId != null) {
      setFindChordPickedId(null)
    }
    setFindChordPositions((current) => {
      const base =
        current.length === 0 && seedId != null
          ? fingeringPositions(seedId)
          : current
      const index = base.findIndex(
        (item) =>
          item.stringIndex === position.stringIndex && item.fret === position.fret,
      )
      if (index < 0) {
        return [...base, position]
      }
      return base.filter((_, itemIndex) => itemIndex !== index)
    })
  }

  const findChordPitchClasses = useMemo(
    () =>
      findChordPositions.map(
          (position) =>
            (OPEN_STRING_PITCH_CLASS[position.stringIndex]! + position.fret) % 12,
        ),
    [findChordPositions],
  )

  const findChordMatches = useMemo(
    () => chordIdsForPitchClasses(findChordPitchClasses),
    [findChordPitchClasses],
  )

  const findChordHints = useMemo(() => {
    const hintPitchClasses = new Set(
      hintPitchClassesForSelection(findChordPitchClasses),
    )
    if (hintPitchClasses.size === 0) {
      return []
    }
    const usedStrings = new Set(
      findChordPositions.map((position) => position.stringIndex),
    )
    const hints: { stringIndex: number; fret: number }[] = []
    for (
      let stringIndex = 0;
      stringIndex < OPEN_STRING_PITCH_CLASS.length;
      stringIndex++
    ) {
      if (usedStrings.has(stringIndex)) {
        continue
      }
      for (let fret = 0; fret <= fretCount; fret++) {
        const pitchClass =
          (OPEN_STRING_PITCH_CLASS[stringIndex]! + fret) % 12
        if (hintPitchClasses.has(pitchClass)) {
          hints.push({ stringIndex, fret })
        }
      }
    }
    return hints
  }, [findChordPitchClasses, findChordPositions, fretCount])

  const findChordTitle = useMemo(() => {
    if (findChordMatches.length === 1) {
      return CHORD_PRESETS[findChordMatches[0]!].name ?? findChordMatches[0]!
    }
    if (findChordMatches.length > 1) {
      return findChordMatches.join(' · ')
    }
    const seen = new Set<number>()
    const names: string[] = []
    for (const pc of findChordPitchClasses) {
      if (seen.has(pc)) {
        continue
      }
      seen.add(pc)
      names.push(NOTE_NAMES_SHARP[pc]!)
    }
    return names.length > 0 ? names.join(' · ') : 'Fretboard'
  }, [findChordMatches, findChordPitchClasses])

  const exploreChordId = useMemo((): ChordPresetId | null => {
    if (findChordMode) {
      if (findChordPickedId != null) {
        return findChordPickedId
      }
      return findChordMatches.length === 1 ? findChordMatches[0]! : null
    }
    if (findKeyMode) {
      const picked = findKeyChords[findKeyChords.length - 1]
      if (picked != null) {
        return picked
      }
      return findChordMatches.length === 1 ? findChordMatches[0]! : null
    }
    return null
  }, [
    findChordMode,
    findChordPickedId,
    findChordMatches,
    findKeyMode,
    findKeyChords,
  ])

  const exploreLeadKey = useMemo(() => {
    if (!findKeyMode || findKeyRanks == null) {
      return null
    }
    return (
      findKeyRanks.find((rank) => findKeyMatchBrightness(rank.score) != null) ??
      null
    )
  }, [findKeyMode, findKeyRanks])

  const exploreScale = useMemo(() => {
    if (exploreLeadKey == null) {
      return null
    }
    return scalePatternForKey(
      exploreLeadKey.keyId,
      scaleSelection ?? 'full',
      fretCount,
    )
  }, [exploreLeadKey, scaleSelection, fretCount])

  const exploreMarkers = useMemo(() => {
    const covered = new Set<string>()
    if (exploreChordId != null) {
      resolveChord(exploreChordId).strings.forEach((state, stringIndex) => {
        if (typeof state === 'number') {
          covered.add(`${stringIndex}:${state}`)
        }
      })
    }
    return findChordPositions
      .filter((position) => !covered.has(`${position.stringIndex}:${position.fret}`))
      .map((position) => ({
        stringIndex: position.stringIndex,
        fret: position.fret,
        label: noteAtFret(position.stringIndex, position.fret),
      }))
  }, [exploreChordId, findChordPositions])

  const exploreTitle = useMemo(() => {
    if (findChordMode) {
      if (findChordPickedId != null) {
        return CHORD_PRESETS[findChordPickedId].name ?? findChordPickedId
      }
      return findChordTitle
    }
    const chordName =
      exploreChordId != null
        ? (CHORD_PRESETS[exploreChordId].name ?? exploreChordId)
        : null
    const keyName = exploreScale?.name ?? null
    if (chordName != null && keyName != null && chordName !== keyName) {
      return `${chordName} · ${keyName}`
    }
    return keyName ?? chordName ?? findChordTitle
  }, [
    findChordMode,
    findChordPickedId,
    findChordTitle,
    exploreChordId,
    exploreScale,
  ])

  const pickFindChord = (id: ChordPresetId) => {
    setFindChordPositions([])
    setFindChordPickedId((current) => (current === id ? null : id))
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
    player.pause()
    const noteMatches = chordIdsForPitchClasses(
      findChordPositions.map(
        (position) =>
          (OPEN_STRING_PITCH_CLASS[position.stringIndex]! + position.fret) % 12,
      ),
    )
    const progressionFromFindKey =
      findKeyChords.length > 0
        ? findKeyChords.slice(0, MAX_PROGRESSION_STEPS)
        : noteMatches.length === 1
          ? noteMatches
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
    setFindChordMode(false)
    setFindChordPickedId(null)
    setFindChordPositions([])
    setSelection(null)
    setSelectedProgressionStep(null)
    setSelectedKey(keyId)
    if (transposedProgression != null) {
      if (progressionFromFindKey != null) {
        setSelectedSongId(null)
      }
      setBuiltProgression(transposedProgression)
    }
  }

  const clearBuiltProgression = () => {
    player.pause()
    setBuiltProgression(null)
    setSelectedSongId(null)
    setSelectedProgressionStep(null)
    setProgressionAltsOpen(false)
    setSelection(null)
  }

  const handleKeyRowChordClick = (chordId: ChordPresetId) => {
    player.pause()
    detachSongAssociation()

    const current = builtProgression
    if (current != null && current.length >= MAX_PROGRESSION_STEPS) {
      return
    }

    const insertAfter =
      selectedProgressionStep != null &&
      current != null &&
      selectedProgressionStep >= 0 &&
      selectedProgressionStep < current.length
        ? selectedProgressionStep
        : null

    if (current == null || current.length === 0) {
      setBuiltProgression([chordId])
      setSelection({ kind: 'chord', id: chordId })
      return
    }

    if (insertAfter != null) {
      setBuiltProgression(insertProgressionStep(current, insertAfter, chordId))
      setSelectedProgressionStep(insertAfter + 1)
      setSelection({ kind: 'chord', id: chordId })
      return
    }

    setBuiltProgression([...current, chordId])
    setSelection({ kind: 'chord', id: chordId })
  }

  const updateProgressionStep = (
    stepIndex: number,
    chordId: ChordPresetId,
  ) => {
    player.pause()
    setBuiltProgression((cur) => {
      if (cur == null) {
        return cur
      }
      const next = [...cur]
      next[stepIndex] = chordId
      return next
    })
  }

  const clearProgressionReorder = () => {
    const pending = progressionReorderRef.current
    if (pending?.holdTimer != null) {
      clearTimeout(pending.holdTimer)
    }
    progressionReorderRef.current = null
    setProgressionDragFrom(null)
    setProgressionDragOver(null)
  }

  const stepIndexFromPoint = (clientX: number, clientY: number) => {
    const el = document.elementFromPoint(clientX, clientY)
    const step = el?.closest('[data-progression-step-index]')
    if (step == null) {
      return null
    }
    const index = Number(step.getAttribute('data-progression-step-index'))
    return Number.isInteger(index) ? index : null
  }

  const handleProgressionReorderPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    stepIndex: number,
  ) => {
    if (selectedSongId != null || event.button !== 0) {
      return
    }
    if (
      (event.target as HTMLElement).closest(
        '.diagram-progression-step__delete',
      )
    ) {
      return
    }

    clearProgressionReorder()
    const pointerId = event.pointerId
    const startX = event.clientX
    const startY = event.clientY
    const target = event.currentTarget
    progressionReorderRef.current = {
      fromIndex: stepIndex,
      pointerId,
      startX,
      startY,
      holdTimer: setTimeout(() => {
        const pending = progressionReorderRef.current
        if (pending == null || pending.pointerId !== pointerId) {
          return
        }
        pending.active = true
        pending.holdTimer = null
        pending.overIndex = stepIndex
        detachSongAssociation()
        setProgressionDragFrom(stepIndex)
        setProgressionDragOver(stepIndex)
        try {
          target.setPointerCapture(pointerId)
        } catch {
          /* pointer may already be released */
        }
      }, PROGRESSION_REORDER_HOLD_MS),
      active: false,
      overIndex: stepIndex,
    }
  }

  const handleProgressionReorderPointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const pending = progressionReorderRef.current
    if (pending == null || pending.pointerId !== event.pointerId) {
      return
    }

    if (!pending.active) {
      const dx = event.clientX - pending.startX
      const dy = event.clientY - pending.startY
      if (
        dx * dx + dy * dy >
        PROGRESSION_REORDER_CANCEL_PX * PROGRESSION_REORDER_CANCEL_PX
      ) {
        clearProgressionReorder()
      }
      return
    }

    event.preventDefault()
    const overIndex = stepIndexFromPoint(event.clientX, event.clientY)
    if (overIndex != null) {
      pending.overIndex = overIndex
      setProgressionDragOver(overIndex)
    }
  }

  const handleProgressionReorderPointerEnd = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const pending = progressionReorderRef.current
    if (pending == null || pending.pointerId !== event.pointerId) {
      return
    }

    const { fromIndex, active, overIndex } = pending

    if (active) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {
        /* already released */
      }
      // Swallow the click that follows a completed long-press drag.
      const target = event.currentTarget
      const blockClick = (clickEvent: Event) => {
        clickEvent.preventDefault()
        clickEvent.stopPropagation()
        target.removeEventListener('click', blockClick, true)
      }
      target.addEventListener('click', blockClick, true)
    }

    clearProgressionReorder()

    if (active && overIndex !== fromIndex) {
      player.pause()
      setBuiltProgression((cur) =>
        cur == null ? cur : swapProgressionSteps(cur, fromIndex, overIndex),
      )
      setSelectedProgressionStep((cur) => {
        if (cur == null) {
          return null
        }
        if (cur === fromIndex) {
          return overIndex
        }
        if (cur === overIndex) {
          return fromIndex
        }
        return cur
      })
    }
  }

  const toggleProgressionStepSelection = (
    stepIndex: number,
    chordId: ChordPresetId,
  ) => {
    if (player.playing) {
      player.play(stepIndex)
      return
    }
    if (selectedProgressionStep === stepIndex) {
      setSelectedProgressionStep(null)
      setSelection(null)
      return
    }
    setSelectedProgressionStep(stepIndex)
    setSelection({ kind: 'chord', id: chordId })
  }

  const handleDeleteStep = (stepIndex: number) => {
    player.pause()
    const deletedId = builtProgression?.[stepIndex]
    const willBeEmpty = builtProgression?.length === 1

    detachSongAssociation()
    setBuiltProgression((cur) =>
      cur == null ? cur : deleteProgressionStep(cur, stepIndex),
    )
    setSelectedProgressionStep((cur) => {
      if (cur == null) {
        return null
      }
      if (cur === stepIndex || willBeEmpty) {
        return null
      }
      if (cur > stepIndex) {
        return cur - 1
      }
      return cur
    })
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

  const songDisabledReason = (
    keyId: KeyId,
    songId: SongId,
  ): string | null => {
    if (!isSongResolvableInKey(keyId, songId)) {
      return 'Not available in this key'
    }
    if (!filterPlayableOnly) {
      return null
    }
    const missing = unknownChordsIn(chordsForSong(keyId, songId), knownChords)
    if (missing.length === 0) {
      return null
    }
    return `Requires ${missing.join(', ')}`
  }

  const renderSongSeedButton = (keyId: KeyId, songId: SongId) => {
    const song = SONGS[songId]
    const unresolved = !isSongResolvableInKey(keyId, songId)
    const blocked =
      filterPlayableOnly &&
      !unresolved &&
      !isSongPlayableInKey(keyId, songId, knownChords)
    const disabled = unresolved || blocked || findKeyMode || findChordMode
    const blockedReason = findKeyMode
      ? 'Unavailable while finding a key'
      : songDisabledReason(keyId, songId)
    const seedChords = unresolved
      ? null
      : chordsForSong(keyId, songId)
          .map((id) => CHORD_PRESETS[id].name)
          .join(' · ')
    const tooltipLabel =
      blockedReason ??
      (seedChords != null
        ? `${song.artist} — ${seedChords} in ${KEY_DEFS[keyId].name}`
        : `${song.title} · ${song.artist}`)

    return (
      <Tooltip key={songId} label={tooltipLabel}>
        <button
          type="button"
          className={[
            'diagram-chord-btn',
            'diagram-song-seeds__btn',
            blocked ? 'diagram-chord-btn--unplayable' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={disabled}
          aria-disabled={disabled}
          onClick={() => seedFromSong(songId)}
        >
          <span className="diagram-song-seeds__text">
            <span className="diagram-song-seeds__title">{song.title}</span>
            <span className="diagram-song-seeds__artist">{song.artist}</span>
          </span>
        </button>
      </Tooltip>
    )
  }

  const songSearch = (
    <input
      id="song-search"
      name="song-search"
      className="diagram-song-search"
      type="search"
      placeholder="Search songs"
      value={songQuery}
      aria-label="Search songs"
      autoComplete="off"
      onChange={(event) => setSongQuery(event.target.value)}
    />
  )

  const renderSongSeeds = (seedKey?: KeyId | null) => {
    const embedded = seedKey != null
    const availableIds = embedded
      ? SONG_IDS.filter((songId) => SONGS[songId].defaultKey === seedKey)
      : SONG_IDS

    if (availableIds.length === 0) {
      return null
    }

    const needle = songQuery.trim().toLowerCase()
    const songIds =
      needle.length === 0
        ? availableIds
        : availableIds.filter((songId) => {
            const song = SONGS[songId]
            return (
              song.title.toLowerCase().includes(needle) ||
              song.artist.toLowerCase().includes(needle)
            )
          })

    const songButtons = songIds.map((songId) =>
      renderSongSeedButton(seedKey ?? SONGS[songId].defaultKey, songId),
    )
    const songList =
      songIds.length === 0 ? (
        <p className="diagram-song-seeds__empty">No songs match.</p>
      ) : (
        <div className="diagram-chord-grid diagram-song-seeds">{songButtons}</div>
      )

    if (embedded) {
      return (
        <div
          className="diagram-chords-build__songs-row"
          role="group"
          aria-labelledby={`${baseId}-songs-label`}
        >
          <div className="diagram-chords-build__songs-header">
            <p className="diagram-label" id={`${baseId}-songs-label`}>
              Songs
            </p>
            {songSearch}
          </div>
          {songList}
        </div>
      )
    }

    return (
      <div
        className={[
          'diagram-field',
          findChordMode ? 'diagram-field--locked' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="group"
        aria-labelledby={`${baseId}-songs-label`}
        inert={findChordMode ? true : undefined}
      >
        <div className="diagram-field__label-row">
          <p className="diagram-label" id={`${baseId}-songs-label`}>
            Songs
          </p>
          {songSearch}
        </div>
        {songList}
      </div>
    )
  }

  const renderProgressionSeeds = (keyId: KeyId) => (
    <div
      className="diagram-chord-grid diagram-progression-grid diagram-progression-seeds"
      role="group"
      aria-label="Progression seeds"
    >
      {basicProgressionIdsForKey(keyId).map((progressionId) =>
        renderProgressionSeedButton(keyId, progressionId),
      )}
      {coloredProgressionIdsForKey(keyId).map((progressionId) =>
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
      titleSuffix?: string
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
    const baseTitle =
      options?.keyId != null
        ? `${CHORD_PRESETS[id].name}${options.roman != null ? ` · ${options.roman}` : (() => {
            const { label, kind } = romanLabelForChordInKey(options.keyId, id)
            return kind !== 'foreign' ? ` · ${label}` : ''
          })()} in ${KEY_DEFS[options.keyId].name}`
        : CHORD_PRESETS[id].name
    const title =
      options?.titleSuffix != null
        ? `${baseTitle} — ${options.titleSuffix}`
        : baseTitle

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

  const renderKeyButton = (keyId: KeyId) => {
    const def = KEY_DEFS[keyId]
    const selected = activeKey === keyId
    const isRelative = activeKey != null && relativeKeyId(activeKey) === keyId
    const inFindKeyFlow = selectedKey == null && findKeyMode
    const playableBlocked =
      filterPlayableOnly && !isKeyPlayable(keyId, knownChords)
    const findKeyScore =
      inFindKeyFlow && findKeyScoreById != null
        ? findKeyScoreById.get(keyId)
        : undefined
    const findKeyBrightness =
      findKeyScore != null ? findKeyMatchBrightness(findKeyScore) : null
    const hasFindKeyInput =
      findKeyChords.length > 0 || findChordPositions.length > 0
    const disabled =
      playableBlocked ||
      (inFindKeyFlow && (!hasFindKeyInput || findKeyBrightness == null))
    const keyTitle =
      inFindKeyFlow && !hasFindKeyInput
        ? 'Select chords or fretboard notes to find matching keys'
        : inFindKeyFlow && findKeyScore != null
          ? `${def.name} — ${findKeyScore}% match`
          : inFindKeyFlow && findKeyBrightness == null
            ? 'Does not match selected chords'
            : playableBlocked
              ? 'No progressions playable with your known chords'
              : isRelative
                ? `${def.name} · relative ${keyId.endsWith('m') ? 'minor' : 'major'}`
                : def.name
    return (
      <Tooltip key={keyId} label={keyTitle}>
        <button
          type="button"
          className={[
            'diagram-chord-btn',
            selected ? 'diagram-chord-btn--selected' : '',
            isRelative ? 'diagram-chord-btn--relative' : '',
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
  }

  const renderChordRootColumn = (root: RootName) => {
    const renderId = (id: ChordPresetId) =>
      renderChordCell(
        id,
        findKeyMode
          ? {
              selected: findKeyChords.includes(id),
              onSelect: () => toggleFindKeyChord(id),
            }
          : findChordMode
            ? {
                selected:
                  findChordPickedId === id ||
                  (findChordPickedId == null && findChordMatches.includes(id)),
                onSelect: () => pickFindChord(id),
              }
            : undefined,
      )

    return (
      <div
        key={root}
        className="diagram-chord-root-column"
        aria-label={`${root} chords`}
      >
        {primaryChordIdsForRoot(root).map(renderId)}
        <button
          type="button"
          className={[
            'diagram-chord-btn',
            'diagram-chord-root-column__variants-toggle',
            chordVariantsOpen
              ? 'diagram-chord-root-column__variants-toggle--open'
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-expanded={chordVariantsOpen}
          aria-label={
            chordVariantsOpen ? 'Hide chord variants' : 'Show chord variants'
          }
          onClick={() => setChordVariantsOpen((open) => !open)}
        >
          {chordVariantsOpen ? (
            <ChevronUp size={14} aria-hidden />
          ) : (
            <ChevronDown size={14} aria-hidden />
          )}
        </button>
        {chordVariantsOpen
          ? extraChordIdsForRoot(root).map(renderId)
          : null}
      </div>
    )
  }

  const renderScaleControl = (
    popupPlacement: string,
    tooltipPlacement: TooltipPlacement,
    closeOtherPickers: () => void,
  ) => {
    const scaleTooltip =
      scaleSelection != null
        ? `Scale: ${scaleSelectionLabel(scaleSelection)}`
        : 'Scale overlay'

    return (
      <div ref={scalePickerRef} className="app-page__divider-scale">
        <Tooltip
          placement={tooltipPlacement}
          label={scaleTooltip}
          disabled={scalePickerOpen}
        >
          <button
            type="button"
            className={[
              'app-page__divider-scale-toggle',
              scaleSelection != null ? 'app-page__divider-tool--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label={scaleTooltip}
            aria-expanded={scalePickerOpen}
            aria-haspopup="listbox"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => {
              closeOtherPickers()
              setScalePickerOpen((open) => !open)
            }}
          >
            <Share2 size={16} strokeWidth={2.5} aria-hidden />
          </button>
        </Tooltip>
        {scalePickerOpen ? (
          <div
            className={`app-page__divider-scale-menu ${popupPlacement}`}
            role="listbox"
            aria-label="Scale overlay"
          >
            {SCALE_MENU_OPTIONS.map((option) => {
              const selected = scaleSelection === option.value
              const optionTitle =
                option.value == null
                  ? 'No scale overlay'
                  : scaleModeTitle(option.label)
              return (
                <button
                  key={option.label}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  title={optionTitle}
                  className={[
                    'app-page__divider-scale-option',
                    selected ? 'app-page__divider-scale-option--selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => {
                    void setScaleSelection(option.value)
                    setScalePickerOpen(false)
                  }}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>
    )
  }

  const renderKnownFilterControl = (
    tooltipPlacement: TooltipPlacement,
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
    <main ref={mainRef} className={shellClassName} style={gridStyle}>
      <section
        className="app-page__options"
        aria-label="Practice"
      >
        <div className="app-page__inner">
          <div className="diagram-controls">
            <div className="diagram-field">
              <div className="diagram-field__label-row">
                <p className="diagram-label" id={`${baseId}-key-label`}>
                  {selectedKey != null ? 'Key' : 'Keys'}
                </p>
                <div className="diagram-field__label-action">
                  <Tooltip
                    label={
                      findKeyMode
                        ? 'Click chords or fretboard notes to find matching keys'
                        : 'Turn on to find a key from chords or fretboard notes'
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
                </div>
              </div>
              <div
                className={[
                  'diagram-select-stack',
                  isMobileViewport ? 'diagram-select-stack--keys' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="group"
                aria-labelledby={`${baseId}-key-label`}
              >
                {isMobileViewport ? (
                  <>
                    <div className="diagram-select-stack diagram-select-stack--key-group">
                      <div className="diagram-chord-grid diagram-key-select-grid">
                        {KEY_MAJOR_IDS.slice(0, KEY_MOBILE_GROUP_SIZE).map(
                          renderKeyButton,
                        )}
                      </div>
                      <div className="diagram-chord-grid diagram-key-select-grid">
                        {KEY_MINOR_IDS.slice(0, KEY_MOBILE_GROUP_SIZE).map(
                          renderKeyButton,
                        )}
                      </div>
                    </div>
                    <div className="diagram-select-stack diagram-select-stack--key-group">
                      <div className="diagram-chord-grid diagram-key-select-grid">
                        {KEY_MAJOR_IDS.slice(KEY_MOBILE_GROUP_SIZE).map(
                          renderKeyButton,
                        )}
                      </div>
                      <div className="diagram-chord-grid diagram-key-select-grid">
                        {KEY_MINOR_IDS.slice(KEY_MOBILE_GROUP_SIZE).map(
                          renderKeyButton,
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="diagram-chord-grid diagram-key-select-grid">
                      {KEY_MAJOR_IDS.map(renderKeyButton)}
                    </div>
                    <hr className="diagram-select-stack-divider" aria-hidden />
                    <div className="diagram-chord-grid diagram-key-select-grid">
                      {KEY_MINOR_IDS.map(renderKeyButton)}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="diagram-field">
              <div className="diagram-field__label-row">
                <p className="diagram-label" id={`${baseId}-chord-label`}>
                  Chords
                </p>
                <div className="diagram-field__label-action">
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
                        disabled={findChordMode}
                        onClick={toggleEditKnownChordsMode}
                      >
                        <Pencil size={12} aria-hidden />
                        edit
                      </button>
                    </Tooltip>
                  ) : null}
                  <Tooltip
                    label={
                      findChordMode
                        ? 'Click chords or fretboard notes to identify a chord'
                        : 'Turn on to identify a chord from chords or fretboard notes'
                    }
                  >
                    <button
                      type="button"
                      className={
                        findChordMode
                          ? 'diagram-find-key diagram-find-key--active'
                          : 'diagram-find-key'
                      }
                      aria-pressed={findChordMode}
                      aria-label="Find chord from fretboard notes"
                      onClick={toggleFindChordMode}
                    >
                      <Search size={12} aria-hidden />
                      find chord
                    </button>
                  </Tooltip>
                </div>
              </div>
              <div>
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
                                  selected: findChordMode
                                    ? findChordPickedId === slot.chordId ||
                                      (findChordPickedId == null &&
                                        findChordMatches.includes(slot.chordId))
                                    : undefined,
                                  onSelect: () =>
                                    findChordMode
                                      ? pickFindChord(slot.chordId!)
                                      : handleKeyRowChordClick(slot.chordId!),
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
                      <div className="diagram-chords-build__progression-heading">
                        <p
                          className="diagram-chords-build__sub-label"
                          id={`${baseId}-progression-label`}
                        >
                          {selectedSongId != null
                            ? 'Song'
                            : `Progression${hasBuiltProgression ? '' : 's'}`}
                        </p>
                        {selectedSongId != null ? (
                          <p className="diagram-chords-build__song-label">
                            {SONGS[selectedSongId].title}
                            <span className="diagram-chords-build__song-artist">
                              {SONGS[selectedSongId].artist}
                            </span>
                          </p>
                        ) : null}
                      </div>
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
                        <div className="diagram-chords-build__progression-steps-scroll">
                          {selectedSongId != null ? (
                            <div
                              className="diagram-strum-pattern"
                              style={
                                {
                                  '--progression-step-count':
                                    builtProgression.length,
                                } as React.CSSProperties
                              }
                              aria-label={`Strum pattern ${SONGS[selectedSongId].strumPattern.join(' ')}${
                                SONGS[selectedSongId].strumBarsPerChord > 1
                                  ? `, ${SONGS[selectedSongId].strumBarsPerChord} times per chord`
                                  : ', once per chord'
                              }`}
                            >
                              {builtProgression.map((chordId, stepIndex) => {
                                const song = SONGS[selectedSongId]
                                const bars = song.strumBarsPerChord
                                const strokes = Array.from(
                                  { length: bars },
                                  () => song.strumPattern,
                                ).flat()
                                return (
                                  <div
                                    key={`strum-chord-${stepIndex}-${chordId}`}
                                    className={[
                                      'diagram-strum-pattern__bar',
                                      selectedProgressionStep === stepIndex
                                        ? 'diagram-strum-pattern__bar--active'
                                        : '',
                                    ]
                                      .filter(Boolean)
                                      .join(' ')}
                                    aria-hidden
                                  >
                                    {strokes.map((stroke, strokeIndex) =>
                                      stroke === 'D' ? (
                                        <ArrowDown
                                          key={`${stepIndex}-d-${strokeIndex}`}
                                          className="diagram-strum-pattern__icon diagram-strum-pattern__icon--down"
                                          strokeWidth={2.5}
                                        />
                                      ) : (
                                        <ArrowUp
                                          key={`${stepIndex}-u-${strokeIndex}`}
                                          className="diagram-strum-pattern__icon diagram-strum-pattern__icon--up"
                                          strokeWidth={2.5}
                                        />
                                      ),
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          ) : null}
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
                                '--progression-step-count':
                                  builtProgression.length,
                              } as React.CSSProperties
                            }
                          >
                          {builtProgression.map((sourceChordId, stepIndex) => {
                            const chordId =
                              progressionDragFrom != null &&
                              progressionDragOver != null &&
                              progressionDragFrom !== progressionDragOver
                                ? stepIndex === progressionDragFrom
                                  ? builtProgression[progressionDragOver]!
                                  : stepIndex === progressionDragOver
                                    ? builtProgression[progressionDragFrom]!
                                    : sourceChordId
                                : sourceChordId
                            const triadId = triadIdForStep(activeKey, chordId)
                            const romanInfo = romanLabelForProgressionStep(
                              activeKey,
                              chordId,
                              triadId,
                            )
                            const songLocked = selectedSongId != null
                            const altOptions = songLocked
                              ? []
                              : progressionAltOptions(activeKey, chordId)
                            const stepSelected =
                              selectedProgressionStep === stepIndex
                            const isHeldSlot =
                              progressionDragFrom != null &&
                              (progressionDragOver === progressionDragFrom
                                ? stepIndex === progressionDragFrom
                                : stepIndex === progressionDragOver)
                            const isSwapOrigin =
                              progressionDragFrom != null &&
                              progressionDragOver != null &&
                              progressionDragFrom !== progressionDragOver &&
                              stepIndex === progressionDragFrom

                            return (
                              <div
                                key={`progression-step-${stepIndex}`}
                                data-progression-step-index={stepIndex}
                                className={[
                                  'diagram-chord-in-key__column',
                                  'diagram-progression-step',
                                  songLocked
                                    ? ''
                                    : 'diagram-chord-in-key__column--editable',
                                  stepSelected
                                    ? 'diagram-progression-step--selected'
                                    : '',
                                  isHeldSlot
                                    ? 'diagram-progression-step--dragging'
                                    : '',
                                  isSwapOrigin
                                    ? 'diagram-progression-step--swap-origin'
                                    : '',
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                              >
                                <div
                                  className={[
                                    'diagram-progression-step__chord-wrap',
                                    !songLocked
                                      ? 'diagram-progression-step__chord-wrap--reorderable'
                                      : '',
                                    progressionDragFrom != null
                                      ? 'diagram-progression-step__chord-wrap--reorder-active'
                                      : '',
                                  ]
                                    .filter(Boolean)
                                    .join(' ')}
                                  onPointerDown={
                                    findChordMode
                                      ? undefined
                                      : (event) =>
                                          handleProgressionReorderPointerDown(
                                            event,
                                            stepIndex,
                                          )
                                  }
                                  onPointerMove={
                                    handleProgressionReorderPointerMove
                                  }
                                  onPointerUp={
                                    handleProgressionReorderPointerEnd
                                  }
                                  onPointerCancel={
                                    handleProgressionReorderPointerEnd
                                  }
                                  onContextMenu={(event) => {
                                    event.preventDefault()
                                  }}
                                >
                                  {renderChordCell(chordId, {
                                    keyId: activeKey,
                                    roman:
                                      romanInfo.kind !== 'foreign'
                                        ? romanInfo.label
                                        : undefined,
                                    inProgression: true,
                                    selectable: true,
                                    selected: findChordMode
                                      ? findChordPickedId === chordId ||
                                        (findChordPickedId == null &&
                                          findChordMatches.includes(chordId))
                                      : stepSelected,
                                    onSelect: () =>
                                      findChordMode
                                        ? pickFindChord(chordId)
                                        : toggleProgressionStepSelection(
                                            stepIndex,
                                            chordId,
                                          ),
                                    titleSuffix: songLocked
                                      ? stepSelected
                                        ? 'click to deselect'
                                        : 'click to focus'
                                      : stepSelected
                                        ? 'click to deselect · add from chords above'
                                        : 'click to select · hold to reorder',
                                  })}
                                </div>
                                {!songLocked && stepSelected ? (
                                  <Tooltip label="Remove chord">
                                    <button
                                      type="button"
                                      className="diagram-chord-roman diagram-progression-step__delete"
                                      aria-label={`Remove step ${stepIndex + 1}`}
                                      onClick={() =>
                                        handleDeleteStep(stepIndex)
                                      }
                                    >
                                      <Trash2
                                        className="diagram-progression-step__delete-icon"
                                        strokeWidth={2.5}
                                        aria-hidden
                                      />
                                    </button>
                                  </Tooltip>
                                ) : (
                                  renderRoman(
                                    chordId,
                                    scaleRomanLabel(
                                      chordId,
                                      romanInfo.label,
                                    ),
                                    romanInfo.kind === 'foreign'
                                      ? 'diagram-chord-roman--foreign'
                                      : undefined,
                                    isChordInSelectedScale(chordId),
                                  )
                                )}
                                {!songLocked ? (
                                  <button
                                    type="button"
                                    className={[
                                      'diagram-chord-btn',
                                      'diagram-progression-step__alts-toggle',
                                      progressionAltsOpen
                                        ? 'diagram-progression-step__alts-toggle--open'
                                        : '',
                                    ]
                                      .filter(Boolean)
                                      .join(' ')}
                                    aria-expanded={progressionAltsOpen}
                                    aria-label={
                                      progressionAltsOpen
                                        ? 'Hide alternate chords'
                                        : 'Show alternate chords'
                                    }
                                    onClick={() =>
                                      setProgressionAltsOpen((open) => !open)
                                    }
                                  >
                                    {progressionAltsOpen ? (
                                      <ChevronUp size={14} aria-hidden />
                                    ) : (
                                      <ChevronDown size={14} aria-hidden />
                                    )}
                                  </button>
                                ) : null}
                                {!songLocked &&
                                progressionAltsOpen &&
                                altOptions.length > 0 ? (
                                  <div className="diagram-progression-step__alts">
                                    {altOptions.map(
                                      ({ chordId: altId, suggested }) =>
                                        renderChordCell(altId, {
                                          keyId: activeKey,
                                          compact: true,
                                          dimmed: !suggested,
                                          selected: altId === chordId,
                                          onSelect: () => {
                                            updateProgressionStep(
                                              stepIndex,
                                              altId,
                                            )
                                            setSelectedProgressionStep(stepIndex)
                                            setSelection({
                                              kind: 'chord',
                                              id: altId,
                                            })
                                          },
                                        }),
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            )
                          })}
                          </div>
                        </div>
                        <ProgressionPlayBar
                          playing={player.playing}
                          step={selectedProgressionStep ?? player.step}
                          length={builtProgression?.length ?? 0}
                          bpm={player.bpm}
                          muted={player.muted}
                          loop={player.loop}
                          metronome={player.metronome}
                          chordSound={chordSound}
                          barsPerChord={barsPerChord}
                          onPlay={() =>
                            player.play(selectedProgressionStep ?? player.step)
                          }
                          onPause={() => {
                            player.pause()
                            stopChordStrum()
                          }}
                          onToStart={player.toStart}
                          onBack={player.backOne}
                          onForward={player.forwardOne}
                          onBpm={player.setBpm}
                          onToggleMuted={() => {
                            const next = !player.muted
                            playbackMutedRef.current = next
                            if (next) {
                              stopChordStrum()
                            }
                            player.toggleMuted()
                          }}
                          onToggleLoop={player.toggleLoop}
                          onToggleMetronome={player.toggleMetronome}
                          onCycleSound={() => {
                            const next = nextChordSound(chordSoundRef.current)
                            chordSoundRef.current = next
                            setChordSound(next)
                            if (playbackMutedRef.current) {
                              return
                            }
                            const index = selectedProgressionStep ?? player.step
                            const chordId = builtProgressionRef.current?.[index]
                            if (
                              chordId != null &&
                              (player.playing || selectedProgressionStep != null)
                            ) {
                              playChordStrum(chordId, next)
                            }
                          }}
                        />
                      </>
                    ) : null}
                  </div>

                  {!hasBuiltProgression ? renderSongSeeds(activeKey) : null}
                </div>
              ) : isMobileViewport ? (
                <div
                  className="diagram-select-stack diagram-select-stack--chords"
                  role="group"
                  aria-labelledby={`${baseId}-chord-label`}
                >
                  <div className="diagram-chord-select-grid diagram-chord-select-grid--by-root">
                    {ROOT_NAMES.slice(0, 6).map(renderChordRootColumn)}
                  </div>
                  <div className="diagram-chord-select-grid diagram-chord-select-grid--by-root">
                    {ROOT_NAMES.slice(6).map(renderChordRootColumn)}
                  </div>
                </div>
              ) : (
                <div
                  className="diagram-chord-select-grid diagram-chord-select-grid--by-root"
                  role="group"
                  aria-labelledby={`${baseId}-chord-label`}
                >
                  {ROOT_NAMES.map(renderChordRootColumn)}
                </div>
              )}
              </div>
            </div>

            {activeKey == null ? renderSongSeeds() : null}
          </div>
        </div>
      </section>

      <DiagramDivider
        panel={panel}
        onCloseExtraPickers={() => setScalePickerOpen(false)}
        middleTools={({ closePickers, tooltipPlacement, popupPlacement }) => (
          <>
            {renderScaleControl(popupPlacement, tooltipPlacement, closePickers)}
            {renderKnownFilterControl(tooltipPlacement)}
          </>
        )}
      />

      {showDiagramPanel ? (
          <section
            className={[
              'app-page__diagram',
              hasBuiltProgression && !findChordMode && !findKeyMode
                ? 'app-page__diagram--progression'
                : '',
              diagramLayoutVertical
                ? 'app-page__diagram--layout-vertical'
                : 'app-page__diagram--layout-horizontal',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label="Fretboard preview"
          >
            <div className="app-page__diagram-wrap">
              {findKeyMode || findChordMode ? (
                <div className="app-page__diagram-stage app-page__diagram-stage--single">
                  <Fretboard
                    chord={exploreChordId}
                    title={exploreTitle}
                    markers={exploreMarkers}
                    hintPositions={findChordHints}
                    scalePattern={exploreScale}
                    fretCount={fretCount}
                    displayNotes={displayNotes}
                    orientation={fretboardOrientation}
                    fitContainer
                    onPositionClick={toggleFindBoardPosition}
                  />
                </div>
              ) : hasBuiltProgression && activeKey != null ? (
                <div
                  className="app-page__diagram-stage app-page__diagram-stage--progression"
                  data-arrangement={progressionArrangement}
                  style={
                    {
                      '--progression-step-count': progressionBoards.length,
                      ...(progressionBoardMaxHeightCss != null
                        ? {
                            '--progression-board-max-height':
                              progressionBoardMaxHeightCss,
                          }
                        : {}),
                    } as React.CSSProperties
                  }
                >
                  {progressionBoards.map(({ chordId, stepIndex }) => {
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
                    title={
                      boardSelection?.kind === 'chord' || activeKey != null
                        ? undefined
                        : 'Fretboard'
                    }
                    fitContainer
                  />
                </div>
              )}
            </div>
          </section>
      ) : null}
    </main>
  )
}
