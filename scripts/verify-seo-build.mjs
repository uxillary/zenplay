// Run after npm run build. No browser, deployed service or account is used.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, readdir, stat } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import { preview } from 'vite'

const read = (name) => readFile(new URL(`../dist/${name}`, import.meta.url), 'utf8')
const sw = await read('sw.js')
const entries = [...sw.matchAll(/\{url:"([^"]+)",revision:(?:"([^"]+)"|null)\}/g)].map(([, url, revision]) => ({ url, revision }))
assert.ok(entries.length > 200, 'All existing game assets should remain precached')
for (const name of ['index.html', 'games/solitaire/index.html', '404.html']) {
  const html = await read(name)
  const entry = entries.find(({ url }) => url === name)
  assert.ok(entry, `Missing precache document: ${name}`)
  assert.equal(entry.revision, createHash('md5').update(html).digest('hex'), `Workbox must hash final HTML: ${name}`)
  assert.doesNotMatch(html, /<!--seo-head-->|\/src\/main\.tsx|zen-solitaire-table|sessionId/)
  assert.equal((html.match(/<main\b/g) ?? []).length, 1)
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1)
}
assert.doesNotMatch(sw, /NavigationRoute|createHandlerBoundToURL/)
const files = await readdir(new URL('../dist/', import.meta.url))
assert.ok(!files.includes('sitemap.xml'), 'The eight-game sitemap must wait for the completed catalogue')
assert.ok(!files.includes('render.js'), 'The static renderer must not be deployed')
const manifest = JSON.parse(await read('manifest.webmanifest'))
assert.deepEqual([manifest.id, manifest.scope, manifest.start_url], ['/', '/', '/'])
const assets = await readdir(new URL('../dist/assets/', import.meta.url))
for (const game of ['Solitaire', 'Sudoku', 'Pairs', 'WordSearch', 'NoughtsCrosses', 'Fifteen', 'Mahjong', 'Flags']) {
  const chunk = assets.find((name) => name.startsWith(`${game}Screen-`) && name.endsWith('.js'))
  assert.ok(chunk && entries.some(({ url }) => url === `assets/${chunk}`), `Lazy/offline game chunk missing: ${game}`)
}

const server = await preview({ preview: { host: '127.0.0.1', port: 0, strictPort: true } })
try {
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`
  const home = await fetch(`${origin}/`)
  const solitaire = await fetch(`${origin}/games/solitaire/`)
  assert.equal(home.status, 200)
  assert.equal(solitaire.status, 200)
  const homeHtml = await home.text(), gameHtml = await solitaire.text()
  assert.notEqual(homeHtml, gameHtml)
  assert.match(homeHtml, /data-page="\/"/)
  assert.match(gameHtml, /data-page="\/games\/solitaire\/"/)
  assert.match(gameHtml, /Klondike Solitaire/)
  assert.match(solitaire.headers.get('content-type'), /text\/html/)
  for (const path of ['/games/missing/', '/not-a-page/', '/games/sudoku/', '/robots.txt', '/sitemap.xml']) {
    const response = await fetch(origin + path)
    assert.equal(response.status, 404, path)
    assert.doesNotMatch(await response.text(), /data-page="\/"|Solitaire game/)
  }
  for (const path of ['/games/solitaire', '/games/solitaire/index.html']) {
    const response = await fetch(`${origin}${path}?source=test`, { redirect: 'manual' })
    assert.equal(response.status, 301)
    assert.equal(response.headers.get('location'), '/games/solitaire/?source=test')
  }
  console.log('PASS local Vite preview: distinct public HTML, aliases, unknown routes and incomplete catalogue paths')
} finally {
  await new Promise((resolve) => server.httpServer.close(resolve))
}

const sizes = []
for (const file of assets.filter((name) => /^(?:index|App|SolitaireScreen)-.*\.(?:js|css)$/.test(name))) {
  const data = await readFile(new URL(`../dist/assets/${file}`, import.meta.url))
  sizes.push({ file, bytes: data.length, gzipBytes: gzipSync(data).length })
}
let precacheBytes = 0
for (const url of new Set(entries.map((entry) => entry.url))) precacheBytes += (await stat(new URL(`../dist/${url}`, import.meta.url))).size
console.log(JSON.stringify({ finalHtmlBytes: { home: Buffer.byteLength(await read('index.html')), solitaire: Buffer.byteLength(await read('games/solitaire/index.html')) }, precacheEntries: entries.length, uniquePrecacheBytes: precacheBytes, assets: sizes }, null, 2))
console.log('PASS final HTML precache revisions, root PWA identity and existing lazy game assets; Cloudflare not tested')
