import type { PageMetadata } from './publicContent'

export const updatePageMetadata = (page: PageMetadata) => {
  document.title = page.title
  for (const [name, content] of [['description', page.description], ['robots', page.noindex ? 'noindex,follow' : 'index,follow']]) {
    let element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
    if (!element) {
      element = document.createElement('meta')
      element.name = name
      document.head.append(element)
    }
    element.content = content
  }
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!page.canonical) canonical?.remove()
  else {
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href = page.canonical
  }
}
