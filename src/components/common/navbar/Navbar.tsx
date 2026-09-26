import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
    ArrowLeftIcon,
    BellIcon,
    ChevronIcon,
    CloseIcon,
    LogOutIcon,
    MenuIcon,
    MoonIcon,
    SettingsIcon,
    SparkIcon,
    SunIcon,
    UserIcon,
    UsersIcon,
} from '../../../icons/icons'
import { cn } from '../../../utils/cn'
import Avatar from '../../ui/avatar/Avatar'
import { fieldControlClass, fieldSizeClasses } from '../../ui/inputs/fieldStyles'

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
    admin: 'Administrator',
    organizer: 'Organizer',
    analyst: 'Analyst',
    viewer: 'Viewer',
}

type ModuleLink = {
    label: string
    path: string
    icon: ReactNode
}

const moduleLinks: ModuleLink[] = [
    { label: 'Administrador', path: '/superuser/rbac', icon: <UsersIcon className="size-4" /> },
    { label: 'Playground', path: '/playground', icon: <SparkIcon className="size-4" /> },
]

/** Entries of the account menu, shared by the desktop dropdown and the mobile sheet. */
type AccountMenuItem = { label: string; icon: ReactNode; path?: string }

const accountMenuItems: AccountMenuItem[] = [
    { label: 'My profile', icon: <UserIcon className="size-4" /> },
    { label: 'Super user panel', icon: <SettingsIcon className="size-4" />, path: '/super' },
    { label: 'Notifications', icon: <BellIcon className="size-4" /> },
]

const iconButtonClass =
    'inline-flex size-9 shrink-0 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-canvas-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-40'

const menuItemClass =
    'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-fg transition-colors hover:bg-canvas-subtle'

const menuPanelClass =
    'absolute right-0 z-(--z-dropdown) mt-2 overflow-hidden rounded-lg border border-line bg-surface shadow-lg'

function AccountMenuList({ onSelect }: { onSelect: () => void }) {
    return (
        <div className="py-1">
            {accountMenuItems.map((item) =>
                item.path ? (
                    <NavLink key={item.label} to={item.path} onClick={onSelect} className={menuItemClass}>
                        <span className="text-fg-muted">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ) : (
                    <button key={item.label} type="button" onClick={onSelect} className={menuItemClass}>
                        <span className="text-fg-muted">{item.icon}</span>
                        {item.label}
                    </button>
                )
            )}
        </div>
    )
}

