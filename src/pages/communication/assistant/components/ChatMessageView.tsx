import AttachmentList from '../../../../components/common/attachments/AttachmentList'
import Markdown from '../../../../components/common/markdown/Markdown'
import CopyButton from '../../../../components/ui/copy-button/CopyButton'
import { AssistantIcon, RefreshIcon } from '../../../../icons/icons'
import type { ChatMessage } from '../../../../services/assistant/assistant.service'
import { cn } from '../../../../utils/cn'

type ChatMessageViewProps = {
    message: ChatMessage
    isStreaming: boolean
    /** Only the last answer can be regenerated */
    canRegenerate: boolean
    onRegenerate: () => void
}

/** One turn of the chat: user bubble on the right, assistant answer in Markdown. */
export default function ChatMessageView({ message, isStreaming, canRegenerate, onRegenerate }: ChatMessageViewProps) {
    if (message.role === 'user') {
        return (
            <div className="flex flex-col items-end gap-2">
                <AttachmentList attachments={message.attachments} className="justify-end" />
                {message.content ? (
                    <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-brand-solid px-4 py-2.5 text-sm text-on-solid sm:max-w-[75%]">
                        {message.content}
                    </p>
                ) : null}
            </div>
        )
    }

    const isThinking = isStreaming && !message.content
    return (
        <div className="flex gap-3">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-strong" aria-hidden="true">
                <AssistantIcon className="size-4" />
            </span>
            <div className="min-w-0 flex-1 pt-1">
                {isThinking ? (
                    <p className="flex items-center gap-1.5 text-sm text-fg-muted" role="status">
                        <span className="flex gap-1" aria-hidden="true">
                            {[0, 150, 300].map((delay) => (
                                <span key={delay} className="size-1.5 animate-bounce rounded-full bg-fg-subtle" style={{ animationDelay: `${delay}ms` }} />
                            ))}
                        </span>
                        Pensando…
                    </p>
                ) : (
                    <Markdown className={cn(isStreaming && 'after:ml-0.5 after:inline-block after:h-4 after:w-1.5 after:animate-pulse after:bg-fg-muted after:align-middle')}>
                        {message.content}
                    </Markdown>
                )}

                {message.status === 'stopped' ? <p className="mt-2 text-xs text-fg-muted">Respuesta detenida.</p> : null}
                {message.status === 'error' ? <p className="mt-2 text-xs font-medium text-danger">Hubo un error al generar la respuesta.</p> : null}

                {!isStreaming && message.content ? (
                    <div className="mt-2 flex items-center gap-1">
                        <CopyButton value={message.content} label="Copiar respuesta" />
                        {canRegenerate ? (
                            <button
                                type="button"
                                onClick={onRegenerate}
                                aria-label="Regenerar respuesta"
                                title="Regenerar respuesta"
                                className="inline-flex h-7 items-center gap-1.5 rounded-md px-1.5 text-xs font-medium text-fg-muted transition-colors hover:bg-canvas-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25"
                            >
                                <RefreshIcon className="size-3.5" />
                            </button>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    )
}
