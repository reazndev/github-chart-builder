import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const RYBBIT_SCRIPT = 'https://rybbit.ruu.by/api/script.js'
const RYBBIT_SITE_ID = '7441296754ae'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: 'rybbit-production-analytics',
      transformIndexHtml(html) {
        if (mode !== 'production') {
          return html
        }

        return {
          html,
          tags: [
            {
              tag: 'script',
              attrs: {
                src: RYBBIT_SCRIPT,
                'data-site-id': RYBBIT_SITE_ID,
                defer: true,
              },
              injectTo: 'head',
            },
          ],
        }
      },
    },
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8030',
        changeOrigin: true,
      }
    }
  }
}))
