#!/usr/bin/env node
/**
 * Write src/data/siteState.json and db/db.example.json from default known-chord seeds.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const knownPath = join(root, 'src', 'data', 'defaultKnownChordIds.json')

const knownIds = JSON.parse(readFileSync(knownPath, 'utf8'))

const userSettings = {
  id: 'default',
  settingsVersion: 3,
  knownChords: knownIds,
  filterPlayableOnly: false,
  displayNotes: false,
  fretCount: 6,
  scaleSelection: null,
  diagramLayout: 'horizontal',
  horizontalSplitRatio: 0.65,
  verticalSplitRatio: 0.58,
  fretboardOrientation: 'landscape',
  panelsSwapped: false,
  diagramHidden: false,
  accentColorId: 'gold',
  selectedKey: null,
  selectedChord: null,
  builtProgression: null,
}

const siteState = {
  userSettings: (({ id: _id, ...rest }) => rest)(userSettings),
}

writeFileSync(
  join(root, 'src', 'data', 'siteState.json'),
  `${JSON.stringify(siteState, null, 2)}\n`,
  'utf8',
)
writeFileSync(
  join(root, 'db', 'db.example.json'),
  `${JSON.stringify({ userSettings: [userSettings] }, null, 2)}\n`,
  'utf8',
)

console.log(`Seeded state: ${knownIds.length} known chords`)
