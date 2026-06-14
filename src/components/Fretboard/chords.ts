import { CHORD_VOICINGS, type ChordVoicingId } from './chordVoicings'
import type { ChordFingering } from './types'

const ROOT_NAMES = [
  'A',
  'A#',
  'B',
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
] as const

export type RootName = (typeof ROOT_NAMES)[number]

const ROOT_NAMES_BY_LENGTH = [...ROOT_NAMES].sort(
  (a, b) => b.length - a.length,
)

const EXTENDED_QUALITY_LABEL: Record<
  Exclude<ChordQuality, 'major' | 'minor'>,
  string
> = {
  diminished: 'diminished',
  dim7: 'diminished 7th',
  sus2: 'suspended 2nd',
  sus4: 'suspended 4th',
  dom7: '7th',
  dom7sus4: '7 suspended 4th',
  maj7: 'major 7th',
  min7: 'minor 7th',
  add9: 'add 9',
  maj6: '6th',
  min6: 'minor 6th',
  dom9: '9th',
  maj9: 'major 9th',
  min9: 'minor 9th',
}

function chordPresetName(id: ChordVoicingId): string {
  for (const rootName of ROOT_NAMES_BY_LENGTH) {
    if (!id.startsWith(rootName)) {
      continue
    }
    const suffix = id.slice(rootName.length)
    if (suffix === '') {
      return `${rootName} major`
    }
    if (suffix === 'm') {
      return `${rootName} minor`
    }
    const label = EXTENDED_QUALITY_LABEL[
      suffix === 'dim7'
        ? 'dim7'
        : suffix === 'dim'
          ? 'diminished'
          : suffix === '7sus4'
            ? 'dom7sus4'
            : suffix === 'maj9'
              ? 'maj9'
              : suffix === 'maj7'
                ? 'maj7'
                : suffix === 'm9'
                  ? 'min9'
                  : suffix === 'm7'
                    ? 'min7'
                    : suffix === 'm6'
                      ? 'min6'
                      : suffix === 'add9'
                        ? 'add9'
                        : suffix === '9'
                          ? 'dom9'
                          : suffix === '6'
                            ? 'maj6'
                            : suffix === '7'
                              ? 'dom7'
                              : (suffix as 'sus2' | 'sus4')
    ]
    return `${rootName} ${label}`
  }
  throw new Error(`Unknown chord voicing id: ${id}`)
}

function buildChordPresets(): Record<ChordVoicingId, ChordFingering> {
  const presets = {} as Record<ChordVoicingId, ChordFingering>
  for (const id of Object.keys(CHORD_VOICINGS) as ChordVoicingId[]) {
    const voicing = CHORD_VOICINGS[id]
    presets[id] = {
      name: chordPresetName(id),
      strings: voicing.strings,
      fingers: voicing.fingers,
    }
  }
  return presets
}

export const CHORD_PRESETS = buildChordPresets()

export type ChordPresetId = ChordVoicingId

export type ChordQuality =
  | 'major'
  | 'minor'
  | 'diminished'
  | 'dim7'
  | 'sus2'
  | 'sus4'
  | 'dom7'
  | 'dom7sus4'
  | 'maj7'
  | 'min7'
  | 'add9'
  | 'maj6'
  | 'min6'
  | 'dom9'
  | 'maj9'
  | 'min9'

export const CHORD_MAJOR_IDS = [
  'A',
  'A#',
  'B',
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
] as const satisfies readonly ChordPresetId[]

export const CHORD_MINOR_IDS = [
  'Am',
  'A#m',
  'Bm',
  'Cm',
  'C#m',
  'Dm',
  'D#m',
  'Em',
  'Fm',
  'F#m',
  'Gm',
  'G#m',
] as const satisfies readonly ChordPresetId[]

export const CHORD_DIM_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}dim`,
) as readonly `${RootName}dim`[] & readonly ChordPresetId[]

export const CHORD_DIM7_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}dim7`,
) as readonly `${RootName}dim7`[] & readonly ChordPresetId[]

export const CHORD_SUS2_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}sus2`,
) as readonly `${RootName}sus2`[] & readonly ChordPresetId[]

export const CHORD_SUS4_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}sus4`,
) as readonly `${RootName}sus4`[] & readonly ChordPresetId[]

export const CHORD_DOM7_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}7`,
) as readonly `${RootName}7`[] & readonly ChordPresetId[]

export const CHORD_DOM7SUS4_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}7sus4`,
) as readonly `${RootName}7sus4`[] & readonly ChordPresetId[]

