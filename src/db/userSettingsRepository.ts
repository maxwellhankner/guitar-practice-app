import { ApiError, apiGet, apiPatch, apiPost } from '../api'
import siteStateJson from '../data/siteState.json'
import {
  CHORD_PRESET_IDS,
  sanitizeFretCount,
  sanitizeScaleSelection,
  type ChordPresetId,
  type ScaleSelection,
} from '../components/Fretboard'
import type { FretboardOrientation } from '../components/Fretboard/types'
import {
  DEFAULT_ACCENT_COLOR_ID,
  sanitizeAccentColorId,
  type AccentColorId,
} from '../theme/accentColors'
import { defaultKnownChords } from './defaultKnownChords'

export type { FretboardOrientation } from '../components/Fretboard/types'
export type { AccentColorId } from '../theme/accentColors'

const SETTINGS_PATH = '/userSettings/default'
const DOC_ID = 'default'

/** Options panel share; diagram gets `1 - ratio` (capped at 50%). */
export const PANEL_SPLIT_MIN = 0.5
export const PANEL_SPLIT_MAX = 0.78
export const DEFAULT_HORIZONTAL_SPLIT = 0.65
export const DEFAULT_VERTICAL_SPLIT = 0.58

export type DiagramLayout = 'horizontal' | 'vertical'

export function clampSplitRatio(value: number): number {
  return Math.min(PANEL_SPLIT_MAX, Math.max(PANEL_SPLIT_MIN, value))
}

export type UserSettings = {
  /** Bumped when stored settings need one-time migration. */
  settingsVersion: number
  knownChords: ChordPresetId[]
  /** When true, keys/progressions/chords filter to known chords. */
  filterPlayableOnly: boolean
  displayNotes: boolean
  fretCount: number
  /** null = no scale overlay */
  scaleSelection: ScaleSelection
  diagramLayout: DiagramLayout
  horizontalSplitRatio: number
  verticalSplitRatio: number
  fretboardOrientation: FretboardOrientation
  panelsSwapped: boolean
  /** When true, the fretboard diagram panel is hidden; tools move to the options header. */
  diagramHidden: boolean
  /** Rainbow accent used for selections, borders, and highlights. */
  accentColorId: AccentColorId
}

/** Baked snapshot shipped with production builds (see scripts/publish-state.mjs). */
export type SiteState = {
  userSettings: UserSettings
}

type UserSettingsRecord = UserSettings & { id: string }

/** Legacy rows may still carry `disabledChords` until migrated. */
type UserSettingsRecordInput = Omit<Partial<UserSettings>, 'knownChords'> & {
  id: string
  knownChords?: unknown
  disabledChords?: unknown
}

const USER_SETTINGS_VERSION = 2

const DEFAULT_SETTINGS: UserSettings = {
  settingsVersion: USER_SETTINGS_VERSION,
  knownChords: defaultKnownChords(),
  filterPlayableOnly: false,
  displayNotes: false,
  fretCount: 6,
  scaleSelection: null,
  diagramLayout: 'horizontal',
  horizontalSplitRatio: DEFAULT_HORIZONTAL_SPLIT,
  verticalSplitRatio: DEFAULT_VERTICAL_SPLIT,
  fretboardOrientation: 'landscape',
  panelsSwapped: false,
  diagramHidden: false,
  accentColorId: DEFAULT_ACCENT_COLOR_ID,
}

const validChordIds = new Set<string>(CHORD_PRESET_IDS)

function isDevApiEnabled(): boolean {
  return import.meta.env.DEV
}

/** Production session overlay — lost on full page reload. */
let sessionSettings: UserSettings | null = null

function bakedUserSettings(): UserSettings {
  const raw = (siteStateJson as SiteState).userSettings
  return fromRecord({ id: DOC_ID, ...raw })
}

