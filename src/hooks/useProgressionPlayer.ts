import { useCallback, useEffect, useRef, useState } from 'react'

/** Quarter notes in a bar. A chord holds this many beats, times the song's bar count. */
const BEATS_PER_BAR = 4

export const PLAYBACK_BPM_MIN = 40
export const PLAYBACK_BPM_MAX = 200
export const PLAYBACK_BPM_DEFAULT = 80

export function clampPlaybackBpm(value: number): number {
  if (!Number.isFinite(value)) {
    return PLAYBACK_BPM_DEFAULT
  }
  return Math.min(
    PLAYBACK_BPM_MAX,
    Math.max(PLAYBACK_BPM_MIN, Math.round(value)),
  )
}

/**
 * Steps through a progression. `onStep` runs for the chord that should show
 * (and, unless muted by the caller, sound). `onBeat` runs for each metronome
 * click while that option is on; the downbeat is `accent`.
 */
export function useProgressionPlayer(
  length: number,
  barsPerChord: number,
  onStep: (index: number) => void,
  onBeat: (accent: boolean) => void,
) {
  const onStepRef = useRef(onStep)
  const onBeatRef = useRef(onBeat)
  const lengthRef = useRef(length)
  const barsRef = useRef(barsPerChord)

  useEffect(() => {
    onStepRef.current = onStep
    onBeatRef.current = onBeat
    lengthRef.current = length
    barsRef.current = barsPerChord
  }, [onStep, onBeat, length, barsPerChord])

  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState(0)
  const [bpm, setBpmState] = useState(PLAYBACK_BPM_DEFAULT)
  const [muted, setMuted] = useState(false)
  const [loop, setLoop] = useState(true)
  const [metronome, setMetronome] = useState(false)

  const playingRef = useRef(false)
  const stepRef = useRef(0)
  const bpmRef = useRef(PLAYBACK_BPM_DEFAULT)
  const loopRef = useRef(true)
  const metronomeRef = useRef(false)
  /** Beats already sounded in the current chord. 0 is the downbeat. */
  const beatRef = useRef(0)
  const timerRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const beatsInChord = useCallback(() => {
    const bars = barsRef.current > 0 ? barsRef.current : 1
    return BEATS_PER_BAR * bars
  }, [])

  const emitClick = useCallback((accent: boolean) => {
    if (!metronomeRef.current) {
      return
    }
    onBeatRef.current(accent)
  }, [])

  const scheduleNextBeatRef = useRef<() => void>(() => {})

  const scheduleNextBeat = useCallback(() => {
    clearTimer()
    if (!playingRef.current || lengthRef.current < 1) {
      return
    }
    const ms = 60_000 / clampPlaybackBpm(bpmRef.current)
    timerRef.current = window.setTimeout(() => {
      if (!playingRef.current || lengthRef.current < 1) {
        return
      }
      const nextBeat = beatRef.current + 1
      if (nextBeat >= beatsInChord()) {
        const len = lengthRef.current
        const upcoming = stepRef.current + 1
        if (upcoming >= len && !loopRef.current) {
          playingRef.current = false
          setPlaying(false)
          clearTimer()
          return
        }
        const next = upcoming >= len ? 0 : upcoming
        stepRef.current = next
        setStep(next)
        beatRef.current = 0
        onStepRef.current(next)
        emitClick(true)
      } else {
        beatRef.current = nextBeat
        emitClick(nextBeat % BEATS_PER_BAR === 0)
      }
      scheduleNextBeatRef.current()
    }, ms)
  }, [beatsInChord, clearTimer, emitClick])

  useEffect(() => {
    scheduleNextBeatRef.current = scheduleNextBeat
  }, [scheduleNextBeat])

  useEffect(() => clearTimer, [clearTimer])

  useEffect(() => {
    if (playingRef.current) {
      scheduleNextBeat()
    }
  }, [barsPerChord, scheduleNextBeat])

  useEffect(() => {
    if (length < 1) {
      clearTimer()
      if (playingRef.current) {
        playingRef.current = false
        setPlaying(false)
      }
      if (stepRef.current !== 0) {
        stepRef.current = 0
        setStep(0)
      }
      return
    }
    if (stepRef.current > length - 1) {
      const next = length - 1
      stepRef.current = next
      setStep(next)
      if (playingRef.current) {
        beatRef.current = 0
        onStepRef.current(next)
        emitClick(true)
        scheduleNextBeat()
      }
    }
  }, [length, clearTimer, emitClick, scheduleNextBeat])

  const play = useCallback(
    (fromIndex?: number) => {
      const len = lengthRef.current
      if (len < 1) {
        return
      }
      const raw = fromIndex ?? stepRef.current
      const index = Math.min(len - 1, Math.max(0, raw))
      stepRef.current = index
      setStep(index)
      beatRef.current = 0
      playingRef.current = true
      setPlaying(true)
      onStepRef.current(index)
      emitClick(true)
      scheduleNextBeat()
    },
    [emitClick, scheduleNextBeat],
  )

  const pause = useCallback(() => {
    if (!playingRef.current) {
      return
    }
    playingRef.current = false
    setPlaying(false)
    clearTimer()
  }, [clearTimer])

  const jump = useCallback(
    (index: number) => {
      const len = lengthRef.current
      if (len < 1) {
        return
      }
      const next = ((index % len) + len) % len
      stepRef.current = next
      setStep(next)
      beatRef.current = 0
      onStepRef.current(next)
      if (playingRef.current) {
        emitClick(true)
        scheduleNextBeat()
      }
    },
    [emitClick, scheduleNextBeat],
  )

  const setBpm = useCallback(
    (value: number) => {
      const next = clampPlaybackBpm(value)
      bpmRef.current = next
      setBpmState(next)
      if (playingRef.current) {
        scheduleNextBeat()
      }
    },
    [scheduleNextBeat],
  )

  const toggleMuted = useCallback(() => {
    setMuted((current) => !current)
  }, [])

  const toggleLoop = useCallback(() => {
    const next = !loopRef.current
    loopRef.current = next
    setLoop(next)
  }, [])

  const toggleMetronome = useCallback(() => {
    const next = !metronomeRef.current
    metronomeRef.current = next
    setMetronome(next)
  }, [])

  const toStart = useCallback(() => jump(0), [jump])
  const backOne = useCallback(() => jump(stepRef.current - 1), [jump])
  const forwardOne = useCallback(() => jump(stepRef.current + 1), [jump])

  return {
    playing,
    step,
    bpm,
    muted,
    loop,
    metronome,
    play,
    pause,
    toStart,
    backOne,
    forwardOne,
    setBpm,
    toggleMuted,
    toggleLoop,
    toggleMetronome,
  }
}
