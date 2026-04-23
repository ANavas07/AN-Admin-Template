import { useEffect, useRef, useState } from 'react'
import ButtonComponent from '../../ui/buttons/ButtonComponent'
import { SettingsIcon } from '../../../icons/icons'

type UserRole = 'admin' | 'organizer' | 'analyst' | 'viewer'

type CurrentUser = {
    id: string
    name: string
    email: string
    roles: UserRole[]
}

type NavbarProps = {
    isDarkMode: boolean
    onToggleTheme: () => void
    currentUser: CurrentUser
    currentRole: UserRole
    onChangeRole: (role: UserRole) => void
}

const ROLE_LABELS: Record<UserRole, string> = {
    admin: 'Administrador',
    organizer: 'Organizador',
    analyst: 'Analista',
    viewer: 'Observador',
}

export default function Navbar({
    isDarkMode,
    onToggleTheme,
    currentUser,
    currentRole,
    onChangeRole,
}: NavbarProps) {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const mobileMenuRef = useRef<HTMLDivElement>(null)

    // Cerrar menus cuando hace click afuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsUserMenuOpen(false)
            }
            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target as Node)
            ) {
                setIsMobileMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <header className="sticky top-0 z-30 border-b border-(--color-border) bg-(--color-surface)/80 backdrop-blur">
            <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand font-bold text-white shadow-sm">
                        CT
                    </span>
                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold tracking-wide text-(--color-text)">
                            Gestion de Torneos Deportivos
                        </p>
                        <p className="text-xs text-(--color-text-muted)">
                            Panel
                        </p>
                    </div>
                </div>

                {/* Desktop Menu (lg+) */}
                <div className="hidden items-center gap-3 sm:gap-4 lg:flex">
                    <ButtonComponent variant="primary" leftIcon="🏠" to={"/playground"}>
                        Playground Components
                    </ButtonComponent>
                    <ButtonComponent variant="ghost" icon={<SettingsIcon />}
                        iconPosition="right"
                        to={"/super"}
                    >
                        Super usuario
                    </ButtonComponent>


                    {/* Rol selector */}
                    <select
                        value={currentRole}
                        onChange={(e) => onChangeRole(e.target.value as UserRole)}
                        className="rounded-lg border border-(--color-border) bg-(--color-bg-soft) px-3 py-2 text-sm font-medium text-(--color-text) transition-colors hover:border-highlight focus:outline-none focus:ring-2 focus:ring-highlight focus:ring-offset-2 focus:ring-offset-(--color-bg)"
                        aria-label="Selecciona tu rol"
                    >
                        {currentUser.roles.map((role) => (
                            <option key={role} value={role}>
                                {ROLE_LABELS[role]}
                            </option>
                        ))}
                    </select>

                    {/* Divisor visual */}
                    <div className="h-6 w-px bg-(--color-border)" />

                    {/* User menu toggle */}
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="inline-flex items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-bg-soft) px-3 py-2 text-sm font-medium text-(--color-text) transition-colors hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                            aria-expanded={isUserMenuOpen}
                            aria-haspopup="true"
                        >
                            <span className="h-6 w-6 rounded-full bg-brand text-xs font-bold leading-6 text-white">
                                {currentUser.name.charAt(0).toUpperCase()}
                            </span>
                            <span className="max-w-30 truncate">
                                {currentUser.name.split(' ')[0]}
                            </span>
                            <span className="text-xs opacity-60" aria-hidden="true">
                                ▼
                            </span>
                        </button>

                        {/* Desktop Dropdown menu */}
                        {isUserMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-(--color-border) bg-(--color-surface) shadow-lg">
                                <div className="border-b border-(--color-border) px-4 py-3">
                                    <p className="text-sm font-semibold text-(--color-text)">
                                        {currentUser.name}
                                    </p>
                                    <p className="truncate text-xs text-(--color-text-muted)">
                                        {currentUser.email}
                                    </p>
                                </div>

                                <div className="py-1">
                                    <button
                                        type="button"
                                        onClick={() => setIsUserMenuOpen(false)}
                                        className="w-full px-4 py-2 text-left text-sm text-(--color-text) hover:bg-(--color-bg-soft) transition-colors"
                                    >
                                        👤 Mi Perfil
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsUserMenuOpen(false)}
                                        className="w-full px-4 py-2 text-left text-sm text-(--color-text) hover:bg-(--color-bg-soft) transition-colors"
                                    >
                                        ⚙️ Configuración
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsUserMenuOpen(false)}
                                        className="w-full px-4 py-2 text-left text-sm text-(--color-text) hover:bg-(--color-bg-soft) transition-colors"
                                    >
                                        🔔 Notificaciones
                                    </button>
                                </div>

                                <div className="border-t border-(--color-border) px-4 py-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsUserMenuOpen(false)}
                                        className="w-full rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                                    >
                                        🚪 Cerrar sesión
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Theme toggle */}
                    <button
                        type="button"
                        onClick={onToggleTheme}
                        className="inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg-soft) px-3 py-2 text-sm font-medium text-(--color-text) transition-colors hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        aria-label={isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                        title={isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                    >
                        <span className="text-base leading-none" aria-hidden="true">
                            {isDarkMode ? '🌙' : '☀️'}
                        </span>
                    </button>
                </div>

                {/* Mobile Hamburger Menu (lg hidden) */}
                <div className="flex items-center gap-2 lg:hidden">
                    {/* Theme toggle en mobile */}
                    <button
                        type="button"
                        onClick={onToggleTheme}
                        className="inline-flex items-center justify-center rounded-full border border-(--color-border) bg-(--color-bg-soft) p-2 text-(--color-text) transition-colors hover:border-brand"
                        aria-label={isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                    >
                        <span className="text-lg leading-none" aria-hidden="true">
                            {isDarkMode ? '🌙' : '☀️'}
                        </span>
                    </button>

                    {/* Hamburger toggle */}
                    <div className="relative" ref={mobileMenuRef}>
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center rounded-lg border border-(--color-border) bg-(--color-bg-soft) p-2 text-(--color-text) transition-colors hover:border-brand"
                            aria-label="Abre menu navegación"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className="text-xl" aria-hidden="true">
                                {isMobileMenuOpen ? '✕' : '☰'}
                            </span>
                        </button>

                        {/* Mobile Menu Dropdown */}
                        {isMobileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-64 rounded-lg border border-(--color-border) bg-(--color-surface) shadow-lg">
                                {/* User Info Section */}
                                <div className="border-b border-(--color-border) px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <span className="h-10 w-10 rounded-full bg-brand text-sm font-bold leading-10 text-white text-center">
                                            {currentUser.name.charAt(0).toUpperCase()}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-(--color-text)">
                                                {currentUser.name}
                                            </p>
                                            <p className="truncate text-xs text-(--color-text-muted)">
                                                {currentUser.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Role Selector */}
                                <div className="border-b border-(--color-border) px-4 py-3">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
                                        Mi Rol
                                    </p>
                                    <select
                                        value={currentRole}
                                        onChange={(e) => {
                                            onChangeRole(e.target.value as UserRole)
                                            setIsMobileMenuOpen(false)
                                        }}
                                        className="w-full rounded-lg border border-(--color-border) bg-(--color-bg-soft) px-3 py-2 text-sm font-medium text-(--color-text) transition-colors focus:outline-none focus:ring-2 focus:ring-highlight"
                                    >
                                        {currentUser.roles.map((role) => (
                                            <option key={role} value={role}>
                                                {ROLE_LABELS[role]}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Menu Items */}
                                <div className="py-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full px-4 py-2 text-left text-sm text-(--color-text) hover:bg-(--color-bg-soft) transition-colors"
                                    >
                                        👤 Mi Perfil
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full px-4 py-2 text-left text-sm text-(--color-text) hover:bg-(--color-bg-soft) transition-colors"
                                    >
                                        ⚙️ Configuración
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full px-4 py-2 text-left text-sm text-(--color-text) hover:bg-(--color-bg-soft) transition-colors"
                                    >
                                        🔔 Notificaciones
                                    </button>
                                </div>

                                {/* Logout */}
                                <div className="border-t border-(--color-border) px-4 py-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                                    >
                                        🚪 Cerrar sesión
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
