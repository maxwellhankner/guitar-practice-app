import { useEffect, useRef, useState } from 'react'
import {
  centsOffTarget,
  detectFrequency,
  nearestGuitarString,
  pitchFromFrequency,
  STANDARD_GUITAR_STRINGS,
  type DetectedPitch,
  type GuitarString,
} from '../audio/pitchDetect'

export type TunerStatus =
  | 'idle'
  | 'requesting'
  | 'listening'
  | 'denied'
  | 'error'

export type TunerReading = {
  pitch: DetectedPitch
  target: GuitarString
  cents: number
}

type UseTunerMicOptions = {
  /** When set, lock comparison to this string; otherwise auto-pick nearest. */
  lockedStringId: string | null
}

export function useTunerMic({ lockedStringId }: UseTunerMicOptions) {
  const [status, setStatus] = useState<TunerStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reading, setReading] = useState<TunerReading | null>(null)

  const lockedRef = useRef(lockedStringId)
  lockedRef.current = lockedStringId

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
      analyser.fftSize = 2048
      source.connect(analyser)

      const buffer = new Float32Array(new ArrayBuffer(analyser.fftSize * 4))
      const active = { stream, context, analyser, buffer, raf: 0 }
      audioRef.current = active
      setStatus('listening')

      let smoothCents: number | null = null
      let lastNoteKey: string | null = null

      const tick = () => {
        const current = audioRef.current
        if (!current) {
          return
        }

        current.analyser.getFloatTimeDomainData(current.buffer)
        const frequency = detectFrequency(
          current.buffer,
          current.context.sampleRate,
        )

        if (frequency > 0) {
          const pitch = pitchFromFrequency(frequency)
          if (pitch) {
            const lockedId = lockedRef.current
            const target =
              lockedId != null
                ? (STANDARD_GUITAR_STRINGS.find((s) => s.id === lockedId) ??
                  nearestGuitarString(frequency))
                : nearestGuitarString(frequency)
            const cents = centsOffTarget(frequency, target.frequency)
            const noteKey = `${pitch.noteName}${pitch.octave}`
            if (noteKey !== lastNoteKey) {
              smoothCents = cents
              lastNoteKey = noteKey
            } else if (smoothCents == null) {
              smoothCents = cents
            } else {
              smoothCents = smoothCents * 0.7 + cents * 0.3
            }
            setReading({
              pitch,
              target,
              cents: smoothCents,
            })
          }
        } else {
          // Keep last reading briefly; clear if silence persists via idle fade
          // (leave previous reading so the needle doesn't flicker)
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
