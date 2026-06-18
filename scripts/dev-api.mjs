#!/usr/bin/env node
/**
 * Local settings API for dev. Listens on localhost only; Vite proxies /api → here.
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import { watch } from 'chokidar'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { NormalizedAdapter } from 'json-server/lib/adapters/normalized-adapter.js'
import { Observer } from 'json-server/lib/adapters/observer.js'
import { createApp } from 'json-server/lib/app.js'
import { App } from '@tinyhttp/app'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const file = join(root, 'db', 'db.json')
const example = join(root, 'db', 'db.example.json')
const port = 3001
const host = '127.0.0.1'

if (!existsSync(file)) {
  copyFileSync(example, file)
}

if (readFileSync(file, 'utf-8').trim() === '') {
  writeFileSync(file, '{}')
}

const adapter = new JSONFile(file)
const observer = new Observer(new NormalizedAdapter(adapter))
const db = new Low(observer, {})
await db.read()

const api = createApp(db, { logger: false })
const app = new App()

/** @type {import('node:http').ServerResponse[]} */
const sseClients = []

function broadcastSettingsChanged() {
  const payload = 'data: settings-updated\n\n'
  for (const res of sseClients) {
    res.write(payload)
  }
}

app.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })
  res.write(': connected\n\n')
  sseClients.push(res)
  req.on('close', () => {
    const index = sseClients.indexOf(res)
    if (index >= 0) {
      sseClients.splice(index, 1)
    }
  })
})

let writing = false

app.use(api)

app.listen(port, () => {}, host)

observer.onWriteStart = () => {
  writing = true
}

observer.onWriteEnd = () => {
  writing = false
  broadcastSettingsChanged()
}

setInterval(() => {
  for (const res of sseClients) {
    res.write(': ping\n\n')
  }
}, 25_000)

if (process.env.NODE_ENV !== 'production') {
  watch(file).on('change', () => {
    if (!writing) {
      db.read()
        .then(() => {
          broadcastSettingsChanged()
        })
        .catch((e) => {
          if (e instanceof SyntaxError) {
            console.log(
              chalk.red(`Error parsing ${file}: ${e.message}`),
            )
            return
          }
          console.log(e)
        })
    }
  })
}
