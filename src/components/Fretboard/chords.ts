import {
  EXTENDED_VOICINGS,
  type ExtendedVoicingId,
} from './extendedVoicings'
import type { ChordFingering } from './types'

function c(
  strings: ChordFingering['strings'],
  name: string,
  fingers?: NonNullable<ChordFingering['fingers']>,
): ChordFingering {
  return fingers != null ? { name, strings, fingers } : { name, strings }
}

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
  sus2: 'suspended 2nd',
  sus4: 'suspended 4th',
  dom7: '7th',
  maj7: 'major 7th',
  min7: 'minor 7th',
}

function extendedPresetName(id: ExtendedVoicingId): string {
  for (const rootName of ROOT_NAMES_BY_LENGTH) {
    if (!id.startsWith(rootName)) {
      continue
    }
    const suffix = id.slice(rootName.length)
    const label = EXTENDED_QUALITY_LABEL[
      suffix === 'dim'
        ? 'diminished'
        : suffix === '7'
          ? 'dom7'
          : suffix === 'maj7'
            ? 'maj7'
            : suffix === 'm7'
              ? 'min7'
              : (suffix as 'sus2' | 'sus4')
    ]
    return `${rootName} ${label}`
  }
  throw new Error(`Unknown extended voicing id: ${id}`)
}

function buildExtendedChordPresets(): Record<string, ChordFingering> {
  const presets: Record<string, ChordFingering> = {}
  for (const id of Object.keys(EXTENDED_VOICINGS) as ExtendedVoicingId[]) {
    const voicing = EXTENDED_VOICINGS[id]
    presets[id] = c(
      voicing.strings,
      extendedPresetName(id),
      voicing.fingers,
    )
  }
  return presets
}

/** Open and barre shapes — sharp spellings only (A# not Bb, etc.). */
const MAJOR_MINOR_CHORD_PRESETS = {
  A: c(['x', 0, 2, 2, 2, 0], 'A major', [null, null, 1, 2, 3, null]),
  'A#': c(['x', 1, 3, 3, 3, 1], 'A# major', [null, 1, 3, 4, 3, 1]),
  B: c(['x', 2, 4, 4, 4, 2], 'B major', [null, 1, 3, 4, 3, 1]),
  C: c(['x', 3, 2, 0, 1, 0], 'C major', [null, 3, 2, null, 1, null]),
  'C#': c(['x', 4, 6, 6, 6, 4], 'C# major', [null, 1, 3, 4, 3, 1]),
  D: c(['x', 'x', 0, 2, 3, 2], 'D major', [null, null, null, 1, 3, 2]),
  'D#': c(['x', 6, 8, 8, 8, 6], 'D# major', [null, 1, 3, 4, 3, 1]),
  E: c([0, 2, 2, 1, 0, 0], 'E major', [null, 2, 3, 1, null, null]),
  F: c([1, 3, 3, 2, 1, 1], 'F major', [1, 3, 4, 2, 1, 1]),
  'F#': c([2, 4, 4, 3, 2, 2], 'F# major', [1, 3, 4, 2, 1, 1]),
  G: c([3, 2, 0, 0, 0, 3], 'G major', [3, 2, null, null, null, 4]),
  'G#': c([4, 6, 6, 5, 4, 4], 'G# major', [1, 3, 4, 2, 1, 1]),
  Am: c(['x', 0, 2, 2, 1, 0], 'A minor', [null, null, 3, 2, 1, null]),
  'A#m': c(['x', 1, 3, 3, 1, 1], 'A# minor', [null, 1, 3, 4, 2, 1]),
  Bm: c(['x', 2, 4, 4, 3, 2], 'B minor', [null, 1, 3, 4, 2, 1]),
  Cm: c(['x', 3, 5, 5, 4, 3], 'C minor', [null, 1, 3, 4, 2, 1]),
  'C#m': c(['x', 4, 6, 6, 4, 4], 'C# minor', [null, 1, 3, 4, 2, 1]),
  Dm: c(['x', 'x', 0, 2, 3, 1], 'D minor', [null, null, null, 2, 3, 1]),
  'D#m': c(['x', 6, 8, 8, 6, 6], 'D# minor', [null, 1, 3, 4, 2, 1]),
  Em: c([0, 2, 2, 0, 0, 0], 'E minor', [null, 2, 3, null, null, null]),
  Fm: c([1, 3, 3, 1, 1, 1], 'F minor', [1, 3, 4, 1, 1, 1]),
  'F#m': c(['x', 2, 4, 4, 2, 2], 'F# minor', [null, 1, 3, 4, 2, 1]),
  Gm: c([3, 5, 5, 3, 3, 3], 'G minor', [1, 3, 4, 1, 1, 1]),
  'G#m': c(['x', 4, 6, 6, 4, 4], 'G# minor', [null, 1, 3, 4, 2, 1]),
} as const satisfies Record<string, ChordFingering>

const EXTENDED_CHORD_PRESETS = buildExtendedChordPresets()

export const CHORD_PRESETS = {
  ...MAJOR_MINOR_CHORD_PRESETS,
  ...EXTENDED_CHORD_PRESETS,
} as const satisfies Record<string, ChordFingering>

export type ChordPresetId = keyof typeof CHORD_PRESETS

export type ChordQuality =
  | 'major'
  | 'minor'
  | 'diminished'
  | 'sus2'
  | 'sus4'
  | 'dom7'
  | 'maj7'
  | 'min7'

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

export const CHORD_SUS2_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}sus2`,
) as readonly `${RootName}sus2`[] & readonly ChordPresetId[]

export const CHORD_SUS4_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}sus4`,
) as readonly `${RootName}sus4`[] & readonly ChordPresetId[]

export const CHORD_DOM7_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}7`,
) as readonly `${RootName}7`[] & readonly ChordPresetId[]

export const CHORD_MAJ7_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}maj7`,
) as readonly `${RootName}maj7`[] & readonly ChordPresetId[]

export const CHORD_MIN7_IDS = ROOT_NAMES.map(
  (rootName) => `${rootName}m7`,
) as readonly `${RootName}m7`[] & readonly ChordPresetId[]

/** Column order within each root group in the chord picker (top → bottom). */
export const CHORD_VARIANT_ORDER = [
  'major',
  'minor',
  'diminished',
  'sus2',
  'sus4',
  'dom7',
  'maj7',
  'min7',
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
    case 'sus2':
      return `${rootName}sus2` as ChordPresetId
    case 'sus4':
      return `${rootName}sus4` as ChordPresetId
    case 'dom7':
      return `${rootName}7` as ChordPresetId
    case 'maj7':
      return `${rootName}maj7` as ChordPresetId
    case 'min7':
      return `${rootName}m7` as ChordPresetId
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
  return chordId.endsWith('dim')
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
    if (suffix === 'm') {
      return { rootName, rootPc, quality: 'minor' }
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
    if (suffix === '7') {
      return { rootName, rootPc, quality: 'dom7' }
    }
    if (suffix === 'maj7') {
      return { rootName, rootPc, quality: 'maj7' }
    }
    if (suffix === 'm7') {
      return { rootName, rootPc, quality: 'min7' }
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
