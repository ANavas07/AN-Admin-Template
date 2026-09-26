import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { appConfig, ROLE_LABELS } from '../../../config/app.config'
import { useWorkspace } from '../../../context/workspace-context'
import { BuildingIcon, ChevronIcon, PanelLeftIcon, SearchIcon } from '../../../icons/icons'
import { cn } from '../../../utils/cn'
import { modifierKeyLabel } from '../../../utils/platform'
import ModuleIcon from '../../admin-panel/ModuleIcon'
import {
    findRouteMatch,
    getAccessibleCategories,
    getModuleById,
    hasModuleAccess,
    HOME_PATH,
    isPathActive,
} from '../../admin-panel/data/navigation'
import type { ModuleDefinition } from '../../admin-panel/data/modules'
import Avatar from '../../ui/avatar/Avatar'
import Kbd from '../../ui/kbd/Kbd'
import { useCommandPalette } from '../command-palette/command-palette-context'

type AppSidebarProps = {
    /** Desktop: narrow icon rail instead of the full panel */
    isCollapsed: boolean
    onToggleCollapsed: () => void
    /** Tablet / mobile: the sidebar is a drawer over the content */
    isMobileOpen: boolean
    onCloseMobile: () => void
}

const itemBaseClass =
    'group relative flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25'

function itemStateClass(isActive: boolean) {
    return isActive
        ? 'bg-brand-soft font-medium text-brand-strong'
        : 'text-fg-muted hover:bg-canvas-subtle hover:text-fg'
}

/** Small bar at the left edge marking the active route. */
function ActiveIndicator() {
    return <span className="absolute inset-y-2 -left-2 w-0.5 rounded-full bg-brand" aria-hidden="true" />
}

type NavModuleItemProps = {
    module: ModuleDefinition
    pathname: string
    activeModuleId: string | null
    isRail: boolean
    onNavigate: () => void
}