export const CHORD_MAJ7_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}maj7`,
) as readonly `${RootName}maj7`[] & readonly ChordPresetId[]

export const CHORD_MIN7_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}m7`,
) as readonly `${RootName}m7`[] & readonly ChordPresetId[]

export const CHORD_ADD9_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}add9`,
) as readonly `${RootName}add9`[] & readonly ChordPresetId[]

export const CHORD_MAJ6_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}6`,
) as readonly `${RootName}6`[] & readonly ChordPresetId[]

export const CHORD_MIN6_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}m6`,
) as readonly `${RootName}m6`[] & readonly ChordPresetId[]

export const CHORD_DOM9_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}9`,
) as readonly `${RootName}9`[] & readonly ChordPresetId[]

export const CHORD_MAJ9_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}maj9`,
) as readonly `${RootName}maj9`[] & readonly ChordPresetId[]

export const CHORD_MIN9_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}m9`,
) as readonly `${RootName}m9`[] & readonly ChordPresetId[]

/** Column order within each root group in the chord picker (top → bottom). */
export const CHORD_VARIANT_ORDER = [
  'major',
  'minor',
  'sus2',
  'sus4',
  'dom7',
  'dom7sus4',
  'maj7',
  'min7',
  'add9',
  'maj6',
  'min6',
  'dom9',
  'maj9',
  'min9',
  'diminished',
  'dim7',
] as const

export type ChordVariant = (typeof CHORD_VARIANT_ORDER)[number]

export function chordIdForRootVariant(
  rootName: RootName,
  variant: ChordVariant,
): ChordPresetId {
  switch (variant) {
    case 'major':
      return rootName
    case 'minor':
      return `${rootName}m` as ChordPresetId
    case 'diminished':
      return `${rootName}dim` as ChordPresetId
    case 'dim7':
      return `${rootName}dim7` as ChordPresetId
    case 'sus2':
      return `${rootName}sus2` as ChordPresetId
    case 'sus4':
      return `${rootName}sus4` as ChordPresetId
    case 'dom7':
      return `${rootName}7` as ChordPresetId
    case 'dom7sus4':
      return `${rootName}7sus4` as ChordPresetId
    case 'maj7':
      return `${rootName}maj7` as ChordPresetId
    case 'min7':
      return `${rootName}m7` as ChordPresetId
    case 'add9':
      return `${rootName}add9` as ChordPresetId
    case 'maj6':
      return `${rootName}6` as ChordPresetId
    case 'min6':
      return `${rootName}m6` as ChordPresetId
    case 'dom9':
      return `${rootName}9` as ChordPresetId
    case 'maj9':
      return `${rootName}maj9` as ChordPresetId
    case 'min9':
      return `${rootName}m9` as ChordPresetId
  }
}

export function chordIdsForRoot(rootName: RootName): ChordPresetId[] {
  return CHORD_VARIANT_ORDER.map((variant) =>
    chordIdForRootVariant(rootName, variant),
  )
}

export const CHORD_SELECTABLE_IDS = ROOT_NAMES.flatMap((rootName) =>
  chordIdsForRoot(rootName),
) as readonly ChordPresetId[]

export const CHORD_PRESET_IDS = [...CHORD_SELECTABLE_IDS] as const satisfies readonly ChordPresetId[]

const ROOT_PC: Record<string, number> = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11,
}

export function isDiminishedChord(chordId: ChordPresetId): boolean {
  return /dim7?$/.test(chordId)
}

export function isChordPracticeable(_chordId: ChordPresetId): boolean {
  return true
}

