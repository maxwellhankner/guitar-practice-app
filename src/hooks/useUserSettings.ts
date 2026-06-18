import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChordPresetId, KeyId, ScaleSelection } from '../components/Fretboard'
import {
  DEFAULT_HORIZONTAL_SPLIT,
  DEFAULT_VERTICAL_SPLIT,
  clampSplitRatio,
  fetchUserSettings,
  setAccentColorId,
  setChordKnown,
  setDiagramLayout,
  setDisplayNotes,
  setFilterPlayableOnly,
  setFretCount,
  setHorizontalSplitRatio,
  setScaleSelection,
  setVerticalSplitRatio,
  setFretboardOrientation,
  setPanelsSwapped,
  setDiagramHidden,
  setPracticeSelection,
  type AccentColorId,
  type DiagramLayout,
  type FretboardOrientation,
  type UserSettings,
} from '../db/userSettingsRepository'
import { DEFAULT_ACCENT_COLOR_ID } from '../theme/accentColors'
import { useAccentTheme } from './useAccentTheme'
import { useDevSettingsSync } from './useDevSettingsSync'

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchUserSettings().then((loaded) => {
      if (!cancelled) {
        setSettings(loaded)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  useDevSettingsSync(setSettings)

  const knownChords = useMemo(
    () => new Set(settings?.knownChords ?? []),
    [settings?.knownChords],
  )

  const setChordKnownState = useCallback(
    async (chordId: ChordPresetId, known: boolean) => {
      const next = await setChordKnown(chordId, known)
      setSettings(next)
    },
    [],
  )

  const setFilterPlayableOnlyState = useCallback(async (value: boolean) => {
    const next = await setFilterPlayableOnly(value)
    setSettings(next)
  }, [])

  const setDisplayNotesState = useCallback(async (value: boolean) => {
    const next = await setDisplayNotes(value)
    setSettings(next)
  }, [])

  const setFretCountState = useCallback(async (value: number) => {
    const next = await setFretCount(value)
    setSettings(next)
  }, [])

  const setScaleSelectionState = useCallback(async (value: ScaleSelection) => {
    const next = await setScaleSelection(value)
    setSettings(next)
  }, [])

  const setDiagramLayoutState = useCallback(async (value: DiagramLayout) => {
    setSettings((prev) => (prev != null ? { ...prev, diagramLayout: value } : prev))
    const next = await setDiagramLayout(value)
    setSettings(next)
  }, [])

  const setHorizontalSplitRatioState = useCallback(async (value: number) => {
    const clamped = clampSplitRatio(value)
    setSettings((prev) =>
      prev != null ? { ...prev, horizontalSplitRatio: clamped } : prev,
    )
    const next = await setHorizontalSplitRatio(clamped)
    setSettings(next)
  }, [])

  const setVerticalSplitRatioState = useCallback(async (value: number) => {
    const clamped = clampSplitRatio(value)
    setSettings((prev) =>
      prev != null ? { ...prev, verticalSplitRatio: clamped } : prev,
    )
    const next = await setVerticalSplitRatio(clamped)
    setSettings(next)
  }, [])

  const setFretboardOrientationState = useCallback(
    async (value: FretboardOrientation) => {
      setSettings((prev) =>
        prev != null ? { ...prev, fretboardOrientation: value } : prev,
      )
      const next = await setFretboardOrientation(value)
      setSettings(next)
    },
    [],
  )

  const setPanelsSwappedState = useCallback(async (value: boolean) => {
    setSettings((prev) =>
      prev != null ? { ...prev, panelsSwapped: value } : prev,
    )
    const next = await setPanelsSwapped(value)
    setSettings(next)
  }, [])

  const setDiagramHiddenState = useCallback(async (value: boolean) => {
    setSettings((prev) =>
      prev != null ? { ...prev, diagramHidden: value } : prev,
    )
    const next = await setDiagramHidden(value)
    setSettings(next)
  }, [])

  const setAccentColorIdState = useCallback(async (value: AccentColorId) => {
    setSettings((prev) =>
      prev != null ? { ...prev, accentColorId: value } : prev,
    )
    const next = await setAccentColorId(value)
    setSettings(next)
  }, [])

  const setPracticeSelectionState = useCallback(
    async (partial: {
      selectedKey?: KeyId | null
      selectedChord?: ChordPresetId | null
      builtProgression?: ChordPresetId[] | null
      scaleSelection?: ScaleSelection
    }) => {
      setSettings((prev) => (prev != null ? { ...prev, ...partial } : prev))
      const next = await setPracticeSelection(partial)
      setSettings(next)
    },
    [],
  )

  useAccentTheme(settings?.accentColorId)

  return {
    ready: settings != null,
    settings,
    knownChords,
    filterPlayableOnly: settings?.filterPlayableOnly ?? false,
    displayNotes: settings?.displayNotes ?? false,
    fretCount: settings?.fretCount ?? 6,
    scaleSelection: settings?.scaleSelection ?? null,
    diagramLayout: settings?.diagramLayout ?? 'horizontal',
    horizontalSplitRatio: settings?.horizontalSplitRatio ?? DEFAULT_HORIZONTAL_SPLIT,
    verticalSplitRatio: settings?.verticalSplitRatio ?? DEFAULT_VERTICAL_SPLIT,
    fretboardOrientation: settings?.fretboardOrientation ?? 'landscape',
    panelsSwapped: settings?.panelsSwapped ?? false,
    diagramHidden: settings?.diagramHidden ?? false,
    accentColorId: settings?.accentColorId ?? DEFAULT_ACCENT_COLOR_ID,
    selectedKey: settings?.selectedKey ?? null,
    selectedChord: settings?.selectedChord ?? null,
    builtProgression: settings?.builtProgression ?? null,
    setChordKnown: setChordKnownState,
    setFilterPlayableOnly: setFilterPlayableOnlyState,
    setDisplayNotes: setDisplayNotesState,
    setFretCount: setFretCountState,
    setScaleSelection: setScaleSelectionState,
    setDiagramLayout: setDiagramLayoutState,
    setHorizontalSplitRatio: setHorizontalSplitRatioState,
    setVerticalSplitRatio: setVerticalSplitRatioState,
    setFretboardOrientation: setFretboardOrientationState,
    setPanelsSwapped: setPanelsSwappedState,
    setDiagramHidden: setDiagramHiddenState,
    setAccentColorId: setAccentColorIdState,
    setPracticeSelection: setPracticeSelectionState,
  }
}
