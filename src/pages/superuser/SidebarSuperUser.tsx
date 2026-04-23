import { useEffect } from 'react'

export type NavItem = {
    id: string
    label: string
    icon: string
}

type SidebarSuperUserProps = {
    navItems: NavItem[]
    activeItem?: string
    onNavClick?: (id: string) => void
    isOpen: boolean
    onClose: () => void
    userName?: string
    userRole?: string
}

export default function SidebarSuperUser({
    navItems,
    activeItem,
    onNavClick,
    isOpen,
    onClose,
    userName,
    userRole,
}: SidebarSuperUserProps) {
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [onClose])

    return (
        <>
            {/* Overlay mobile */}
            <div
                className={`fixed inset-0 z-20 bg-black/50 transition-opacity duration-300 lg:hidden ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 z-30 h-full w-64 flex flex-col
                    bg-(--color-surface) border-r border-(--color-border)
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:relative lg:translate-x-0 lg:h-auto lg:min-h-screen
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 p-4 border-b border-(--color-border) shrink-0">
                    <div className="min-w-0">
                        <p className="font-bold text-(--color-text) truncate">
                            {userName ?? 'Superusuario'}
                        </p>
                        <p className="text-xs text-(--color-text-muted) truncate">
                            {userRole ?? 'Super Admin'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar menú"
                        className="lg:hidden shrink-0 p-1.5 rounded-lg hover:bg-(--color-bg-soft) text-(--color-text-muted) transition-colors"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M12.707 4.707a1 1 0 00-1.414-1.414L8 6.586 4.707 3.293a1 1 0 00-1.414 1.414L6.586 8l-3.293 3.293a1 1 0 001.414 1.414L8 9.414l3.293 3.293a1 1 0 001.414-1.414L9.414 8l3.293-3.293z" />
                        </svg>
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                onNavClick?.(item.id)
                                onClose()
                            }}
                            className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                text-sm font-medium transition-all text-left
                                ${
                                    activeItem === item.id
                                        ? 'bg-brand text-white shadow-sm'
                                        : 'text-(--color-text) hover:bg-(--color-bg-soft) hover:text-brand'
                                }
                            `}
                        >
                            <span className="text-base shrink-0">{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>
        </>
    )
}
