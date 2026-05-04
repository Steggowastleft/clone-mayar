import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import '../css/app.css'

axios.defaults.withCredentials = true
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

const token = document.head.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
if (token) {
  axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content
}

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true }) as Record<string, { default: unknown }>

    // Coba exact match dulu
    if (pages[`./Pages/${name}.tsx`]) {
      return pages[`./Pages/${name}.tsx`]
    }

    // Fallback: case-insensitive search
    // Mengatasi mismatch antara controller (Auth/Register) vs file (Auth/register)
    const key = `./Pages/${name}.tsx`.toLowerCase()
    const match = Object.keys(pages).find(k => k.toLowerCase() === key)

    if (match) {
      return pages[match]
    }

    console.error(`[Inertia] Page not found: ./Pages/${name}.tsx`)
    console.log('[Inertia] Available pages:', Object.keys(pages))
    throw new Error(`Page not found: ${name}`)
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
  progress: {
    color: '#4B5563',
  },
})