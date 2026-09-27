import { useEffect, useRef, useState } from 'react'
import {
  AUDIBLE_MAX_HZ,
  AUDIBLE_MIN_HZ,
  detectFrequency,
  midiFromFrequency,
  pitchFromFrequency,
  TUNER_RMS_GATE_DESKTOP,
  TUNER_RMS_GATE_MOBILE,
  type DetectedPitch,
} from '../audio/pitchDetect'
import { type HummedNote } from '../audio/humPlacement'
import { type ChartMark, type PitchPoint } from '../audio/humTrace'

export type HumStatus = 'idle' | 'requesting' | 'listening' | 'denied' | 'error'

const MAX_NOTES = 16
/** How long a pitch must hold before it is written down. */
const STABLE_MS = 180
/** Silence this long lets the same note be captured again. */
const RELEASE_MS = 350
/** How often a point is added to the pitch line. */
const SAMPLE_MS = 40
/** How often the chart is redrawn. */
const FLUSH_MS = 80
/** Drop samples older than this so a long hum stays light. */
const MAX_TRACE_MS = 30000

function isMobileLikeDevice(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(pointer: coarse)').matches
}

function noteFromPitch(pitch: DetectedPitch): HummedNote {
  return {
    noteName: pitch.noteName,
    octave: pitch.octave,
    midi: Math.round(midiFromFrequency(pitch.nearestNoteHz)),
  }
}

export function useHumCapture() {
  const [status, setStatus] = useState<HumStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [liveNote, setLiveNote] = useState<HummedNote | null>(null)
  const [notes, setNotes] = useState<HummedNote[]>([])
  const [trace, setTrace] = useState<PitchPoint[]>([])
  const [marks, setMarks] = useState<ChartMark[]>([])

  const notesRef = useRef(notes)
  notesRef.current = notes
  const traceRef = useRef<PitchPoint[]>([])
  const marksRef = useRef<ChartMark[]>([])
  const sessionRef = useRef({
    origin: 0,
    lastSample: 0,
    lastFlush: 0,
    lastMidi: null as number | null,
  })

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
    active.stream.getTracks().forEach((track) => track.stop())
    void active.context.close()
    audioRef.current = null
  }

  function stop() {
    stopInternal()
    setLiveNote(null)
    setStatus('idle')
    setErrorMessage(null)
  }

  function resetTraceClock() {
    sessionRef.current.origin = 0
    sessionRef.current.lastSample = 0
    sessionRef.current.lastFlush = 0
    sessionRef.current.lastMidi = null
  }

  function replaceTrace(points: PitchPoint[], nextMarks: ChartMark[]) {
    traceRef.current = points
    marksRef.current = nextMarks
    setTrace(points)
    setMarks(nextMarks)
  }

  function clearNotes() {
    setNotes([])
    resetTraceClock()
    replaceTrace([], [])
  }

  async function start() {
    if (audioRef.current) {
      return
    }
    setStatus('requesting')
    setErrorMessage(null)
    setLiveNote(null)

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

      const minRms = isMobileLikeDevice()
        ? TUNER_RMS_GATE_MOBILE
        : Math.min(TUNER_RMS_GATE_DESKTOP, 0.012)

      const source = context.createMediaStreamSource(stream)
      const analyser = context.createAnalyser()
      analyser.fftSize = 4096
      analyser.smoothingTimeConstant = 0
      source.connect(analyser)

      const buffer = new Float32Array(new ArrayBuffer(analyser.fftSize * 4))
      const active = { stream, context, analyser, buffer, raf: 0 }
      audioRef.current = active
      setStatus('listening')
      resetTraceClock()
      replaceTrace([], [])

      let smoothHz: number | null = null
      let liveKey: string | null = null
      let stableKey: string | null = null
      let stableSince = 0
      let lastCommitKey: string | null = null
      let silentSince: number | null = null

      const tick = (now: number) => {
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
          minRms,
        )

        if (frequency > 0) {
          silentSince = null
          smoothHz = smoothHz == null ? frequency : smoothHz * 0.82 + frequency * 0.18
          const pitch = pitchFromFrequency(smoothHz)
          if (pitch) {
            const key = `${pitch.noteName}${pitch.octave}`
            if (key !== liveKey) {
              liveKey = key
              setLiveNote(noteFromPitch(pitch))
            }
            if (key !== stableKey) {
              stableKey = key
              stableSince = now
            } else if (
              now - stableSince >= STABLE_MS &&
              key !== lastCommitKey &&
              notesRef.current.length < MAX_NOTES
            ) {
              lastCommitKey = key
              const hummed = noteFromPitch(pitch)
              const order = notesRef.current.length + 1
              const session = sessionRef.current
              const t = session.origin === 0 ? 0 : now - session.origin
              const mark: ChartMark = {
                t,
                midi: hummed.midi,
                label: `${order} ${hummed.noteName}${hummed.octave}`,
                order,
              }
              marksRef.current = [...marksRef.current, mark]
              setMarks(marksRef.current)
              setNotes((prev) =>
                prev.length >= MAX_NOTES ? prev : [...prev, hummed],
              )
            }
          }
        } else {
          if (silentSince == null) {
            silentSince = now
          }
          if (now - silentSince >= RELEASE_MS) {
            smoothHz = null
            stableKey = null
            lastCommitKey = null
            sessionRef.current.lastMidi = null
            if (liveKey != null) {
              liveKey = null
              setLiveNote(null)
            }
          }
        }

        const session = sessionRef.current
        if (session.origin === 0) {
          session.origin = now
          session.lastSample = now
          session.lastFlush = now
        }
        if (now - session.lastSample >= SAMPLE_MS) {
          session.lastSample = now
          const midi =
            smoothHz != null && silentSince == null
              ? midiFromFrequency(smoothHz)
              : silentSince != null &&
                  now - silentSince < RELEASE_MS &&
                  session.lastMidi != null
                ? session.lastMidi
                : null
          if (midi != null) {
            session.lastMidi = midi
          }
          traceRef.current.push({ t: now - session.origin, midi })
          const newest = traceRef.current[traceRef.current.length - 1]!.t
          const cutoff = newest - MAX_TRACE_MS
          if (traceRef.current[0]!.t < cutoff) {
            traceRef.current = traceRef.current.filter((point) => point.t >= cutoff)
            const keptMarks = marksRef.current.filter((mark) => mark.t >= cutoff)
            if (keptMarks.length !== marksRef.current.length) {
              marksRef.current = keptMarks
              setMarks(keptMarks)
            }
          }
        }
        if (now - session.lastFlush >= FLUSH_MS) {
          session.lastFlush = now
          setTrace(traceRef.current.slice())
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

  return {
    status,
    errorMessage,
    liveNote,
    notes,
    trace,
    marks,
    phraseFull: notes.length >= MAX_NOTES,
    start,
    stop,
    clearNotes,
  }
}
