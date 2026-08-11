import { useLayoutEffect, type RefObject } from 'react'

const FIT_MIN_EM = 0.62
const FIT_EPSILON_PX = 0.5

/**
 * Shrinks `labelRef` font-size only when its text overflows the available width.
 * Resets to full size whenever the text or container width changes.
 */
export function useFitText(
  containerRef: RefObject<HTMLElement | null>,
  labelRef: RefObject<HTMLElement | null>,
  text: string,
): void {
  useLayoutEffect(() => {
    const container = containerRef.current
    const label = labelRef.current
    if (container == null || label == null) {
      return
    }

    const fit = () => {
      label.style.fontSize = ''
      if (label.scrollWidth <= label.clientWidth + FIT_EPSILON_PX) {
        return
      }

      let low = FIT_MIN_EM
      let high = 1
      for (let i = 0; i < 10; i++) {
        const mid = (low + high) / 2
        label.style.fontSize = `${mid}em`
        if (label.scrollWidth <= label.clientWidth + FIT_EPSILON_PX) {
          low = mid
        } else {
          high = mid
        }
      }
      label.style.fontSize = `${low}em`
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(container)
    return () => {
      observer.disconnect()
      label.style.fontSize = ''
    }
  }, [containerRef, labelRef, text])
}
