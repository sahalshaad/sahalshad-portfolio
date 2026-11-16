import { StrictMode, lazy, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const AdminApp = lazy(() => import('./admin/AdminApp'))

function AdminRouteWrapper() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null
    let created = false
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'robots'
      document.head.appendChild(meta)
      created = true
    }
    const previousContent = meta.content
    meta.content = 'noindex, nofollow'

    return () => {
      if (created) {
        meta?.remove()
      } else if (meta) {
        meta.content = previousContent
      }
    }
  }, [])

  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center bg-zinc-950 text-zinc-100">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            <p className="text-xs text-zinc-400">Loading admin panel…</p>
          </div>
        </div>
      }
    >
      <AdminApp />
    </Suspense>
  )
}

function Root() {
  const isAdmin = window.location.pathname.startsWith('/admin')

  if (isAdmin) {
    return <AdminRouteWrapper />
  }

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
