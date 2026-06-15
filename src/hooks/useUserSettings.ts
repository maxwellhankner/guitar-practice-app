import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChordPresetId, ScaleSelection } from '../components/Fretboard'
import {
  DEFAULT_HORIZONTAL_SPLIT,
  DEFAULT_VERTICAL_SPLIT,
  PANEL_SPLIT_MAX,
  PANEL_SPLIT_MIN,
  fetchUserSettings,
  setChordDisabled,
  setDiagramLayout,
  setDisplayNotes,
  setFilterPlayableOnly,
  setFretCount,
  setHorizontalSplitRatio,
  setScaleSelection,
  setVerticalSplitRatio,
  setFretboardOrientation,
  setPanelsSwapped,
  type DiagramLayout,
  type FretboardOrientation,
  type UserSettings,
} from '../db/userSettingsRepository'

function clampSplitRatio(value: number): number {
  return Math.min(PANEL_SPLIT_MAX, Math.max(PANEL_SPLIT_MIN, value))
}

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

  const disabledChords = useMemo(
    () => new Set(settings?.disabledChords ?? []),
    [settings?.disabledChords],
  )

  const setChordPlayable = useCallback(
    async (chordId: ChordPresetId, playable: boolean) => {
      const next = await setChordDisabled(chordId, !playable)
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

  return {
    ready: settings != null,
    settings,
    disabledChords,
    filterPlayableOnly: settings?.filterPlayableOnly ?? false,
    displayNotes: settings?.displayNotes ?? false,
    fretCount: settings?.fretCount ?? 6,
    scaleSelection: settings?.scaleSelection ?? null,
    diagramLayout: settings?.diagramLayout ?? 'horizontal',
    horizontalSplitRatio: settings?.horizontalSplitRatio ?? DEFAULT_HORIZONTAL_SPLIT,
    verticalSplitRatio: settings?.verticalSplitRatio ?? DEFAULT_VERTICAL_SPLIT,
    fretboardOrientation: settings?.fretboardOrientation ?? 'landscape',
    panelsSwapped: settings?.panelsSwapped ?? false,
    setChordPlayable,
    setFilterPlayableOnly: setFilterPlayableOnlyState,
    setDisplayNotes: setDisplayNotesState,
    setFretCount: setFretCountState,
    setScaleSelection: setScaleSelectionState,
    setDiagramLayout: setDiagramLayoutState,
    setHorizontalSplitRatio: setHorizontalSplitRatioState,
    setVerticalSplitRatio: setVerticalSplitRatioState,
    setFretboardOrientation: setFretboardOrientationState,
    setPanelsSwapped: setPanelsSwappedState,
  }
}
