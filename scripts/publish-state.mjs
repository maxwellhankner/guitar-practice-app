#!/usr/bin/env node
/**
 * Copy dev user settings from db/db.json into the baked production snapshot.
 * Run before committing a deploy when you want GH Pages to reflect local edits.
 *
 *   npm run publish-state
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dbPath = join(root, 'db', 'db.json')
const outPath = join(root, 'src', 'data', 'siteState.json')

function readDb() {
  try {
    return JSON.parse(readFileSync(dbPath, 'utf8'))
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT') {
      console.error(
        'db/db.json not found. Run `npm run dev` once (or copy db/db.example.json to db/db.json).',
      )
      process.exit(1)
    }
    throw err
  }
}

const db = readDb()
const rows = db.userSettings
if (!Array.isArray(rows)) {
  console.error('db/db.json: expected a userSettings array.')
  process.exit(1)
}

const row = rows.find((r) => r?.id === 'default')
if (row == null || typeof row !== 'object') {
  console.error('db/db.json: no userSettings row with id "default".')
  process.exit(1)
}

const { id: _id, ...userSettings } = row
const siteState = { userSettings }

writeFileSync(outPath, `${JSON.stringify(siteState, null, 2)}\n`, 'utf8')
console.log(`Wrote ${outPath}`)
