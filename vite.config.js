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
      includeAssets: ['favicon.svg', 'icons/icon-192x192.png', 'icons/icon-512x512.png'],
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
            src: 'icons/logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/logo.png',
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
    allowedHosts: ['bumpy-seas-poke.loca.lt']
  },
  css: {
    postcss: undefined
  }
});
