import { useMemo, useState } from 'react'
import type { ModuleCategory } from './data/modules'
import { hasModuleAccess } from './data/navigation'
import ActivityMetrics from './workspace/ActivityMetrics'
import FavoritesPanel from './workspace/FavoritesPanel'
import ModuleCatalog from './workspace/ModuleCatalog'
import QuickActionsPanel from './workspace/QuickActionsPanel'
import RecentPanel from './workspace/RecentPanel'
import SystemInfoPanel from './workspace/SystemInfoPanel'
import { useWorkspaceInsights } from './workspace/useWorkspaceInsights'

export type { ModuleCategory }

type MainPanelProps = {
    categories: ModuleCategory[]
    userRole: string
    userName: string
    /** @deprecated The user's details now live in the sidebar; kept for compatibility. */
    userEmail?: string
    /** @deprecated See userEmail. */
    organization?: string
    /** @deprecated See userEmail. */
    identifier?: string
    /** @deprecated See userEmail. */
    location?: string
    onModuleClick?: (moduleUrl: string) => void
}

const dateFormatter = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' })

function greeting(hour: number) {
    if (hour < 12) return 'Buenos días'
    if (hour < 19) return 'Buenas tardes'
    return 'Buenas noches'
}

/**
 * Home as a personal workspace: favorites, recent history, quick actions and
 * system context first, then the user's activity metrics and the full catalog.
 */
export default function MainPanel({ categories, userRole, userName, onModuleClick }: MainPanelProps) {
    const insights = useWorkspaceInsights()
    const [now] = useState(() => new Date())

    // Same role filter as before: categories with no visible module are hidden
    const visibleCategories = useMemo(
        () =>
            categories
                .map((category) => ({
                    ...category,
                    modules: category.modules.filter((module) => hasModuleAccess(module, userRole)),
                }))
                .filter((category) => category.modules.length > 0),
        [categories, userRole]
    )

    const openModule = (url: string) => onModuleClick?.(url)
    const firstName = userName.split(' ')[0]

    return (
        <div className="min-h-[calc(100vh-var(--layout-navbar-height))] bg-canvas">
            <div className="mx-auto max-w-(--layout-content-max-width) space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <header className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="eyebrow first-letter:uppercase">{dateFormatter.format(now)}</p>
                        <h1 className="page-title mt-1.5">
                            {greeting(now.getHours())}, {firstName}
                        </h1>
                        <p className="mt-1.5 text-sm text-fg-muted">
                            Tu espacio de trabajo: favoritos, actividad reciente y accesos según cómo usas el sistema.
                        </p>
                    </div>
                </header>

                {/* Tablet: two columns, dense so the narrow panels pair up; desktop: 8 / 4 split */}
                <div className="grid gap-4 md:grid-flow-dense md:grid-cols-2 xl:grid-flow-row xl:grid-cols-12">
                    <FavoritesPanel
                        favorites={insights.favoriteModules}
                        suggestions={insights.suggestions}
                        usageOf={insights.usageOf}
                        className="md:col-span-2 xl:col-span-8"
                    />
                    <RecentPanel className="xl:col-span-4" />
                    <QuickActionsPanel actions={insights.quickActions} className="md:col-span-2 xl:col-span-8" />
                    <SystemInfoPanel lastVisitAt={insights.summary.lastVisitAt} className="xl:col-span-4" />
                </div>

                <ActivityMetrics insights={insights} />

                <ModuleCatalog categories={visibleCategories} usageOf={insights.usageOf} onOpen={openModule} />
            </div>
        </div>
    )
}
