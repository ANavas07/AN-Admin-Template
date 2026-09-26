import { Link } from 'react-router-dom'
import { useWorkspace } from '../../../context/workspace-context'
import { formatRelativeTime } from '../../../utils/relativeTime'
import Panel from '../../../components/ui/panel/Panel'
import ModuleIcon from '../../../components/common/modules/ModuleIcon'
import { getModuleById, hasModuleAccess } from '../../../navigation/navigation'

const RECENT_LIMIT = 6

/** Navigation history: the last pages the user opened, newest first. */
export default function RecentPanel({ className }: { className?: string }) {
    const { recents, role } = useWorkspace()
    const visible = recents
        .filter((entry) => {
            const module = getModuleById(entry.moduleId)
            return module !== null && hasModuleAccess(module, role)
        })
        .slice(0, RECENT_LIMIT)

    return (
        <Panel title="Visitados recientemente" description="Retoma donde lo dejaste" headingId="home-recent" className={className}>
            {visible.length > 0 ? (
                <ul className="-mx-2">
                    {visible.map((entry) => {
                        const module = getModuleById(entry.moduleId)
                        return (
                            <li key={entry.path}>
                                <Link
                                    to={entry.path}
                                    className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-canvas-subtle focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25"
                                >
                                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-line text-fg-muted">
                                        <ModuleIcon name={module?.icon ?? 'recent'} className="size-4" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium text-fg">{entry.title}</span>
                                        <span className="block truncate text-2xs text-fg-subtle">{entry.path}</span>
                                    </span>
                                    <time dateTime={new Date(entry.at).toISOString()} className="shrink-0 text-2xs text-fg-muted">
                                        {formatRelativeTime(entry.at)}
                                    </time>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            ) : (
                <p className="py-6 text-center text-sm text-fg-muted">Los módulos que abras aparecerán aquí.</p>
            )}
        </Panel>
    )
}