function NavModuleItem({ module, pathname, activeModuleId, isRail, onNavigate }: NavModuleItemProps) {
    const children = module.children ?? []
    const isActive = activeModuleId === module.id
    const hasActiveChild = children.some((page) => isPathActive(pathname, page.url))
    const [isExpanded, setIsExpanded] = useState(hasActiveChild)
    const submenuId = `sidebar-submenu-${module.id}`

    // Opening a nested route from elsewhere (palette, link) reveals its submenu
    const [lastActiveChild, setLastActiveChild] = useState(hasActiveChild)
    if (hasActiveChild !== lastActiveChild) {
        setLastActiveChild(hasActiveChild)
        if (hasActiveChild) setIsExpanded(true)
    }

    if (!module.url) return null

    return (
        <li>
            <div className="relative flex items-center">
                <NavLink
                    to={module.url}
                    onClick={onNavigate}
                    title={isRail ? module.title : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(itemBaseClass, itemStateClass(isActive || (isRail && hasActiveChild)), isRail && 'justify-center px-0')}
                >
                    {isActive ? <ActiveIndicator /> : null}
                    <ModuleIcon name={module.icon} className="size-4.5 shrink-0" />
                    {isRail ? <span className="sr-only">{module.title}</span> : <span className="truncate">{module.title}</span>}
                </NavLink>
                {children.length > 0 && !isRail ? (
                    <button
                        type="button"
                        onClick={() => setIsExpanded((current) => !current)}
                        aria-expanded={isExpanded}
                        aria-controls={submenuId}
                        aria-label={`${isExpanded ? 'Contraer' : 'Expandir'} ${module.title}`}
                        className="absolute right-1 inline-flex size-7 items-center justify-center rounded-sm text-fg-subtle transition-colors hover:bg-canvas-subtle hover:text-fg"
                    >
                        <ChevronIcon className={cn('size-3.5 transition-transform duration-(--duration-base)', isExpanded ? 'rotate-0' : '-rotate-90')} />
                    </button>
                ) : null}
            </div>

            {children.length > 0 && !isRail ? (
                <div
                    id={submenuId}
                    className={cn(
                        'grid transition-[grid-template-rows] duration-(--duration-base) ease-standard',
                        isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    )}
                >
                    <ul className="ml-4.5 overflow-hidden border-l border-line pl-2" inert={!isExpanded}>
                        {children.map((page) => {
                            const isPageActive = isPathActive(pathname, page.url)
                            return (
                                <li key={page.id} className="pt-0.5">
                                    <NavLink
                                        to={page.url}
                                        onClick={onNavigate}
                                        aria-current={isPageActive ? 'page' : undefined}
                                        className={cn(itemBaseClass, 'h-8', itemStateClass(isPageActive))}
                                    >
                                        <span className="truncate">{page.title}</span>
                                    </NavLink>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            ) : null}
        </li>
    )
}

/**
 * Global navigation: the signed-in user, favorites and every module the role
 * can access (with nested pages). Collapses to an icon rail on desktop and
 * becomes a drawer on tablet and mobile.
 */
export default function AppSidebar({ isCollapsed, onToggleCollapsed, isMobileOpen, onCloseMobile }: AppSidebarProps) {
    const { pathname } = useLocation()
    const { user, role, favorites } = useWorkspace()
    const { open: openPalette } = useCommandPalette()
    const categories = getAccessibleCategories(role)
    const activeModuleId = findRouteMatch(pathname)?.module.id ?? null
    const favoriteModules = favorites
        .map((id) => getModuleById(id))
        .filter((module): module is ModuleDefinition => module !== null && hasModuleAccess(module, role))

    // The drawer closes with Escape; the rail state only applies from lg up
    useEffect(() => {
        if (!isMobileOpen) return
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') onCloseMobile()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isMobileOpen, onCloseMobile])

    return (
        <>
            {/* Tablet / mobile scrim */}
            <div
                className={cn(
                    'fixed inset-0 top-(--layout-navbar-height) z-(--z-overlay) bg-overlay transition-opacity duration-(--duration-base) lg:hidden',
                    isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                )}
                onClick={onCloseMobile}
                aria-hidden="true"
            />

            <aside
                aria-label="Navegación principal"
                data-collapsed={isCollapsed}
                className={cn(
                    'group/sidebar z-(--z-overlay) flex shrink-0 flex-col border-r border-line bg-surface',
                    'transition-[width,translate] duration-(--duration-slow) ease-emphasized',
                    // Tablet / mobile: fixed drawer below the navbar
                    'fixed bottom-0 left-0 top-(--layout-navbar-height) w-72',
                    isMobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full',
                    // Desktop: part of the layout, sticky under the navbar
                    'lg:sticky lg:h-[calc(100vh-var(--layout-navbar-height))] lg:translate-x-0 lg:shadow-none',
                    isCollapsed ? 'lg:w-16' : 'lg:w-64'
                )}
            >
                {/* User */}
                <div className={cn('border-b border-line p-3', isCollapsed && 'lg:px-2')}>
                    <div className={cn('flex items-center gap-3 rounded-lg p-1.5', isCollapsed && 'lg:justify-center lg:p-0')}>
                        <Avatar name={user.name} tone="brand" size="md" className="size-10 text-sm" />
                        <div className={cn('min-w-0', isCollapsed && 'lg:hidden')}>
                            <p className="truncate text-sm font-semibold text-fg">{user.name}</p>
                            <p className="truncate text-xs text-fg-muted">{ROLE_LABELS[role]}</p>
                        </div>
                    </div>
                    <dl className={cn('mt-2 space-y-1 px-1.5 text-xs', isCollapsed && 'lg:hidden')}>
                        <div className="flex items-start gap-2 text-fg-muted">
                            <dt className="sr-only">Organización y departamento</dt>
                            <BuildingIcon className="mt-px size-3.5 shrink-0 text-fg-subtle" aria-hidden="true" />
                            <dd className="min-w-0">
                                {user.department ? <span className="block truncate">{user.department}</span> : null}
                                <span className="block truncate text-fg-subtle">{appConfig.organization}</span>
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Search */}
                <div className={cn('px-3 pt-3', isCollapsed && 'lg:px-2')}>
                    <button
                        type="button"
                        onClick={openPalette}
                        title={isCollapsed ? 'Buscar' : undefined}
                        className={cn(
                            'flex h-9 w-full items-center gap-2 rounded-md border border-line bg-canvas px-2.5 text-sm text-fg-subtle transition-colors hover:border-line-strong hover:text-fg-muted',
                            isCollapsed && 'lg:justify-center lg:px-0'
                        )}
                    >
                        <SearchIcon className="size-4 shrink-0" />
                        <span className={cn('flex-1 text-left', isCollapsed && 'lg:sr-only')}>Buscar…</span>
                        <span className={cn('flex gap-0.5', isCollapsed && 'lg:hidden')}>
                            <Kbd>{modifierKeyLabel()}</Kbd>
                            <Kbd>K</Kbd>
                        </span>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3" aria-label="Módulos">
                    <ul className="space-y-0.5">
                        <li>
                            <NavLink
                                to={HOME_PATH}
                                onClick={onCloseMobile}
                                title={isCollapsed ? 'Inicio' : undefined}
                                className={({ isActive }) =>
                                    cn(itemBaseClass, itemStateClass(isActive), isCollapsed && 'lg:justify-center lg:px-0')
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive ? <ActiveIndicator /> : null}
                                        <ModuleIcon name="home" className="size-4.5 shrink-0" />
                                        <span className={cn('truncate', isCollapsed && 'lg:sr-only')}>Inicio</span>
                                    </>
                                )}
                            </NavLink>
                        </li>
                    </ul>

                    {favoriteModules.length > 0 ? (
                        <section className="mt-4">
                            <h2 className={cn('eyebrow mb-1 px-2.5 text-3xs', isCollapsed && 'lg:sr-only')}>Favoritos</h2>
                            <ul className="space-y-0.5">
                                {favoriteModules.map((module) => (
                                    <NavModuleItem
                                        key={`favorite-${module.id}`}
                                        module={{ ...module, children: undefined }}
                                        pathname={pathname}
                                        activeModuleId={activeModuleId}
                                        isRail={isCollapsed && !isMobileOpen}
                                        onNavigate={onCloseMobile}
                                    />
                                ))}
                            </ul>
                        </section>
                    ) : null}

                    {categories.map((category) => (
                        <section key={category.name} className="mt-4">
                            <h2 className={cn('eyebrow mb-1 px-2.5 text-3xs', isCollapsed && 'lg:sr-only')}>
                                {category.name.charAt(0) + category.name.slice(1).toLowerCase()}
                            </h2>
                            {isCollapsed ? <div className="mx-2 mb-1 hidden border-t border-line lg:block" aria-hidden="true" /> : null}
                            <ul className="space-y-0.5">
                                {category.modules.map((module) => (
                                    <NavModuleItem
                                        key={module.id}
                                        module={module}
                                        pathname={pathname}
                                        activeModuleId={activeModuleId}
                                        isRail={isCollapsed && !isMobileOpen}
                                        onNavigate={onCloseMobile}
                                    />
                                ))}
                            </ul>
                        </section>
                    ))}
                </nav>

                {/* Collapse (desktop only) */}
                <div className="hidden border-t border-line p-3 lg:block">
                    <button
                        type="button"
                        onClick={onToggleCollapsed}
                        aria-expanded={!isCollapsed}
                        aria-label={isCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
                        title={isCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
                        className={cn(itemBaseClass, 'text-fg-muted hover:bg-canvas-subtle hover:text-fg', isCollapsed && 'justify-center px-0')}
                    >
                        <PanelLeftIcon className="size-4.5 shrink-0" />
                        {isCollapsed ? null : <span>Contraer</span>}
                    </button>
                </div>
            </aside>
        </>
    )
}
