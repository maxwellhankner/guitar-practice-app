import { useEffect, useId, useState, type ReactNode } from 'react'
import {
  Metronome,
  Pause,
  Play,
  Repeat,
  SkipBack,
  StepBack,
  StepForward,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { Tooltip } from './Tooltip'
import { CHORD_SOUND_LABELS, type ChordSoundId } from '../audio/chordStrum'
import {
  PLAYBACK_BPM_MAX,
  PLAYBACK_BPM_MIN,
} from '../hooks/useProgressionPlayer'

type ProgressionPlayBarProps = {
  playing: boolean
  step: number
  length: number
  bpm: number
  muted: boolean
  loop: boolean
  metronome: boolean
  chordSound: ChordSoundId
  barsPerChord: number
  onPlay: () => void
  onPause: () => void
  onToStart: () => void
  onBack: () => void
  onForward: () => void
  onBpm: (bpm: number) => void
  onToggleMuted: () => void
  onToggleLoop: () => void
  onToggleMetronome: () => void
  onCycleSound: () => void
}

function TransportButton({
  label,
  disabled,
  pressed,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  pressed?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Tooltip label={label}>
      <button
        type="button"
        className={[
          'diagram-chord-btn',
          'diagram-play__btn',
          pressed ? 'diagram-play__btn--on' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={label}
        aria-pressed={pressed}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    </Tooltip>
  )
}

export function ProgressionPlayBar({
  playing,
  step,
  length,
  bpm,
  muted,
  loop,
  metronome,
  chordSound,
  barsPerChord,
  onPlay,
  onPause,
  onToStart,
  onBack,
  onForward,
  onBpm,
  onToggleMuted,
  onToggleLoop,
  onToggleMetronome,
  onCycleSound,
}: ProgressionPlayBarProps) {
  const bpmId = useId()
  const [draft, setDraft] = useState(String(bpm))

  useEffect(() => {
    setDraft(String(bpm))
  }, [bpm])

  const commitBpm = (raw: string) => {
    const parsed = Number(raw)
    if (!Number.isFinite(parsed)) {
      setDraft(String(bpm))
      return
    }
    onBpm(parsed)
  }

  const holdLabel =
    barsPerChord > 1
      ? `Each chord lasts ${barsPerChord} bars`
      : 'Each chord lasts one bar'

  return (
    <div className="diagram-play" aria-label="Play" data-playing={playing}>
      <p className="diagram-chords-build__sub-label">Play</p>
      <div className="diagram-play__row">
        <div className="diagram-play__group" role="group" aria-label="Transport">
          <TransportButton label="Back to start" onClick={onToStart}>
            <SkipBack size={16} strokeWidth={2.25} aria-hidden />
          </TransportButton>
          <TransportButton label="Back one" onClick={onBack}>
            <StepBack size={16} strokeWidth={2.25} aria-hidden />
          </TransportButton>
          <TransportButton
            label={playing ? 'Pause' : 'Play'}
            onClick={playing ? onPause : onPlay}
          >
            {playing ? (
              <Pause size={16} strokeWidth={2.25} aria-hidden />
            ) : (
              <Play size={16} strokeWidth={2.25} aria-hidden />
            )}
          </TransportButton>
          <TransportButton label="Forward one" onClick={onForward}>
            <StepForward size={16} strokeWidth={2.25} aria-hidden />
          </TransportButton>
          <TransportButton
            label={metronome ? 'Metronome on' : 'Metronome off'}
            pressed={metronome}
            onClick={onToggleMetronome}
          >
            <Metronome size={16} strokeWidth={2.25} aria-hidden />
          </TransportButton>
          <TransportButton
            label={`Sound ${chordSound}, ${CHORD_SOUND_LABELS[chordSound]}`}
            onClick={onCycleSound}
          >
            {chordSound}
          </TransportButton>
        </div>

        <span className="diagram-play__position" aria-live="polite">
          {length > 0 ? `${step + 1} / ${length}` : '–'}
        </span>

        <label className="diagram-play__bpm" htmlFor={bpmId} title={holdLabel}>
          <span className="diagram-play__bpm-label">BPM</span>
          <input
            id={bpmId}
            className="diagram-play__bpm-input"
            type="number"
            inputMode="numeric"
            min={PLAYBACK_BPM_MIN}
            max={PLAYBACK_BPM_MAX}
            step={1}
            value={draft}
            aria-label="BPM"
            title={holdLabel}
            onChange={(event) => {
              const raw = event.target.value
              setDraft(raw)
              const parsed = Number(raw)
              if (
                raw.trim() !== '' &&
                Number.isFinite(parsed) &&
                parsed >= PLAYBACK_BPM_MIN &&
                parsed <= PLAYBACK_BPM_MAX
              ) {
                onBpm(parsed)
              }
            }}
            onBlur={() => commitBpm(draft)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur()
              }
            }}
          />
        </label>

        <TransportButton
          label={muted ? 'Unmute' : 'Mute'}
          pressed={muted}
          onClick={onToggleMuted}
        >
          {muted ? (
            <VolumeX size={16} strokeWidth={2.25} aria-hidden />
          ) : (
            <Volume2 size={16} strokeWidth={2.25} aria-hidden />
          )}
        </TransportButton>
        <TransportButton
          label={loop ? 'Loop on' : 'Loop off'}
          pressed={loop}
          onClick={onToggleLoop}
        >
          <Repeat size={16} strokeWidth={2.25} aria-hidden />
        </TransportButton>
      </div>
    </div>
  )
}
