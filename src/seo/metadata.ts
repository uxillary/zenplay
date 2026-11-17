import type { AppNavigation } from '../app/navigation'
import { metadataForNavigation, metadataTags, serializeStructuredData, structuredDataForNavigation } from './publicContent'

export const updatePageMetadata = (navigation: AppNavigation) => {
  const page = metadataForNavigation(navigation)
  document.title = page.title
  for (const { attribute, key, content } of metadataTags(page, page.noindex || document.documentElement.dataset.indexing === 'noindex')) {
    let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute(attribute, key)
      document.head.append(element)
    }
    element.content = content
  }
  const previousUrl = document.querySelector('meta[property="og:url"]')
  if (!page.canonical) previousUrl?.remove()
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!page.canonical) canonical?.remove()
  else {
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical) }
    canonical.href = page.canonical
  }
  const data = structuredDataForNavigation(navigation)
  let script = document.getElementById('zenplay-structured-data')
  if (!data) script?.remove()
  else {
    if (!script) { script = document.createElement('script'); script.id = 'zenplay-structured-data'; script.setAttribute('type', 'application/ld+json'); document.head.append(script) }
    script.textContent = serializeStructuredData(data)
  }
}
