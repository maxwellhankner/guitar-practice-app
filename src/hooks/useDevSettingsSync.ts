import { useEffect } from 'react'
import {
  fetchUserSettings,
  type UserSettings,
} from '../db/userSettingsRepository'

/** Dev only: re-fetch settings when another client (or editor) updates db.json. */
export function useDevSettingsSync(
  setSettings: (settings: UserSettings) => void,
) {
  useEffect(() => {
    if (!import.meta.env.DEV) {
      return
    }

    const source = new EventSource('/api/events')
    source.onmessage = () => {
      void fetchUserSettings().then(setSettings)
    }

    return () => {
      source.close()
    }
  }, [setSettings])
}
