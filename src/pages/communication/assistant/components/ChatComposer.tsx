import { useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import AttachmentList from '../../../../components/common/attachments/AttachmentList'
import AttachmentPicker from '../../../../components/common/attachments/AttachmentPicker'
import { SendIcon } from '../../../../icons/icons'
import type { Attachment } from '../../../../utils/attachments'
import { cn } from '../../../../utils/cn'

type ChatComposerProps = {
    isStreaming: boolean
    onSend: (text: string, attachments: Attachment[]) => void
    onStop: () => void
}

const MAX_HEIGHT = 200

/** Message box: Enter sends, Shift + Enter adds a line. Grows with the text. */
export default function ChatComposer({ isStreaming, onSend, onStop }: ChatComposerProps) {
    const [text, setText] = useState('')
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const canSend = !isStreaming && (text.trim().length > 0 || attachments.length > 0)

    function resize() {
        const element = textareaRef.current
        if (!element) return
        element.style.height = 'auto'
        element.style.height = `${Math.min(element.scrollHeight, MAX_HEIGHT)}px`
    }

    function submit(event?: FormEvent) {
        event?.preventDefault()
        if (!canSend) return
        onSend(text, attachments)
        setText('')
        setAttachments([])
        requestAnimationFrame(resize)
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault()
            submit()
        }
    }

    return (
        <form onSubmit={submit} className="mx-auto w-full max-w-3xl">
            <div className="rounded-2xl border border-line bg-surface shadow-sm transition-shadow focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/15">
                <AttachmentList
                    attachments={attachments}
                    className="px-3 pt-3"
                    onRemove={(removed) => setAttachments((current) => current.filter((item) => item.id !== removed.id))}
                />
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={text}
                    onChange={(event) => {
                        setText(event.target.value)
                        resize()
                    }}
                    onKeyDown={handleKeyDown}
                    aria-label="Mensaje para el asistente"
                    placeholder="Pregunta lo que necesites…"
                    className="block max-h-50 w-full resize-none bg-transparent px-4 pb-1 pt-3.5 text-sm leading-relaxed text-fg placeholder:text-fg-subtle focus:outline-none"
                />
                <div className="flex items-center justify-between gap-2 px-2 pb-2">
                    <AttachmentPicker compact label="Adjuntar archivos" onAdd={(added) => setAttachments((current) => [...current, ...added])} />
                    {isStreaming ? (
                        <button
                            type="button"
                            onClick={onStop}
                            aria-label="Detener respuesta"
                            title="Detener respuesta"
                            className="inline-flex size-9 items-center justify-center rounded-full bg-fg text-canvas transition-opacity hover:opacity-85"
                        >
                            <span className="size-3 rounded-xs bg-current" aria-hidden="true" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={!canSend}
                            aria-label="Enviar mensaje"
                            title="Enviar (Enter)"
                            className={cn(
                                'inline-flex size-9 items-center justify-center rounded-full transition-colors',
                                canSend ? 'bg-brand-solid text-on-solid hover:bg-brand-solid/90' : 'bg-canvas-subtle text-fg-subtle'
                            )}
                        >
                            <SendIcon className="size-4" />
                        </button>
                    )}
                </div>
            </div>
            <p className="mt-2 text-center text-2xs text-fg-subtle">
                Respuestas simuladas en esta plantilla. Verifica la información importante. Enter envía · Shift + Enter nueva línea
            </p>
        </form>
    )
}
