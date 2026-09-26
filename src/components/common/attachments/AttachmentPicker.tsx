import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { UploadIcon } from '../../../icons/icons'
import { readFilesAsAttachments } from '../../../utils/attachments'
import type { Attachment } from '../../../utils/attachments'
import { cn } from '../../../utils/cn'

type AttachmentPickerProps = {
    onAdd: (attachments: Attachment[]) => void
    label?: string
    accept?: string
    /** Icon-only button (chat composers) */
    compact?: boolean
    className?: string
}

/** Button that opens the file dialog and returns the files as attachments. */
export default function AttachmentPicker({ onAdd, label = 'Adjuntar archivos', accept, compact = false, className }: AttachmentPickerProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [isReading, setIsReading] = useState(false)

    async function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? [])
        event.target.value = ''
        if (files.length === 0) return
        setIsReading(true)
        onAdd(await readFilesAsAttachments(files))
        setIsReading(false)
    }

    return (
        <>
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isReading}
                aria-label={label}
                title={label}
                className={cn(
                    'inline-flex items-center gap-2 rounded-md text-sm font-medium text-fg-muted transition-colors hover:bg-canvas-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25 disabled:opacity-50',
                    compact ? 'size-9 justify-center' : 'h-8 border border-dashed border-line-strong px-3',
                    className
                )}
            >
                <UploadIcon className="size-4" />
                {compact ? null : isReading ? 'Leyendo…' : label}
            </button>
            <input ref={inputRef} type="file" multiple accept={accept} className="hidden" onChange={handleChange} tabIndex={-1} aria-hidden="true" />
        </>
    )
}
