import { FileDocIcon, TrashBinIcon } from '../../../icons/icons'
import { downloadAttachment } from '../../../utils/attachments'
import type { Attachment } from '../../../utils/attachments'
import { cn } from '../../../utils/cn'
import { formatBytes } from '../../../utils/format'

type AttachmentListProps = {
    attachments: Attachment[]
    /** Shows a remove button on each chip */
    onRemove?: (attachment: Attachment) => void
    className?: string
}

/** Attachment chips: open / download when the content is stored, optional remove. */
export default function AttachmentList({ attachments, onRemove, className }: AttachmentListProps) {
    if (attachments.length === 0) return null
    return (
        <ul className={cn('flex flex-wrap gap-2', className)} aria-label="Adjuntos">
            {attachments.map((attachment) => (
                <li key={attachment.id} className="flex max-w-full items-center gap-1 rounded-md border border-line bg-surface py-1 pl-2 pr-1">
                    <FileDocIcon className="size-4 shrink-0 text-fg-subtle" />
                    <button
                        type="button"
                        onClick={() => downloadAttachment(attachment)}
                        disabled={!attachment.dataUrl}
                        title={attachment.dataUrl ? `Descargar ${attachment.name}` : 'Solo se guardó la referencia del archivo'}
                        className="min-w-0 truncate text-left text-xs font-medium text-fg enabled:hover:text-brand disabled:cursor-default"
                    >
                        {attachment.name}
                    </button>
                    <span className="shrink-0 text-2xs text-fg-subtle">{formatBytes(attachment.size)}</span>
                    {onRemove ? (
                        <button
                            type="button"
                            onClick={() => onRemove(attachment)}
                            className="inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-fg-subtle hover:bg-danger-soft hover:text-danger"
                            aria-label={`Quitar ${attachment.name}`}
                        >
                            <TrashBinIcon className="size-3.5" />
                        </button>
                    ) : null}
                </li>
            ))}
        </ul>
    )
}
