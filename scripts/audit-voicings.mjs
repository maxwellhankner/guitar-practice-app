/**
 * One-off audit: pick lowest/easiest chords-db position per preset.
 * Usage: node scripts/audit-voicings.mjs [--write]
 */
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const VOICINGS_PATH = join(ROOT, 'src/components/Fretboard/chordVoicings.ts')
const DB_PATH = '/tmp/guitar-chords-db.json'

const ROOTS_BY_LENGTH = ['G#', 'F#', 'D#', 'C#', 'A#', 'G', 'F', 'E', 'D', 'C', 'B', 'A']
const APP_TO_DB = {
  'A#': 'Bb',
  'D#': 'Eb',
  'G#': 'Ab',
  'C#': 'Csharp',
  'F#': 'Fsharp',
}

const SUFFIX_MAP = {
  '': 'major',
  m: 'minor',
  dim: 'dim',
  dim7: 'dim7',
  sus2: 'sus2',
  sus4: 'sus4',
  7: '7',
  '7sus4': '7sus4',
  maj7: 'maj7',
  m7: 'm7',
  add9: 'add9',
  6: '6',
  m6: 'm6',
  9: '9',
  maj9: 'maj9',
  m9: 'm9',
}

/** Hand-tuned shapes to preserve (user-approved). */
const OVERRIDES = {
  Cadd9: {
    strings: ['x', 3, 2, 0, 3, 3],
    fingers: [null, 3, 2, null, 1, 4],
  },
  Fadd9: {
    strings: ['x', 'x', 3, 2, 1, 3],
    fingers: [null, null, 3, 2, 1, 4],
  },
}

function parseId(id) {
  for (const root of ROOTS_BY_LENGTH) {
    if (id.startsWith(root)) {
      const tail = id.slice(root.length)
      const dbSuffix = SUFFIX_MAP[tail]
      if (!dbSuffix) throw new Error(`Unknown suffix for ${id}`)
      return { appRoot: root, dbKey: APP_TO_DB[root] ?? root, dbSuffix, tail }
    }
  }
  throw new Error(`Cannot parse ${id}`)
}

function positionToVoicing(pos) {
  const { frets, fingers, baseFret = 1 } = pos
  const offset = baseFret - 1
  const strings = frets.map((f) => {
    if (f < 0) return 'x'
    return f + offset
  })
  const appFingers = fingers.map((finger, i) => {
    if (strings[i] === 'x' || strings[i] === 0) return null
    if (finger === 0) return null
    return finger
  })
  return { strings, fingers: appFingers }
}

function voicingKey({ strings, fingers }) {
  return `${strings.join(',')}|${fingers.map((f) => f ?? '.').join(',')}`
}

function scoreVoicing({ strings }) {
  const played = strings.filter((s) => s !== 'x').map(Number)
  if (played.length < 4) return Infinity

  const maxFret = Math.max(...played)
  const positive = played.filter((f) => f > 0)
  const minFret = positive.length ? Math.min(...positive) : 0
  const span = maxFret - minFret
  const openCount = played.filter((f) => f === 0).length

  let score = maxFret * 100 + span * 8 - openCount * 10
  if (maxFret > 7) score += 800
  else if (maxFret > 5) score += 80
  if (maxFret <= 4) score -= 20

  // Prefer fuller voicings (teaching defaults use 5–6 strings).
  if (played.length < 5) score += 120
  if (played.length < 6) score += 40

  // Reject sparse “cluster” shapes (e.g. Em7 0-x-0-0-0-x).
  if (maxFret === 0 && played.length < 5) score += 600

  // Penalize dead strings between sounded strings (low E → high E).
  let seenSound = false
  let seenGap = false
  for (const s of strings) {
    if (s !== 'x') {
      if (seenGap) score += 200
      seenSound = true
    } else if (seenSound) {
      seenGap = true
    }
  }

  return score
}

function pickBest(positions) {
  let best = null
  let bestScore = Infinity
  for (const pos of positions) {
    const v = positionToVoicing(pos)
    const s = scoreVoicing(v)
    if (s < bestScore) {
      bestScore = s
      best = v
    }
  }
  return best
}

