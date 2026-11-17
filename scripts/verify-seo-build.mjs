// Run after npm run build. No browser, deployed service or account is used.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, readdir, stat } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import { preview } from 'vite'
import { gameCases, pageCases, utilityCases } from './seoCases.mjs'

const read = (name) => readFile(new URL(`../dist/${name}`, import.meta.url), 'utf8')
const sw = await read('sw.js')
const entries = [...sw.matchAll(/\{url:"([^"]+)",revision:(?:"([^"]+)"|null)\}/g)].map(([, url, revision]) => ({ url, revision }))
assert.ok(entries.length > 200, 'All existing game assets should remain precached')
const documentNames = [...pageCases.map(page => `${page.path.slice(1)}index.html`), '404.html']
const previewBuild = (await read('index.html')).includes('data-indexing="noindex"')
const titles = new Set(), descriptions = new Set()
for (const name of documentNames) {
  const html = await read(name)
  const entry = entries.find(({ url }) => url === name)
  assert.ok(entry, `Missing precache document: ${name}`)
  assert.equal(entry.revision, createHash('md5').update(html).digest('hex'), `Workbox must hash final HTML: ${name}`)
  assert.doesNotMatch(html, /<!--seo-head-->|\/src\/main\.tsx|zen-solitaire-table|sessionId/)
  assert.equal((html.match(/<main\b/g) ?? []).length, 1)
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1)
  const title = html.match(/<title>(.*?)<\/title>/)[1], description = html.match(/name="description" content="([^"]+)"/)[1]
  assert.ok(!titles.has(title), name); titles.add(title)
  assert.ok(!descriptions.has(description), name); descriptions.add(description)
  const path = name === '404.html' ? '/404.html' : `/${name.replace(/index.html$/, '')}`
  const noindex = previewBuild || name === '404.html' || utilityCases.some(page => page.path === path)
  assert.ok(html.includes(`name="robots" content="${noindex ? 'noindex' : 'index'},follow"`), name)
  const canonicals = [...html.matchAll(/rel="canonical" href="([^"]+)"/g)]
  assert.equal(canonicals.length, name === '404.html' ? 0 : 1, name)
  if (name !== '404.html') assert.equal(canonicals[0][1], `https://playadfree.games${path}`)
  assert.match(html, /property="og:image" content="https:\/\/playadfree.games\/icons\/icon-512.png"/)
  assert.match(html, /name="twitter:card" content="summary"/)
  const json = html.match(/<script id="zenplay-structured-data" type="application\/ld\+json">(.*?)<\/script>/)?.[1]
  if (path === '/' || gameCases.some(page => page.path === path)) {
    const data = JSON.parse(json)
    assert.equal(data['@context'], 'https://schema.org')
    assert.doesNotMatch(json, /aggregateRating|"@type":"Review"|"@type":"Offer"|sessionId|displayName/)
    if (path === '/') {
      const items = data['@graph'].find(item => item['@type'] === 'CollectionPage').mainEntity.itemListElement
      assert.deepEqual(items.map(item => item.url), gameCases.map(page => `https://playadfree.games${page.path}`))
    } else {
      const game = data['@graph'].find(item => item['@type'] === 'VideoGame')
      assert.equal(game.url, `https://playadfree.games${path}`)
      assert.equal(game.isAccessibleForFree, true)
      assert.ok(html.includes('aria-label="Related games"'))
    }
  } else assert.equal(json, undefined)

}
assert.doesNotMatch(sw, /NavigationRoute|createHandlerBoundToURL/)
const files = await readdir(new URL('../dist/', import.meta.url))
const xml = await read('sitemap.xml')
assert.deepEqual([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]), ['https://playadfree.games/', ...gameCases.map(game => `https://playadfree.games${game.path}`)])
assert.equal(new Set([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1])).size, 9)
assert.doesNotMatch(xml, /settings|profile|support|install|404|lastmod/)
assert.equal((await read('_redirects')).trim().split('\n').length, 12)
assert.doesNotMatch(await read('_redirects'), /\*/)
assert.match(await read('robots.txt'), previewBuild ? /Disallow: \// : /Sitemap: https:\/\/playadfree.games\/sitemap.xml/)
if (previewBuild) assert.match(await read('_headers'), /^\/\*/)
else { assert.doesNotMatch(await read('_headers'), /^\/\*/); for (const page of utilityCases) assert.ok((await read('_headers')).includes(page.path)) }
assert.ok(entries.every(entry => !/auth\/v1|rest\/v1|functions\/v1/.test(entry.url)))
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
  const bodies = new Set()
  for (const name of documentNames) {
    const response = await fetch(`${origin}/${name}?__WB_REVISION__=acceptance`)
    assert.equal(response.status, 200, `Precache installation fetch: ${name}`)
    assert.equal(await response.text(), await read(name), `Precache response must be final HTML: ${name}`)
  }
  for (const page of pageCases) {
    const response = await fetch(origin + page.path)
    assert.equal(response.status, 200, page.path)
    assert.match(response.headers.get('content-type'), /text\/html/)
    assert.match(response.headers.get('x-robots-tag'), /noindex/)
    const html = await response.text()
    assert.ok(html.includes(`data-page="${page.path}"`), page.path)
    assert.ok(!bodies.has(html)); bodies.add(html)
  }
  for (const path of ['/games/missing/', '/not-a-page/', '/settings/missing/', '/games/Sudoku/']) {
    const response = await fetch(origin + path)
    assert.equal(response.status, 404, path)
    assert.doesNotMatch(await response.text(), /data-page="\/"|Solitaire game/)
  }
  for (const page of [...gameCases, ...utilityCases]) for (const path of [page.path.slice(0, -1), `${page.path}index.html`]) {
    const response = await fetch(`${origin}${path}?source=test`, { redirect: 'manual' })
    assert.equal(response.status, 301, path)
    assert.equal(response.headers.get('location'), `${page.path}?source=test`)
  }
  for (const [path, type] of [['/robots.txt', /text\/plain/], ['/sitemap.xml', /(?:application|text)\/xml/]]) {
    const response = await fetch(origin + path)
    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-type'), type)
  }
  console.log('PASS 13 distinct HTTP page documents, all aliases, 404s, sitemap/robots MIME and local preview noindex headers')
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
console.log(JSON.stringify({ finalHtmlBytes: Object.fromEntries(await Promise.all(documentNames.map(async name => [name, Buffer.byteLength(await read(name))]))), precacheEntries: entries.length, uniquePrecacheBytes: precacheBytes, assets: sizes }, null, 2))
console.log('PASS final HTML precache revisions, root PWA identity and existing lazy game assets; Cloudflare not tested')
