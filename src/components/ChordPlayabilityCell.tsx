import { useEffect, useRef, useState } from 'react'
import type { ChordPresetId } from './Fretboard'

const PLAYABILITY_HOVER_DELAY_MS = 500

type ChordPlayabilityCellProps = {
  chordId: ChordPresetId
  /** Stored in the database — user can play this chord. */
  playable: boolean
  /** Whether the chord can be selected on the diagram right now. */
  selectable: boolean
  selected: boolean
  title?: string
  onSelect: () => void
  onPlayableChange: (playable: boolean) => void
  /** When false, no hover popup (e.g. KNOWN filtering is off). */
  showPlayabilityPopup: boolean
}

function LockIcon({ locked }: { locked: boolean }) {
  return (
    <svg
      className={
        locked
          ? 'diagram-chord-playability__lock diagram-chord-playability__lock--locked'
          : 'diagram-chord-playability__lock'
      }
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      {locked ? (
        <>
          <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
          <path
            d="M8 11V8a4 4 0 0 1 8 0v3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
          <path
            d="M8 11V8a4 4 0 0 1 7.5-2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  )
}

export function ChordPlayabilityCell({
  chordId,
  playable,
  selectable,
  selected,
  title,
  onSelect,
  onPlayableChange,
  showPlayabilityPopup,
}: ChordPlayabilityCellProps) {
  const popupId = `chord-play-${chordId}`
  const [popupVisible, setPopupVisible] = useState(false)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearHoverTimer = () => {
    if (hoverTimerRef.current != null) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }

  const handleMouseEnter = () => {
    clearHoverTimer()
    hoverTimerRef.current = setTimeout(() => {
      setPopupVisible(true)
      hoverTimerRef.current = null
    }, PLAYABILITY_HOVER_DELAY_MS)
  }

  const handleMouseLeave = () => {
    clearHoverTimer()
    setPopupVisible(false)
  }

  useEffect(() => () => clearHoverTimer(), [])

  useEffect(() => {
    if (!showPlayabilityPopup) {
      clearHoverTimer()
      setPopupVisible(false)
    }
  }, [showPlayabilityPopup])

  const chordButton = (
    <button
      type="button"
      className={[
        'diagram-chord-btn',
        selected ? 'diagram-chord-btn--selected' : '',
        showPlayabilityPopup && !playable ? 'diagram-chord-btn--unplayable' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-pressed={selected}
      disabled={!selectable}
      title={title}
      onClick={(e) => {
        onSelect()
        e.currentTarget.blur()
      }}
    >
      {chordId}
    </button>
  )

  if (!showPlayabilityPopup) {
    return <div className="diagram-chord-cell">{chordButton}</div>
  }

  return (
    <div
      className="diagram-chord-cell"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {chordButton}
      <div
        className={[
          'diagram-chord-playability',
          popupVisible ? 'diagram-chord-playability--visible' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="group"
        aria-label={`${chordId} playability`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <LockIcon locked={!playable} />
        <button
          type="button"
          role="switch"
          className="diagram-chord-playability__switch"
          aria-checked={playable}
          aria-labelledby={popupId}
          title={playable ? 'Can play — click to disable' : "Can't play — click to enable"}
          onClick={(e) => {
            onPlayableChange(!playable)
            e.currentTarget.blur()
          }}
        >
          <span className="diagram-chord-playability__switch-track">
            <span className="diagram-chord-playability__switch-thumb" />
          </span>
        </button>
        <span id={popupId} className="diagram-chord-playability__label">
          {playable ? 'Can play' : "Can't play"}
        </span>
      </div>
    </div>
  )
}