function mergeSettings(
  current: UserSettings,
  partial: Partial<UserSettings>,
): UserSettings {
  return {
    settingsVersion: partial.settingsVersion ?? current.settingsVersion,
    knownChords:
      partial.knownChords != null
        ? sanitizeChordIds(partial.knownChords)
        : current.knownChords,
    filterPlayableOnly:
      partial.filterPlayableOnly ?? current.filterPlayableOnly,
    displayNotes: partial.displayNotes ?? current.displayNotes,
    fretCount:
      partial.fretCount != null
        ? sanitizeFretCount(partial.fretCount)
        : current.fretCount,
    scaleSelection:
      partial.scaleSelection !== undefined
        ? sanitizeScaleSelection(partial.scaleSelection)
        : current.scaleSelection,
    diagramLayout:
      partial.diagramLayout != null
        ? sanitizeDiagramLayout(partial.diagramLayout)
        : current.diagramLayout,
    horizontalSplitRatio:
      partial.horizontalSplitRatio != null
        ? sanitizeSplitRatio(
            partial.horizontalSplitRatio,
            current.horizontalSplitRatio,
          )
        : current.horizontalSplitRatio,
    verticalSplitRatio:
      partial.verticalSplitRatio != null
        ? sanitizeSplitRatio(
            partial.verticalSplitRatio,
            current.verticalSplitRatio,
          )
        : current.verticalSplitRatio,
    fretboardOrientation:
      partial.fretboardOrientation != null
        ? sanitizeFretboardOrientation(partial.fretboardOrientation)
        : current.fretboardOrientation,
    panelsSwapped: partial.panelsSwapped ?? current.panelsSwapped,
    diagramHidden: partial.diagramHidden ?? current.diagramHidden,
    accentColorId:
      partial.accentColorId != null
        ? sanitizeAccentColorId(partial.accentColorId)
        : current.accentColorId,
  }
}

function sanitizeDiagramLayout(value: unknown): DiagramLayout {
  return value === 'vertical' ? 'vertical' : 'horizontal'
}

function sanitizeFretboardOrientation(value: unknown): FretboardOrientation {
  return value === 'portrait' ? 'portrait' : 'landscape'
}

function sanitizeSplitRatio(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }
  return clampSplitRatio(value)
}

function sanitizeChordIds(ids: unknown): ChordPresetId[] {
  if (!Array.isArray(ids)) {
    return []
  }
  return ids.filter((id): id is ChordPresetId => validChordIds.has(id))
}

function knownChordsFromRecord(record: UserSettingsRecordInput): ChordPresetId[] {
  const known = sanitizeChordIds(record.knownChords)
  if (known.length > 0) {
    return known
  }
  const disabled = sanitizeChordIds(record.disabledChords)
  if (disabled.length > 0) {
    const disabledSet = new Set(disabled)
    return CHORD_PRESET_IDS.filter((id) => !disabledSet.has(id))
  }
  return []
}

function fromRecord(record: UserSettingsRecordInput): UserSettings {
  return {
    settingsVersion:
      typeof record.settingsVersion === 'number'
        ? record.settingsVersion
        : 0,
    knownChords: knownChordsFromRecord(record),
    filterPlayableOnly:
      typeof record.filterPlayableOnly === 'boolean'
        ? record.filterPlayableOnly
        : DEFAULT_SETTINGS.filterPlayableOnly,
    displayNotes:
      typeof record.displayNotes === 'boolean'
        ? record.displayNotes
        : DEFAULT_SETTINGS.displayNotes,
    fretCount: sanitizeFretCount(record.fretCount),
    scaleSelection: sanitizeScaleSelection(record.scaleSelection),
    diagramLayout: sanitizeDiagramLayout(record.diagramLayout),
    horizontalSplitRatio: sanitizeSplitRatio(
      record.horizontalSplitRatio,
      DEFAULT_HORIZONTAL_SPLIT,
    ),
    verticalSplitRatio: sanitizeSplitRatio(
      record.verticalSplitRatio,
      DEFAULT_VERTICAL_SPLIT,
    ),
    fretboardOrientation: sanitizeFretboardOrientation(
      record.fretboardOrientation,
    ),
    panelsSwapped:
      typeof record.panelsSwapped === 'boolean'
        ? record.panelsSwapped
        : DEFAULT_SETTINGS.panelsSwapped,
    diagramHidden:
      typeof record.diagramHidden === 'boolean'
        ? record.diagramHidden
        : DEFAULT_SETTINGS.diagramHidden,
    accentColorId: sanitizeAccentColorId(record.accentColorId),
  }
}

