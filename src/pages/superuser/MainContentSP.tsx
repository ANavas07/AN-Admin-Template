import { useState } from 'react'
import SidebarSuperUser from './SidebarSuperUser'
import type { NavItem } from './SidebarSuperUser'

const NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard',      icon: '🏠' },
    { id: 'users',     label: 'Usuarios',        icon: '👥' },
    { id: 'orgs',      label: 'Organizaciones',  icon: '🏢' },
    { id: 'reports',   label: 'Reportes',        icon: '📊' },
    { id: 'settings',  label: 'Configuración',   icon: '⚙️' },
]

function SectionContent({ activeItem }: { activeItem: string }) {
    switch (activeItem) {
        case 'dashboard':  return <h1 className="text-2xl font-bold text-(--color-text)">Dashboard</h1>
        case 'users':      return <h1 className="text-2xl font-bold text-(--color-text)">Usuarios</h1>
        case 'orgs':       return <h1 className="text-2xl font-bold text-(--color-text)">Organizaciones</h1>
        case 'reports':    return <h1 className="text-2xl font-bold text-(--color-text)">Reportes</h1>
        case 'settings':   return <h1 className="text-2xl font-bold text-(--color-text)">Configuración</h1>
        default:           return null
    }
}

export default function MainContentSP() {
    const [activeItem, setActiveItem] = useState('dashboard')
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const activeLabel = NAV_ITEMS.find((n) => n.id === activeItem)?.label ?? 'Panel'

    return (
        <div className="flex min-h-screen bg-(--color-bg)">
            <SidebarSuperUser
                navItems={NAV_ITEMS}
                activeItem={activeItem}
                onNavClick={setActiveItem}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                userName="Super Admin"
                userRole="Superusuario"
            />

            <div className="flex flex-col flex-1 min-w-0">
                <header className="lg:hidden sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-(--color-surface) border-b border-(--color-border)">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Abrir menú"
                        className="p-2 rounded-lg hover:bg-(--color-bg-soft) text-(--color-text) transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <rect x="3" y="4" width="14" height="2" rx="1" />
                            <rect x="3" y="9" width="14" height="2" rx="1" />
                            <rect x="3" y="14" width="14" height="2" rx="1" />
                        </svg>
                    </button>
                    <span className="font-semibold text-(--color-text) truncate">{activeLabel}</span>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <SectionContent activeItem={activeItem} />
                </main>
            </div>
        </div>
    )
}
