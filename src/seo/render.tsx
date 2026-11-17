import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import { notFoundNavigation, parseAppPath } from '../app/navigation'
import { PublicShell } from './PublicShell'
import { metadataForNavigation, metadataTags, serializeStructuredData, structuredDataForNavigation } from './publicContent'

export const renderDocument = (template: string, path: string, options: { noindex?: boolean } = {}): string => {
  if (!template.includes('<!--seo-head-->') || !template.includes('<div id="root"></div>')) {
    throw new Error('The SEO renderer requires the unrendered Vite HTML template.')
  }
  const navigation = parseAppPath(path) ?? notFoundNavigation
  const page = metadataForNavigation(navigation)
  const data = structuredDataForNavigation(navigation)
  const head = renderToStaticMarkup(<>
    {page.canonical ? <link rel="canonical" href={page.canonical} /> : null}
    {metadataTags(page, page.noindex || options.noindex).filter(tag => tag.key !== 'description').map(({ attribute, key, content }) => <meta key={key} {...{ [attribute]: key }} content={content} />)}
    {data ? <script id="zenplay-structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(data) }} /> : null}
  </>)
  return template
    .replace('<html lang="en">', `<html lang="en" data-indexing="${options.noindex ? 'noindex' : 'public'}">`)
    .replace(/<title>[^<]*<\/title>/, renderToStaticMarkup(<title>{page.title}</title>))
    .replace(/<meta name="description"[^>]*\/>/, renderToStaticMarkup(<meta name="description" content={page.description} />))
    .replace('<!--seo-head-->', head)
    .replace('<div id="root"></div>', `<div id="root" data-page="${path}">${renderToString(<PublicShell navigation={navigation} />)}</div>`)
}
