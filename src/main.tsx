import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/figtree'
import '@fontsource-variable/jetbrains-mono'
import '@fontsource-variable/alexandria'
import '@fontsource-variable/noto-sans-arabic'
import './index.css'
import './i18n'
import App from './App'

const arabicFonts = () =>
  Promise.all([
    document.fonts.load('800 40px "Noto Sans Arabic Variable"', 'ا'),
    document.fonts.load('400 16px "Noto Sans Arabic Variable"', 'ا'),
    document.fonts.load('800 24px "Alexandria Variable"', 'م'),
  ])
const FONT_WAIT_MS = 500

function render() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      {/* The single-page build runs in a host frame that has no URL of its own to route on. */}
      {import.meta.env.VITE_ROUTER === 'memory' ? (
        <MemoryRouter>
          <App />
        </MemoryRouter>
      ) : (
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
          <App />
        </BrowserRouter>
      )}
    </StrictMode>,
  )
  arabicFonts().catch(() => {})
}

if (document.documentElement.lang === 'ar') {
  Promise.race([arabicFonts(), new Promise((done) => setTimeout(done, FONT_WAIT_MS))])
    .catch(() => {})
    .finally(render)
} else {
  render()
}
