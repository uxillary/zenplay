import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin, ResolvedConfig } from 'vite'
import type { renderDocument as renderDocumentType } from '../src/seo/render'

const redirectAlias = (request: IncomingMessage, response: ServerResponse): boolean => {
  const url = new URL(request.url ?? '/', 'http://localhost')
  const destination = url.pathname === '/index.html' ? '/'
    : url.pathname === '/games/solitaire' || url.pathname === '/games/solitaire/index.html' ? '/games/solitaire/' : null
  if (!destination) return false
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
        if (url.pathname === '/games/solitaire/') request.url = `/index.html${url.search}`
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        if (!redirectAlias(request, response)) next()
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
        await mkdir(resolve(output, 'games/solitaire'), { recursive: true })
        await Promise.all([
          writeFile(resolve(output, 'index.html'), renderDocument(template, '/')),
          writeFile(resolve(output, 'games/solitaire/index.html'), renderDocument(template, '/games/solitaire/')),
          writeFile(resolve(output, '404.html'), renderDocument(template, '/404.html')),
          writeFile(resolve(output, '_redirects'), '/games/solitaire /games/solitaire/ 301\n'),
        ])
      },
    },
  }
}
