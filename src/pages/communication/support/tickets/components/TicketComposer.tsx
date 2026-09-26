import { useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import AttachmentList from '../../../../../components/common/attachments/AttachmentList'
import AttachmentPicker from '../../../../../components/common/attachments/AttachmentPicker'
import ButtonComponent from '../../../../../components/ui/buttons/ButtonComponent'
import { fieldTextareaClass } from '../../../../../components/ui/inputs/fieldStyles'
import SegmentedControl from '../../../../../components/ui/segmented/SegmentedControl'
import { SendIcon } from '../../../../../icons/icons'
import type { CommentInput } from '../../../../../services/support/support.service'
import type { Attachment } from '../../../../../utils/attachments'
import { cn } from '../../../../../utils/cn'
import { modifierKeyLabel } from '../../../../../utils/platform'

type TicketComposerProps = {
    /** Agents can switch to internal notes */
    canWriteInternal: boolean
    /** Resolves true when the message was saved */
    onSubmit: (input: CommentInput) => Promise<boolean>
}

/** Reply box of a ticket. Ctrl/⌘ + Enter sends. */
export default function TicketComposer({ canWriteInternal, onSubmit }: TicketComposerProps) {
    const [body, setBody] = useState('')
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [mode, setMode] = useState<'public' | 'internal'>('public')
    const [isSending, setIsSending] = useState(false)
    const isInternal = canWriteInternal && mode === 'internal'
    const canSend = body.trim().length > 0 || attachments.length > 0

    async function send(event?: FormEvent) {
        event?.preventDefault()
        if (!canSend || isSending) return
        setIsSending(true)
        const saved = await onSubmit({ body, attachments, internal: isInternal })
        setIsSending(false)
        if (saved) {
            setBody('')
            setAttachments([])
        }
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault()
            void send()
        }
    }

    return (
        <form onSubmit={send} className={cn('card space-y-3 p-4', isInternal && 'border-warning/40 bg-warning-soft/40')}>
            {canWriteInternal ? (
                <SegmentedControl
                    label="Tipo de mensaje"
                    size="sm"
                    value={mode}
                    onChange={setMode}
                    options={[
                        { value: 'public', label: 'Respuesta pública' },
                        { value: 'internal', label: 'Nota interna' },
                    ]}
                />
            ) : null}
            <textarea
                aria-label={isInternal ? 'Nota interna' : 'Respuesta'}
                rows={4}
                className={fieldTextareaClass}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isInternal ? 'Solo visible para el equipo de soporte…' : 'Escribe tu respuesta…'}
            />
            <AttachmentList attachments={attachments} onRemove={(removed) => setAttachments((current) => current.filter((item) => item.id !== removed.id))} />
            <div className="flex flex-wrap items-center justify-between gap-2">
                <AttachmentPicker onAdd={(added) => setAttachments((current) => [...current, ...added])} />
                <div className="flex items-center gap-3">
                    <span className="hidden text-2xs text-fg-subtle sm:inline">{modifierKeyLabel()} + Enter para enviar</span>
                    <ButtonComponent type="submit" disabled={!canSend} isLoading={isSending} leftIcon={<SendIcon className="size-4" />}>
                        {isInternal ? 'Guardar nota' : 'Enviar'}
                    </ButtonComponent>
                </div>
            </div>
        </form>
    )
}
