import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import AttachmentList from '../../../../components/common/attachments/AttachmentList'
import AttachmentPicker from '../../../../components/common/attachments/AttachmentPicker'
import ButtonComponent from '../../../../components/ui/buttons/ButtonComponent'
import { CloseIcon, SendIcon, TrashBinIcon } from '../../../../icons/icons'
import type { DraftInput } from '../../../../services/mail/mail.service'
import { cn } from '../../../../utils/cn'
import { modifierKeyLabel } from '../../../../utils/platform'
import { COMPOSE_TITLES } from '../composerDrafts'
import type { ComposerState } from '../composerDrafts'
import RecipientInput from './RecipientInput'

type ComposerProps = {
    initial: ComposerState
    onSend: (draft: DraftInput) => Promise<boolean>
    /** Closing keeps the work as a draft */
    onSaveDraft: (draft: DraftInput) => Promise<string>
    onDiscard: (draftId?: string) => void
    onClose: () => void
}

const hasContent = (draft: DraftInput) => draft.to.length > 0 || draft.subject.trim() || draft.body.trim() || draft.attachments.length > 0

/**
 * Docked compose window (full screen on phones). Mount with a `key` per
 * message so each opening starts from its own draft.
 */
export default function Composer({ initial, onSend, onSaveDraft, onDiscard, onClose }: ComposerProps) {
    const [draft, setDraft] = useState<DraftInput>(initial.draft)
    const [showCc, setShowCc] = useState(initial.draft.cc.length > 0)
    const [isSending, setIsSending] = useState(false)
    const isReply = initial.mode === 'reply' || initial.mode === 'replyAll'

    const set = <K extends keyof DraftInput>(key: K, value: DraftInput[K]) => setDraft((current) => ({ ...current, [key]: value }))

    async function handleSend() {
        setIsSending(true)
        const sent = await onSend(draft)
        setIsSending(false)
        if (sent) onClose()
    }

    async function handleClose() {
        if (hasContent(draft)) await onSaveDraft(draft)
        onClose()
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault()
            void handleSend()
        } else if (event.key === 'Escape') {
            event.preventDefault()
            void handleClose()
        }
    }

    return (
        <div
            role="dialog"
            aria-label={COMPOSE_TITLES[initial.mode]}
            onKeyDown={handleKeyDown}
            className={cn(
                'fixed inset-0 z-(--z-modal) flex flex-col bg-surface shadow-2xl',
                'md:inset-auto md:bottom-0 md:right-6 md:h-[min(36rem,calc(100vh-6rem))] md:w-xl md:rounded-t-xl md:border md:border-b-0 md:border-line'
            )}
        >
            <header className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-line bg-surface-muted px-4 md:rounded-t-xl">
                <h2 className="truncate text-sm font-semibold text-fg">{draft.subject.trim() || COMPOSE_TITLES[initial.mode]}</h2>
                <button
                    type="button"
                    onClick={() => void handleClose()}
                    className="inline-flex size-7 items-center justify-center rounded-md text-fg-muted hover:bg-canvas-subtle hover:text-fg"
                    aria-label="Cerrar y guardar borrador"
                    title="Cerrar y guardar borrador"
                >
                    <CloseIcon className="size-4" />
                </button>
            </header>

            <RecipientInput label="Para" value={draft.to} onChange={(to) => set('to', to)} autoFocus={draft.to.length === 0} />
            {showCc ? (
                <RecipientInput label="CC" value={draft.cc} onChange={(cc) => set('cc', cc)} />
            ) : (
                <button type="button" onClick={() => setShowCc(true)} className="self-end px-4 pt-1 text-xs font-medium text-fg-muted hover:text-fg">
                    Agregar CC
                </button>
            )}
            <input
                aria-label="Asunto"
                value={draft.subject}
                onChange={(event) => set('subject', event.target.value)}
                placeholder="Asunto"
                className="h-10 shrink-0 border-b border-line bg-transparent px-4 text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
            />
            <textarea
                aria-label="Mensaje"
                value={draft.body}
                onChange={(event) => set('body', event.target.value)}
                autoFocus={draft.to.length > 0}
                // Replies start above the quoted text
                onFocus={(event) => {
                    if (isReply && event.currentTarget.selectionStart === event.currentTarget.value.length) event.currentTarget.setSelectionRange(0, 0)
                }}
                className="min-h-0 flex-1 resize-none bg-transparent px-4 py-3 text-sm leading-relaxed text-fg placeholder:text-fg-subtle focus:outline-none"
                placeholder="Escribe tu mensaje…"
            />
            {draft.attachments.length ? (
                <AttachmentList
                    className="max-h-24 shrink-0 overflow-y-auto px-4 pb-2"
                    attachments={draft.attachments}
                    onRemove={(removed) => set('attachments', draft.attachments.filter((item) => item.id !== removed.id))}
                />
            ) : null}

            <footer className="flex shrink-0 items-center gap-2 border-t border-line px-3 py-2.5">
                <ButtonComponent onClick={() => void handleSend()} isLoading={isSending} leftIcon={<SendIcon className="size-4" />} title={`${modifierKeyLabel()} + Enter`}>
                    Enviar
                </ButtonComponent>
                <AttachmentPicker compact label="Adjuntar archivos" onAdd={(added) => set('attachments', [...draft.attachments, ...added])} />
                <span className="ml-auto hidden text-2xs text-fg-subtle sm:inline">{modifierKeyLabel()} + Enter para enviar</span>
                <button
                    type="button"
                    onClick={() => {
                        onDiscard(draft.id)
                        onClose()
                    }}
                    className="inline-flex size-9 items-center justify-center rounded-md text-fg-muted hover:bg-danger-soft hover:text-danger"
                    aria-label="Descartar"
                    title="Descartar"
                >
                    <TrashBinIcon className="size-4" />
                </button>
            </footer>
        </div>
    )
}
