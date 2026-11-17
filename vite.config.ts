import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { pageRoutes } from './src/app/navigation'
import { seoPrerender } from './scripts/seoPrerender'

export default defineConfig(({ isSsrBuild }) => ({
  appType: 'mpa',
  build: isSsrBuild ? { copyPublicDir: false } : undefined,
  plugins: [
    react(),
    tailwindcss(),
    ...(isSsrBuild ? [] : [seoPrerender()]),
    VitePWA({
      disable: isSsrBuild,
      registerType: 'prompt',
      includeAssets: [
        'icons/icon-192.svg',
        'icons/icon-512.svg',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/icon-512-maskable.png',
        'icons/apple-touch-icon.png',
      ],
      manifest: {
        name: 'ZenPlay',
        short_name: 'ZenPlay',
        description: 'Familiar games. No adverts. Accounts are optional.',
        id: '/',
        scope: '/',
        start_url: '/',
        orientation: 'any',
        theme_color: '#1e4e37',
        background_color: '#f1ede2',
        display: 'standalone',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: null,
        // These precached files are public static resources and never vary by
        // query. This does not cache unrelated API/account requests.
        ignoreURLParametersMatching: [/.*/],
        // Only exact static-page aliases use a network fallback. No API URL or
        // wildcard navigation rule is cached; canonical pages use precache routing.
        runtimeCaching: pageRoutes.filter(route => route.path !== '/').map(({ path }) => ({
          urlPattern: new RegExp(`^https?://[^/]+${path.slice(0, -1)}(?:/index\\.html)?(?:\\?.*)?$`),
          handler: 'NetworkOnly' as const,
          options: { precacheFallback: { fallbackURL: `${path.slice(1)}index.html` } },
        })),
        skipWaiting: false,
        clientsClaim: false,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
}))
