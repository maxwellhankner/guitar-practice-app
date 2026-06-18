import { useEffect, useState } from 'react'

export const MOBILE_VIEWPORT_MEDIA = '(max-width: 40rem), (max-height: 40rem)'

export function useIsMobileViewport(): boolean {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia(MOBILE_VIEWPORT_MEDIA).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_VIEWPORT_MEDIA)
    const sync = () => setIsMobile(mql.matches)
    sync()
    mql.addEventListener('change', sync)
    return () => mql.removeEventListener('change', sync)
  }, [])

  return isMobile
}
