import { ApiError, apiGet, apiPatch, apiPost } from '../api'
import {
  CHORD_PRESET_IDS,
  sanitizeFretCount,
  sanitizeScaleSelection,
  type ChordPresetId,
  type ScaleSelection,
} from '../components/Fretboard'

const SETTINGS_PATH = '/userSettings/default'
const DOC_ID = 'default'
const LEGACY_DISABLED_CHORDS_KEY = 'guitar-practice-disabled-chords'
const LEGACY_FAKE_DB_KEY = 'guitar-practice-fake-db'

export type UserSettings = {
  disabledChords: ChordPresetId[]
  /** When true, keys/progressions/chords filter to what you can play. */
  filterPlayableOnly: boolean
  displayNotes: boolean
  fretCount: number
  /** null = no scale overlay */
  scaleSelection: ScaleSelection
}

type UserSettingsRecord = UserSettings & { id: string }

const DEFAULT_SETTINGS: UserSettings = {
  disabledChords: [],
  filterPlayableOnly: false,
  displayNotes: false,
  fretCount: 6,
  scaleSelection: null,
}

const validChordIds = new Set<string>(CHORD_PRESET_IDS)

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
  const next: UserSettings = {
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
