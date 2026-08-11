import { useRef, type Ref } from 'react'
import type { ChordPresetId } from './Fretboard'
import { useFitText } from '../hooks/useFitText'
import { Tooltip } from './Tooltip'

type ChordPlayabilityCellProps = {
  chordId: ChordPresetId
  known: boolean
  selected: boolean
  title?: string
  onSelect: () => void
  onKnownToggle: () => void
  /** Grey unknown chords when known chords mode is on. */
  knownChordsMode: boolean
  /** Click toggles known/unknown instead of selecting. */
  editKnownMode: boolean
  /** Lower emphasis (e.g. non-suggested progression alts) while still selectable. */
  dimmed?: boolean
  /** Smaller styling for color-chord alternatives under diatonic columns. */
  compact?: boolean
  /** Override button text (defaults to `chordId`). */
  label?: string
  /** Progression triad — yellow border marking a step shown in the diagram row. */
  inProgression?: boolean
  /** When false, shows the chord label without selection or click handling. */
  selectable?: boolean
}

export function ChordPlayabilityCell({
  chordId,
  known,
  selected,
  title,
  onSelect,
  onKnownToggle,
  knownChordsMode,
  editKnownMode,
  dimmed = false,
  compact = false,
  label,
  inProgression = false,
  selectable = true,
}: ChordPlayabilityCellProps) {
  const showAsUnknown = knownChordsMode && !known
  const canInteract = editKnownMode || selectable
  const rootRef = useRef<HTMLElement | null>(null)
  const labelRef = useRef<HTMLSpanElement | null>(null)

  const chordClasses = [
    'diagram-chord-btn',
    compact ? 'diagram-chord-btn--compact' : '',
    !editKnownMode && selectable && selected && (!knownChordsMode || known)
      ? 'diagram-chord-btn--selected'
      : '',
    !editKnownMode && selectable && selected && knownChordsMode && !known
      ? 'diagram-chord-btn--selected-unplayable'
      : '',
    !editKnownMode && selectable && dimmed ? 'diagram-chord-btn--dim' : '',
    canInteract && showAsUnknown ? 'diagram-chord-btn--unplayable' : '',
    !editKnownMode && inProgression ? 'diagram-chord-btn--progression' : '',
    !canInteract ? 'diagram-chord-btn--display' : '',
    editKnownMode ? 'diagram-chord-btn--edit-known' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const chordContent = label ?? chordId
  useFitText(rootRef, labelRef, chordContent)

  const chordLabel = (
    <span ref={labelRef} className="diagram-chord-btn__label">
      {chordContent}
    </span>
  )

  const chordButton = canInteract ? (
    <button
      ref={rootRef as Ref<HTMLButtonElement>}
      type="button"
      className={chordClasses}
      aria-pressed={!editKnownMode && selectable ? selected : undefined}
      aria-label={
        editKnownMode
          ? `${chordId} — ${known ? 'known, click to mark unknown' : 'not known, click to mark known'}`
          : undefined
      }
      onClick={(e) => {
        if (editKnownMode) {
          onKnownToggle()
        } else {
          onSelect()
        }
        e.currentTarget.blur()
      }}
    >
      {chordLabel}
    </button>
  ) : (
    <div ref={rootRef as Ref<HTMLDivElement>} className={chordClasses}>
      {chordLabel}
    </div>
  )

  const chordControl =
    title != null ? (
      <Tooltip label={title}>{chordButton}</Tooltip>
    ) : (
      chordButton
    )

  return <div className="diagram-chord-cell">{chordControl}</div>
}
