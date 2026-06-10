import {
  CHORD_PRESET_IDS,
  type ChordPresetId,
} from '../components/Fretboard'
import { fakeDb } from './fakeDb'

const COLLECTION = 'userSettings'
const DOC_ID = 'default'
const LEGACY_DISABLED_CHORDS_KEY = 'guitar-practice-disabled-chords'

export type UserSettings = {
  disabledChords: ChordPresetId[]
  /** When true, keys/progressions/chords filter to what you can play. */
  filterPlayableOnly: boolean
}

const DEFAULT_SETTINGS: UserSettings = {
  disabledChords: [],
  filterPlayableOnly: true,
}

const validChordIds = new Set<string>(CHORD_PRESET_IDS)

function sanitizeChordIds(ids: unknown): ChordPresetId[] {
  if (!Array.isArray(ids)) {
    return []
  }
  return ids.filter((id): id is ChordPresetId => validChordIds.has(id))
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

function migrateLegacySettings(settings: UserSettings): UserSettings {
  const legacy = loadLegacyDisabledChords()
  if (legacy.length === 0) {
    return settings
  }
  localStorage.removeItem(LEGACY_DISABLED_CHORDS_KEY)
  return {
    ...settings,
    disabledChords: legacy,
  }
}

export async function fetchUserSettings(): Promise<UserSettings> {
  const stored = await fakeDb.get<UserSettings>(COLLECTION, DOC_ID)
  if (stored == null) {
    const migrated = migrateLegacySettings(DEFAULT_SETTINGS)
    if (migrated.disabledChords.length > 0) {
      await fakeDb.put(COLLECTION, DOC_ID, migrated)
    }
    return migrated
  }
  return {
    disabledChords: sanitizeChordIds(stored.disabledChords),
    filterPlayableOnly:
      typeof stored.filterPlayableOnly === 'boolean'
        ? stored.filterPlayableOnly
        : DEFAULT_SETTINGS.filterPlayableOnly,
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
  }
  await fakeDb.put(COLLECTION, DOC_ID, next)
  return next
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
