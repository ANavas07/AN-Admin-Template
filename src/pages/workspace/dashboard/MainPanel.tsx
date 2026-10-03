import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ModuleCategory } from '../../../navigation/modules'
import PageContainer from '../../../components/common/page/PageContainer'
import { useAccount } from '../../../context/account-context'
import { ArrowRightIcon, GridIcon } from '../../../icons/icons'
import ActivityMetrics from '../components/ActivityMetrics'
import AgendaPanel from '../components/AgendaPanel'
import FavoritesPanel from '../components/FavoritesPanel'
import QuickActionsPanel from '../components/QuickActionsPanel'
import RecentPanel from '../components/RecentPanel'
import { summarizeAgenda, useAgenda } from '../hooks/useAgenda'
import { useWorkspaceInsights } from '../hooks/useWorkspaceInsights'

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
 * Home, ordered by the questions people bring to it:
 * 1. What needs me today? (agenda from mail, support, API keys, processes)
 * 2. Where do I usually go? (favorites and recent pages)
 * 3. What can I start? (quick actions)
 * 4. How am I using the system? (compact metrics, optional in Preferences)
 * The full module catalog lives in Workspace › Modules.
 */
export default function MainPanel({ userName }: MainPanelProps) {
    const insights = useWorkspaceInsights()
    const agenda = useAgenda()
    const { preferences } = useAccount()
    const [now] = useState(() => new Date())
    const firstName = userName.split(' ')[0]

    return (
        <PageContainer>
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow first-letter:uppercase">{dateFormatter.format(now)}</p>
                    <h1 className="page-title mt-1.5">
                        {greeting(now.getHours())}, {firstName}
                    </h1>
                    <p className="mt-1.5 max-w-2xl text-sm text-fg-muted" aria-live="polite">
                        {agenda.isLoading ? 'Revisando tus pendientes…' : summarizeAgenda(agenda.items)}
                    </p>
                </div>
            </header>

            <AgendaPanel items={agenda.items} isLoading={agenda.isLoading} />

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <FavoritesPanel
                    favorites={insights.favoriteModules}
                    suggestions={insights.suggestions}
                    usageOf={insights.usageOf}
                    className="xl:col-span-8"
                />
                <RecentPanel className="xl:col-span-4" />
            </div>

            <QuickActionsPanel actions={insights.quickActions} />

            {preferences.showHomeMetrics ? <ActivityMetrics insights={insights} compact /> : null}

            <Link to="/workspace/modules" className="card-interactive group flex items-center gap-4 p-4">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-canvas-subtle text-fg-muted">
                    <GridIcon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-fg">Explorar todos los módulos</span>
                    <span className="block text-xs text-fg-muted">
                        {insights.accessibleModules.length} módulos disponibles para tu rol, agrupados por área.
                    </span>
                </span>
                <ArrowRightIcon className="size-4 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
            </Link>
        </PageContainer>
    )
}
