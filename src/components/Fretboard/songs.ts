import { type ChordPresetId } from './chords'
import { type KeyId } from './keys'
import {
  chordsForSteps,
  type ProgressionStepDef,
} from './progressions'
import { MAX_PROGRESSION_STEPS } from './progressionBuilder'

export const SONG_IDS = [
  'let-it-be',
  'im-yours',
  'perfect',
  'stand-by-me',
  'with-or-without-you',
  'knockin-heavens-door',
  'horse-with-no-name',
  'zombie',
  'three-little-birds',
  'louie-louie',
  'sweet-home-alabama',
  'good-riddance',
] as const

export type SongId = (typeof SONG_IDS)[number]

/** Down or up stroke for a beginner one-bar strum loop. */
export type StrumStroke = 'D' | 'U'

export type SongDef = {
  id: SongId
  title: string
  artist: string
  /** Beginner-friendly starting key for the song loop. */
  defaultKey: KeyId
  /** Degree-based loop (4–8 chords) that repeats while you play. */
  steps: readonly ProgressionStepDef[]
  /** Repeating one-bar strum shown above the progression chords. */
  strumPattern: readonly StrumStroke[]
  /** How many times to play the strum pattern while holding each chord. */
  strumBarsPerChord: 1 | 2
}

function steps(degrees: readonly number[]): ProgressionStepDef[] {
  return degrees.map((degree) => ({ degree }))
}

/** Common pop/folk pattern: D D U U D U */
const FOLK_STRUM = ['D', 'D', 'U', 'U', 'D', 'U'] as const satisfies readonly StrumStroke[]
/** Steady downs — great while learning chord changes. */
const DOWN_STRUM = ['D', 'D', 'D', 'D'] as const satisfies readonly StrumStroke[]
/** Even down-up eighths. */
const ALTERNATE_STRUM = [
  'D',
  'U',
  'D',
  'U',
  'D',
  'U',
  'D',
  'U',
] as const satisfies readonly StrumStroke[]
/** Reggae-style offbeat ups (simplified). */
const SKANK_STRUM = ['U', 'U', 'U', 'U'] as const satisfies readonly StrumStroke[]

/**
 * Simple repeating beginner loops (open-chord friendly).
 * Steps are scale degrees so they transpose with the selected key.
 */
export const SONGS: Record<SongId, SongDef> = {
  'let-it-be': {
    id: 'let-it-be',
    title: 'Let It Be',
    artist: 'The Beatles',
    defaultKey: 'C',
    steps: steps([1, 5, 6, 4]),
    strumPattern: FOLK_STRUM,
    strumBarsPerChord: 1,
  },
  'im-yours': {
    id: 'im-yours',
    title: "I'm Yours",
    artist: 'Jason Mraz',
    defaultKey: 'G',
    steps: steps([1, 5, 6, 4]),
    strumPattern: FOLK_STRUM,
    strumBarsPerChord: 2,
  },
  perfect: {
    id: 'perfect',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    defaultKey: 'G',
    steps: steps([1, 6, 4, 5]),
    strumPattern: FOLK_STRUM,
    strumBarsPerChord: 2,
  },
  'stand-by-me': {
    id: 'stand-by-me',
    title: 'Stand By Me',
    artist: 'Ben E. King',
    defaultKey: 'A',
    steps: steps([1, 6, 4, 5]),
    strumPattern: FOLK_STRUM,
    strumBarsPerChord: 2,
  },
  'with-or-without-you': {
    id: 'with-or-without-you',
    title: 'With or Without You',
    artist: 'U2',
    defaultKey: 'D',
    steps: steps([1, 5, 6, 4]),
    strumPattern: DOWN_STRUM,
    strumBarsPerChord: 2,
  },
  'knockin-heavens-door': {
    id: 'knockin-heavens-door',
    title: "Knockin' on Heaven's Door",
    artist: 'Bob Dylan',
    defaultKey: 'G',
    steps: steps([1, 5, 2, 4]),
    strumPattern: FOLK_STRUM,
    strumBarsPerChord: 2,
  },
  'horse-with-no-name': {
    id: 'horse-with-no-name',
    title: 'A Horse With No Name',
    artist: 'America',
    defaultKey: 'Em',
    steps: steps([1, 7, 1, 7]),
    strumPattern: FOLK_STRUM,
    strumBarsPerChord: 2,
  },
  zombie: {
    id: 'zombie',
    title: 'Zombie',
    artist: 'The Cranberries',
    defaultKey: 'Em',
    steps: steps([1, 6, 3, 7]),
    strumPattern: DOWN_STRUM,
    strumBarsPerChord: 2,
  },
  'three-little-birds': {
    id: 'three-little-birds',
    title: 'Three Little Birds',
    artist: 'Bob Marley',
    defaultKey: 'A',
    steps: steps([1, 4, 5, 1]),
    strumPattern: SKANK_STRUM,
    strumBarsPerChord: 2,
  },
  'louie-louie': {
    id: 'louie-louie',
    title: 'Louie Louie',
    artist: 'The Kingsmen',
    defaultKey: 'A',
    steps: steps([1, 4, 5, 4]),
    strumPattern: DOWN_STRUM,
    strumBarsPerChord: 2,
  },
  'sweet-home-alabama': {
    id: 'sweet-home-alabama',
    title: 'Sweet Home Alabama',
    artist: 'Lynyrd Skynyrd',
    defaultKey: 'G',
    steps: steps([1, 5, 4, 1]),
    strumPattern: FOLK_STRUM,
    strumBarsPerChord: 1,
  },
  'good-riddance': {
    id: 'good-riddance',
    title: 'Good Riddance',
    artist: 'Green Day',
    defaultKey: 'G',
    // Verse-style loop that stays within 8 chords
    steps: steps([1, 4, 5, 6, 1, 4, 5, 1]),
    strumPattern: ALTERNATE_STRUM,
    strumBarsPerChord: 1,
  },
}

const songIdSet = new Set<string>(SONG_IDS)

export function isSongId(value: unknown): value is SongId {
  return typeof value === 'string' && songIdSet.has(value)
}

export function sanitizeSongId(value: unknown): SongId | null {
  return isSongId(value) ? value : null
}

export function isSongResolvableInKey(keyId: KeyId, songId: SongId): boolean {
  const { steps: songSteps } = SONGS[songId]
  if (songSteps.length < 1 || songSteps.length > MAX_PROGRESSION_STEPS) {
    return false
  }
  try {
    chordsForSteps(keyId, songSteps)
    return true
  } catch {
    return false
  }
}

export function chordsForSong(keyId: KeyId, songId: SongId): ChordPresetId[] {
  return chordsForSteps(keyId, SONGS[songId].steps)
}

export function seedProgressionFromSong(
  keyId: KeyId,
  songId: SongId,
): ChordPresetId[] {
  return chordsForSong(keyId, songId)
}

export function formatStrumPattern(pattern: readonly StrumStroke[]): string {
  return pattern.join(' ')
}
