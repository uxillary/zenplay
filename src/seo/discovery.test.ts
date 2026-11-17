import assert from 'node:assert/strict'
import test from 'node:test'
import { allowIndexing, headersTxt, indexableRoutes, redirectsTxt, robotsTxt, sitemapXml } from './discovery.ts'
import { serializeStructuredData } from './publicContent.ts'

test('sitemap has exactly Home and eight canonical game URLs', () => {
  assert.equal(indexableRoutes.length, 9)
  assert.equal((sitemapXml().match(/<loc>/g) ?? []).length, 9)
  assert.doesNotMatch(sitemapXml(), /settings|profile|support|install|404|lastmod/)
  assert.match(robotsTxt(true), /Sitemap: https:\/\/playadfree.games\/sitemap.xml/)
  const redirects = redirectsTxt().trim().split('\n')
  assert.equal(redirects.length, 12)
  assert.ok(redirects.every(line => line.endsWith('/ 301') && !line.includes('*')))
})

test('preview indexing fails closed on unconfirmed Cloudflare branches', () => {
  assert.equal(allowIndexing({ mode: 'production' }), true)
  assert.equal(allowIndexing({ mode: 'development' }), false)
  assert.equal(allowIndexing({ mode: 'production', forceNoindex: '1' }), false)
  assert.equal(allowIndexing({ mode: 'production', cloudflare: '1', branch: 'main' }), false)
  assert.equal(allowIndexing({ mode: 'production', cloudflare: '1', branch: 'preview', productionBranch: 'main' }), false)
  assert.equal(allowIndexing({ mode: 'production', cloudflare: '1', branch: 'main', productionBranch: 'main' }), true)
  assert.match(headersTxt(false), /^\/\*\n {2}X-Robots-Tag: noindex/)
  assert.doesNotMatch(headersTxt(true), /^\/\*/)
  assert.match(robotsTxt(false), /Disallow: \//)
})

test('JSON-LD escapes script delimiters and retains exact data after JSON parsing', () => {
  const data = { text: '</script><script>alert(1)</script>' }
  const serialized = serializeStructuredData(data)
  assert.doesNotMatch(serialized, /</)
  assert.deepEqual(JSON.parse(serialized), data)
})
