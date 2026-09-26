import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ROLE_LABELS } from '../../../config/app.config'
import type { CurrentUser, UserRole } from '../../../config/app.config'
import {
    ArrowLeftIcon,
    ChevronIcon,
    LockIcon,
    LogOutIcon,
    MenuIcon,
    MoonIcon,
    SearchIcon,
    SettingsIcon,
    SunIcon,
    SupportIcon,
    UserIcon,
} from '../../../icons/icons'
import { signOut } from '../../../services/session'
import { cn } from '../../../utils/cn'
import { modifierKeyLabel } from '../../../utils/platform'
import { HOME_PATH } from '../../../navigation/navigation'
import Avatar from '../../ui/avatar/Avatar'
import { fieldControlClass, fieldSizeClasses } from '../../ui/inputs/fieldStyles'
import Kbd from '../../ui/kbd/Kbd'
import { useCommandPalette } from '../command-palette/command-palette-context'

type NavbarProps = {
    isDarkMode: boolean
    onToggleTheme: () => void
    currentUser: CurrentUser
    currentRole: UserRole
    onChangeRole: (role: UserRole) => void
    /** Opens / collapses the sidebar. Without it the toggle is not shown. */
    onToggleSidebar?: () => void
}

/** Entries of the account menu. */
type AccountMenuItem = { label: string; icon: ReactNode; path: string }

const accountMenuItems: AccountMenuItem[] = [
    { label: 'Perfil', icon: <UserIcon className="size-4" />, path: '/account/profile' },
    { label: 'Preferencias', icon: <SettingsIcon className="size-4" />, path: '/account/preferences' },
    { label: 'Seguridad', icon: <LockIcon className="size-4" />, path: '/account/security' },
    { label: 'Centro de soporte', icon: <SupportIcon className="size-4" />, path: '/support' },
]

const iconButtonClass =
    'inline-flex size-9 shrink-0 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-canvas-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-40'

const menuItemClass =
    'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-fg transition-colors hover:bg-canvas-subtle'

