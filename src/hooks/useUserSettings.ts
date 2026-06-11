import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChordPresetId, ScaleSelection } from '../components/Fretboard'
import {
  fetchUserSettings,
  setChordDisabled,
  setDisplayNotes,
  setFilterPlayableOnly,
  setFretCount,
  setScaleSelection,
  type UserSettings,
} from '../db/userSettingsRepository'

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

  return {
    ready: settings != null,
    settings,
    disabledChords,
    filterPlayableOnly: settings?.filterPlayableOnly ?? false,
    displayNotes: settings?.displayNotes ?? false,
    fretCount: settings?.fretCount ?? 6,
    scaleSelection: settings?.scaleSelection ?? null,
    setChordPlayable,
    setFilterPlayableOnly: setFilterPlayableOnlyState,
    setDisplayNotes: setDisplayNotesState,
    setFretCount: setFretCountState,
    setScaleSelection: setScaleSelectionState,
  }
}
