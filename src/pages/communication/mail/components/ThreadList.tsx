import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../../../../components/ui/avatar/Avatar'
import Badge from '../../../../components/ui/badge/Badge'
import { PaperclipIcon, StarIcon } from '../../../../icons/icons'
import type { MailThread, MailView } from '../../../../services/mail/mail.service'
import { cn } from '../../../../utils/cn'
import { formatAddressList, formatMailDate, labelTone, previewText } from '../mailPresentation'

type ThreadListProps = {
    threads: MailThread[]
    view: MailView
    selectedId?: string
    now: number
    onToggleStar: (thread: MailThread) => void
    /** Opening a conversation marks it as read */
    onOpen: (thread: MailThread) => void
    /** Drafts open in the composer instead of the reading pane */
    onOpenDraft: (thread: MailThread) => void
}

const rowClass = 'flex w-full gap-3 px-4 py-3 pr-11 text-left focus-visible:bg-canvas-subtle focus-visible:outline-none'

/** A link to the conversation, or a button when there is no route (drafts). */
function RowLink({ to, onClick, isSelected, children }: { to?: string; onClick: () => void; isSelected: boolean; children: ReactNode }) {
    if (!to) {
        return (
            <button type="button" onClick={onClick} className={rowClass}>
                {children}
            </button>
        )
    }
    return (
        <Link to={to} onClick={onClick} aria-current={isSelected ? 'true' : undefined} className={rowClass}>
            {children}
        </Link>
    )
}

/** Conversation list: sender, subject, preview, date and flags. */
export default function ThreadList({ threads, view, selectedId, now, onToggleStar, onOpen, onOpenDraft }: ThreadListProps) {
    const isOutgoing = view === 'sent' || view === 'drafts'
    return (
        <ul className="divide-y divide-line" aria-label="Conversaciones">
            {threads.map((thread) => {
                const isSelected = thread.id === selectedId
                const counterpart = isOutgoing ? `Para: ${formatAddressList(thread.latestInView.to) || '(sin destinatario)'}` : thread.latest.from.name
                return (
                    <li key={thread.id} className={cn('relative', isSelected ? 'bg-brand-soft/60' : 'hover:bg-canvas-subtle/60')}>
                        {thread.isUnread ? <span className="absolute inset-y-0 left-0 w-0.5 bg-brand" aria-hidden="true" /> : null}
                        <RowLink
                            to={view === 'drafts' ? undefined : `/mail/${view}/${thread.id}`}
                            onClick={() => (view === 'drafts' ? onOpenDraft(thread) : onOpen(thread))}
                            isSelected={isSelected}
                        >
                            <Avatar name={isOutgoing ? thread.latestInView.to[0]?.name ?? '?' : thread.latest.from.name} size="sm" className="mt-0.5" />
                            <span className="min-w-0 flex-1">
                                <span className="flex items-baseline gap-2">
                                    <span className={cn('min-w-0 flex-1 truncate text-sm', thread.isUnread ? 'font-semibold text-fg' : 'text-fg')}>
                                        {counterpart}
                                        {thread.messages.length > 1 ? <span className="ml-1 text-xs font-normal text-fg-subtle">({thread.messages.length})</span> : null}
                                    </span>
                                    <time dateTime={thread.latest.sentAt} className={cn('shrink-0 text-2xs', thread.isUnread ? 'font-semibold text-brand' : 'text-fg-subtle')}>
                                        {formatMailDate(thread.latest.sentAt, now)}
                                    </time>
                                </span>
                                <span className={cn('block truncate text-sm', thread.isUnread ? 'font-semibold text-fg' : 'text-fg')}>
                                    {view === 'drafts' ? <span className="mr-1 text-danger">Borrador</span> : null}
                                    {thread.subject || '(sin asunto)'}
                                </span>
                                <span className="mt-0.5 flex items-center gap-1.5">
                                    <span className="min-w-0 flex-1 truncate text-xs text-fg-muted">{previewText(thread.latest.body) || 'Sin contenido'}</span>
                                    {thread.hasAttachments ? (
                                        <>
                                            <PaperclipIcon className="size-3.5 shrink-0 text-fg-subtle" />
                                            <span className="sr-only">Con adjuntos</span>
                                        </>
                                    ) : null}
                                </span>
                                {thread.labels.length ? (
                                    <span className="mt-1.5 flex flex-wrap gap-1">
                                        {thread.labels.map((label) => (
                                            <Badge key={label} tone={labelTone(label)} size="sm">
                                                {label}
                                            </Badge>
                                        ))}
                                    </span>
                                ) : null}
                            </span>
                        </RowLink>
                        {view !== 'drafts' && view !== 'trash' ? (
                            <button
                                type="button"
                                onClick={() => onToggleStar(thread)}
                                aria-pressed={thread.isStarred}
                                aria-label={thread.isStarred ? 'Quitar de favoritos' : 'Marcar como favorito'}
                                className={cn(
                                    'absolute right-3 top-9 inline-flex size-7 items-center justify-center rounded-md transition-colors hover:bg-canvas-subtle',
                                    thread.isStarred ? 'text-warning' : 'text-fg-subtle hover:text-fg'
                                )}
                            >
                                <StarIcon className={cn('size-4', thread.isStarred && 'fill-current')} />
                            </button>
                        ) : null}
                    </li>
                )
            })}
        </ul>
    )
}
