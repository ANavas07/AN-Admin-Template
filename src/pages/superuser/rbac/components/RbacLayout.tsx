import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { findRouteMatch } from '../../../../components/admin-panel/data/navigation'
import RbacSidebar from './RbacSidebar'

/** Title of the current RBAC page, from the navigation registry. */
function getLabel(pathname: string): string {
  return findRouteMatch(pathname)?.page?.title ?? 'Control de Acceso'
}

export default function RbacLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const pageLabel = getLabel(location.pathname)

  return (
    <div className="flex min-h-screen bg-canvas">
      <RbacSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar móvil */}
        <header className="lg:hidden sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-surface border-b border-line">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú RBAC"
            className="p-2 rounded-lg hover:bg-canvas-subtle text-fg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <rect x="3" y="4" width="14" height="2" rx="1" />
              <rect x="3" y="9" width="14" height="2" rx="1" />
              <rect x="3" y="14" width="14" height="2" rx="1" />
            </svg>
          </button>
          <span className="font-semibold text-sm text-fg truncate">{pageLabel}</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
