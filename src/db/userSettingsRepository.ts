import { ApiError, apiGet, apiPatch, apiPost } from '../api'
import {
  CHORD_PRESET_IDS,
  sanitizeFretCount,
  sanitizeScaleSelection,
  type ChordPresetId,
  type ScaleSelection,
} from '../components/Fretboard'
import type { FretboardOrientation } from '../components/Fretboard/types'

export type { FretboardOrientation } from '../components/Fretboard/types'

const SETTINGS_PATH = '/userSettings/default'
const DOC_ID = 'default'
const LEGACY_DISABLED_CHORDS_KEY = 'guitar-practice-disabled-chords'
const LEGACY_FAKE_DB_KEY = 'guitar-practice-fake-db'

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
  disabledChords: ChordPresetId[]
  /** When true, keys/progressions/chords filter to what you can play. */
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
}

type UserSettingsRecord = UserSettings & { id: string }

const DEFAULT_SETTINGS: UserSettings = {
  disabledChords: [],
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
}

const validChordIds = new Set<string>(CHORD_PRESET_IDS)

/** json-server is dev-only; production uses in-memory defaults. */
function isSettingsApiEnabled(): boolean {
  return import.meta.env.DEV
}

let inMemorySettings: UserSettings | null = null

function getInMemorySettings(): UserSettings {
  if (inMemorySettings == null) {
    inMemorySettings = migrateLegacySettings({ ...DEFAULT_SETTINGS })
  }
  return inMemorySettings
}

function mergeSettings(
  current: UserSettings,
  partial: Partial<UserSettings>,
): UserSettings {
  return {
    disabledChords:
      partial.disabledChords != null
        ? sanitizeChordIds(partial.disabledChords)
        : current.disabledChords,
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

function fromRecord(record: UserSettingsRecord): UserSettings {
  return {
    disabledChords: sanitizeChordIds(record.disabledChords),
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
  }
}

function loadLegacyDisabledChords(): ChordPresetId[] {
  try {
    const raw = localStorage.getItem(LEGACY_DISABLED_CHORDS_KEY)
    if (raw == null) {
      return []
    }
    const parsed: unknown = JSON.parse(raw)
    return sanitizeChordIds(parsed)
  } catch {
    return []
  }
}

function loadLegacyFakeDbSettings(): UserSettings | null {
  try {
    const raw = localStorage.getItem(LEGACY_FAKE_DB_KEY)
    if (raw == null) {
      return null
    }
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed !== 'object' ||
      parsed == null ||
      !('rows' in parsed) ||
      !Array.isArray((parsed as { rows: unknown[] }).rows)
    ) {
      return null
    }
    const row = (parsed as { rows: { collection: string; id: string; data: unknown }[] }).rows.find(
      (r) => r.collection === 'userSettings' && r.id === DOC_ID,
    )
    if (row?.data == null || typeof row.data !== 'object') {
      return null
    }
    const data = row.data as UserSettings
    return {
      disabledChords: sanitizeChordIds(data.disabledChords),
      filterPlayableOnly:
        typeof data.filterPlayableOnly === 'boolean'
          ? data.filterPlayableOnly
          : DEFAULT_SETTINGS.filterPlayableOnly,
      displayNotes:
        typeof data.displayNotes === 'boolean'
          ? data.displayNotes
          : DEFAULT_SETTINGS.displayNotes,
      fretCount: sanitizeFretCount(data.fretCount),
      scaleSelection: sanitizeScaleSelection(data.scaleSelection),
      diagramLayout: sanitizeDiagramLayout(data.diagramLayout),
      horizontalSplitRatio: sanitizeSplitRatio(
        data.horizontalSplitRatio,
        DEFAULT_HORIZONTAL_SPLIT,
      ),
      verticalSplitRatio: sanitizeSplitRatio(
        data.verticalSplitRatio,
        DEFAULT_VERTICAL_SPLIT,
      ),
      fretboardOrientation: sanitizeFretboardOrientation(
        data.fretboardOrientation,
      ),
      panelsSwapped:
        typeof data.panelsSwapped === 'boolean'
          ? data.panelsSwapped
          : DEFAULT_SETTINGS.panelsSwapped,
      diagramHidden:
        typeof data.diagramHidden === 'boolean'
          ? data.diagramHidden
          : DEFAULT_SETTINGS.diagramHidden,
    }
  } catch {
    return null
  }
}

function clearLegacyStorage(): void {
  localStorage.removeItem(LEGACY_DISABLED_CHORDS_KEY)
  localStorage.removeItem(LEGACY_FAKE_DB_KEY)
}

function migrateLegacySettings(settings: UserSettings): UserSettings {
  const fromFakeDb = loadLegacyFakeDbSettings()
  if (fromFakeDb != null) {
    clearLegacyStorage()
    return fromFakeDb
  }

  const legacy = loadLegacyDisabledChords()
  if (legacy.length === 0) {
    return settings
  }
  clearLegacyStorage()
  return {
    ...settings,
    disabledChords: legacy,
  }
}

async function createUserSettings(settings: UserSettings): Promise<UserSettings> {
  const record = await apiPost<UserSettingsRecord>('/userSettings', {
    id: DOC_ID,
    ...settings,
  })
  return fromRecord(record)
}

async function readUserSettings(): Promise<UserSettings | null> {
  try {
    const record = await apiGet<UserSettingsRecord>(SETTINGS_PATH)
    return fromRecord(record)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null
    }
    throw err
  }
}

export async function fetchUserSettings(): Promise<UserSettings> {
  if (!isSettingsApiEnabled()) {
    return getInMemorySettings()
  }

  try {
    const stored = await readUserSettings()
    if (stored != null) {
      return stored
    }

    const migrated = migrateLegacySettings(DEFAULT_SETTINGS)
    return createUserSettings(migrated)
  } catch {
    return migrateLegacySettings(DEFAULT_SETTINGS)
  }
}

export async function saveUserSettings(
  partial: Partial<UserSettings>,
): Promise<UserSettings> {
  const current = await fetchUserSettings()
  const next = mergeSettings(current, partial)

  if (!isSettingsApiEnabled()) {
    inMemorySettings = next
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

export async function setChordDisabled(
  chordId: ChordPresetId,
  disabled: boolean,
): Promise<UserSettings> {
  const current = await fetchUserSettings()
  const set = new Set(current.disabledChords)
  if (disabled) {
    set.add(chordId)
  } else {
    set.delete(chordId)
  }
  return saveUserSettings({ disabledChords: [...set] })
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
