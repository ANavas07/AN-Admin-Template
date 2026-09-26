import { Link } from 'react-router-dom'
import Badge from '../../../../../components/ui/badge/Badge'
import type { Ticket } from '../../../../../services/support/support.service'
import { formatDateTime } from '../../../../../utils/format'
import { formatRelativeTime } from '../../../../../utils/relativeTime'
import { CATEGORY_META, PRIORITY_META, STATUS_META } from '../../supportPresentation'

/** One ticket in the list: number, subject, state and last activity. */
export default function TicketRow({ ticket, now }: { ticket: Ticket; now: number }) {
    const status = STATUS_META[ticket.status]
    const priority = PRIORITY_META[ticket.priority]
    const publicReplies = ticket.comments.filter((comment) => !comment.internal).length
    return (
        <li>
            <Link
                to={`/support/tickets/${ticket.id}`}
                className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-canvas-subtle/60 focus-visible:bg-canvas-subtle focus-visible:outline-none sm:flex-row sm:items-center sm:gap-4"
            >
                <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-2xs font-medium text-fg-subtle">
                        <span className="font-mono">{ticket.number}</span>
                        <span aria-hidden="true">·</span>
                        <span>{CATEGORY_META[ticket.category].label}</span>
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-fg">{ticket.subject}</p>
                    <p className="mt-0.5 text-xs text-fg-muted">
                        {ticket.assignee ? `Asignado a ${ticket.assignee}` : 'Sin asignar'} · {publicReplies}{' '}
                        {publicReplies === 1 ? 'respuesta' : 'respuestas'}
                    </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:w-64 sm:justify-end">
                    <Badge tone={priority.tone} size="sm">
                        {priority.label}
                    </Badge>
                    <Badge tone={status.tone} size="sm" dot>
                        {status.label}
                    </Badge>
                    <time dateTime={ticket.updatedAt} title={formatDateTime(ticket.updatedAt)} className="w-full text-2xs text-fg-subtle sm:text-right">
                        Actualizado {formatRelativeTime(new Date(ticket.updatedAt).getTime(), now)}
                    </time>
                </div>
            </Link>
        </li>
    )
}
