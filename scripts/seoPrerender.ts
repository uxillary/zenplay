import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin, ResolvedConfig } from 'vite'
import { canonicalPathForRequest, pageRoutes } from '../src/app/navigation'
import { allowIndexing, headersTxt, redirectsTxt, robotsTxt, sitemapXml } from '../src/seo/discovery'
import type { renderDocument as renderDocumentType } from '../src/seo/render'

const redirectAlias = (request: IncomingMessage, response: ServerResponse): boolean => {
  const url = new URL(request.url ?? '/', 'http://localhost')
  const destination = canonicalPathForRequest(url.pathname)
  if (!destination || destination === url.pathname) return false
  response.writeHead(301, { Location: `${destination}${url.search}` })
  response.end()
  return true
}

export const seoPrerender = (): Plugin => {
  let config: ResolvedConfig
  return {
    name: 'zenplay-public-pages',
    configResolved(resolved) { config = resolved },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (redirectAlias(request, response)) return
        const url = new URL(request.url ?? '/', 'http://localhost')
        if (canonicalPathForRequest(url.pathname)) request.url = `/index.html${url.search}`
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        response.setHeader('X-Robots-Tag', 'noindex, follow')
        if (redirectAlias(request, response)) return
        const path = new URL(request.url ?? '/', 'http://localhost').pathname
        // Windows' case-insensitive filesystem must not turn invalid/case-mixed
        // page paths into successful game documents during local acceptance.
        if (path !== '/404.html' && !canonicalPathForRequest(path) && (!extname(path) || path.endsWith('.html'))) {
          void readFile(resolve(config.root, config.build.outDir, '404.html'), 'utf8').then(html => {
            response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
            response.end(request.method === 'HEAD' ? undefined : html)
          }).catch(next)
          return
        }
        next()
      })
    },
    // Vite writes the hashed assets/template first. This hook finishes all HTML
    // before vite-plugin-pwa's closeBundle generates Workbox revisions.
    writeBundle: {
      sequential: true,
      async handler() {
        const output = resolve(config.root, config.build.outDir)
        const { renderDocument } = await import(pathToFileURL(resolve(config.root, 'dist-ssr/render.js')).href) as { renderDocument: typeof renderDocumentType }
        const template = await readFile(resolve(output, 'index.html'), 'utf8')
        const indexing = allowIndexing({ mode: config.mode, cloudflare: process.env.CF_PAGES, branch: process.env.CF_PAGES_BRANCH,
          productionBranch: process.env.ZENPLAY_PRODUCTION_BRANCH, forceNoindex: process.env.ZENPLAY_NOINDEX })
        await Promise.all([...pageRoutes.map(async ({ path }) => {
          const destination = resolve(output, `.${path}`, 'index.html')
          await mkdir(resolve(output, `.${path}`), { recursive: true })
          await writeFile(destination, renderDocument(template, path, { noindex: !indexing }))
        }),
          writeFile(resolve(output, '404.html'), renderDocument(template, '/404.html', { noindex: !indexing })),
          writeFile(resolve(output, '_redirects'), redirectsTxt()),
          writeFile(resolve(output, '_headers'), headersTxt(indexing)),
          writeFile(resolve(output, 'robots.txt'), robotsTxt(indexing)),
          writeFile(resolve(output, 'sitemap.xml'), sitemapXml()),
        ])
      },
    },
  }
}
