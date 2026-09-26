import { useState } from 'react'
import SidebarSuperUser from './SidebarSuperUser'
import type { NavItem } from './SidebarSuperUser'
import { ChartIcon, HomeIcon, LayersIcon, SettingsIcon, UsersIcon } from '../../icons/icons'

const NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon className="size-4" /> },
    { id: 'users', label: 'Usuarios', icon: <UsersIcon className="size-4" /> },
    { id: 'orgs', label: 'Organizaciones', icon: <LayersIcon className="size-4" /> },
    { id: 'reports', label: 'Reportes', icon: <ChartIcon className="size-4" /> },
    { id: 'settings', label: 'Configuración', icon: <SettingsIcon className="size-4" /> },
]

function SectionContent({ activeItem }: { activeItem: string }) {
    switch (activeItem) {
        case 'dashboard': return <h1 className="text-2xl font-semibold text-fg">Dashboard</h1>
        case 'users': return <h1 className="text-2xl font-semibold text-fg">Usuarios</h1>
        case 'orgs': return <h1 className="text-2xl font-semibold text-fg">Organizaciones</h1>
        case 'reports': return <h1 className="text-2xl font-semibold text-fg">Reportes</h1>
        case 'settings': return <h1 className="text-2xl font-semibold text-fg">Configuración</h1>
        default: return null
    }
}

export default function MainContentSP() {
    const [activeItem, setActiveItem] = useState('dashboard')
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const activeLabel = NAV_ITEMS.find((n) => n.id === activeItem)?.label ?? 'Panel'

    return (
        <div className="flex min-h-screen bg-canvas">
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
                <header className="lg:hidden sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-surface border-b border-line">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Abrir menú"
                        className="p-2 rounded-lg hover:bg-canvas-subtle text-fg transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <rect x="3" y="4" width="14" height="2" rx="1" />
                            <rect x="3" y="9" width="14" height="2" rx="1" />
                            <rect x="3" y="14" width="14" height="2" rx="1" />
                        </svg>
                    </button>
                    <span className="font-semibold text-fg truncate">{activeLabel}</span>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <SectionContent activeItem={activeItem} />
                </main>
            </div>
        </div>
    )
}