function applyMigrations(settings: UserSettings): {
  settings: UserSettings
  changed: boolean
} {
  if (settings.settingsVersion >= USER_SETTINGS_VERSION) {
    return { settings, changed: false }
  }

  let next = settings
  if (next.knownChords.length === 0) {
    next = { ...next, knownChords: defaultKnownChords() }
  }
  return {
    settings: { ...next, settingsVersion: USER_SETTINGS_VERSION },
    changed: true,
  }
}

async function persistUserSettingsToApi(
  settings: UserSettings,
): Promise<UserSettings> {
  const record = await apiPatch<UserSettingsRecord>(SETTINGS_PATH, settings)
  return fromRecord(record)
}

async function createUserSettings(settings: UserSettings): Promise<UserSettings> {
  const record = await apiPost<UserSettingsRecord>('/userSettings', {
    id: DOC_ID,
    ...settings,
  })
  return fromRecord(record)
}

async function readUserSettingsFromApi(): Promise<UserSettings | null> {
  try {
    const record = await apiGet<UserSettingsRecordInput>(SETTINGS_PATH)
    return fromRecord(record)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null
    }
    throw err
  }
}

export async function fetchUserSettings(): Promise<UserSettings> {
  if (isDevApiEnabled()) {
    try {
      const stored = await readUserSettingsFromApi()
      if (stored != null) {
        const { settings, changed } = applyMigrations(stored)
        if (changed) {
          return persistUserSettingsToApi(settings)
        }
        return settings
      }
      return createUserSettings(DEFAULT_SETTINGS)
    } catch {
      return DEFAULT_SETTINGS
    }
  }

  if (sessionSettings == null) {
    sessionSettings = applyMigrations(bakedUserSettings()).settings
  }
  return sessionSettings
}

export async function saveUserSettings(
  partial: Partial<UserSettings>,
): Promise<UserSettings> {
  const current = await fetchUserSettings()
  const next = mergeSettings(current, partial)

  if (!isDevApiEnabled()) {
    sessionSettings = next
    return next
  }

  try {
    const record = await apiPatch<UserSettingsRecord>(SETTINGS_PATH, next)
    return fromRecord(record)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return createUserSettings(next)
    }
    throw err
  }
}

export async function setChordKnown(
  chordId: ChordPresetId,
  known: boolean,
): Promise<UserSettings> {
  const current = await fetchUserSettings()
  const set = new Set(current.knownChords)
  if (known) {
    set.add(chordId)
  } else {
    set.delete(chordId)
  }
  return saveUserSettings({ knownChords: [...set] })
}

export async function setFilterPlayableOnly(
  value: boolean,
): Promise<UserSettings> {
  return saveUserSettings({ filterPlayableOnly: value })
}

export async function setDisplayNotes(value: boolean): Promise<UserSettings> {
  return saveUserSettings({ displayNotes: value })
}

export async function setFretCount(value: number): Promise<UserSettings> {
  return saveUserSettings({ fretCount: value })
}

export async function setScaleSelection(
  value: ScaleSelection,
): Promise<UserSettings> {
  return saveUserSettings({ scaleSelection: value })
}

export async function setDiagramLayout(
  value: DiagramLayout,
): Promise<UserSettings> {
  return saveUserSettings({ diagramLayout: value })
}

export async function setHorizontalSplitRatio(
  value: number,
): Promise<UserSettings> {
  return saveUserSettings({
    horizontalSplitRatio: sanitizeSplitRatio(value, DEFAULT_HORIZONTAL_SPLIT),
  })
}

export async function setVerticalSplitRatio(
  value: number,
): Promise<UserSettings> {
  return saveUserSettings({
    verticalSplitRatio: sanitizeSplitRatio(value, DEFAULT_VERTICAL_SPLIT),
  })
}

export async function setFretboardOrientation(
  value: FretboardOrientation,
): Promise<UserSettings> {
  return saveUserSettings({ fretboardOrientation: value })
}

export async function setPanelsSwapped(value: boolean): Promise<UserSettings> {
  return saveUserSettings({ panelsSwapped: value })
}

export async function setDiagramHidden(value: boolean): Promise<UserSettings> {
  return saveUserSettings({ diagramHidden: value })
}

export async function setAccentColorId(
  value: AccentColorId,
): Promise<UserSettings> {
  return saveUserSettings({ accentColorId: sanitizeAccentColorId(value) })
}
