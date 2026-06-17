#!/usr/bin/env node
/**
 * Copy dev user settings from db/db.json into the baked production snapshot.
 * Falls back to db/db.example.json when db.json is missing (e.g. CI).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dbPath = join(root, 'db', 'db.json')
const examplePath = join(root, 'db', 'db.example.json')
const outPath = join(root, 'src', 'data', 'siteState.json')

const sourcePath = existsSync(dbPath) ? dbPath : examplePath

if (!existsSync(sourcePath)) {
  console.error(
    'No db/db.json or db/db.example.json found. Run `npm run seed-default-state`.',
  )
  process.exit(1)
}

if (!existsSync(dbPath)) {
  console.warn('db/db.json not found — publishing from db/db.example.json')
}

const db = JSON.parse(readFileSync(sourcePath, 'utf8'))
const rows = db.userSettings
if (!Array.isArray(rows)) {
  console.error(`${sourcePath}: expected a userSettings array.`)
  process.exit(1)
}

const row = rows.find((r) => r?.id === 'default')
if (row == null || typeof row !== 'object') {
  console.error(`${sourcePath}: no userSettings row with id "default".`)
  process.exit(1)
}

const { id: _id, disabledChords: _legacyDisabled, ...rest } = row
const userSettings = { ...rest }

if (
  !Array.isArray(userSettings.knownChords) &&
  Array.isArray(row.disabledChords)
) {
  const disabledSet = new Set(row.disabledChords)
  const voicingSource = readFileSync(
    join(root, 'src', 'components', 'Fretboard', 'chordVoicings.ts'),
    'utf8',
  )
  const allIds = [...voicingSource.matchAll(/^\s+"([^"]+)":\s*\{/gm)].map(
    (m) => m[1],
  )
  userSettings.knownChords = allIds.filter((id) => !disabledSet.has(id))
}

writeFileSync(
  outPath,
  `${JSON.stringify({ userSettings }, null, 2)}\n`,
  'utf8',
)
console.log(`Wrote ${outPath} from ${sourcePath}`)
