// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',

      injectManifest: {
        // This is the correct way to pass format to the SW bundler
        rollupOptions: {
          output: {
            format: 'iife',
            entryFileNames: 'sw.js', // Forces the name to stay sw.js
          }
        }
      },
      manifest: {
        name: 'NUR — Prayer Companion',
        short_name: 'NUR',
        description: 'Never miss a prayer. Real-time prayer times, reminders, Quran reader & streak tracker.',
        theme_color: '#e27d60',
        background_color: '#fdf6ee',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        categories: ['lifestyle', 'utilities'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Prayer Tracker',
            short_name: 'Tracker',
            description: 'Open your prayer history',
            url: '/?open=tracker',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
          },
        ],
      },

      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
});