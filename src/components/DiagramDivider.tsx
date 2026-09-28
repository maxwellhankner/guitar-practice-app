import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowLeftRight,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Columns2,
  Music,
  RotateCcwSquare,
  Rows2,
} from 'lucide-react'
import type { DiagramPanel } from '../hooks/useDiagramPanel'
import { FRET_COUNT_OPTIONS } from './Fretboard/viewport'
import { Tooltip, type TooltipPlacement } from './Tooltip'

type DiagramDividerProps = {
  panel: DiagramPanel
  /** Learn-only tools, placed after fret count and before note names. */
  middleTools?: (slots: {
    closePickers: () => void
    tooltipPlacement: TooltipPlacement
    popupPlacement: string
  }) => ReactNode
  onCloseExtraPickers?: () => void
}

export function DiagramDivider({
  panel,
  middleTools,
  onCloseExtraPickers,
}: DiagramDividerProps) {
  const [fretPickerOpen, setFretPickerOpen] = useState(false)
  const fretPickerRef = useRef<HTMLDivElement>(null)

  const closePickers = () => {
    setFretPickerOpen(false)
    onCloseExtraPickers?.()
  }

  useEffect(() => {
    if (!fretPickerOpen) {
      return
    }
    const onPointerDown = (event: PointerEvent) => {
      if (fretPickerRef.current?.contains(event.target as Node)) {
        return
      }
      setFretPickerOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFretPickerOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [fretPickerOpen])

  const {
    showDiagramPanel,
    diagramLayoutVertical,
    diagramLayout,
    fretboardPortrait,
    fretCount,
    displayNotes,
    panelsSwapped,
    menuBarLayout,
    menuBarTooltipPlacement,
    menuPickerPopupPlacement,
    setDiagramHidden,
    setDiagramLayout,
    setPanelsSwapped,
    setFretboardOrientation,
    setFretCount,
    setDisplayNotes,
    handleDividerPointerDown,
    splitAria,
  } = panel

  const diagramPanelChevronDirection = diagramLayoutVertical
    ? panelsSwapped
      ? 'left'
      : 'right'
    : panelsSwapped
      ? 'up'
      : 'down'
  const diagramPanelChevronOpposite = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  } as const
  const diagramPanelPositionLabel =
    diagramPanelChevronDirection === 'down'
      ? 'below'
      : diagramPanelChevronDirection === 'up'
        ? 'above'
        : diagramPanelChevronDirection === 'right'
          ? 'to the right'
          : 'to the left'

  const renderDiagramPanelChevron = (
    direction: keyof typeof diagramPanelChevronOpposite = diagramPanelChevronDirection,
  ) => {
    const iconProps = { size: 16, strokeWidth: 2.5, 'aria-hidden': true as const }
    switch (direction) {
      case 'up':
        return <ChevronUp {...iconProps} />
      case 'down':
        return <ChevronDown {...iconProps} />
      case 'left':
        return <ChevronLeft {...iconProps} />
      case 'right':
        return <ChevronRight {...iconProps} />
    }
  }

  return (
    <div
      className={[
        'app-page__divider',
        menuBarLayout === 'vertical'
          ? 'app-page__divider--vertical'
          : 'app-page__divider--horizontal',
        panel.diagramHidden ? 'app-page__divider--docked' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role={showDiagramPanel ? 'separator' : 'toolbar'}
      aria-label={showDiagramPanel ? 'Resize panels' : 'Diagram tools'}
      {...(showDiagramPanel
        ? {
            'aria-orientation': diagramLayoutVertical
              ? ('vertical' as const)
              : ('horizontal' as const),
            ...splitAria,
            onPointerDown: handleDividerPointerDown,
          }
        : {})}
    >
      {panel.diagramHidden ? (
        <Tooltip
          placement={menuBarTooltipPlacement}
          label={`Show guitar diagram ${diagramPanelPositionLabel}`}
        >
          <button
            type="button"
            className="app-page__divider-diagram-toggle"
            aria-label={`Show guitar diagram ${diagramPanelPositionLabel}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => void setDiagramHidden(false)}
          >
            {renderDiagramPanelChevron(
              diagramPanelChevronOpposite[diagramPanelChevronDirection],
            )}
          </button>
        </Tooltip>
      ) : (
        <Tooltip
          placement={menuBarTooltipPlacement}
          label={`Hide guitar diagram ${diagramPanelPositionLabel}`}
        >
          <button
            type="button"
            className="app-page__divider-diagram-toggle"
            aria-label={`Hide guitar diagram ${diagramPanelPositionLabel}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => {
              closePickers()
              void setDiagramHidden(true)
            }}
          >
            {renderDiagramPanelChevron()}
          </button>
        </Tooltip>
      )}
      {showDiagramPanel ? (
        <>
          <Tooltip
            placement={menuBarTooltipPlacement}
            label={
              diagramLayoutVertical
                ? 'Arrange diagrams in a row'
                : 'Stack diagrams vertically'
            }
          >
            <button
              type="button"
              className="app-page__divider-layout-toggle"
              aria-label={
                diagramLayoutVertical
                  ? 'Arrange diagrams in a row'
                  : 'Stack diagrams vertically'
              }
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() =>
                void setDiagramLayout(
                  diagramLayout === 'horizontal' ? 'vertical' : 'horizontal',
                )
              }
            >
              {diagramLayoutVertical ? (
                <Rows2 size={16} strokeWidth={2.5} aria-hidden />
              ) : (
                <Columns2 size={16} strokeWidth={2.5} aria-hidden />
              )}
            </button>
          </Tooltip>
          <Tooltip
            placement={menuBarTooltipPlacement}
            label={
              diagramLayoutVertical
                ? 'Swap left and right panels'
                : 'Swap top and bottom panels'
            }
          >
            <button
              type="button"
              className="app-page__divider-swap-toggle"
              aria-label={
                diagramLayoutVertical
                  ? 'Swap left and right panels'
                  : 'Swap top and bottom panels'
              }
              aria-pressed={panelsSwapped}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => void setPanelsSwapped(!panelsSwapped)}
            >
              {diagramLayoutVertical ? (
                <ArrowLeftRight size={16} strokeWidth={2.5} aria-hidden />
              ) : (
                <ArrowUpDown size={16} strokeWidth={2.5} aria-hidden />
              )}
            </button>
          </Tooltip>
          <Tooltip
            placement={menuBarTooltipPlacement}
            label={
              fretboardPortrait
                ? 'Standard fretboard orientation'
                : 'Rotate fretboard vertically'
            }
          >
            <button
              type="button"
              className="app-page__divider-orientation-toggle"
              aria-label={
                fretboardPortrait
                  ? 'Standard fretboard orientation'
                  : 'Rotate fretboard vertically'
              }
              aria-pressed={fretboardPortrait}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() =>
                void setFretboardOrientation(
                  fretboardPortrait ? 'landscape' : 'portrait',
                )
              }
            >
              <RotateCcwSquare size={16} strokeWidth={2.5} aria-hidden />
            </button>
          </Tooltip>
          <div ref={fretPickerRef} className="app-page__divider-frets">
            <Tooltip
              placement={menuBarTooltipPlacement}
              label="Fret count"
              disabled={fretPickerOpen}
            >
              <button
                type="button"
                className="app-page__divider-frets-toggle"
                aria-label={`Fret count: ${fretCount}`}
                aria-expanded={fretPickerOpen}
                aria-haspopup="listbox"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => {
                  onCloseExtraPickers?.()
                  setFretPickerOpen((open) => !open)
                }}
              >
                <span className="app-page__divider-frets-value" aria-hidden>
                  {fretCount}
                </span>
              </button>
            </Tooltip>
            {fretPickerOpen ? (
              <div
                className={`app-page__divider-frets-menu ${menuPickerPopupPlacement}`}
                role="listbox"
                aria-label="Fret count"
              >
                {FRET_COUNT_OPTIONS.map((n) => {
                  const selected = fretCount === n
                  return (
                    <button
                      key={n}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={[
                        'app-page__divider-frets-option',
                        selected ? 'app-page__divider-frets-option--selected' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => {
                        void setFretCount(n)
                        setFretPickerOpen(false)
                      }}
                    >
                      {n}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
          {middleTools?.({
            closePickers: () => {
              setFretPickerOpen(false)
            },
            tooltipPlacement: menuBarTooltipPlacement,
            popupPlacement: menuPickerPopupPlacement,
          })}
          <Tooltip
            placement={menuBarTooltipPlacement}
            label={displayNotes ? 'Hide note names' : 'Show note names'}
          >
            <button
              type="button"
              className={[
                'app-page__divider-notes-toggle',
                displayNotes ? 'app-page__divider-tool--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={displayNotes ? 'Hide note names' : 'Show note names'}
              aria-pressed={displayNotes}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => void setDisplayNotes(!displayNotes)}
            >
              <Music size={16} strokeWidth={2.5} aria-hidden />
            </button>
          </Tooltip>
        </>
      ) : null}
    </div>
  )
}
