import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/192x192.png', 'icons/logo.svg', 'icons/icon-512x512.png'],
      workbox: {
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15 MB
      },
      manifest: {
        name: 'Runner',
        short_name: 'Runner',
        description: 'Your running companion web app',
        theme_color: '#191919',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icons/192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/logo.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['7f6a46778c20.ngrok-free.app'],
  },
  css: {
    postcss: undefined
  }
});
