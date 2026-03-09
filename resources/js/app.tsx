import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import '../css/app.css'

axios.defaults.withCredentials = true
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

// Set CSRF token dari meta tag
const token = document.head.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
if (token) {
  axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content
}

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true }) as Record<string, { default: unknown }>
    const page = pages[`./Pages/${name}.tsx`]
    if (!page) {
      console.error(`[Inertia] Page not found: ./Pages/${name}.tsx`)
      console.log('[Inertia] Available pages:', Object.keys(pages))
    }
    return page
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
  progress: {
    color: '#4B5563',
  },
})