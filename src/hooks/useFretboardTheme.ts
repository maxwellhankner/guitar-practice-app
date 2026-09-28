import { useEffect } from 'react'
import {
  DEFAULT_FRETBOARD_COLOR_ID,
  type FretboardColorId,
} from '../theme/fretboardColors'

export function useFretboardTheme(fretboardColorId: FretboardColorId | undefined) {
  useEffect(() => {
    document.documentElement.dataset.fretboard =
      fretboardColorId ?? DEFAULT_FRETBOARD_COLOR_ID
  }, [fretboardColorId])
}
