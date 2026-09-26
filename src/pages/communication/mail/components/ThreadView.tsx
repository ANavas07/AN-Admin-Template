import { useState } from 'react'
import type { ReactNode } from 'react'
import AttachmentList from '../../../../components/common/attachments/AttachmentList'
import Avatar from '../../../../components/ui/avatar/Avatar'
import Badge from '../../../../components/ui/badge/Badge'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import { ArchiveIcon, ArrowLeftIcon, ForwardIcon, MailIcon, MailOpenIcon, RefreshIcon, ReplyIcon, StarIcon, TrashBinIcon } from '../../../../icons/icons'
import type { MailMessage, MailThread, MailView } from '../../../../services/mail/mail.service'
import { cn } from '../../../../utils/cn'
import { formatAddressList, formatMailDate, formatMailDateLong, labelTone, previewText } from '../mailPresentation'

type ThreadViewProps = {
    thread: MailThread
    view: MailView
    now: number
    onBack: () => void
    onReply: (message: MailMessage, replyAll: boolean) => void
    onForward: (message: MailMessage) => void
    onArchive: () => void
    onMoveToInbox: () => void
    onTrash: () => void
    onRestore: () => void
    onDeleteForever: () => void
    onMarkUnread: () => void
    onToggleStar: () => void
}

function ToolbarButton({ label, onClick, children, tone }: { label: string; onClick: () => void; children: ReactNode; tone?: 'danger' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className={cn(
                'inline-flex size-9 items-center justify-center rounded-md text-fg-muted transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25',
                tone === 'danger' ? 'hover:bg-danger-soft hover:text-danger' : 'hover:bg-canvas-subtle hover:text-fg'
            )}
        >
            {children}
        </button>
    )
}

/** Reading pane: the conversation with actions (Outlook / Gmail style). */
export default function ThreadView(props: ThreadViewProps) {
    const { thread, view, now, onBack, onReply, onForward } = props
    const latest = thread.messages[thread.messages.length - 1]
    // Earlier messages start collapsed, like in Gmail; the latest one is open
    const [expanded, setExpanded] = useState<Set<string>>(() => new Set([latest.id]))
    const isTrash = view === 'trash'
    const hasMultipleRecipients = latest.to.length + latest.cc.length > 1

    function toggle(id: string) {
        setExpanded((current) => {
            const next = new Set(current)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    return (
        <article className="flex min-h-0 flex-1 flex-col" aria-labelledby="thread-subject">
            <div className="flex shrink-0 items-center gap-1 border-b border-line px-2 py-1.5 sm:px-4">
                <ToolbarButton label="Volver a la lista" onClick={onBack}>
                    <ArrowLeftIcon className="size-4" />
                </ToolbarButton>
                <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
                {isTrash ? (
                    <>
                        <ToolbarButton label="Restaurar" onClick={props.onRestore}>
                            <RefreshIcon className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton label="Eliminar definitivamente" onClick={props.onDeleteForever} tone="danger">
                            <TrashBinIcon className="size-4" />
                        </ToolbarButton>
                    </>
                ) : (
                    <>
                        {view === 'archive' ? (
                            <ToolbarButton label="Mover a la bandeja de entrada" onClick={props.onMoveToInbox}>
                                <MailIcon className="size-4" />
                            </ToolbarButton>
                        ) : view !== 'sent' ? (
                            <ToolbarButton label="Archivar" onClick={props.onArchive}>
                                <ArchiveIcon className="size-4" />
                            </ToolbarButton>
                        ) : null}
                        <ToolbarButton label="Enviar a la papelera" onClick={props.onTrash} tone="danger">
                            <TrashBinIcon className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton label="Marcar como no leído" onClick={props.onMarkUnread}>
                            <MailOpenIcon className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton label={thread.isStarred ? 'Quitar de favoritos' : 'Marcar como favorito'} onClick={props.onToggleStar}>
                            <StarIcon className={cn('size-4', thread.isStarred && 'fill-current text-warning')} />
                        </ToolbarButton>
                    </>
                )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
                <header className="px-4 pb-3 pt-5 sm:px-6">
                    <h2 id="thread-subject" className="text-lg font-semibold text-fg">
                        {thread.subject || '(sin asunto)'}
                    </h2>
                    {thread.labels.length ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {thread.labels.map((label) => (
                                <Badge key={label} tone={labelTone(label)} size="sm">
                                    {label}
                                </Badge>
                            ))}
                        </div>
                    ) : null}
                </header>

                <ol className="space-y-3 px-4 pb-6 sm:px-6">
                    {thread.messages.map((message) => {
                        const isOpen = expanded.has(message.id)
                        return (
                            <li key={message.id} className="card overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => toggle(message.id)}
                                    aria-expanded={isOpen}
                                    className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-canvas-subtle/50"
                                >
                                    <Avatar name={message.from.name} size="md" />
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-baseline gap-2">
                                            <span className="truncate text-sm font-semibold text-fg">{message.from.name}</span>
                                            <span className="hidden truncate text-xs text-fg-subtle sm:inline">&lt;{message.from.email}&gt;</span>
                                        </span>
                                        <span className="block truncate text-xs text-fg-muted">
                                            {isOpen
                                                ? `Para: ${formatAddressList(message.to)}${message.cc.length ? ` · CC: ${formatAddressList(message.cc)}` : ''}`
                                                : previewText(message.body)}
                                        </span>
                                    </span>
                                    <time dateTime={message.sentAt} title={formatMailDateLong(message.sentAt)} className="shrink-0 text-xs text-fg-subtle">
                                        {formatMailDate(message.sentAt, now)}
                                    </time>
                                </button>
                                {isOpen ? (
                                    <div className="px-4 pb-4 sm:pl-16">
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg">{message.body}</p>
                                        {message.attachments.length ? (
                                            <div className="mt-4 border-t border-line pt-3">
                                                <p className="mb-2 text-xs font-medium text-fg-muted">
                                                    {message.attachments.length} {message.attachments.length === 1 ? 'adjunto' : 'adjuntos'}
                                                </p>
                                                <AttachmentList attachments={message.attachments} />
                                            </div>
                                        ) : null}
                                    </div>
                                ) : null}
                            </li>
                        )
                    })}
                </ol>

                {isTrash ? null : (
                    <div className="flex flex-wrap gap-2 px-4 pb-8 sm:px-6 sm:pl-22">
                        <ButtonComponent variant="outline" leftIcon={<ReplyIcon className="size-4" />} onClick={() => onReply(latest, false)}>
                            Responder
                        </ButtonComponent>
                        {hasMultipleRecipients ? (
                            <ButtonComponent variant="outline" leftIcon={<ReplyIcon className="size-4" />} onClick={() => onReply(latest, true)}>
                                Responder a todos
                            </ButtonComponent>
                        ) : null}
                        <ButtonComponent variant="outline" leftIcon={<ForwardIcon className="size-4" />} onClick={() => onForward(latest)}>
                            Reenviar
                        </ButtonComponent>
                    </div>
                )}
            </div>
        </article>
    )
}
