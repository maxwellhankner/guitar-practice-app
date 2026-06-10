const DB_STORAGE_KEY = 'guitar-practice-fake-db'

type DbRow = {
  collection: string
  id: string
  data: unknown
  updatedAt: string
}

type DbFile = {
  version: 1
  rows: DbRow[]
}

function readDb(): DbFile {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY)
    if (raw == null) {
      return { version: 1, rows: [] }
    }
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed !== 'object' ||
      parsed == null ||
      !('version' in parsed) ||
      !('rows' in parsed) ||
      !Array.isArray((parsed as DbFile).rows)
    ) {
      return { version: 1, rows: [] }
    }
    return parsed as DbFile
  } catch {
    return { version: 1, rows: [] }
  }
}

function writeDb(db: DbFile): void {
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db))
}

function rowKey(collection: string, id: string): string {
  return `${collection}::${id}`
}

/** Simulated database — Promise API backed by localStorage. */
export const fakeDb = {
  async get<T>(collection: string, id: string): Promise<T | null> {
    await Promise.resolve()
    const db = readDb()
    const row = db.rows.find(
      (r) => rowKey(r.collection, r.id) === rowKey(collection, id),
    )
    return (row?.data as T | undefined) ?? null
  },

  async put<T>(collection: string, id: string, data: T): Promise<T> {
    await Promise.resolve()
    const db = readDb()
    const key = rowKey(collection, id)
    const index = db.rows.findIndex(
      (r) => rowKey(r.collection, r.id) === key,
    )
    const row: DbRow = {
      collection,
      id,
      data,
      updatedAt: new Date().toISOString(),
    }
    if (index >= 0) {
      db.rows[index] = row
    } else {
      db.rows.push(row)
    }
    writeDb(db)
    return data
  },

  async patch<T extends object>(
    collection: string,
    id: string,
    partial: Partial<T>,
    defaults: T,
  ): Promise<T> {
    const current = (await fakeDb.get<T>(collection, id)) ?? defaults
    const next = { ...current, ...partial }
    return fakeDb.put(collection, id, next)
  },
}
