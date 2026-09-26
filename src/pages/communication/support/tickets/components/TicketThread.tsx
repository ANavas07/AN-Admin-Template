import AttachmentList from '../../../../../components/common/attachments/AttachmentList'
import Avatar from '../../../../../components/ui/avatar/Avatar'
import Badge from '../../../../../components/ui/badge/Badge'
import type { Ticket } from '../../../../../services/support/support.service'
import { cn } from '../../../../../utils/cn'
import { formatDateTime } from '../../../../../utils/format'
import { formatRelativeTime } from '../../../../../utils/relativeTime'

type TicketThreadProps = {
    ticket: Ticket
    /** Agents also see internal notes */
    showInternal: boolean
}

/** Conversation of a ticket: the original request followed by replies and notes. */
export default function TicketThread({ ticket, showInternal }: TicketThreadProps) {
    const comments = ticket.comments.filter((comment) => showInternal || !comment.internal)
    const entries = [
        {
            id: 'request',
            author: ticket.requesterName,
            authorRole: 'requester' as const,
            body: ticket.description,
            internal: false,
            attachments: ticket.attachments,
            at: ticket.createdAt,
        },
        ...comments,
    ]

    return (
        <ol className="space-y-4" aria-label="Conversación">
            {entries.map((entry) => (
                <li key={entry.id} className="flex gap-3">
                    <Avatar name={entry.author} size="sm" className="mt-0.5" />
                    <article
                        className={cn(
                            'min-w-0 flex-1 rounded-lg border px-4 py-3',
                            entry.internal ? 'border-warning/30 bg-warning-soft' : entry.authorRole === 'agent' ? 'border-line bg-surface' : 'border-line bg-canvas-subtle/60'
                        )}
                    >
                        <header className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-fg">{entry.author}</span>
                            {entry.authorRole === 'agent' ? (
                                <Badge tone="brand" size="sm">
                                    Soporte
                                </Badge>
                            ) : null}
                            {entry.internal ? (
                                <Badge tone="warning" size="sm">
                                    Nota interna
                                </Badge>
                            ) : null}
                            <time dateTime={entry.at} title={formatDateTime(entry.at)} className="ml-auto text-xs text-fg-subtle">
                                {formatRelativeTime(new Date(entry.at).getTime())}
                            </time>
                        </header>
                        {entry.body ? <p className="mt-1.5 whitespace-pre-wrap text-sm text-fg">{entry.body}</p> : null}
                        <AttachmentList attachments={entry.attachments} className="mt-2.5" />
                    </article>
                </li>
            ))}
        </ol>
    )
}
