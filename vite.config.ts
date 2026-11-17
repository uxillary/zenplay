import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
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
        runtimeCaching: [{
          urlPattern: ({ request, url }) => request.mode === 'navigate' && url.origin === self.location.origin
            && (url.pathname === '/games/solitaire' || url.pathname === '/games/solitaire/index.html'),
          handler: 'NetworkOnly',
          options: { precacheFallback: { fallbackURL: 'games/solitaire/index.html' } },
        }],
        skipWaiting: false,
        clientsClaim: false,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
}))
