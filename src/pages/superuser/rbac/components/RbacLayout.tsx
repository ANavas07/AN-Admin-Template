import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import RbacSidebar from './RbacSidebar'

const SECTION_LABELS: Record<string, string> = {
  roles: 'Roles',
  permissions: 'Permisos',
  groups: 'Grupos',
  users: 'Asignación de Usuarios',
  audit: 'Log de Auditoría',
}

function getLabel(pathname: string): string {
  const segment = pathname.split('/').at(-1) ?? ''
  return SECTION_LABELS[segment] ?? 'Control de Acceso'
}

export default function RbacLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const pageLabel = getLabel(location.pathname)

  return (
    <div className="flex min-h-screen bg-(--color-bg)">
      <RbacSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar móvil */}
        <header className="lg:hidden sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-(--color-surface) border-b border-(--color-border)">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú RBAC"
            className="p-2 rounded-lg hover:bg-(--color-bg-soft) text-(--color-text) transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <rect x="3" y="4" width="14" height="2" rx="1" />
              <rect x="3" y="9" width="14" height="2" rx="1" />
              <rect x="3" y="14" width="14" height="2" rx="1" />
            </svg>
          </button>
          <span className="font-semibold text-sm text-(--color-text) truncate">{pageLabel}</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
