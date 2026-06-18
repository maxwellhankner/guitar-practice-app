import { useEffect, useState } from 'react'
import type { DiagramLayout } from '../db/userSettingsRepository'

const MOBILE_MEDIA = '(max-width: 40rem), (max-height: 40rem)'
const LANDSCAPE_MEDIA = '(orientation: landscape)'

function readMobileDiagramLayout(): DiagramLayout | null {
  if (typeof window === 'undefined') {
    return null
  }
  if (!window.matchMedia(MOBILE_MEDIA).matches) {
    return null
  }
  return window.matchMedia(LANDSCAPE_MEDIA).matches ? 'vertical' : 'horizontal'
}

/** On mobile: stacked panels in portrait, side-by-side in landscape. */
export function useMobileDiagramLayout(
  savedLayout: DiagramLayout,
): DiagramLayout {
  const [mobileLayout, setMobileLayout] = useState<DiagramLayout | null>(
    readMobileDiagramLayout,
  )

  useEffect(() => {
    const mobileMql = window.matchMedia(MOBILE_MEDIA)
    const landscapeMql = window.matchMedia(LANDSCAPE_MEDIA)

    const sync = () => {
      if (!mobileMql.matches) {
        setMobileLayout(null)
        return
      }
      setMobileLayout(landscapeMql.matches ? 'vertical' : 'horizontal')
    }

    sync()
    mobileMql.addEventListener('change', sync)
    landscapeMql.addEventListener('change', sync)
    return () => {
      mobileMql.removeEventListener('change', sync)
      landscapeMql.removeEventListener('change', sync)
    }
  }, [])

  return mobileLayout ?? savedLayout
}
