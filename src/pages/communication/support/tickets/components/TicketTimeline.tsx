import Panel from '../../../../../components/ui/panel/Panel'
import { toneSolid } from '../../../../../components/ui/tone'
import type { TicketEvent } from '../../../../../services/support/support.service'
import type { TicketPriority, TicketStatus } from '../../../../../services/support/support.service'
import { cn } from '../../../../../utils/cn'
import { formatDateTime } from '../../../../../utils/format'
import { formatRelativeTime } from '../../../../../utils/relativeTime'
import { PRIORITY_META, STATUS_META } from '../../supportPresentation'

function describe(event: TicketEvent) {
    switch (event.type) {
        case 'created':
            return { text: 'Ticket creado', tone: 'info' as const }
        case 'status':
            return { text: `Estado: ${STATUS_META[event.value as TicketStatus]?.label ?? event.value}`, tone: STATUS_META[event.value as TicketStatus]?.tone ?? 'neutral' }
        case 'priority':
            return { text: `Prioridad: ${PRIORITY_META[event.value as TicketPriority]?.label ?? event.value}`, tone: 'warning' as const }
        case 'assigned':
            return { text: `Asignado a ${event.value}`, tone: 'neutral' as const }
    }
}

/** Status tracking: every change of state, priority or assignee. */
export default function TicketTimeline({ events }: { events: TicketEvent[] }) {
    return (
        <Panel title="Seguimiento">
            <ol className="relative space-y-4 before:absolute before:inset-y-1 before:left-1 before:w-px before:bg-line">
                {[...events].reverse().map((event) => {
                    const { text, tone } = describe(event)
                    return (
                        <li key={event.id} className="relative pl-6">
                            <span className={cn('absolute left-0 top-1.5 size-2.5 rounded-full ring-3 ring-surface', toneSolid[tone])} aria-hidden="true" />
                            <p className="text-sm text-fg">{text}</p>
                            <p className="text-xs text-fg-muted">
                                {event.actor} ·{' '}
                                <time dateTime={event.at} title={formatDateTime(event.at)}>
                                    {formatRelativeTime(new Date(event.at).getTime())}
                                </time>
                            </p>
                        </li>
                    )
                })}
            </ol>
        </Panel>
    )
}