export default function Navbar({
    isDarkMode,
    onToggleTheme,
    currentUser,
    currentRole,
    onChangeRole,
    onToggleSidebar,
}: NavbarProps) {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const location = useLocation()
    const { open: openPalette } = useCommandPalette()

    // Close the account menu when clicking outside or pressing Escape
    useEffect(() => {
        if (!isUserMenuOpen) return
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsUserMenuOpen(false)
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') setIsUserMenuOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isUserMenuOpen])

    // History navigation keeps the previous module's route state intact
    const handleGoBack = () => {
        if (window.history.length > 1) navigate(-1)
        else navigate(HOME_PATH)
    }

    const isHome = location.pathname === HOME_PATH
    const themeLabel = isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'
    const roleSelect = (className?: string) => (
        <select
            value={currentRole}
            onChange={(e) => onChangeRole(e.target.value as UserRole)}
            className={cn(fieldControlClass(), fieldSizeClasses.md, 'px-3 font-medium', className)}
            aria-label="Select your role"
        >
            {currentUser.roles.map((role) => (
                <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                </option>
            ))}
        </select>
    )

    return (
        <header className="sticky top-0 z-(--z-sticky) border-b border-line bg-surface">
            <div className="flex h-(--layout-navbar-height) items-center justify-between gap-3 px-3 sm:px-4">
                {/* Left: sidebar, history, brand */}
                <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                    {onToggleSidebar ? (
                        <button
                            type="button"
                            onClick={onToggleSidebar}
                            className={iconButtonClass}
                            aria-label="Mostrar u ocultar la barra lateral"
                            title="Barra lateral"
                        >
                            <MenuIcon className="size-5" />
                        </button>
                    ) : null}
                    <button
                        type="button"
                        onClick={handleGoBack}
                        disabled={isHome}
                        className={cn(iconButtonClass, 'hidden sm:inline-flex')}
                        aria-label="Go back to the previous module"
                        title="Back to previous module"
                    >
                        <ArrowLeftIcon className="size-4.5" />
                    </button>

                    <div className="mx-1 hidden h-6 w-px bg-line sm:block" />

                    <NavLink to={HOME_PATH} className="flex min-w-0 items-center gap-2.5" aria-label="Go to home">
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-solid text-xs font-bold tracking-wide text-on-solid">
                            CT
                        </span>
                        <span className="hidden min-w-0 leading-tight xl:block">
                            <span className="block truncate text-sm font-semibold text-fg">Sistema de Gestion</span>
                            <span className="block text-xs text-fg-muted">Panel de Control</span>
                        </span>
                    </NavLink>
                </div>

                {/* Center: command palette trigger */}
                <button
                    type="button"
                    onClick={openPalette}
                    className="hidden h-9 w-full max-w-md items-center gap-2 rounded-md border border-line bg-canvas px-3 text-sm text-fg-subtle transition-colors hover:border-line-strong hover:text-fg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25 md:flex"
                    aria-label="Buscar módulos, páginas o acciones"
                >
                    <SearchIcon className="size-4 shrink-0" />
                    <span className="flex-1 truncate text-left">Buscar módulos, páginas o acciones…</span>
                    <span className="flex gap-0.5">
                        <Kbd>{modifierKeyLabel()}</Kbd>
                        <Kbd>K</Kbd>
                    </span>
                </button>

                {/* Right: role, theme, account */}
                <div className="flex items-center gap-1.5">
                    <button type="button" onClick={openPalette} className={cn(iconButtonClass, 'md:hidden')} aria-label="Buscar">
                        <SearchIcon className="size-4.5" />
                    </button>

                    <div className="hidden lg:block">{roleSelect('w-auto')}</div>

                    <button type="button" onClick={onToggleTheme} className={iconButtonClass} aria-label={themeLabel} title={themeLabel}>
                        {isDarkMode ? <SunIcon className="size-4.5" /> : <MoonIcon className="size-4.5" />}
                    </button>

                    <div className="mx-1 hidden h-6 w-px bg-line sm:block" />

                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="inline-flex h-9 items-center gap-2 rounded-md pl-1 pr-1 text-sm font-medium text-fg transition-colors hover:bg-canvas-subtle focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25 sm:pr-2"
                            aria-expanded={isUserMenuOpen}
                            aria-haspopup="true"
                            aria-label="Account menu"
                        >
                            <Avatar name={currentUser.name} tone="brand" size="sm" />
                            <span className="hidden max-w-30 truncate sm:inline">{currentUser.name.split(' ')[0]}</span>
                            <ChevronIcon className="hidden size-4 text-fg-subtle sm:block" />
                        </button>

                        {isUserMenuOpen && (
                            <div className="absolute right-0 z-(--z-dropdown) mt-2 w-64 overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
                                <div className="border-b border-line px-3 py-2.5">
                                    <p className="text-sm font-semibold text-fg">{currentUser.name}</p>
                                    <p className="truncate text-xs text-fg-muted">{currentUser.email}</p>
                                </div>
                                {/* On smaller screens the role selector lives here */}
                                <div className="border-b border-line px-3 py-2.5 lg:hidden">
                                    <p className="eyebrow mb-1.5 text-3xs">My role</p>
                                    {roleSelect()}
                                </div>
                                <div className="py-1">
                                    {accountMenuItems.map((item) => (
                                        <NavLink
                                            key={item.label}
                                            to={item.path}
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className={menuItemClass}
                                        >
                                            <span className="text-fg-muted">{item.icon}</span>
                                            {item.label}
                                        </NavLink>
                                    ))}
                                </div>
                                <div className="border-t border-line py-1">
                                    <button type="button" onClick={signOut} className={cn(menuItemClass, 'text-danger hover:bg-danger-soft')}>
                                        <LogOutIcon className="size-4" />
                                        Sign out
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
