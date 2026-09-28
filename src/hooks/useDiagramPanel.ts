import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { TooltipPlacement } from '../components/Tooltip'
import {
  PANEL_SPLIT_MAX,
  PANEL_SPLIT_MIN,
  clampSplitRatio,
} from '../db/userSettingsRepository'
import { useIsMobileViewport } from './useIsMobileViewport'
import { useMobileDiagramLayout } from './useMobileDiagramLayout'
import { useUserSettings } from './useUserSettings'

export function useDiagramPanel() {
  const settings = useUserSettings()
  const [liveSplitRatio, setLiveSplitRatio] = useState<number | null>(null)
  const mainRef = useRef<HTMLElement>(null)
  const isMobileViewport = useIsMobileViewport()
  const diagramLayoutVertical =
    useMobileDiagramLayout(settings.diagramLayout) === 'vertical'
  const showDiagramPanel = !settings.diagramHidden
  const fretboardPortrait = settings.fretboardOrientation === 'portrait'
  const savedPanelSplitRatio = diagramLayoutVertical
    ? settings.verticalSplitRatio
    : settings.horizontalSplitRatio
  const panelSplitRatio = liveSplitRatio ?? savedPanelSplitRatio
  const diagramShare = 1 - panelSplitRatio
  const gridSplitTemplate = settings.panelsSwapped
    ? `${diagramShare}fr auto ${panelSplitRatio}fr`
    : `${panelSplitRatio}fr auto ${diagramShare}fr`
  const usesVerticalSplitLayout =
    diagramLayoutVertical &&
    (showDiagramPanel || !isMobileViewport || settings.diagramHidden)
  const menuBarLayout = usesVerticalSplitLayout ? 'vertical' : 'horizontal'
  const dividerTooltipPlacement: TooltipPlacement = diagramLayoutVertical
    ? settings.panelsSwapped
      ? 'left'
      : 'right'
    : settings.panelsSwapped
      ? 'above'
      : 'below'
  const pickerPopupPlacement = diagramLayoutVertical
    ? settings.panelsSwapped
      ? 'app-page__divider-popup--left'
      : 'app-page__divider-popup--right'
    : settings.panelsSwapped
      ? 'app-page__divider-popup--above'
      : 'app-page__divider-popup--below'
  const menuBarTooltipPlacement: TooltipPlacement = settings.diagramHidden
    ? usesVerticalSplitLayout
      ? 'left'
      : 'above'
    : dividerTooltipPlacement
  const menuPickerPopupPlacement = settings.diagramHidden
    ? usesVerticalSplitLayout
      ? 'app-page__divider-popup--left'
      : 'app-page__divider-popup--above'
    : pickerPopupPlacement

  const shellClassName = [
    usesVerticalSplitLayout ? 'app-page app-page--split' : 'app-page',
    showDiagramPanel && settings.panelsSwapped ? 'app-page--panels-swapped' : '',
    settings.diagramHidden ? 'app-page--diagram-hidden' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const gridStyle = showDiagramPanel
    ? diagramLayoutVertical
      ? {
          gridTemplateColumns: gridSplitTemplate,
          gridTemplateRows: 'minmax(0, 1fr)',
        }
      : {
          gridTemplateRows: gridSplitTemplate,
          gridTemplateColumns: 'minmax(0, 1fr)',
        }
    : undefined

  const handleDividerPointerDown = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if ((event.target as HTMLElement).closest('button')) {
      return
    }
    event.preventDefault()
    const main = mainRef.current
    const divider = event.currentTarget.closest('.app-page__divider')
    if (main == null || !(divider instanceof HTMLElement)) {
      return
    }

    const rect = main.getBoundingClientRect()
    const vertical = diagramLayoutVertical
    let currentRatio = savedPanelSplitRatio

    divider.setPointerCapture(event.pointerId)

    const onPointerMove = (moveEvent: PointerEvent) => {
      const raw = vertical
        ? (moveEvent.clientX - rect.left) / rect.width
        : (moveEvent.clientY - rect.top) / rect.height
      const next = settings.panelsSwapped ? 1 - raw : raw
      currentRatio = clampSplitRatio(next)
      setLiveSplitRatio(currentRatio)
    }

    const onPointerUp = (upEvent: PointerEvent) => {
      if (vertical) {
        void settings.setVerticalSplitRatio(currentRatio)
      } else {
        void settings.setHorizontalSplitRatio(currentRatio)
      }
      setLiveSplitRatio(null)
      divider.releasePointerCapture(upEvent.pointerId)
      divider.removeEventListener('pointermove', onPointerMove)
      divider.removeEventListener('pointerup', onPointerUp)
      divider.removeEventListener('pointercancel', onPointerUp)
    }

    divider.addEventListener('pointermove', onPointerMove)
    divider.addEventListener('pointerup', onPointerUp)
    divider.addEventListener('pointercancel', onPointerUp)
  }

  return {
    ...settings,
    mainRef,
    isMobileViewport,
    diagramLayoutVertical,
    showDiagramPanel,
    fretboardPortrait,
    panelSplitRatio,
    usesVerticalSplitLayout,
    menuBarLayout,
    menuBarTooltipPlacement,
    menuPickerPopupPlacement,
    shellClassName,
    gridStyle,
    handleDividerPointerDown,
    splitAria: {
      'aria-valuenow': Math.round(panelSplitRatio * 100),
      'aria-valuemin': Math.round(PANEL_SPLIT_MIN * 100),
      'aria-valuemax': Math.round(PANEL_SPLIT_MAX * 100),
    },
  }
}

export type DiagramPanel = ReturnType<typeof useDiagramPanel>
