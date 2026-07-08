import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Dev-only stand-in for the Vercel serverless function api/cgtrader.js.
      // Forwards the same query params (keywords, page, print_ready, free,
      // sort_by) straight through to CGTrader's public search endpoint so
      // fetch('/api/cgtrader?keywords=x') behaves identically in dev and prod.
      '/api/cgtrader': {
        target: 'https://www.cgtrader.com',
        changeOrigin: true,
        // CGTrader 302-redirects to a canonical URL (e.g. dropping page=1).
        // Follow it server-side so the browser receives JSON, not a
        // cross-origin redirect it would be CORS-blocked from following.
        followRedirects: true,
        rewrite: (path) => path.replace(/^\/api\/cgtrader/, '/search.json'),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          Accept: 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
    },
  },
})
