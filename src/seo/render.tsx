import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import { notFoundNavigation, parseAppPath } from '../app/navigation'
import { PublicShell } from './PublicShell'
import { metadataForNavigation } from './publicContent'

export const renderDocument = (template: string, path: '/' | '/games/solitaire/' | '/404.html'): string => {
  if (!template.includes('<!--seo-head-->') || !template.includes('<div id="root"></div>')) {
    throw new Error('The SEO renderer requires the unrendered Vite HTML template.')
  }
  const navigation = parseAppPath(path) ?? notFoundNavigation
  const page = metadataForNavigation(navigation)
  const head = renderToStaticMarkup(<>
    {page.canonical ? <link rel="canonical" href={page.canonical} /> : null}
    <meta name="robots" content={page.noindex ? 'noindex,follow' : 'index,follow'} />
  </>)
  return template
    .replace(/<title>[^<]*<\/title>/, renderToStaticMarkup(<title>{page.title}</title>))
    .replace(/<meta name="description"[^>]*\/>/, renderToStaticMarkup(<meta name="description" content={page.description} />))
    .replace('<!--seo-head-->', head)
    .replace('<div id="root"></div>', `<div id="root" data-page="${path}">${renderToString(<PublicShell navigation={navigation} />)}</div>`)
}
