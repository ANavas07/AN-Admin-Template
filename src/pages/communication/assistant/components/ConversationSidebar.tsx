import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { NavLink } from 'react-router-dom'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import InputComponent from '../../../../components/ui/inputs/InputComponent'
import { EditIcon, PinIcon, PlusIcon, TrashBinIcon } from '../../../../icons/icons'
import type { Conversation } from '../../../../services/assistant/assistant.service'
import { cn } from '../../../../utils/cn'
import { normalizeText } from '../../../../utils/text'

type ConversationSidebarProps = {
    conversations: Conversation[]
    activeId?: string
    now: number
    onNewChat: () => void
    onNavigate: () => void
    onRename: (id: string, title: string) => void
    onTogglePin: (conversation: Conversation) => void
    onDelete: (conversation: Conversation) => void
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Pinned first, then by recency buckets, like ChatGPT / Claude. */
function groupConversations(conversations: Conversation[], now: number) {
    const startOfToday = new Date(now).setHours(0, 0, 0, 0)
    const sorted = [...conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    const groups: { label: string; items: Conversation[] }[] = [
        { label: 'Fijadas', items: sorted.filter((item) => item.pinned) },
        { label: 'Hoy', items: [] },
        { label: 'Últimos 7 días', items: [] },
        { label: 'Anteriores', items: [] },
    ]
    for (const conversation of sorted.filter((item) => !item.pinned)) {
        const time = new Date(conversation.updatedAt).getTime()
        const group = time >= startOfToday ? groups[1] : time >= startOfToday - 6 * DAY_MS ? groups[2] : groups[3]
        group.items.push(conversation)
    }
    return groups.filter((group) => group.items.length > 0)
}

const actionClass =
    'inline-flex size-7 items-center justify-center rounded-md text-fg-subtle transition-colors hover:bg-surface hover:text-fg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25'

/** New chat, search and the conversation history with pin, rename and delete. */
export default function ConversationSidebar({ conversations, activeId, now, onNewChat, onNavigate, onRename, onTogglePin, onDelete }: ConversationSidebarProps) {
    const [query, setQuery] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [draftTitle, setDraftTitle] = useState('')

    const normalizedQuery = normalizeText(query.trim())
    const visible = normalizedQuery
        ? conversations.filter((conversation) =>
              normalizeText(`${conversation.title} ${conversation.messages.map((message) => message.content).join(' ')}`).includes(normalizedQuery)
          )
        : conversations
    const groups = groupConversations(visible, now)

    function startRename(conversation: Conversation) {
        setEditingId(conversation.id)
        setDraftTitle(conversation.title)
    }

    function commitRename() {
        if (editingId) onRename(editingId, draftTitle)
        setEditingId(null)
    }

    function handleRenameKey(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') commitRename()
        if (event.key === 'Escape') setEditingId(null)
    }

    return (
        <div className="flex h-full flex-col">
            <div className="shrink-0 space-y-2 p-3">
                <ButtonComponent fullWidth leftIcon={<PlusIcon className="size-4" />} onClick={onNewChat}>
                    Nueva conversación
                </ButtonComponent>
                <InputComponent
                    type="search"
                    size="sm"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar conversaciones"
                    aria-label="Buscar conversaciones"
                    showSearchIcon
                    iconPosition="left"
                />
            </div>

            <nav aria-label="Historial de conversaciones" className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
                {groups.length === 0 ? (
                    <p className="px-2 py-6 text-center text-sm text-fg-muted">{query ? 'Sin coincidencias.' : 'Aún no hay conversaciones.'}</p>
                ) : (
                    groups.map((group) => (
                        <section key={group.label} className="mt-3 first:mt-0" aria-label={group.label}>
                            <p className="eyebrow px-2 pb-1 text-3xs">{group.label}</p>
                            <ul className="space-y-0.5">
                                {group.items.map((conversation) => {
                                    const isActive = conversation.id === activeId
                                    if (editingId === conversation.id) {
                                        return (
                                            <li key={conversation.id}>
                                                <input
                                                    autoFocus
                                                    aria-label="Nuevo nombre de la conversación"
                                                    value={draftTitle}
                                                    onChange={(event) => setDraftTitle(event.target.value)}
                                                    onBlur={commitRename}
                                                    onKeyDown={handleRenameKey}
                                                    maxLength={80}
                                                    className="h-9 w-full rounded-md border border-brand bg-surface px-2.5 text-sm text-fg focus:outline-none focus:ring-3 focus:ring-brand/20"
                                                />
                                            </li>
                                        )
                                    }
                                    return (
                                        <li key={conversation.id} className="group relative">
                                            <NavLink
                                                to={`/assistant/${conversation.id}`}
                                                onClick={onNavigate}
                                                title={conversation.title}
                                                className={cn(
                                                    'flex h-9 items-center gap-2 rounded-md pl-2.5 text-sm transition-colors group-hover:pr-24 group-focus-within:pr-24',
                                                    // The active conversation always shows its actions (touch screens have no hover)
                                                    isActive ? 'bg-brand-soft pr-24 font-medium text-brand-strong' : 'pr-2 text-fg hover:bg-canvas-subtle'
                                                )}
                                            >
                                                {conversation.pinned ? <PinIcon className="size-3.5 shrink-0 text-fg-subtle" /> : null}
                                                <span className="truncate">{conversation.title}</span>
                                            </NavLink>
                                            <div className={cn('absolute inset-y-0 right-1 items-center group-focus-within:flex group-hover:flex', isActive ? 'flex' : 'hidden')}>
                                                <button
                                                    type="button"
                                                    className={actionClass}
                                                    onClick={() => onTogglePin(conversation)}
                                                    aria-label={conversation.pinned ? 'Desfijar' : 'Fijar'}
                                                    title={conversation.pinned ? 'Desfijar' : 'Fijar'}
                                                >
                                                    <PinIcon className={cn('size-3.5', conversation.pinned && 'text-brand')} />
                                                </button>
                                                <button type="button" className={actionClass} onClick={() => startRename(conversation)} aria-label="Renombrar" title="Renombrar">
                                                    <EditIcon className="size-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className={cn(actionClass, 'hover:text-danger')}
                                                    onClick={() => onDelete(conversation)}
                                                    aria-label="Eliminar"
                                                    title="Eliminar"
                                                >
                                                    <TrashBinIcon className="size-3.5" />
                                                </button>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </section>
                    ))
                )}
            </nav>
        </div>
    )
}
