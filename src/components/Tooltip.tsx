import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
} from 'react'
import { createPortal } from 'react-dom'

const VIEWPORT_PAD = 8
const TOOLTIP_GAP = 6
export const TOOLTIP_SHOW_DELAY_MS = 1000

export type TooltipPlacement = 'below' | 'above' | 'left' | 'right'

type TooltipChildProps = {
  onClick?: (event: MouseEvent<HTMLElement>) => void
  onPointerDown?: (event: PointerEvent<HTMLElement>) => void
  onPointerEnter?: (event: PointerEvent<HTMLElement>) => void
  onPointerMove?: (event: PointerEvent<HTMLElement>) => void
  onPointerLeave?: (event: PointerEvent<HTMLElement>) => void
  onPointerCancel?: (event: PointerEvent<HTMLElement>) => void
  onFocus?: (event: FocusEvent<HTMLElement>) => void
  onBlur?: (event: FocusEvent<HTMLElement>) => void
  'aria-describedby'?: string
}

type TooltipProps = {
  label: string
  placement?: TooltipPlacement
  children: ReactElement<TooltipChildProps>
  disabled?: boolean
}

const lastPointer = { x: 0, y: 0 }
let pointerTrackingInstalled = false

function trackPointer(clientX: number, clientY: number) {
  lastPointer.x = clientX
  lastPointer.y = clientY
}

function ensurePointerTracking() {
  if (pointerTrackingInstalled) {
    return
  }
  pointerTrackingInstalled = true
  window.addEventListener(
    'pointermove',
    (event) => {
      trackPointer(event.clientX, event.clientY)
    },
    { passive: true },
  )
}

function isPointerOverElement(element: HTMLElement): boolean {
  const under = document.elementFromPoint(lastPointer.x, lastPointer.y)
  return under != null && element.contains(under)
}

function shouldShowForAnchor(anchor: HTMLElement | null): boolean {
  if (anchor == null || !document.hasFocus()) {
    return false
  }
  if (anchor.matches(':focus-visible')) {
    return true
  }
  return anchor.matches(':hover') && isPointerOverElement(anchor)
}

function positionTooltip(
  anchorRect: DOMRect,
  tipRect: DOMRect,
  placement: TooltipPlacement,
) {
  let x = 0
  let y = 0

  switch (placement) {
    case 'below':
      x = anchorRect.left + anchorRect.width / 2 - tipRect.width / 2
      y = anchorRect.bottom + TOOLTIP_GAP
      break
    case 'above':
      x = anchorRect.left + anchorRect.width / 2 - tipRect.width / 2
      y = anchorRect.top - tipRect.height - TOOLTIP_GAP
      break
    case 'right':
      x = anchorRect.right + TOOLTIP_GAP
      y = anchorRect.top + anchorRect.height / 2 - tipRect.height / 2
      break
    case 'left':
      x = anchorRect.left - tipRect.width - TOOLTIP_GAP
      y = anchorRect.top + anchorRect.height / 2 - tipRect.height / 2
      break
  }

  x = Math.min(x, window.innerWidth - tipRect.width - VIEWPORT_PAD)
  x = Math.max(x, VIEWPORT_PAD)
  y = Math.min(y, window.innerHeight - tipRect.height - VIEWPORT_PAD)
  y = Math.max(y, VIEWPORT_PAD)

  return { x, y }
}

export function Tooltip({
  label,
  placement = 'below',
  children,
  disabled = false,
}: TooltipProps) {
  ensurePointerTracking()

  const tooltipId = useId()
  const anchorRef = useRef<HTMLElement | null>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const showDelayRef = useRef<number | null>(null)
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [ready, setReady] = useState(false)

  const hide = () => {
    if (showDelayRef.current != null) {
      window.clearTimeout(showDelayRef.current)
      showDelayRef.current = null
    }
    setVisible(false)
    setReady(false)
  }

  const dismiss = (clearFocus = false) => {
    hide()
    if (clearFocus && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  useEffect(() => {
    const onWindowBlur = () => {
      dismiss(true)
    }

    const onWindowFocus = () => {
      dismiss(true)
    }

    const onPageHide = () => {
      dismiss(true)
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        dismiss(true)
      }
    }

    const onDocumentMouseOut = (event: globalThis.MouseEvent) => {
      if (event.relatedTarget == null) {
        dismiss()
      }
    }

    window.addEventListener('blur', onWindowBlur)
    window.addEventListener('focus', onWindowFocus)
    window.addEventListener('pagehide', onPageHide)
    document.addEventListener('visibilitychange', onVisibilityChange)
    document.addEventListener('mouseout', onDocumentMouseOut)

    return () => {
      window.removeEventListener('blur', onWindowBlur)
      window.removeEventListener('focus', onWindowFocus)
      window.removeEventListener('pagehide', onPageHide)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      document.removeEventListener('mouseout', onDocumentMouseOut)
      dismiss()
    }
  }, [])

  const show = () => {
    if (disabled) {
      return
    }
    if (showDelayRef.current != null) {
      window.clearTimeout(showDelayRef.current)
    }
    showDelayRef.current = window.setTimeout(() => {
      showDelayRef.current = null
      if (!shouldShowForAnchor(anchorRef.current)) {
        return
      }
      setVisible(true)
    }, TOOLTIP_SHOW_DELAY_MS)
  }

  useLayoutEffect(() => {
    if (!visible) {
      return
    }
    const anchor = anchorRef.current
    const tip = tipRef.current
    if (anchor == null || tip == null) {
      return
    }

    if (!shouldShowForAnchor(anchor)) {
      hide()
      return
    }

    const anchorRect = anchor.getBoundingClientRect()
    const tipRect = tip.getBoundingClientRect()
    setCoords(positionTooltip(anchorRect, tipRect, placement))
    setReady(true)
  }, [visible, label, placement])

  if (!isValidElement(children)) {
    return children
  }

  const child = children

  return (
    <>
      {cloneElement(child, {
        onPointerDown: (event: PointerEvent<HTMLElement>) => {
          child.props.onPointerDown?.(event)
          hide()
        },
        onClick: (event: MouseEvent<HTMLElement>) => {
          child.props.onClick?.(event)
          hide()
        },
        onPointerEnter: (event: PointerEvent<HTMLElement>) => {
          anchorRef.current = event.currentTarget
          trackPointer(event.clientX, event.clientY)
          child.props.onPointerEnter?.(event)
          show()
        },
        onPointerMove: (event: PointerEvent<HTMLElement>) => {
          trackPointer(event.clientX, event.clientY)
          child.props.onPointerMove?.(event)
        },
        onPointerLeave: (event: PointerEvent<HTMLElement>) => {
          child.props.onPointerLeave?.(event)
          hide()
        },
        onPointerCancel: (event: PointerEvent<HTMLElement>) => {
          child.props.onPointerCancel?.(event)
          hide()
        },
        onFocus: (event: FocusEvent<HTMLElement>) => {
          anchorRef.current = event.currentTarget
          child.props.onFocus?.(event)
          if (event.target.matches(':focus-visible')) {
            show()
          }
        },
        onBlur: (event: FocusEvent<HTMLElement>) => {
          child.props.onBlur?.(event)
          hide()
        },
        'aria-describedby': visible ? tooltipId : undefined,
      })}
      {visible
        ? createPortal(
            <div
              ref={tipRef}
              id={tooltipId}
              role="tooltip"
              className="app-tooltip"
              style={{
                left: coords.x,
                top: coords.y,
                visibility: ready ? 'visible' : 'hidden',
              }}
            >
              {label}
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
