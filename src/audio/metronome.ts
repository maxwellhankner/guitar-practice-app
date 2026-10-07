import { withPlaybackAudio } from './chordStrum'

/** Short click. The downbeat is higher and louder than the other beats. */
export function playMetronomeClick(accent: boolean): void {
  withPlaybackAudio((audio, destination) => {
    const now = audio.currentTime
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = 'sine'
    osc.frequency.value = accent ? 1760 : 1175
    const peak = accent ? 0.28 : 0.14
    gain.gain.setValueAtTime(peak, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (accent ? 0.045 : 0.03))
    osc.connect(gain)
    gain.connect(destination)
    osc.start(now)
    osc.stop(now + 0.06)
  })
}
