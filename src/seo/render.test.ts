import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { createServer, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import { homeNavigation, solitaireNavigation } from '../app/navigation.ts'

let server: ViteDevServer
let renderDocument: typeof import('./render.tsx').renderDocument
const template = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')

before(async () => {
  server = await createServer({ configFile: false, plugins: [react()], optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  renderDocument = (await server.ssrLoadModule('/src/seo/render.tsx')).renderDocument
})
after(async () => { await server?.close() })

test('public HTML is deterministic, distinct and contains useful content without a board or private state', () => {
  const home = renderDocument(template, '/')
  const solitaire = renderDocument(template, '/games/solitaire/')
  assert.equal(renderDocument(template, '/games/solitaire/'), solitaire)
  assert.notEqual(home, solitaire)
  assert.match(home, /href="\/games\/solitaire\/"/)
  assert.match(solitaire, /Klondike Solitaire/)
  assert.match(solitaire, /Only a King may start an empty column/)
  assert.match(solitaire, /aria-label="Solitaire game"/)
  assert.match(solitaire, /role="status" aria-live="polite">Loading game/)
  assert.match(solitaire, /href="\/"/)
  for (const html of [home, solitaire]) {
    assert.equal((html.match(/<main\b/g) ?? []).length, 1)
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1)
    assert.equal((html.match(/<title>/g) ?? []).length, 1)
    assert.equal((html.match(/name="description"/g) ?? []).length, 1)
    assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1)
    assert.match(html, /<noscript>.*Playing games needs JavaScript/)
    assert.doesNotMatch(html, /zen-solitaire-table|zen-playing-card|sessionId|zenplay-settings|publishableKey|<!--seo-head-->/)
  }
  assert.match(solitaire, /<title>Free Solitaire, No Adverts — ZenPlay<\/title>/)
  assert.match(solitaire, /rel="canonical" href="https:\/\/playadfree.games\/games\/solitaire\/"/)
  assert.match(home, /rel="canonical" href="https:\/\/playadfree.games\/"/)
})

test('the client boundary produces exactly the same first-render markup as the static shell', async () => {
  const { PublicShell } = await server.ssrLoadModule('/src/seo/PublicShell.tsx')
  const { Bootstrap } = await server.ssrLoadModule('/src/seo/Bootstrap.tsx')
  for (const navigation of [homeNavigation, solitaireNavigation]) {
    assert.equal(renderToString(createElement(Bootstrap, { navigation })), renderToString(createElement(PublicShell, { navigation })))
  }
})

test('missing pages are noindex and cannot claim a game or homepage canonical', () => {
  const html = renderDocument(template, '/404.html')
  assert.match(html, /Page not found/)
  assert.match(html, /name="robots" content="noindex,follow"/)
  assert.doesNotMatch(html, /rel="canonical"|Solitaire game|zen-solitaire-table/)
})

test('the renderer rejects an already-rendered template', () => {
  assert.throws(() => renderDocument(renderDocument(template, '/'), '/'), /unrendered Vite HTML template/)
})