export function parseChordPresetId(chordId: ChordPresetId): {
  rootName: string
  rootPc: number
  quality: ChordQuality
} {
  for (const rootName of ROOT_NAMES_BY_LENGTH) {
    if (!chordId.startsWith(rootName)) {
      continue
    }
    const suffix = chordId.slice(rootName.length)
    const rootPc = ROOT_PC[rootName]
    if (rootPc == null) {
      break
    }

    if (suffix === '') {
      return { rootName, rootPc, quality: 'major' }
    }
    if (suffix === 'dim7') {
      return { rootName, rootPc, quality: 'dim7' }
    }
    if (suffix === 'dim') {
      return { rootName, rootPc, quality: 'diminished' }
    }
    if (suffix === 'sus2') {
      return { rootName, rootPc, quality: 'sus2' }
    }
    if (suffix === 'sus4') {
      return { rootName, rootPc, quality: 'sus4' }
    }
    if (suffix === '7sus4') {
      return { rootName, rootPc, quality: 'dom7sus4' }
    }
    if (suffix === 'maj9') {
      return { rootName, rootPc, quality: 'maj9' }
    }
    if (suffix === 'maj7') {
      return { rootName, rootPc, quality: 'maj7' }
    }
    if (suffix === 'm9') {
      return { rootName, rootPc, quality: 'min9' }
    }
    if (suffix === 'm7') {
      return { rootName, rootPc, quality: 'min7' }
    }
    if (suffix === 'm6') {
      return { rootName, rootPc, quality: 'min6' }
    }
    if (suffix === 'm') {
      return { rootName, rootPc, quality: 'minor' }
    }
    if (suffix === 'add9') {
      return { rootName, rootPc, quality: 'add9' }
    }
    if (suffix === '9') {
      return { rootName, rootPc, quality: 'dom9' }
    }
    if (suffix === '6') {
      return { rootName, rootPc, quality: 'maj6' }
    }
    if (suffix === '7') {
      return { rootName, rootPc, quality: 'dom7' }
    }
    break
  }

  throw new Error(`Unknown chord preset id: ${chordId}`)
}

export function chordPitchClasses(
  rootPc: number,
  quality: ChordQuality,
): readonly number[] {
  switch (quality) {
    case 'diminished':
      return [rootPc, (rootPc + 3) % 12, (rootPc + 6) % 12]
    case 'dim7':
      return [
        rootPc,
        (rootPc + 3) % 12,
        (rootPc + 6) % 12,
        (rootPc + 9) % 12,
      ]
    case 'sus2':
      return [rootPc, (rootPc + 2) % 12, (rootPc + 7) % 12]
    case 'sus4':
      return [rootPc, (rootPc + 5) % 12, (rootPc + 7) % 12]
    case 'dom7':
      return [
        rootPc,
        (rootPc + 4) % 12,
        (rootPc + 7) % 12,
        (rootPc + 10) % 12,
      ]
    case 'dom7sus4':
      return [
        rootPc,
        (rootPc + 5) % 12,
        (rootPc + 7) % 12,
        (rootPc + 10) % 12,
      ]
    case 'maj7':
      return [
        rootPc,
        (rootPc + 4) % 12,
        (rootPc + 7) % 12,
        (rootPc + 11) % 12,
      ]
    case 'min7':
      return [
        rootPc,
        (rootPc + 3) % 12,
        (rootPc + 7) % 12,
        (rootPc + 10) % 12,
      ]
    case 'add9':
      return [
        rootPc,
        (rootPc + 4) % 12,
        (rootPc + 7) % 12,
        (rootPc + 2) % 12,
      ]
    case 'maj6':
      return [
        rootPc,
        (rootPc + 4) % 12,
        (rootPc + 7) % 12,
        (rootPc + 9) % 12,
      ]
    case 'min6':
      return [
        rootPc,
        (rootPc + 3) % 12,
        (rootPc + 7) % 12,
        (rootPc + 9) % 12,
      ]
    case 'dom9':
      return [
        rootPc,
        (rootPc + 4) % 12,
        (rootPc + 7) % 12,
        (rootPc + 10) % 12,
        (rootPc + 2) % 12,
      ]
    case 'maj9':
      return [
        rootPc,
        (rootPc + 4) % 12,
        (rootPc + 7) % 12,
        (rootPc + 11) % 12,
        (rootPc + 2) % 12,
      ]
    case 'min9':
      return [
        rootPc,
        (rootPc + 3) % 12,
        (rootPc + 7) % 12,
        (rootPc + 10) % 12,
        (rootPc + 2) % 12,
      ]
    case 'major': {
      return [rootPc, (rootPc + 4) % 12, (rootPc + 7) % 12]
    }
    case 'minor': {
      return [rootPc, (rootPc + 3) % 12, (rootPc + 7) % 12]
    }
  }
}

/** @deprecated Use {@link chordPitchClasses}. */
export function triadPitchClasses(
  rootPc: number,
  quality: ChordQuality,
): readonly number[] {
  return chordPitchClasses(rootPc, quality)
}

export function resolveChord(
  chord: ChordFingering | ChordPresetId,
): ChordFingering {
  if (typeof chord === 'string') {
    const preset = CHORD_PRESETS[chord]
    if (!preset) {
      throw new Error(`Unknown chord preset: ${chord}`)
    }
    return preset
  }
  return chord
}

export { ROOT_NAMES }
