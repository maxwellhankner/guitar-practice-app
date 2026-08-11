import { useEffect, useRef, useState } from 'react'
import {
  AUDIBLE_MAX_HZ,
  AUDIBLE_MIN_HZ,
  centsOffTarget,
  detectFrequency,
  pitchFromFrequency,
  type DetectedPitch,
} from '../audio/pitchDetect'

export type TunerStatus =
  | 'idle'
  | 'requesting'
  | 'listening'
  | 'denied'
  | 'error'

export type TunerTarget = {
  id: string
  label: string
  noteName: string
  octave: number
  frequency: number
}

export type TunerReading = {
  pitch: DetectedPitch
  target: TunerTarget
  cents: number
}

function chromaticTarget(pitch: DetectedPitch): TunerTarget {
  return {
    id: `${pitch.noteName}${pitch.octave}`,
    label: `${pitch.noteName}${pitch.octave}`,
    noteName: pitch.noteName,
    octave: pitch.octave,
    frequency: pitch.nearestNoteHz,
  }
}

export function useTunerMic() {
  const [status, setStatus] = useState<TunerStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reading, setReading] = useState<TunerReading | null>(null)

  const audioRef = useRef<{
    stream: MediaStream
    context: AudioContext
    analyser: AnalyserNode
    buffer: Float32Array<ArrayBuffer>
    raf: number
  } | null>(null)

  useEffect(() => {
    return () => {
      stopInternal()
    }
  }, [])

  function stopInternal() {
    const active = audioRef.current
    if (!active) {
      return
    }
    cancelAnimationFrame(active.raf)
    active.stream.getTracks().forEach((t) => t.stop())
    void active.context.close()
    audioRef.current = null
  }

  function stop() {
    stopInternal()
    setReading(null)
    setStatus('idle')
    setErrorMessage(null)
  }

  async function start() {
    if (audioRef.current) {
      return
    }
    setStatus('requesting')
    setErrorMessage(null)
    setReading(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      const context = new AudioContext()
      if (context.state === 'suspended') {
        await context.resume()
      }

      const source = context.createMediaStreamSource(stream)
      const analyser = context.createAnalyser()
      // 4096 keeps YIN responsive while covering low E (~82 Hz).
      analyser.fftSize = 4096
      analyser.smoothingTimeConstant = 0
      source.connect(analyser)

      const buffer = new Float32Array(new ArrayBuffer(analyser.fftSize * 4))
      const active = { stream, context, analyser, buffer, raf: 0 }
      audioRef.current = active
      setStatus('listening')

      /**
       * Response feel (~60fps):
       * - Was ~16ms (0.6 new each frame) — too jumpy
       * - Now ~150ms Hz / ~180ms cents, with a short note-change debounce
       */
      const HZ_SMOOTH = 0.88 // keep 88% old → ~130–150ms settle
      const CENTS_SMOOTH = 0.9 // keep 90% old → ~180ms settle
      const NOTE_CONFIRM_FRAMES = 6 // ~100ms before switching displayed note
      const MISS_HOLD_FRAMES = 12 // ~200ms hold through tiny gaps

      let smoothHz: number | null = null
      let smoothCents: number | null = null
      let displayedTarget: TunerTarget | null = null
      let pendingTargetKey: string | null = null
      let pendingTargetFrames = 0
      let missedFrames = 0

      const publish = (frequency: number) => {
        const pitch = pitchFromFrequency(frequency)
        if (!pitch) {
          return
        }
        const detectedTarget = chromaticTarget(pitch)
        const detectedKey = detectedTarget.id

        if (displayedTarget == null) {
          displayedTarget = detectedTarget
          pendingTargetKey = null
          pendingTargetFrames = 0
        } else if (detectedKey === displayedTarget.id) {
          pendingTargetKey = null
          pendingTargetFrames = 0
        } else if (detectedKey === pendingTargetKey) {
          pendingTargetFrames += 1
          if (pendingTargetFrames >= NOTE_CONFIRM_FRAMES) {
            displayedTarget = detectedTarget
            pendingTargetKey = null
            pendingTargetFrames = 0
          }
        } else {
          pendingTargetKey = detectedKey
          pendingTargetFrames = 1
        }

        const target = displayedTarget
        const cents = centsOffTarget(frequency, target.frequency)
        smoothCents =
          smoothCents == null
            ? cents
            : smoothCents * CENTS_SMOOTH + cents * (1 - CENTS_SMOOTH)

        setReading({
          pitch: {
            ...pitch,
            frequency,
            noteName: target.noteName,
            octave: target.octave,
            noteIndex: pitch.noteIndex,
            cents: pitch.cents,
            nearestNoteHz: target.frequency,
          },
          target,
          cents: smoothCents,
        })
      }

      const tick = () => {
        const current = audioRef.current
        if (!current) {
          return
        }

        current.analyser.getFloatTimeDomainData(current.buffer)
        const frequency = detectFrequency(
          current.buffer,
          current.context.sampleRate,
          AUDIBLE_MIN_HZ,
          AUDIBLE_MAX_HZ,
        )

        if (frequency > 0) {
          missedFrames = 0
          smoothHz =
            smoothHz == null
              ? frequency
              : smoothHz * HZ_SMOOTH + frequency * (1 - HZ_SMOOTH)
          publish(smoothHz)
        } else if (smoothHz != null && missedFrames < MISS_HOLD_FRAMES) {
          missedFrames += 1
          publish(smoothHz)
        } else {
          smoothHz = null
          smoothCents = null
          displayedTarget = null
          pendingTargetKey = null
          pendingTargetFrames = 0
          missedFrames = 0
        }

        current.raf = requestAnimationFrame(tick)
      }

      active.raf = requestAnimationFrame(tick)
    } catch (err) {
      stopInternal()
      const name =
        err && typeof err === 'object' && 'name' in err
          ? String((err as { name: unknown }).name)
          : ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setStatus('denied')
        setErrorMessage(
          'Microphone access was blocked. Allow the mic in your browser settings, then try again.',
        )
      } else if (name === 'NotFoundError') {
        setStatus('error')
        setErrorMessage('No microphone was found on this device.')
      } else {
        setStatus('error')
        setErrorMessage(
          err instanceof Error ? err.message : 'Could not open the microphone.',
        )
      }
    }
  }

  return { status, errorMessage, reading, start, stop }
}
