import { Link } from 'react-router-dom'
import ModuleIcon from '../../../components/common/modules/ModuleIcon'
import EmptyState from '../../../components/ui/empty-state/EmptyState'
import Panel from '../../../components/ui/panel/Panel'
import { useWorkspace } from '../../../context/workspace-context'
import { ClockIcon } from '../../../icons/icons'
import { getModuleById, hasModuleAccess } from '../../../navigation/navigation'
import type { VisitEvent } from '../../../services/workspace/workspace.service'

const VISIBLE_EVENTS = 60
const dayFormatter = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' })
const timeFormatter = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' })

/** Groups the newest visits by calendar day. */
function groupByDay(events: VisitEvent[]) {
    const groups = new Map<string, VisitEvent[]>()
    for (const event of events) {
        const key = new Date(event.at).toDateString()
        groups.set(key, [...(groups.get(key) ?? []), event])
    }
    return [...groups.entries()]
}

/** Chronological log of module visits, newest first, grouped by day. */
export default function VisitLog({ className }: { className?: string }) {
    const { events, role } = useWorkspace()
    const visible = events
        .filter((event) => {
            const module = getModuleById(event.moduleId)
            return module !== null && hasModuleAccess(module, role)
        })
        .slice(-VISIBLE_EVENTS)
        .reverse()

    return (
        <Panel title="Historial de visitas" description={`Últimas ${VISIBLE_EVENTS} visitas a módulos`} className={className}>
            {visible.length === 0 ? (
                <EmptyState icon={<ClockIcon className="size-5" />} title="Sin actividad todavía" description="Las visitas a módulos aparecerán aquí." />
            ) : (
                <div className="max-h-120 space-y-5 overflow-y-auto pr-1">
                    {groupByDay(visible).map(([day, dayEvents]) => (
                        <section key={day}>
                            <h3 className="eyebrow mb-2 text-3xs first-letter:uppercase">{dayFormatter.format(new Date(day))}</h3>
                            <ol className="space-y-1 border-l border-line pl-4">
                                {dayEvents.map((event, index) => {
                                    const module = getModuleById(event.moduleId)!
                                    return (
                                        <li key={`${event.at}-${index}`} className="relative">
                                            <span className="absolute -left-5.25 top-3 size-2 rounded-full border-2 border-surface bg-line-strong" aria-hidden="true" />
                                            <Link
                                                to={module.url ?? '#'}
                                                className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-canvas-subtle"
                                            >
                                                <ModuleIcon name={module.icon} className="size-4 text-fg-muted" />
                                                <span className="min-w-0 flex-1 truncate text-fg">{module.title}</span>
                                                <time dateTime={new Date(event.at).toISOString()} className="shrink-0 text-xs tabular-nums text-fg-muted">
                                                    {timeFormatter.format(event.at)}
                                                </time>
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ol>
                        </section>
                    ))}
                </div>
            )}
        </Panel>
    )
}