function parseCurrentVoicings(source) {
  const entries = []
  const re =
    /"([^"]+)":\s*\{\s*strings:\s*\[([^\]]+)\],\s*fingers:\s*\[([^\]]+)\],?\s*\}/g
  let m
  while ((m = re.exec(source))) {
    const id = m[1]
    const strings = m[2].split(',').map((s) => {
      const t = s.trim().replace(/^['"]|['"]$/g, '')
      if (t === 'x') return 'x'
      return Number(t)
    })
    const fingers = m[3].split(',').map((s) => {
      const t = s.trim()
      if (t === 'null') return null
      return Number(t)
    })
    entries.push({ id, strings, fingers })
  }
  return entries
}

function formatVal(v) {
  if (v === 'x') return "'x'"
  if (v === null) return 'null'
  return String(v)
}

function formatVoicing(id, { strings, fingers }) {
  const s = strings.map(formatVal).join(', ')
  const f = fingers.map(formatVal).join(', ')
  return `  "${id}": {\n    strings: [${s}],\n    fingers: [${f}],\n  }`
}

function stringsLabel(strings) {
  return strings.map((s) => (s === 'x' ? 'x' : String(s))).join('')
}

const db = JSON.parse(readFileSync(DB_PATH, 'utf8'))
const source = readFileSync(VOICINGS_PATH, 'utf8')
const current = parseCurrentVoicings(source)
const changes = []
const missing = []
const next = []

for (const entry of current) {
  const { id, strings, fingers } = entry
  const currentVoicing = { strings, fingers }

  if (OVERRIDES[id]) {
    next.push({ id, ...OVERRIDES[id] })
    if (voicingKey(currentVoicing) !== voicingKey(OVERRIDES[id])) {
      changes.push({
        id,
        reason: 'override',
        from: stringsLabel(strings),
        to: stringsLabel(OVERRIDES[id].strings),
      })
    }
    continue
  }

  const { dbKey, dbSuffix } = parseId(id)
  const chord = db.chords[dbKey]?.find((c) => c.suffix === dbSuffix)
  if (!chord?.positions?.length) {
    missing.push(id)
    next.push({ id, ...currentVoicing })
    continue
  }

  const best = pickBest(chord.positions)
  const currentScore = scoreVoicing(currentVoicing)
  const bestScore = scoreVoicing(best)

  const currentMax = Math.max(
    ...currentVoicing.strings.filter((s) => s !== 'x').map(Number),
  )
  const bestMax = Math.max(...best.strings.filter((s) => s !== 'x').map(Number))

  const shouldReplace =
    voicingKey(currentVoicing) !== voicingKey(best) &&
    (currentMax >= 6 ||
      currentScore > bestScore + 200 ||
      (currentMax >= 4 && currentScore > bestScore + 80))

  if (!shouldReplace) {
    next.push({ id, ...currentVoicing })
    continue
  }

  next.push({ id, ...best })
  changes.push({
    id,
    reason: `db (score ${currentScore} → ${bestScore})`,
    from: stringsLabel(strings),
    to: stringsLabel(best.strings),
  })
}

console.log(`Audited ${current.length} voicings`)
console.log(`Changes: ${changes.length}`)
console.log(`Missing in chords-db: ${missing.length}${missing.length ? ': ' + missing.join(', ') : ''}`)
if (changes.length) {
  console.log('\n--- Changes ---')
  for (const c of changes) {
    console.log(`${c.id}: ${c.from} → ${c.to} (${c.reason})`)
  }
}

const header = `import type { ChordFingering } from './types'

/** One strings + fingers shape per chord preset id (low E to high E). */
export type ChordVoicing = {
  strings: ChordFingering['strings']
  fingers: NonNullable<ChordFingering['fingers']>
}

/** Open and barre shapes — sharp spellings only (A# not Bb, etc.). Grouped by root, then variant. */
export const CHORD_VOICINGS = {
`
const body = next.map((v) => formatVoicing(v.id, v)).join(',\n')
const footer = `
} as const satisfies Record<string, ChordVoicing>

export type ChordVoicingId = keyof typeof CHORD_VOICINGS
`

const output = header + body + footer

if (process.argv.includes('--write')) {
  writeFileSync(VOICINGS_PATH, output)
  console.log(`\nWrote ${VOICINGS_PATH}`)
} else {
  console.log('\nDry run — pass --write to apply')
}