function SignOutButton({ onClick }: { onClick: () => void }) {
    return (
        <div className="border-t border-line py-1">
            <button type="button" onClick={onClick} className={cn(menuItemClass, 'text-danger hover:bg-danger-soft')}>
                <LogOutIcon className="size-4" />
                Sign out
            </button>
        </div>
    )
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
    const navigate = useNavigate()
    const location = useLocation()

    // Close dropdown menus when clicking outside
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

    const handleLogout = () => {
        localStorage.removeItem('token')
        window.location.href = '/login'
    }

    // History navigation keeps the previous module's route state intact
    const handleGoBack = () => {
        if (window.history.length > 1) {
            navigate(-1)
        } else {
            navigate('/dashboard')
        }
    }

    const isHome = location.pathname === '/dashboard'

    const themeLabel = isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'
    const themeToggle = (
        <button type="button" onClick={onToggleTheme} className={iconButtonClass} aria-label={themeLabel} title={themeLabel}>
            {isDarkMode ? <SunIcon className="size-4.5" /> : <MoonIcon className="size-4.5" />}
        </button>
    )

    return (
        <header className="sticky top-0 z-(--z-sticky) border-b border-line bg-surface">
            <div className="mx-auto flex h-(--layout-navbar-height) items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                {/* Left cluster: history controls + brand */}
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={handleGoBack}
                        disabled={isHome}
                        className={iconButtonClass}
                        aria-label="Go back to the previous module"
                        title="Back to previous module"
                    >
                        <ArrowLeftIcon className="size-4.5" />
                    </button>

                    <div className="hidden h-6 w-px bg-line sm:block" />

                    <NavLink to="/dashboard" className="flex min-w-0 items-center gap-2.5" aria-label="Go to home">
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-solid text-xs font-bold tracking-wide text-on-solid">
                            CT
                        </span>
                        <span className="hidden min-w-0 leading-tight xl:block">
                            <span className="block truncate text-sm font-semibold text-fg">Sistema de Gestion</span>
                            <span className="block text-xs text-fg-muted">Panel de Control</span>
                        </span>
                    </NavLink>
                </div>

                {/* Center cluster: module navigation (desktop) */}
                <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
                    {moduleLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                cn(
                                    'inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-brand-soft text-brand-strong'
                                        : 'text-fg-muted hover:bg-canvas-subtle hover:text-fg'
                                )
                            }
                        >
                            {link.icon}
                            <span className="hidden 2xl:inline">{link.label}</span>
                            <span className="2xl:hidden">{link.label.split(' ')[0]}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Right cluster (desktop) */}
                <div className="hidden items-center gap-2 lg:flex">
                    <select
                        value={currentRole}
                        onChange={(e) => onChangeRole(e.target.value as UserRole)}
                        className={cn(fieldControlClass(), fieldSizeClasses.md, 'w-auto px-3 font-medium')}
                        aria-label="Select your role"
                    >
                        {currentUser.roles.map((role) => (
                            <option key={role} value={role}>
                                {ROLE_LABELS[role]}
                            </option>
                        ))}
                    </select>

                    {themeToggle}

                    <div className="mx-1 h-6 w-px bg-line" />

                    {/* User menu toggle */}
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="inline-flex h-9 items-center gap-2 rounded-md pl-1 pr-2 text-sm font-medium text-fg transition-colors hover:bg-canvas-subtle focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25"
                            aria-expanded={isUserMenuOpen}
                            aria-haspopup="true"
                        >
                            <Avatar name={currentUser.name} tone="brand" size="sm" />
                            <span className="max-w-30 truncate">{currentUser.name.split(' ')[0]}</span>
                            <ChevronIcon className="size-4 text-fg-subtle" />
                        </button>

                        {isUserMenuOpen && (
                            <div className={cn(menuPanelClass, 'w-60')}>
                                <div className="border-b border-line px-3 py-2.5">
                                    <p className="text-sm font-semibold text-fg">{currentUser.name}</p>
                                    <p className="truncate text-xs text-fg-muted">{currentUser.email}</p>
                                </div>
                                <AccountMenuList onSelect={() => setIsUserMenuOpen(false)} />
                                <SignOutButton onClick={handleLogout} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile controls (lg hidden) */}
                <div className="flex items-center gap-1 lg:hidden">
                    {themeToggle}

                    <div className="relative" ref={mobileMenuRef}>
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={iconButtonClass}
                            aria-label="Open navigation menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
                        </button>

                        {isMobileMenuOpen && (
                            <div className={cn(menuPanelClass, 'w-72')}>
                                <div className="flex items-center gap-3 border-b border-line px-3 py-3">
                                    <Avatar name={currentUser.name} tone="brand" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-fg">{currentUser.name}</p>
                                        <p className="truncate text-xs text-fg-muted">{currentUser.email}</p>
                                    </div>
                                </div>

                                <nav className="border-b border-line py-1" aria-label="Main navigation">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleGoBack()
                                            setIsMobileMenuOpen(false)
                                        }}
                                        disabled={isHome}
                                        className={cn(menuItemClass, 'disabled:cursor-not-allowed disabled:opacity-40')}
                                    >
                                        <ArrowLeftIcon className="size-4 text-fg-muted" />
                                        Back to previous module
                                    </button>
                                    {moduleLinks.map((link) => (
                                        <NavLink
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={({ isActive }) =>
                                                cn(menuItemClass, isActive && 'bg-brand-soft font-medium text-brand-strong')
                                            }
                                        >
                                            {link.icon}
                                            {link.label}
                                        </NavLink>
                                    ))}
                                </nav>

                                <div className="border-b border-line px-3 py-3">
                                    <label htmlFor="mobile-role" className="eyebrow mb-2 block">
                                        My role
                                    </label>
                                    <select
                                        id="mobile-role"
                                        value={currentRole}
                                        onChange={(e) => {
                                            onChangeRole(e.target.value as UserRole)
                                            setIsMobileMenuOpen(false)
                                        }}
                                        className={cn(fieldControlClass(), fieldSizeClasses.md, 'px-3')}
                                    >
                                        {currentUser.roles.map((role) => (
                                            <option key={role} value={role}>
                                                {ROLE_LABELS[role]}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <AccountMenuList onSelect={() => setIsMobileMenuOpen(false)} />
                                <SignOutButton onClick={handleLogout} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

