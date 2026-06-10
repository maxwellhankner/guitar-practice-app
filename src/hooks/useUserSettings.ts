import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChordPresetId } from '../components/Fretboard'
import {
  fetchUserSettings,
  setChordDisabled,
  setFilterPlayableOnly,
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

  return {
    ready: settings != null,
    settings,
    disabledChords,
    filterPlayableOnly: settings?.filterPlayableOnly ?? true,
    setChordPlayable,
    setFilterPlayableOnly: setFilterPlayableOnlyState,
  }
}
