import { useEffect, useRef, useState } from 'react'
import { Share2 } from 'lucide-react'
import type { ScaleSelection } from './Fretboard'
import { Tooltip, type TooltipPlacement } from './Tooltip'

const SCALE_MENU_OPTIONS: {
  value: ScaleSelection
  label: string
}[] = [
  { value: null, label: 'Off' },
  { value: 'pentatonic', label: 'Pentatonic' },
  { value: 'hexatonic', label: 'Hexatonic' },
  { value: 'full', label: 'Full Scale' },
]

type ScaleOverlayControlProps = {
  scaleSelection: ScaleSelection
  onScaleSelection: (value: ScaleSelection) => void
  /** Detected key name, used in the menu titles once a key exists. */
  keyName: string | null
  tooltipPlacement: TooltipPlacement
  popupPlacement: string
  onOpen: () => void
  closeSignal: number
}

export function ScaleOverlayControl({
  scaleSelection,
  onScaleSelection,
  keyName,
  tooltipPlacement,
  popupPlacement,
  onOpen,
  closeSignal,
}: ScaleOverlayControlProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const dismissRef = useRef(closeSignal)

  useEffect(() => {
    if (dismissRef.current === closeSignal) {
      return
    }
    dismissRef.current = closeSignal
    setOpen(false)
  }, [closeSignal])

  useEffect(() => {
    if (!open) {
      return
    }
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) {
        return
      }
      setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const selectedLabel =
    SCALE_MENU_OPTIONS.find((option) => option.value === scaleSelection)?.label ??
    'Off'
  const scalePhrase = (label: string) =>
    label === 'Full Scale' ? 'Full' : label
  const tooltip =
    scaleSelection == null
      ? 'Scale overlay'
      : keyName != null
        ? `${scalePhrase(selectedLabel)} scale in ${keyName}`
        : `Scale: ${selectedLabel}`

  return (
    <div ref={rootRef} className="app-page__divider-scale">
      <Tooltip placement={tooltipPlacement} label={tooltip} disabled={open}>
        <button
          type="button"
          className={[
            'app-page__divider-scale-toggle',
            scaleSelection != null ? 'app-page__divider-tool--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label={tooltip}
          aria-expanded={open}
          aria-haspopup="listbox"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => {
            onOpen()
            setOpen((current) => !current)
          }}
        >
          <Share2 size={16} strokeWidth={2.5} aria-hidden />
        </button>
      </Tooltip>
      {open ? (
        <div
          className={`app-page__divider-scale-menu ${popupPlacement}`}
          role="listbox"
          aria-label="Scale overlay"
        >
          {SCALE_MENU_OPTIONS.map((option) => {
            const selected = scaleSelection === option.value
            const optionTitle =
              option.value == null
                ? 'No scale overlay'
                : keyName != null
                  ? `${option.label === 'Full Scale' ? 'Full' : option.label} scale in ${keyName}`
                  : `${option.label} scale`
            return (
              <button
                key={option.label}
                type="button"
                role="option"
                aria-selected={selected}
                title={optionTitle}
                className={[
                  'app-page__divider-scale-option',
                  selected ? 'app-page__divider-scale-option--selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => {
                  onScaleSelection(option.value)
                  setOpen(false)
                }}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
