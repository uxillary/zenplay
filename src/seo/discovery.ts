import { pageRoutes } from '../app/navigation.ts'
import { canonicalOrigin, metadataForNavigation } from './publicContent.ts'

export const indexableRoutes = pageRoutes.filter(({ navigation }) => !metadataForNavigation(navigation).noindex)

export const allowIndexing = ({ mode, cloudflare, branch, productionBranch, forceNoindex }: {
  mode: string; cloudflare?: string; branch?: string; productionBranch?: string; forceNoindex?: string
}): boolean => mode === 'production' && forceNoindex !== '1'
  && (cloudflare !== '1' || Boolean(productionBranch && branch === productionBranch))

export const sitemapXml = (): string => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexableRoutes.map(({ path }) => `  <url><loc>${canonicalOrigin}${path}</loc></url>`).join('\n')}\n</urlset>\n`

export const robotsTxt = (indexing: boolean): string => indexing
  ? `User-agent: *\nAllow: /\n\nSitemap: ${canonicalOrigin}/sitemap.xml\n`
  : 'User-agent: *\nDisallow: /\n'

export const redirectsTxt = (): string => pageRoutes.filter(({ path }) => path !== '/').map(({ path }) => `${path.slice(0, -1)} ${path} 301`).join('\n') + '\n'

export const headersTxt = (indexing: boolean): string => indexing
  ? [...pageRoutes.filter(({ navigation }) => metadataForNavigation(navigation).noindex).map(({ path }) => path), '/404.html']
    .map(path => `${path}\n  X-Robots-Tag: noindex, follow\n`).join('\n')
  : '/*\n  X-Robots-Tag: noindex, follow\n'
