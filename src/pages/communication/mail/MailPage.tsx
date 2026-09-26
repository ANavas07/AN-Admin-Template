import { useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import PaneLayout from '../../../components/common/layout/PaneLayout'
import ConfirmDialog from '../../../components/common/pop-up/ConfirmDialog'
import EmptyState from '../../../components/ui/empty-state/EmptyState'
import InputComponent from '../../../components/ui/inputs/InputComponent'
import SegmentedControl from '../../../components/ui/segmented/SegmentedControl'
import { useWorkspace } from '../../../context/workspace-context'
import { MailIcon, MenuIcon } from '../../../icons/icons'
import { normalizeText } from '../../../utils/text'
import { ownAddresses } from '../../../services/mail/mail.service'
import type { MailThread, MailView } from '../../../services/mail/mail.service'
import { cn } from '../../../utils/cn'
import Composer from './components/Composer'
import MailSidebar from './components/MailSidebar'
import ThreadList from './components/ThreadList'
import ThreadView from './components/ThreadView'
import { draftFromMessage, forwardDraft, newDraft, replyDraft } from './composerDrafts'
import type { ComposerState } from './composerDrafts'
import { useMailbox } from './hooks/useMailbox'
import { isMailView, VIEWS } from './mailPresentation'

type ListFilter = 'all' | 'unread' | 'attachments'

function matchesQuery(thread: MailThread, query: string) {
    if (!query) return true
    const text = thread.messages.map((message) => `${message.subject} ${message.body} ${message.from.name} ${message.from.email} ${message.to.map((to) => to.name).join(' ')}`).join(' ')
    return normalizeText(text).includes(query)
}

/**
 * Communication › Mail: folders, conversation list and reading pane
 * (three panes on wide screens, one at a time on phones).
 */
export default function MailPage() {
    const { folder, threadId } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user } = useWorkspace()
    const mailbox = useMailbox()
    const [now] = useState(() => Date.now())
    const [isAsideOpen, setIsAsideOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [filter, setFilter] = useState<ListFilter>('all')
    const [label, setLabel] = useState<string | null>(null)
    // ?compose opens a new message (quick action from the command palette)
    const [composer, setComposer] = useState<(ComposerState & { key: number }) | null>(() =>
        searchParams.has('compose') ? { ...newDraft(), key: 0 } : null
    )
    const [confirmDelete, setConfirmDelete] = useState(false)

    if (!isMailView(folder)) return <Navigate to="/mail/inbox" replace />
    const view: MailView = folder

    const normalizedQuery = normalizeText(query.trim())
    const threads = mailbox.threadsOf(view).filter((thread) => {
        if (filter === 'unread' && !thread.isUnread) return false
        if (filter === 'attachments' && !thread.hasAttachments) return false
        if (label && !thread.labels.includes(label)) return false
        return matchesQuery(thread, normalizedQuery)
    })
    const thread = threadId ? mailbox.threadsOf(view).find((item) => item.id === threadId) : undefined
    const viewLabel = VIEWS.find((item) => item.id === view)?.label ?? ''
    const listPath = `/mail/${view}`

    const openComposer = (state: ComposerState) => setComposer({ ...state, key: Date.now() })
    const leaveThread = () => navigate(listPath)

    async function moveOpenThread(target: Parameters<typeof mailbox.move>[2]) {
        if (!thread) return
        await mailbox.move(thread.id, view, target)
        leaveThread()
    }

    return (
        <>
            <PaneLayout
                asideLabel="Carpetas de correo"
                asideClassName="lg:w-56"
                isAsideOpen={isAsideOpen}
                onCloseAside={() => setIsAsideOpen(false)}
                aside={
                    <MailSidebar
                        counts={mailbox.counts}
                        activeLabel={label}
                        onSelectLabel={setLabel}
                        onCompose={() => {
                            setIsAsideOpen(false)
                            openComposer(newDraft())
                        }}
                        onNavigate={() => setIsAsideOpen(false)}
                    />
                }
            >
                <div className="flex min-h-0 flex-1">
                    <section
                        aria-label={viewLabel}
                        className={cn('flex min-h-0 w-full flex-col border-r border-line bg-surface xl:w-80 xl:shrink-0 2xl:w-md', thread && 'hidden xl:flex')}
                    >
                        <div className="shrink-0 space-y-3 border-b border-line p-3">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAsideOpen(true)}
                                    className="inline-flex size-9 items-center justify-center rounded-md text-fg-muted hover:bg-canvas-subtle hover:text-fg lg:hidden"
                                    aria-label="Mostrar carpetas"
                                >
                                    <MenuIcon className="size-4" />
                                </button>
                                <h1 className="flex-1 truncate text-base font-semibold text-fg">
                                    {viewLabel}
                                    {label ? <span className="font-normal text-fg-muted"> · {label}</span> : null}
                                </h1>
                                <span className="text-xs text-fg-subtle">{threads.length}</span>
                            </div>
                            <InputComponent
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Buscar en el correo"
                                aria-label="Buscar en el correo"
                                showSearchIcon
                                iconPosition="left"
                                size="sm"
                            />
                            <SegmentedControl
                                label="Filtrar conversaciones"
                                size="sm"
                                value={filter}
                                onChange={setFilter}
                                options={[
                                    { value: 'all', label: 'Todos' },
                                    { value: 'unread', label: 'No leídos' },
                                    { value: 'attachments', label: 'Con adjuntos' },
                                ]}
                            />
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto">
                            {mailbox.isLoading ? (
                                <p className="p-4 text-sm text-fg-muted">Cargando correo…</p>
                            ) : threads.length ? (
                                <ThreadList
                                    threads={threads}
                                    view={view}
                                    selectedId={threadId}
                                    now={now}
                                    onToggleStar={(item) => void mailbox.setStarred(item.id, view, !item.isStarred)}
                                    onOpen={(item) => {
                                        if (item.isUnread) void mailbox.setRead(item.id, view, true)
                                    }}
                                    onOpenDraft={(item) => openComposer(draftFromMessage(item.latest))}
                                />
                            ) : (
                                <EmptyState
                                    icon={<MailIcon className="size-5" />}
                                    title={query || filter !== 'all' || label ? 'Sin coincidencias' : 'No hay conversaciones'}
                                    description={query || filter !== 'all' || label ? 'Prueba con otra búsqueda o quita los filtros.' : `Tu carpeta «${viewLabel}» está vacía.`}
                                />
                            )}
                        </div>
                    </section>

                    <section aria-label="Panel de lectura" className={cn('min-w-0 flex-1 flex-col bg-canvas', thread ? 'flex' : 'hidden xl:flex')}>
                        {thread ? (
                            <ThreadView
                                key={thread.id}
                                thread={thread}
                                view={view}
                                now={now}
                                onBack={leaveThread}
                                onReply={(message, replyAll) => openComposer(replyDraft(message, ownAddresses(mailbox.messages, user.email), replyAll))}
                                onForward={(message) => openComposer(forwardDraft(message))}
                                onArchive={() => void moveOpenThread('archive')}
                                onMoveToInbox={() => void moveOpenThread('inbox')}
                                onTrash={() => void moveOpenThread('trash')}
                                onRestore={() => void moveOpenThread('restore')}
                                onDeleteForever={() => setConfirmDelete(true)}
                                onMarkUnread={() => {
                                    void mailbox.setRead(thread.id, view, false)
                                    leaveThread()
                                }}
                                onToggleStar={() => void mailbox.setStarred(thread.id, view, !thread.isStarred)}
                            />
                        ) : (
                            <EmptyState
                                className="flex-1"
                                icon={<MailIcon className="size-5" />}
                                title={threadId ? 'La conversación ya no está en esta carpeta' : 'Selecciona una conversación'}
                                description="Elige un mensaje de la lista para leerlo aquí."
                            />
                        )}
                    </section>
                </div>
            </PaneLayout>

            {composer ? (
                <Composer
                    key={composer.key}
                    initial={composer}
                    onSend={mailbox.send}
                    onSaveDraft={mailbox.saveDraft}
                    onDiscard={(draftId) => (draftId ? void mailbox.deleteDraft(draftId) : undefined)}
                    onClose={() => setComposer(null)}
                />
            ) : null}

            <ConfirmDialog
                isOpen={confirmDelete}
                title="Eliminar definitivamente"
                description="La conversación se borrará de la papelera y no podrá recuperarse."
                confirmLabel="Eliminar"
                onConfirm={async () => {
                    if (thread) await mailbox.deleteForever(thread.id)
                    setConfirmDelete(false)
                    leaveThread()
                }}
                onCancel={() => setConfirmDelete(false)}
            />
        </>
    )
}
