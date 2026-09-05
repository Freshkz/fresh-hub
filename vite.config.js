import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Don't touch index.html markup ourselves; the plugin injects the
      // manifest link + registration script at build time.
      includeAssets: ['favicon.svg', 'pwa/apple-touch-icon.png'],
      manifest: {
        name: 'Fresh Hub',
        short_name: 'Fresh Hub',
        description: 'Proyectos, descargas y novedades de Fresh.',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#0b0b10',
        theme_color: '#0b0b10',
        icons: [
          { src: 'pwa/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa/maskable-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Don't cache admin/auth flows or Supabase API calls — always fetch fresh.
        navigateFallbackDenylist: [/\/admin/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin.includes('supabase.co'),
            handler: 'NetworkOnly',
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
