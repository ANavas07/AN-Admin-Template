import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PaneLayout from '../../../components/common/layout/PaneLayout'
import ConfirmDialog from '../../../components/common/pop-up/ConfirmDialog'
import EmptyState from '../../../components/ui/empty-state/EmptyState'
import { useWorkspace } from '../../../context/workspace-context'
import { AssistantIcon, MenuIcon, PinIcon, PlusIcon } from '../../../icons/icons'
import { assistantEngine } from '../../../services/assistant/assistantEngine'
import type { Conversation } from '../../../services/assistant/assistant.service'
import { cn } from '../../../utils/cn'
import ChatComposer from './components/ChatComposer'
import ChatMessageView from './components/ChatMessageView'
import ConversationSidebar from './components/ConversationSidebar'
import { useAssistant } from './hooks/useAssistant'

const SUGGESTIONS = [
    { title: 'Escribe un hook de React', prompt: 'Escribe un hook de React en TypeScript para cargar datos con cancelación' },
    { title: 'Consulta SQL', prompt: 'Escribe una consulta SQL con los usuarios activos por departamento' },
    { title: 'Compara entornos', prompt: 'Haz una tabla que compare los entornos de una API key' },
    { title: 'Buenas prácticas de seguridad', prompt: '¿Cómo debo gestionar las API keys de forma segura?' },
]

const iconButtonClass = 'inline-flex size-9 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-canvas-subtle hover:text-fg'

/** Communication › AI assistant: conversations, streaming answers, code, files. */
export default function AssistantPage() {
    const { conversationId } = useParams()
    const navigate = useNavigate()
    const { user } = useWorkspace()
    const assistant = useAssistant()
    const [now] = useState(() => Date.now())
    const [isAsideOpen, setIsAsideOpen] = useState(false)
    const [toDelete, setToDelete] = useState<Conversation | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const stickToBottom = useRef(true)

    const conversation = conversationId ? assistant.conversations.find((item) => item.id === conversationId) : undefined
    const messages = conversation?.messages ?? []
    const lastContent = messages.at(-1)?.content.length ?? 0
    const firstName = user.name.split(' ')[0]

    // Follow the answer while it streams, unless the user scrolled up to read
    useEffect(() => {
        const element = scrollRef.current
        if (element && stickToBottom.current) element.scrollTop = element.scrollHeight
    }, [messages.length, lastContent, conversationId])

    function handleSend(text: string, attachments: Parameters<typeof assistant.send>[2]) {
        stickToBottom.current = true
        const id = assistant.send(conversation?.id, text, attachments)
        if (id !== conversationId) navigate(`/assistant/${id}`)
    }

    function startNewChat() {
        setIsAsideOpen(false)
        navigate('/assistant')
    }

    const isStreamingHere = assistant.streaming?.conversationId === conversation?.id && assistant.isStreaming

    return (
        <>
            <PaneLayout
                asideLabel="Conversaciones"
                asideClassName="bg-surface-muted lg:w-72"
                isAsideOpen={isAsideOpen}
                onCloseAside={() => setIsAsideOpen(false)}
                aside={
                    <ConversationSidebar
                        conversations={assistant.conversations}
                        activeId={conversationId}
                        now={now}
                        onNewChat={startNewChat}
                        onNavigate={() => setIsAsideOpen(false)}
                        onRename={assistant.rename}
                        onTogglePin={(item) => assistant.setPinned(item.id, !item.pinned)}
                        onDelete={setToDelete}
                    />
                }
            >
                <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line bg-surface px-3">
                    <button type="button" onClick={() => setIsAsideOpen(true)} className={cn(iconButtonClass, 'lg:hidden')} aria-label="Mostrar conversaciones">
                        <MenuIcon className="size-4" />
                    </button>
                    <h1 className="flex min-w-0 flex-1 items-center gap-2 truncate text-sm font-semibold text-fg">
                        {conversation?.pinned ? <PinIcon className="size-3.5 shrink-0 text-brand" /> : null}
                        <span className="truncate">{conversation?.title ?? 'Asistente IA'}</span>
                    </h1>
                    {assistantEngine.simulated ? (
                        <span className="hidden rounded-full bg-canvas-subtle px-2 py-0.5 text-2xs font-medium text-fg-muted sm:inline">Modo demostración</span>
                    ) : null}
                    <button type="button" onClick={startNewChat} className={iconButtonClass} aria-label="Nueva conversación" title="Nueva conversación">
                        <PlusIcon className="size-4" />
                    </button>
                </header>

                <div
                    ref={scrollRef}
                    onScroll={(event) => {
                        const element = event.currentTarget
                        stickToBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80
                    }}
                    className="min-h-0 flex-1 overflow-y-auto"
                >
                    {conversationId && !conversation && !assistant.isLoading ? (
                        <EmptyState
                            icon={<AssistantIcon className="size-5" />}
                            title="Conversación no encontrada"
                            description="Puede que se haya eliminado."
                            action={
                                <button type="button" onClick={startNewChat} className="text-sm font-medium text-brand hover:underline">
                                    Empezar una nueva
                                </button>
                            }
                        />
                    ) : messages.length === 0 ? (
                        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-16 text-center sm:pt-24">
                            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
                                <AssistantIcon className="size-6" />
                            </span>
                            <h2 className="mt-4 text-xl font-semibold text-fg">Hola, {firstName}. ¿En qué te ayudo hoy?</h2>
                            <p className="mt-1.5 text-sm text-fg-muted">Código, consultas, redacción o dudas sobre la plataforma.</p>
                            <div className="mt-8 grid w-full gap-2 sm:grid-cols-2">
                                {SUGGESTIONS.map((suggestion) => (
                                    <button
                                        key={suggestion.title}
                                        type="button"
                                        onClick={() => handleSend(suggestion.prompt, [])}
                                        className="card-interactive p-3.5 text-left"
                                    >
                                        <span className="block text-sm font-medium text-fg">{suggestion.title}</span>
                                        <span className="mt-0.5 block text-xs text-fg-muted">{suggestion.prompt}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <ol className="mx-auto max-w-3xl space-y-6 px-4 py-6" aria-label="Mensajes" aria-live="polite" aria-busy={isStreamingHere}>
                            {messages.map((message, index) => (
                                <li key={message.id}>
                                    <ChatMessageView
                                        message={message}
                                        isStreaming={assistant.streaming?.messageId === message.id}
                                        canRegenerate={!assistant.isStreaming && message.role === 'assistant' && index === messages.length - 1}
                                        onRegenerate={() => conversation && assistant.regenerate(conversation.id)}
                                    />
                                </li>
                            ))}
                        </ol>
                    )}
                </div>

                <div className="shrink-0 bg-canvas px-4 pb-4 pt-2">
                    <ChatComposer
                        key={conversationId ?? 'new'}
                        isStreaming={assistant.isStreaming}
                        onSend={handleSend}
                        onStop={assistant.stop}
                    />
                </div>
            </PaneLayout>

            <ConfirmDialog
                isOpen={toDelete !== null}
                title="Eliminar conversación"
                description={toDelete ? `«${toDelete.title}» se eliminará de tu historial.` : undefined}
                confirmLabel="Eliminar"
                onConfirm={() => {
                    if (toDelete) {
                        assistant.remove(toDelete.id)
                        if (toDelete.id === conversationId) navigate('/assistant')
                    }
                    setToDelete(null)
                }}
                onCancel={() => setToDelete(null)}
            />
        </>
    )
}
