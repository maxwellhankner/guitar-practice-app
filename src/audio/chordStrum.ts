import { resolveChord, type ChordPresetId } from '../components/Fretboard/chords'
import { STANDARD_GUITAR_STRINGS } from './pitchDetect'

/** Time between strings in a downstroke, low E first. */
const STRUM_GAP_SEC = 0.018

export const CHORD_SOUND_IDS = [1, 2, 3, 4] as const
export type ChordSoundId = (typeof CHORD_SOUND_IDS)[number]

export const CHORD_SOUND_LABELS: Record<ChordSoundId, string> = {
  1: 'Strum',
  2: 'Long strum',
  3: 'Block',
  4: 'Long block',
}

type SoundShape = {
  /** 0 plays every string together. */
  gapSec: number
  /** How long the pluck buffer rings. */
  seconds: number
  /** Karplus-Strong loss. Closer to 1 holds the note longer. */
  damping: number
}

const CHORD_SOUNDS: Record<ChordSoundId, SoundShape> = {
  1: { gapSec: STRUM_GAP_SEC, seconds: 2.2, damping: 0.996 },
  2: { gapSec: STRUM_GAP_SEC, seconds: 6.5, damping: 0.9992 },
  3: { gapSec: 0, seconds: 2.2, damping: 0.996 },
  4: { gapSec: 0, seconds: 6.5, damping: 0.9992 },
}

type StrumVoice = {
  gain: GainNode
  sources: AudioBufferSourceNode[]
}

let audioContext: AudioContext | null = null
let output: DynamicsCompressorNode | null = null
let voice: StrumVoice | null = null

function context(): AudioContext {
  if (audioContext == null) {
    audioContext = new AudioContext()
    output = audioContext.createDynamicsCompressor()
    output.threshold.value = -16
    output.knee.value = 8
    output.ratio.value = 3
    output.attack.value = 0.003
    output.release.value = 0.18
    output.connect(audioContext.destination)
  }
  return audioContext
}

/** Shared output so the metronome and chord strums stay on one clock. */
export function withPlaybackAudio(
  run: (audio: AudioContext, destination: AudioNode) => void,
): void {
  const audio = context()
  void audio.resume()
  if (output == null) {
    return
  }
  run(audio, output)
}

function releaseVoice(audio: AudioContext, previous: StrumVoice, fadeSec: number) {
  const now = audio.currentTime
  previous.gain.gain.cancelScheduledValues(now)
  previous.gain.gain.setValueAtTime(previous.gain.gain.value, now)
  previous.gain.gain.linearRampToValueAtTime(0.0001, now + fadeSec)
  const stopAt = now + fadeSec + 0.02
  for (const source of previous.sources) {
    try {
      source.stop(stopAt)
    } catch {
      /* already stopped */
    }
  }
}

/** Karplus-Strong pluck, normalized so strings share a level. */
function pluckBuffer(
  audio: AudioContext,
  frequency: number,
  seconds: number,
  damping: number,
): AudioBuffer {
  const sampleRate = audio.sampleRate
  const period = Math.max(2, Math.round(sampleRate / frequency))
  const length = Math.floor(sampleRate * seconds)
  const buffer = audio.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  const delay = new Float32Array(period)
  for (let i = 0; i < period; i++) {
    delay[i] = Math.random() * 2 - 1
  }
  let previous = 0
  let peak = 0
  for (let i = 0; i < length; i++) {
    const index = i % period
    const filtered = ((delay[index]! + previous) * 0.5) * damping
    delay[index] = filtered
    previous = filtered
    const attack = Math.min(1, i / 24)
    const sample = filtered * attack
    data[i] = sample
    peak = Math.max(peak, Math.abs(sample))
  }
  if (peak > 0) {
    const gain = 0.85 / peak
    for (let i = 0; i < length; i++) {
      data[i] = data[i]! * gain
    }
  }
  return buffer
}

export function nextChordSound(current: ChordSoundId): ChordSoundId {
  const index = CHORD_SOUND_IDS.indexOf(current)
  return CHORD_SOUND_IDS[(index + 1) % CHORD_SOUND_IDS.length] ?? 1
}

/** Play the chord diagram in the selected sound. Replaces any ringing chord. */
export function playChordStrum(
  chordId: ChordPresetId,
  sound: ChordSoundId = 1,
): void {
  let strings: ReturnType<typeof resolveChord>['strings']
  try {
    strings = resolveChord(chordId).strings
  } catch {
    return
  }

  const frequencies: number[] = []
  strings.forEach((fret, index) => {
    if (fret === 'x') {
      return
    }
    const openHz = STANDARD_GUITAR_STRINGS[index]?.frequency
    if (openHz == null) {
      return
    }
    frequencies.push(openHz * 2 ** (fret / 12))
  })
  if (frequencies.length === 0) {
    stopChordStrum()
    return
  }

  const audio = context()
  void audio.resume()
  if (voice != null) {
    releaseVoice(audio, voice, 0.05)
    voice = null
  }
  if (output == null) {
    return
  }

  const shape = CHORD_SOUNDS[sound]
  const now = audio.currentTime
  const gain = audio.createGain()
  gain.gain.setValueAtTime(0.9 / frequencies.length, now)
  gain.connect(output)
  const sources: AudioBufferSourceNode[] = []
  frequencies.forEach((frequency, index) => {
    const source = audio.createBufferSource()
    source.buffer = pluckBuffer(audio, frequency, shape.seconds, shape.damping)
    source.connect(gain)
    source.start(now + index * shape.gapSec)
    sources.push(source)
  })
  voice = { gain, sources }
}

export function stopChordStrum(): void {
  if (audioContext == null || voice == null) {
    return
  }
  const previous = voice
  voice = null
  releaseVoice(audioContext, previous, 0.06)
}
