import { useEffect } from 'react'
import {
  DEFAULT_ACCENT_COLOR_ID,
  type AccentColorId,
} from '../theme/accentColors'

export function useAccentTheme(accentColorId: AccentColorId | undefined) {
  useEffect(() => {
    document.documentElement.dataset.accent = accentColorId ?? DEFAULT_ACCENT_COLOR_ID
  }, [accentColorId])
}
