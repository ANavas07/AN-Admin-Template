import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
    ArrowLeftIcon,
    FlowIcon,
    HomeIcon,
    SettingsIcon,
    SparkIcon,
    UploadIcon,
    UsersIcon,
} from '../../../icons/icons'

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
    icon: React.ReactNode
}

const moduleLinks: ModuleLink[] = [
    { label: 'Home', path: '/dashboard', icon: <HomeIcon className="size-4.5" /> },
    { label: 'Users', path: '/users', icon: <UsersIcon className="size-4.5" /> },
    { label: 'Files', path: '/files', icon: <UploadIcon className="size-4.5" /> },
    { label: 'Process flow', path: '/process', icon: <FlowIcon className="size-4.5" /> },
    { label: 'Playground', path: '/playground', icon: <SparkIcon className="size-4.5" /> },
]

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
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

    return (
        <header className="sticky top-0 z-30 border-b border-(--color-border) bg-(--color-surface)/80 backdrop-blur">
            <div className="mx-auto flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                {/* Left cluster: history controls + brand */}
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={handleGoBack}
                        disabled={isHome}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-(--color-border) bg-(--color-bg-soft) text-(--color-text) transition-colors hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Go back to the previous module"
                        title="Back to previous module"
                    >
                        <ArrowLeftIcon className="size-4.5" />
                    </button>

                    <div className="hidden h-6 w-px bg-(--color-border) sm:block" />

                    <NavLink
                        to="/dashboard"
                        className="flex min-w-0 items-center gap-3"
                        aria-label="Go to home"
                    >
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand font-bold text-white shadow-sm">
                            CT
                        </span>
                        <span className="hidden min-w-0 xl:block">
                            <span className="block truncate text-sm font-semibold tracking-wide text-(--color-text)">
                                Sports Tournament Management
                            </span>
                            <span className="block text-xs text-(--color-text-muted)">
                                Control panel
                            </span>
                        </span>
                    </NavLink>
                </div>

                {/* Center cluster: module navigation (desktop) */}
                <nav
                    className="hidden items-center gap-1 rounded-2xl border border-(--color-border) bg-(--color-bg-soft)/60 p-1 lg:flex"
                    aria-label="Main navigation"
                >
                    {moduleLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                cn(
                                    'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200',
                                    isActive
                                        ? 'bg-brand text-white shadow-sm'
                                        : 'text-(--color-text-muted) hover:bg-(--color-surface) hover:text-brand'
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
                <div className="hidden items-center gap-3 lg:flex">
                    {/* Role selector */}
                    <select
                        value={currentRole}
                        onChange={(e) => onChangeRole(e.target.value as UserRole)}
                        className="rounded-lg border border-(--color-border) bg-(--color-bg-soft) px-3 py-2 text-sm font-medium text-(--color-text) transition-colors hover:border-highlight focus:outline-none focus:ring-2 focus:ring-highlight focus:ring-offset-2 focus:ring-offset-(--color-bg)"
                        aria-label="Select your role"
                    >
                        {currentUser.roles.map((role) => (
                            <option key={role} value={role}>
                                {ROLE_LABELS[role]}
                            </option>
                        ))}
                    </select>

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

                        {/* Desktop dropdown menu */}
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
                                        👤 My profile
                                    </button>
                                    <NavLink
                                        to="/super"
                                        onClick={() => setIsUserMenuOpen(false)}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-(--color-text) hover:bg-(--color-bg-soft) transition-colors"
                                    >
                                        <SettingsIcon className="size-4" />
                                        Super user panel
                                    </NavLink>
                                    <button
                                        type="button"
                                        onClick={() => setIsUserMenuOpen(false)}
                                        className="w-full px-4 py-2 text-left text-sm text-(--color-text) hover:bg-(--color-bg-soft) transition-colors"
                                    >
                                        🔔 Notifications
                                    </button>
                                </div>

                                <div className="border-t border-(--color-border) px-4 py-2">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                                    >
                                        🚪 Sign out
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
                        aria-label={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                        title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                    >
                        <span className="text-base leading-none" aria-hidden="true">
                            {isDarkMode ? '🌙' : '☀️'}
                        </span>
                    </button>
                </div>

                {/* Mobile controls (lg hidden) */}
                <div className="flex items-center gap-2 lg:hidden">
                    {/* Theme toggle on mobile */}
                    <button
                        type="button"
                        onClick={onToggleTheme}
                        className="inline-flex items-center justify-center rounded-full border border-(--color-border) bg-(--color-bg-soft) p-2 text-(--color-text) transition-colors hover:border-brand"
                        aria-label={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
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
                            aria-label="Open navigation menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className="text-xl" aria-hidden="true">
                                {isMobileMenuOpen ? '✕' : '☰'}
                            </span>
                        </button>

                        {/* Mobile menu dropdown */}
                        {isMobileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-64 rounded-lg border border-(--color-border) bg-(--color-surface) shadow-lg">
                                {/* User info section */}
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

                                {/* Module navigation */}
                                <nav className="border-b border-(--color-border) py-2" aria-label="Main navigation">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleGoBack()
                                            setIsMobileMenuOpen(false)
                                        }}
                                        disabled={isHome}
                                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-(--color-text) hover:bg-(--color-bg-soft) transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ArrowLeftIcon className="size-4.5" />
                                        Back to previous module
                                    </button>
                                    {moduleLinks.map((link) => (
                                        <NavLink
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={({ isActive }) =>
                                                cn(
                                                    'flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors',
                                                    isActive
                                                        ? 'bg-brand-soft font-semibold text-brand'
                                                        : 'text-(--color-text) hover:bg-(--color-bg-soft)'
                                                )
                                            }
                                        >
                                            {link.icon}
                                            {link.label}
                                        </NavLink>
                                    ))}
                                </nav>

                                {/* Role selector */}
                                <div className="border-b border-(--color-border) px-4 py-3">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
                                        My role
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

                                {/* Secondary items */}
                                <div className="py-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full px-4 py-2 text-left text-sm text-(--color-text) hover:bg-(--color-bg-soft) transition-colors"
                                    >
                                        👤 My profile
                                    </button>
                                    <NavLink
                                        to="/super"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-(--color-text) hover:bg-(--color-bg-soft) transition-colors"
                                    >
                                        <SettingsIcon className="size-4" />
                                        Super user panel
                                    </NavLink>
                                    <button
                                        type="button"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full px-4 py-2 text-left text-sm text-(--color-text) hover:bg-(--color-bg-soft) transition-colors"
                                    >
                                        🔔 Notifications
                                    </button>
                                </div>

                                {/* Logout */}
                                <div className="border-t border-(--color-border) px-4 py-2">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                                    >
                                        🚪 Sign out
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
