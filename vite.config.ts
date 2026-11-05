import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// VITE_BASE is set for GitHub Pages project sites, for example /muashir/.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  // The single-page build embeds its fonts, so one file is enough.
  build: process.env.VITE_ROUTER === 'memory' ? { assetsInlineLimit: 100_000_000 } : undefined,
  plugins: [react(), tailwindcss()],
})
